import { Router, Request, Response } from 'express';
import { authenticate, requireShop, AuthRequest } from '../middleware/auth';
import { uploadExcel, uploadImage } from '../middleware/upload';
import Product from '../models/Product';
import Shop from '../models/Shop';
import { parseExcelFile, exportProductsToExcel, generateExcelTemplate } from '../utils/excel';
import fs from 'fs';

const router = Router();

// GET /api/products - Get all products for own shop (dashboard)
router.get('/', authenticate, requireShop, async (req: AuthRequest, res: Response) => {
  try {
    const { category, search, availability, page = 1, limit = 50 } = req.query;
    const query: any = { shopId: req.user!.shopId };

    if (category) query.category = category;
    if (availability !== undefined) query.availability = availability === 'true';
    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(String(search), 'i')] } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Product.countDocuments(query)
    ]);

    return res.json({ products, total, page: Number(page), limit: Number(limit) });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/products/public/:shopSlug - Public products for customer storefront
router.get('/public/:shopSlug', async (req: Request, res: Response) => {
  try {
    const shop = await Shop.findOne({ shopSlug: req.params.shopSlug, isActive: true });
    if (!shop) return res.status(404).json({ error: 'Shop not found' });

    const { category, search } = req.query;
    const query: any = { shopId: shop._id, availability: true };

    if (category) query.category = category;
    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(String(search), 'i')] } }
      ];
    }

    const products = await Product.find(query)
      .select('-shopId -__v -isFromExcel -excelRowIndex')
      .sort({ category: 1, productName: 1 });

    const categories = [...new Set(products.map(p => p.category))];

    return res.json({ products, categories });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/products - Add single product
router.post('/', authenticate, requireShop, async (req: AuthRequest, res: Response) => {
  try {
    const {
      productName, category, brand, price, discountPrice,
      quantity, unit, sku, description, imageUrl, tags, availability
    } = req.body;

    if (!productName || price === undefined || quantity === undefined) {
      return res.status(400).json({ error: 'productName, price, quantity are required' });
    }

    const product = await Product.create({
      shopId: req.user!.shopId,
      productName, category: category || 'General', brand, price,
      discountPrice, quantity, unit: unit || 'piece',
      sku, description, imageUrl,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map((t: string) => t.trim())) : [],
      availability: availability !== false
    });

    // Update shop product count
    await Shop.findByIdAndUpdate(req.user!.shopId, { $inc: { totalProducts: 1 } });

    return res.status(201).json({ product });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/products/:id - Update product
router.put('/:id', authenticate, requireShop, async (req: AuthRequest, res: Response) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, shopId: req.user!.shopId });
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const allowedFields = [
      'productName', 'category', 'brand', 'price', 'discountPrice',
      'quantity', 'unit', 'sku', 'description', 'imageUrl', 'tags', 'availability'
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (field === 'tags' && !Array.isArray(req.body[field])) {
          (product as any)[field] = req.body[field].split(',').map((t: string) => t.trim());
        } else {
          (product as any)[field] = req.body[field];
        }
      }
    }

    await product.save();
    return res.json({ product });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/products/:id
router.delete('/:id', authenticate, requireShop, async (req: AuthRequest, res: Response) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, shopId: req.user!.shopId });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    await Shop.findByIdAndUpdate(req.user!.shopId, { $inc: { totalProducts: -1 } });
    return res.json({ message: 'Product deleted' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/products/upload-image/:id - Upload product image
router.post('/upload-image/:id', authenticate, requireShop, uploadImage.single('image'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const imageUrl = `/uploads/images/${req.file.filename}`;
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, shopId: req.user!.shopId },
      { imageUrl },
      { new: true }
    );
    if (!product) return res.status(404).json({ error: 'Product not found' });
    return res.json({ imageUrl, product });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/products/excel-preview - Preview Excel import (no save)
router.post('/excel-preview', authenticate, requireShop, uploadExcel.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const result = parseExcelFile(req.file.path);

    // Clean up temp file
    fs.unlink(req.file.path, () => {});

    return res.json({
      preview: result.valid.slice(0, 10),
      totalValid: result.valid.length,
      totalErrors: result.errors.length,
      errors: result.errors,
      total: result.total
    });
  } catch (err: any) {
    if (req.file) fs.unlink(req.file.path, () => {});
    return res.status(400).json({ error: err.message });
  }
});

// POST /api/products/excel-import - Import products from Excel
router.post('/excel-import', authenticate, requireShop, uploadExcel.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const result = parseExcelFile(req.file.path);
    fs.unlink(req.file.path, () => {});

    if (result.valid.length === 0) {
      return res.status(400).json({ error: 'No valid rows found in file', errors: result.errors });
    }

    const shopId = req.user!.shopId!;
    let created = 0;
    let updated = 0;
    const importErrors: string[] = [];

    for (const row of result.valid) {
      try {
        // Check if product exists by SKU or product name
        const existing = row.sku
          ? await Product.findOne({ shopId, sku: row.sku })
          : await Product.findOne({ shopId, productName: row.productName });

        if (existing) {
          await Product.findByIdAndUpdate(existing._id, {
            ...row,
            tags: row.tags ? row.tags.split(',').map(t => t.trim()) : existing.tags,
            availability: row.availability as boolean,
            isFromExcel: true
          });
          updated++;
        } else {
          await Product.create({
            shopId,
            ...row,
            tags: row.tags ? row.tags.split(',').map(t => t.trim()) : [],
            availability: row.availability as boolean,
            isFromExcel: true
          });
          created++;
        }
      } catch (e: any) {
        importErrors.push(`Row ${row.productName}: ${e.message}`);
      }
    }

    // Update shop product count
    const total = await Product.countDocuments({ shopId });
    await Shop.findByIdAndUpdate(shopId, { totalProducts: total });

    return res.json({
      message: `Import complete`,
      created,
      updated,
      skipped: result.errors.length,
      importErrors,
      parseErrors: result.errors
    });
  } catch (err: any) {
    if (req.file) fs.unlink(req.file.path, () => {});
    return res.status(400).json({ error: err.message });
  }
});

// GET /api/products/export-excel - Export products to Excel
router.get('/export-excel', authenticate, requireShop, async (req: AuthRequest, res: Response) => {
  try {
    const products = await Product.find({ shopId: req.user!.shopId });
    const rows = products.map(p => ({
      productName: p.productName,
      category: p.category,
      brand: p.brand || '',
      price: p.price,
      discountPrice: p.discountPrice || '',
      quantity: p.quantity,
      unit: p.unit,
      sku: p.sku || '',
      description: p.description || '',
      imageUrl: p.imageUrl || '',
      tags: p.tags.join(', '),
      availability: p.availability ? 'true' : 'false'
    }));

    const buffer = exportProductsToExcel(rows as any);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=products.xlsx');
    return res.send(buffer);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/products/template - Download blank Excel template
router.get('/template', authenticate, async (_req, res: Response) => {
  try {
    const buffer = generateExcelTemplate();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=product-template.xlsx');
    return res.send(buffer);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
