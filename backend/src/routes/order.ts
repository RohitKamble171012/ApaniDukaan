import { Router, Request, Response } from 'express';
import { authenticate, requireShop, AuthRequest } from '../middleware/auth';
import Order from '../models/Order';
import Shop from '../models/Shop';
import Product from '../models/Product';
import { generateOrderNumber } from '../utils/helpers';

const router = Router();

// POST /api/orders/place/:shopSlug - Customer places order (no auth)
router.post('/place/:shopSlug', async (req: Request, res: Response) => {
  try {
    const shop = await Shop.findOne({ shopSlug: req.params.shopSlug, isActive: true });
    if (!shop) return res.status(404).json({ error: 'Shop not found' });

    const { customer, items, paymentMethod, deliveryType } = req.body;

    if (!customer?.name || !customer?.phone) {
      return res.status(400).json({ error: 'Customer name and phone are required' });
    }
    if (!items?.length) return res.status(400).json({ error: 'Order must have at least one item' });
    if (!['cash', 'online'].includes(paymentMethod)) {
      return res.status(400).json({ error: 'Invalid payment method' });
    }

    // Enrich items with current prices and validate stock
    const enrichedItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findOne({ _id: item.productId, shopId: shop._id, availability: true });

      if (!product) {
        return res.status(400).json({ error: `Product "${item.productName}" is not available` });
      }

      if (product.quantity < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for "${product.productName}". Available: ${product.quantity}` });
      }

      const effectivePrice = product.discountPrice || product.price;
      const itemSubtotal = effectivePrice * item.quantity;
      subtotal += itemSubtotal;

      enrichedItems.push({
        productId: product._id,
        productName: product.productName,
        price: product.price,
        discountPrice: product.discountPrice,
        quantity: item.quantity,
        unit: product.unit,
        imageUrl: product.imageUrl,
        subtotal: itemSubtotal
      });
    }

    const deliveryCharge = deliveryType === 'delivery' ? (shop.deliverySettings.deliveryCharge || 0) : 0;
    const total = subtotal + deliveryCharge;

    const order = await Order.create({
      shopId: shop._id,
      orderNumber: generateOrderNumber(),
      customer,
      items: enrichedItems,
      subtotal,
      deliveryCharge,
      total,
      paymentMethod,
      paymentStatus: paymentMethod === 'cash' ? 'pending' : 'pending',
      orderStatus: 'pending',
      deliveryType: deliveryType || 'pickup',
      statusHistory: [{ status: 'pending', timestamp: new Date() }]
    });

    return res.status(201).json({
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        total: order.total,
        paymentMethod: order.paymentMethod,
        orderStatus: order.orderStatus
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/orders - Get all orders for own shop (dashboard)
router.get('/', authenticate, requireShop, async (req: AuthRequest, res: Response) => {
  try {
    const { status, paymentStatus, page = 1, limit = 20, from, to } = req.query;
    const query: any = { shopId: req.user!.shopId };

    if (status) query.orderStatus = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(String(from));
      if (to) query.createdAt.$lte = new Date(String(to));
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Order.countDocuments(query)
    ]);

    return res.json({ orders, total, page: Number(page), limit: Number(limit) });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/:id - Get single order
router.get('/:id', authenticate, requireShop, async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, shopId: req.user!.shopId });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    return res.json({ order });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/track/:orderNumber - Customer order tracking (no auth)
router.get('/track/:orderNumber', async (req: Request, res: Response) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber })
      .select('orderNumber orderStatus paymentStatus total items customer.name deliveryType createdAt statusHistory');
    if (!order) return res.status(404).json({ error: 'Order not found' });
    return res.json({ order });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// PATCH /api/orders/:id/status - Update order status
router.patch('/:id/status', authenticate, requireShop, async (req: AuthRequest, res: Response) => {
  try {
    const { status, note } = req.body;
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });

    const order = await Order.findOne({ _id: req.params.id, shopId: req.user!.shopId });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    order.orderStatus = status;
    order.statusHistory.push({ status, timestamp: new Date(), note });

    // If delivered and cash payment, mark as paid
    if (status === 'delivered' && order.paymentMethod === 'cash') {
      order.paymentStatus = 'paid';
    }

    // Reduce stock when confirmed
    if (status === 'confirmed' && order.orderStatus !== 'confirmed') {
      for (const item of order.items) {
        if (item.productId) {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { quantity: -item.quantity }
          });
        }
      }
    }

    await order.save();
    return res.json({ order });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// PATCH /api/orders/:id/payment - Mark payment received
router.patch('/:id/payment', authenticate, requireShop, async (req: AuthRequest, res: Response) => {
  try {
    const { paymentStatus } = req.body;
    if (!['pending', 'paid', 'failed', 'refunded'].includes(paymentStatus)) {
      return res.status(400).json({ error: 'Invalid paymentStatus' });
    }
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, shopId: req.user!.shopId },
      { paymentStatus },
      { new: true }
    );
    if (!order) return res.status(404).json({ error: 'Order not found' });
    return res.json({ order });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/stats/summary - Dashboard stats
router.get('/stats/summary', authenticate, requireShop, async (req: AuthRequest, res: Response) => {
  try {
    const shopId = req.user!.shopId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalOrders, pendingOrders, confirmedOrders, completedOrders, cancelledOrders,
      todayOrders, totalRevenueAgg, todayRevenueAgg
    ] = await Promise.all([
      Order.countDocuments({ shopId }),
      Order.countDocuments({ shopId, orderStatus: 'pending' }),
      Order.countDocuments({ shopId, orderStatus: { $in: ['confirmed', 'preparing', 'ready'] } }),
      Order.countDocuments({ shopId, orderStatus: 'delivered' }),
      Order.countDocuments({ shopId, orderStatus: 'cancelled' }),
      Order.countDocuments({ shopId, createdAt: { $gte: today } }),
      Order.aggregate([
        { $match: { shopId: require('mongoose').Types.ObjectId.createFromHexString(shopId!), paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Order.aggregate([
        { $match: { shopId: require('mongoose').Types.ObjectId.createFromHexString(shopId!), paymentStatus: 'paid', createdAt: { $gte: today } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ])
    ]);

    return res.json({
      totalOrders,
      pendingOrders,
      confirmedOrders,
      completedOrders,
      cancelledOrders,
      todayOrders,
      totalRevenue: totalRevenueAgg[0]?.total || 0,
      todayRevenue: todayRevenueAgg[0]?.total || 0
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
