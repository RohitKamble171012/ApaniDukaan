import { Router, Response } from 'express';
import { authenticate, requireShop, AuthRequest } from '../middleware/auth';
import Order from '../models/Order';
import Product from '../models/Product';
import Feedback from '../models/Feedback';
import mongoose from 'mongoose';

const router = Router();

router.get('/dashboard', authenticate, requireShop, async (req: AuthRequest, res: Response) => {
  try {
    const shopId = new mongoose.Types.ObjectId(req.user!.shopId!);
    const { days = 30 } = req.query;
    const since = new Date();
    since.setDate(since.getDate() - Number(days));

    // Sales trend
    const salesTrend = await Order.aggregate([
      { $match: { shopId, paymentStatus: 'paid', createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Top selling products
    const topProducts = await Order.aggregate([
      { $match: { shopId, orderStatus: 'delivered', createdAt: { $gte: since } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productName',
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: '$items.subtotal' }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 }
    ]);

    // Low stock
    const lowStock = await Product.find({ shopId, quantity: { $lte: 10 }, availability: true })
      .select('productName quantity unit category sku')
      .sort({ quantity: 1 })
      .limit(20);

    // Category performance
    const categoryPerformance = await Order.aggregate([
      { $match: { shopId, orderStatus: 'delivered' } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      {
        $unwind: {
          path: '$productInfo',
          preserveNullAndEmptyArrays: true   // FIXED: was preserveNullAndEmpty
        }
      },
      {
        $group: {
          _id: { $ifNull: ['$productInfo.category', 'Unknown'] },
          revenue: { $sum: '$items.subtotal' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    // Monthly revenue
    const monthlyRevenue = await Order.aggregate([
      { $match: { shopId, paymentStatus: 'paid' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 6 }
    ]);

    // ── BEHAVIORAL ANALYTICS ──────────────────────────────────────

    // Peak hours (0-23)
    const peakHours = await Order.aggregate([
      { $match: { shopId, createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          orders: { $sum: 1 },
          revenue: { $sum: '$total' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Busy days (0=Sun, 1=Mon ... 6=Sat)
    const busyDays = await Order.aggregate([
      { $match: { shopId, createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dayOfWeek: '$createdAt' }, // 1=Sun, 7=Sat in MongoDB
          orders: { $sum: 1 },
          revenue: { $sum: '$total' }
        }
      },
      { $sort: { orders: -1 } }
    ]);

    const DAY_NAMES = ['', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const busyDaysMapped = busyDays.map(d => ({
      day: DAY_NAMES[d._id] || 'Unknown',
      dayNum: d._id,
      orders: d.orders,
      revenue: d.revenue
    }));

    // Product velocity — how fast each product sells (units/day)
    const allOrderedItems = await Order.aggregate([
      { $match: { shopId, createdAt: { $gte: since } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productName',
          totalSold: { $sum: '$items.quantity' },
          revenue:   { $sum: '$items.subtotal' },
          orderCount: { $sum: 1 }
        }
      }
    ]);

    const daysCount = Math.max(Number(days), 1);
    const productVelocity = allOrderedItems
      .map(item => ({
        name: item._id,
        totalSold: item.totalSold,
        velocity: parseFloat((item.totalSold / daysCount).toFixed(2)),
        revenue: item.revenue
      }))
      .sort((a, b) => b.velocity - a.velocity)
      .slice(0, 10);

    // Surge alerts — products whose sales spiked in last 7 days vs previous 7 days
    const last7  = new Date(); last7.setDate(last7.getDate() - 7);
    const prev7start = new Date(); prev7start.setDate(prev7start.getDate() - 14);

    const [recentSales, previousSales] = await Promise.all([
      Order.aggregate([
        { $match: { shopId, createdAt: { $gte: last7 } } },
        { $unwind: '$items' },
        { $group: { _id: '$items.productName', qty: { $sum: '$items.quantity' } } }
      ]),
      Order.aggregate([
        { $match: { shopId, createdAt: { $gte: prev7start, $lt: last7 } } },
        { $unwind: '$items' },
        { $group: { _id: '$items.productName', qty: { $sum: '$items.quantity' } } }
      ])
    ]);

    const prevMap = new Map(previousSales.map((p: any) => [p._id, p.qty]));
    const surgeAlerts = recentSales
      .map((r: any) => {
        const prev  = prevMap.get(r._id) || 0;
        const surge = prev === 0 ? 100 : Math.round(((r.qty - prev) / prev) * 100);
        return { name: r._id, recentQty: r.qty, prevQty: prev, surgePercent: surge };
      })
      .filter((r: any) => r.surgePercent >= 50)
      .sort((a: any, b: any) => b.surgePercent - a.surgePercent)
      .slice(0, 5);

    // Average order value trend
    const avgOrderValue = await Order.aggregate([
      { $match: { shopId, paymentStatus: 'paid', createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          avgValue: { $avg: '$total' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Repeat customer detection (same phone ordering multiple times)
    const repeatCustomers = await Order.aggregate([
      { $match: { shopId } },
      { $group: { _id: '$customer.phone', orderCount: { $sum: 1 }, totalSpent: { $sum: '$total' } } },
      { $match: { orderCount: { $gt: 1 } } },
      { $count: 'total' }
    ]);

    const totalCustomers = await Order.aggregate([
      { $match: { shopId } },
      { $group: { _id: '$customer.phone' } },
      { $count: 'total' }
    ]);

    // Requested unavailable items
    const requestedItems = await Feedback.aggregate([
      { $match: { shopId, type: 'item_request' } },
      { $unwind: '$requestedItems' },
      {
        $group: {
          _id: { $toLower: '$requestedItems.name' },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Smart recommendations
    const recommendations: Array<{ type: string; message: string; priority: 'high'|'medium'|'low' }> = [];

    if (lowStock.length > 0) {
      const critical = lowStock.filter(p => p.quantity <= 3);
      if (critical.length > 0) {
        recommendations.push({
          type: 'restock',
          message: `🚨 "${critical[0].productName}" has only ${critical[0].quantity} units left — restock immediately.`,
          priority: 'high'
        });
      }
    }

    if (surgeAlerts.length > 0) {
      recommendations.push({
        type: 'surge',
        message: `📈 "${surgeAlerts[0].name}" sales surged +${surgeAlerts[0].surgePercent}% this week — keep extra stock ready.`,
        priority: 'high'
      });
    }

    if (topProducts.length > 0) {
      recommendations.push({
        type: 'bestseller',
        message: `⭐ "${topProducts[0]._id}" is your #1 product with ${topProducts[0].totalSold} units sold. Never let it go out of stock.`,
        priority: 'medium'
      });
    }

    if (requestedItems.length > 0) {
      recommendations.push({
        type: 'demand',
        message: `💡 Customers keep asking for "${requestedItems[0]._id}" (${requestedItems[0].count} requests). Consider adding it.`,
        priority: 'medium'
      });
    }

    const peakHour = peakHours.sort((a: any, b: any) => b.orders - a.orders)[0];
    if (peakHour) {
      const h = peakHour._id;
      const label = h === 0 ? '12am' : h < 12 ? `${h}am` : h === 12 ? '12pm' : `${h-12}pm`;
      recommendations.push({
        type: 'timing',
        message: `🕐 Your busiest hour is ${label}. Make sure stock and staff are ready before then.`,
        priority: 'low'
      });
    }

    const busyDay = busyDaysMapped.sort((a, b) => b.orders - a.orders)[0];
    if (busyDay) {
      recommendations.push({
        type: 'timing',
        message: `📅 ${busyDay.day} is your busiest day with ${busyDay.orders} orders. Plan restocking before ${busyDay.day}.`,
        priority: 'low'
      });
    }

    return res.json({
      salesTrend,
      topProducts,
      lowStock,
      categoryPerformance,
      monthlyRevenue: monthlyRevenue.reverse(),
      requestedItems,
      recommendations,
      // Behavioral
      peakHours: peakHours.sort((a: any, b: any) => a._id - b._id),
      busyDays: busyDaysMapped,
      productVelocity,
      surgeAlerts,
      avgOrderValue,
      customerStats: {
        total: totalCustomers[0]?.total || 0,
        repeat: repeatCustomers[0]?.total || 0
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/sales', authenticate, requireShop, async (req: AuthRequest, res: Response) => {
  try {
    const shopId = new mongoose.Types.ObjectId(req.user!.shopId!);
    const { from, to, groupBy = 'day' } = req.query;

    const dateMatch: any = {};
    if (from) dateMatch.$gte = new Date(String(from));
    if (to)   dateMatch.$lte = new Date(String(to));

    const formatMap: Record<string, string> = {
      day:   '%Y-%m-%d',
      week:  '%Y-W%V',
      month: '%Y-%m'
    };
    const format = formatMap[String(groupBy)] || '%Y-%m-%d';

    const sales = await Order.aggregate([
      {
        $match: {
          shopId,
          orderStatus: { $in: ['delivered', 'confirmed'] },
          ...(Object.keys(dateMatch).length ? { createdAt: dateMatch } : {})
        }
      },
      {
        $group: {
          _id:        { $dateToString: { format, date: '$createdAt' } },
          totalSales: { $sum: '$total' },
          orderCount: { $sum: 1 },
          paidOrders: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return res.json({ sales });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;