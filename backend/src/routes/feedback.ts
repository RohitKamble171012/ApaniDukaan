import { Router, Request, Response } from 'express';
import { authenticate, requireShop, AuthRequest } from '../middleware/auth';
import Feedback from '../models/Feedback';
import Shop from '../models/Shop';
import { generateQRCode } from '../utils/qr';

const feedbackRouter = Router();

// POST /api/feedback/:shopSlug - Customer submits feedback (no auth)
feedbackRouter.post('/:shopSlug', async (req: Request, res: Response) => {
  try {
    const shop = await Shop.findOne({ shopSlug: req.params.shopSlug, isActive: true });
    if (!shop) return res.status(404).json({ error: 'Shop not found' });

    const { customerName, customerPhone, type, message, rating, requestedItems } = req.body;

    if (!type || !['feedback', 'item_request'].includes(type)) {
      return res.status(400).json({ error: 'type must be "feedback" or "item_request"' });
    }

    const feedback = await Feedback.create({
      shopId: shop._id,
      customerName,
      customerPhone,
      type,
      message,
      rating,
      requestedItems
    });

    return res.status(201).json({ feedback, message: 'Thank you for your feedback!' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/feedback - Get all feedback for shop (dashboard)
feedbackRouter.get('/', authenticate, requireShop, async (req: AuthRequest, res: Response) => {
  try {
    const { type, status, page = 1, limit = 20 } = req.query;
    const query: any = { shopId: req.user!.shopId };
    if (type) query.type = type;
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [feedbacks, total] = await Promise.all([
      Feedback.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Feedback.countDocuments(query)
    ]);

    return res.json({ feedbacks, total });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// PATCH /api/feedback/:id/review - Mark as reviewed
feedbackRouter.patch('/:id/review', authenticate, requireShop, async (req: AuthRequest, res: Response) => {
  try {
    const feedback = await Feedback.findOneAndUpdate(
      { _id: req.params.id, shopId: req.user!.shopId },
      { status: 'reviewed', reviewedAt: new Date() },
      { new: true }
    );
    if (!feedback) return res.status(404).json({ error: 'Feedback not found' });
    return res.json({ feedback });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/feedback/:id
feedbackRouter.delete('/:id', authenticate, requireShop, async (req: AuthRequest, res: Response) => {
  try {
    await Feedback.findOneAndDelete({ _id: req.params.id, shopId: req.user!.shopId });
    return res.json({ message: 'Feedback deleted' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// QR Router
const qrRouter = Router();

// GET /api/qr - Get QR for shop
qrRouter.get('/', authenticate, requireShop, async (req: AuthRequest, res: Response) => {
  try {
    const shop = await Shop.findById(req.user!.shopId);
    if (!shop) return res.status(404).json({ error: 'Shop not found' });

    const frontendUrl = process.env.FRONTEND_BASE_URL || 'http://localhost:3000';
    const shopUrl = `${frontendUrl}/shop/${shop.shopSlug}`;

    // Regenerate if not exists
    if (!shop.qrCodeUrl) {
      const { filePath } = await generateQRCode(shop.shopSlug, frontendUrl);
      shop.qrCodeUrl = filePath;
      await shop.save();
    }

    // Get data URL for download
    const QRCode = require('qrcode');
    const dataUrl = await QRCode.toDataURL(shopUrl, { width: 400, margin: 2, errorCorrectionLevel: 'H' });

    return res.json({
      qrCodeUrl: shop.qrCodeUrl,
      dataUrl,
      shopUrl,
      shopSlug: shop.shopSlug,
      shopName: shop.shopName
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export { feedbackRouter as default, qrRouter };
