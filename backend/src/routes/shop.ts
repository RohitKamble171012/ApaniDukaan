import { Router, Request, Response } from 'express';
import { authenticate, requireShop, AuthRequest } from '../middleware/auth';
import { uploadImage } from '../middleware/upload';
import User from '../models/User';
import Shop from '../models/Shop';
import { generateShopSlug } from '../utils/helpers';
import { generateQRCode } from '../utils/qr';
import path from 'path';
import fs from 'fs';

const router = Router();

// POST /api/shop/onboard - Create shop during onboarding
router.post('/onboard', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user!.uid });
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.shopId) {
      return res.status(400).json({ error: 'Shop already exists. Use PUT /api/shop to update.' });
    }

    const {
      shopName, shopType, tagline, description, address, contact,
      hours, paymentSettings, deliverySettings, currency
    } = req.body;

    if (!shopName || !shopType || !address || !contact) {
      return res.status(400).json({ error: 'shopName, shopType, address, contact are required' });
    }

    // Generate unique slug
    const existing = await Shop.find({}).select('shopSlug');
    const existingSlugs = existing.map(s => s.shopSlug);
    const shopSlug = generateShopSlug(shopName, existingSlugs);

    const shop = await Shop.create({
      ownerId: user._id,
      shopSlug,
      shopName,
      shopType,
      tagline,
      description,
      address,
      contact,
      hours,
      paymentSettings,
      deliverySettings,
      currency: currency || 'INR'
    });

    // Generate QR code
    const frontendUrl = process.env.FRONTEND_BASE_URL || 'http://localhost:3000';
    const { filePath } = await generateQRCode(shopSlug, frontendUrl);
    shop.qrCodeUrl = filePath;
    await shop.save();

    // Link shop to user
    user.shopId = shop._id as any;
    user.onboardingComplete = true;
    await user.save();

    return res.status(201).json({ shop });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/shop - Get own shop
router.get('/', authenticate, requireShop, async (req: AuthRequest, res: Response) => {
  try {
    const shop = await Shop.findById(req.user!.shopId);
    if (!shop) return res.status(404).json({ error: 'Shop not found' });
    return res.json({ shop });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/shop - Update shop info
router.put('/', authenticate, requireShop, async (req: AuthRequest, res: Response) => {
  try {
    const allowedFields = [
      'shopName', 'shopType', 'tagline', 'description',
      'address', 'contact', 'socialLinks', 'hours',
      'paymentSettings', 'deliverySettings', 'currency', 'isVisible'
    ];

    const updates: Record<string, any> = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    const shop = await Shop.findByIdAndUpdate(
      req.user!.shopId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!shop) return res.status(404).json({ error: 'Shop not found' });
    return res.json({ shop });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/shop/upload-logo - Upload shop logo
router.post('/upload-logo', authenticate, requireShop, uploadImage.single('logo'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const logoUrl = `/uploads/images/${req.file.filename}`;
    await Shop.findByIdAndUpdate(req.user!.shopId, { logoUrl });
    return res.json({ logoUrl });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/shop/upload-banner - Upload shop banner
router.post('/upload-banner', authenticate, requireShop, uploadImage.single('banner'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const bannerUrl = `/uploads/images/${req.file.filename}`;
    await Shop.findByIdAndUpdate(req.user!.shopId, { bannerUrl });
    return res.json({ bannerUrl });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/shop/public/:slug - Public shop page (no auth)
router.get('/public/:slug', async (req: Request, res: Response) => {
  try {
    const shop = await Shop.findOne({ shopSlug: req.params.slug, isActive: true, isVisible: true })
      .select('-ownerId -__v');
    if (!shop) return res.status(404).json({ error: 'Shop not found' });
    return res.json({ shop });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/shop/regenerate-qr - Regenerate QR code
router.post('/regenerate-qr', authenticate, requireShop, async (req: AuthRequest, res: Response) => {
  try {
    const shop = await Shop.findById(req.user!.shopId);
    if (!shop) return res.status(404).json({ error: 'Shop not found' });

    const frontendUrl = process.env.FRONTEND_BASE_URL || 'http://localhost:3000';
    const { dataUrl, filePath } = await generateQRCode(shop.shopSlug, frontendUrl);

    shop.qrCodeUrl = filePath;
    await shop.save();

    return res.json({ qrCodeUrl: filePath, dataUrl, shopUrl: `${frontendUrl}/shop/${shop.shopSlug}` });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
