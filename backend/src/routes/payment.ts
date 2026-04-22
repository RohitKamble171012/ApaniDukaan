import { Router, Request, Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/Order';

const router = Router();

function getRazorpay() {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!
  });
}

// POST /api/payments/create-order - Create Razorpay order
router.post('/create-order', async (req: Request, res: Response) => {
  try {
    const { orderId, amount, currency = 'INR', receipt } = req.body;

    if (!orderId || !amount) {
      return res.status(400).json({ error: 'orderId and amount are required' });
    }

    const razorpay = getRazorpay();

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      receipt: receipt || `order_${Date.now()}`,
      notes: { internalOrderId: orderId }
    });

    // Update order with razorpay order ID
    await Order.findByIdAndUpdate(orderId, { razorpayOrderId: razorpayOrder.id });

    return res.json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (err: any) {
    console.error('Razorpay create order error:', err);
    return res.status(500).json({ error: 'Payment gateway error. Please try again.' });
  }
});

// POST /api/payments/verify - Verify payment after completion
router.post('/verify', async (req: Request, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return res.status(400).json({ error: 'All payment verification fields are required' });
    }

    // Verify signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      await Order.findByIdAndUpdate(orderId, { paymentStatus: 'failed' });
      return res.status(400).json({ error: 'Payment verification failed. Invalid signature.' });
    }

    // Update order as paid
    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        paymentStatus: 'paid',
        razorpayPaymentId: razorpay_payment_id,
        orderStatus: 'confirmed',
        $push: {
          statusHistory: { status: 'confirmed', timestamp: new Date(), note: 'Payment received via Razorpay' }
        }
      },
      { new: true }
    );

    if (!order) return res.status(404).json({ error: 'Order not found' });

    return res.json({
      success: true,
      message: 'Payment verified successfully',
      orderNumber: order.orderNumber,
      paymentId: razorpay_payment_id
    });
  } catch (err: any) {
    console.error('Payment verify error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/payments/webhook - Razorpay webhook handler
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (webhookSecret) {
      const signature = req.headers['x-razorpay-signature'];
      const body = JSON.stringify(req.body);
      const expectedSig = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex');

      if (signature !== expectedSig) {
        return res.status(400).json({ error: 'Invalid webhook signature' });
      }
    }

    const event = req.body;

    if (event.event === 'payment.captured') {
      const paymentId = event.payload.payment.entity.id;
      const razorpayOrderId = event.payload.payment.entity.order_id;

      await Order.findOneAndUpdate(
        { razorpayOrderId },
        { paymentStatus: 'paid', razorpayPaymentId: paymentId, orderStatus: 'confirmed' }
      );
    }

    if (event.event === 'payment.failed') {
      const razorpayOrderId = event.payload.payment.entity.order_id;
      await Order.findOneAndUpdate({ razorpayOrderId }, { paymentStatus: 'failed' });
    }

    return res.json({ status: 'ok' });
  } catch (err: any) {
    console.error('Webhook error:', err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
