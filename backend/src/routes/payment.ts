import { Router, Request, Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/Order';

const router = Router();

function getRazorpay() {
  const keyId     = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret || keyId.includes('dummy')) {
    throw new Error('RAZORPAY_NOT_CONFIGURED');
  }

  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

// ─── CREATE ORDER ─────────────────────────────────────────────────────────────
router.post('/create-order', async (req: Request, res: Response) => {
  try {
    const { orderId, amount, currency = 'INR' } = req.body;

    if (!orderId || !amount) {
      return res.status(400).json({ error: 'orderId and amount are required' });
    }

    let razorpay: Razorpay;
    try {
      razorpay = getRazorpay();
    } catch {
      return res.status(503).json({
        error: 'Online payment is not configured yet. Please use Cash or UPI QR code.',
        code: 'PAYMENT_NOT_CONFIGURED'
      });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const razorpayOrder = await (razorpay as any).orders.create({
      amount:   Math.round(Number(amount) * 100), // paise
      currency,
      receipt:  `rcpt_${Date.now()}`,
      notes:    {
        internalOrderId: orderId,
        orderNumber:     order.orderNumber,
        platform:        'ApaniDukaan'
      }
    });

    await Order.findByIdAndUpdate(orderId, {
      razorpayOrderId: razorpayOrder.id
    });

    return res.json({
      razorpayOrderId: razorpayOrder.id,
      amount:          razorpayOrder.amount,   // in paise
      currency:        razorpayOrder.currency,
      keyId:           process.env.RAZORPAY_KEY_ID,
      orderNumber:     order.orderNumber
    });

  } catch (err: any) {
    console.error('Razorpay create-order error:', err?.error || err?.message || err);

    if (err?.error?.description) {
      return res.status(500).json({ error: `Payment gateway: ${err.error.description}` });
    }
    return res.status(500).json({ error: err.message || 'Payment gateway error' });
  }
});

// ─── VERIFY PAYMENT ───────────────────────────────────────────────────────────
router.post('/verify', async (req: Request, res: Response) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return res.status(400).json({ error: 'All payment fields are required for verification' });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret || secret.includes('dummy')) {
      return res.status(503).json({ error: 'Payment verification not configured' });
    }

    // Verify signature — this is the security check
    const body             = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      await Order.findByIdAndUpdate(orderId, { paymentStatus: 'failed' });
      return res.status(400).json({ error: 'Payment verification failed — invalid signature' });
    }

    // Signature valid — mark order as paid
    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        paymentStatus:     'paid',
        razorpayPaymentId: razorpay_payment_id,
        orderStatus:       'confirmed',
        $push: {
          statusHistory: {
            status:    'confirmed',
            timestamp: new Date(),
            note:      `Payment verified via Razorpay — ${razorpay_payment_id}`
          }
        }
      },
      { new: true }
    );

    if (!order) return res.status(404).json({ error: 'Order not found' });

    return res.json({
      success:     true,
      orderNumber: order.orderNumber,
      paymentId:   razorpay_payment_id,
      message:     'Payment verified successfully'
    });

  } catch (err: any) {
    console.error('Payment verify error:', err);
    return res.status(500).json({ error: err.message || 'Verification failed' });
  }
});

// ─── WEBHOOK (optional but good to have) ──────────────────────────────────────
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (webhookSecret) {
      const signature = req.headers['x-razorpay-signature'] as string;
      const body      = JSON.stringify(req.body);
      const expected  = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex');

      if (signature !== expected) {
        return res.status(400).json({ error: 'Invalid webhook signature' });
      }
    }

    const { event, payload } = req.body;

    if (event === 'payment.captured') {
      const rzpOrderId = payload?.payment?.entity?.order_id;
      const rzpPayId   = payload?.payment?.entity?.id;
      if (rzpOrderId) {
        await Order.findOneAndUpdate(
          { razorpayOrderId: rzpOrderId },
          {
            paymentStatus:     'paid',
            razorpayPaymentId: rzpPayId,
            orderStatus:       'confirmed'
          }
        );
      }
    }

    if (event === 'payment.failed') {
      const rzpOrderId = payload?.payment?.entity?.order_id;
      if (rzpOrderId) {
        await Order.findOneAndUpdate(
          { razorpayOrderId: rzpOrderId },
          { paymentStatus: 'failed' }
        );
      }
    }

    return res.json({ status: 'ok' });

  } catch (err: any) {
    console.error('Webhook error:', err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
