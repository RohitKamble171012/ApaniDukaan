'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingCart, CreditCard, Banknote, Truck, MapPin, QrCode } from 'lucide-react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { orderApi, paymentApi, shopApi } from '@/lib/api';
import { useCartStore } from '@/store';
import { formatCurrency } from '@/lib/utils';

const schema = z.object({
  name:          z.string().min(2, 'Name required'),
  phone:         z.string().regex(/^[6-9]\d{9}$/, 'Valid 10-digit mobile number required'),
  note:          z.string().optional(),
  paymentMethod: z.enum(['cash', 'online', 'upi']),
  deliveryType:  z.enum(['pickup', 'delivery'])
});
type FormData = z.infer<typeof schema>;

declare global { interface Window { Razorpay: any } }

export default function CheckoutPage() {
  const params             = useParams();
  const router             = useRouter();
  const slug               = params.shopSlug as string;
  const { items, subtotal, clearCart } = useCartStore();
  const [loading, setLoading]   = useState(false);
  const [shopData, setShopData] = useState<any>(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver:      zodResolver(schema),
    defaultValues: { paymentMethod: 'cash', deliveryType: 'pickup' }
  });

  const paymentMethod  = watch('paymentMethod');
  const deliveryType   = watch('deliveryType');

  useEffect(() => {
    shopApi.getPublic(slug)
      .then(({ data }) => setShopData(data.shop))
      .catch(() => {});
  }, [slug]);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4">
        <div className="text-center">
          <ShoppingCart size={48} className="mx-auto text-amber-200 mb-4" />
          <p className="text-warm-500 mb-4">Your cart is empty</p>
          <Link href={`/shop/${slug}`} className="text-amber-600 font-semibold">← Back to shop</Link>
        </div>
      </div>
    );
  }

  // Load Razorpay SDK
  async function loadRazorpaySDK(): Promise<boolean> {
    return new Promise(resolve => {
      if (window.Razorpay) { resolve(true); return; }
      const script    = document.createElement('script');
      script.src      = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload   = () => resolve(true);
      script.onerror  = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  async function onSubmit(values: FormData) {
    setLoading(true);
    try {
      // Step 1 — Place order in our DB
      const orderPayload = {
        customer:      { name: values.name, phone: values.phone, note: values.note },
        items:         items.map(i => ({
          productId:   i.productId,
          productName: i.productName,
          quantity:    i.quantity
        })),
        paymentMethod: values.paymentMethod === 'upi' ? 'online' : values.paymentMethod,
        deliveryType:  values.deliveryType
      };

      const { data: orderData } = await orderApi.place(slug, orderPayload);
      const order = orderData.order;

      // Step 2a — Cash: go directly to confirmation
      if (values.paymentMethod === 'cash') {
        clearCart();
        router.push(`/shop/${slug}/confirmation?order=${order.orderNumber}`);
        return;
      }

      // Step 2b — UPI QR: show QR on confirmation page
      if (values.paymentMethod === 'upi') {
        clearCart();
        router.push(`/shop/${slug}/confirmation?order=${order.orderNumber}&payment=upi`);
        return;
      }

      // Step 2c — Online card via Razorpay
      const sdkLoaded = await loadRazorpaySDK();
      if (!sdkLoaded) {
        toast.error('Payment gateway failed to load. Please try UPI or Cash.');
        setLoading(false);
        return;
      }

      // Step 3 — Create Razorpay order on backend
      let cfData: any;
      try {
        const { data } = await paymentApi.createOrder({
          orderId:  order._id,
          amount:   order.total
        });
        cfData = data;
      } catch (err: any) {
        if (err.message?.includes('PAYMENT_NOT_CONFIGURED') || err.message?.includes('not configured')) {
          toast.error('Card payment not ready yet. Please use UPI or Cash.');
        } else {
          toast.error(err.message || 'Could not initiate payment');
        }
        setLoading(false);
        return;
      }

      // Step 4 — Open Razorpay checkout
      const options = {
        key:          cfData.keyId,
        amount:       cfData.amount,         // in paise
        currency:     cfData.currency,
        name:         'ApaniDukaan',
        description:  `Order ${order.orderNumber}`,
        image:        'https://apanidukaan.live/logo.png',
        order_id:     cfData.razorpayOrderId,

        // Step 5 — On success: verify on backend
        handler: async (response: any) => {
          try {
            const { data: verifyData } = await paymentApi.verify({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              orderId:             order._id
            });

            if (verifyData.success) {
              clearCart();
              router.push(
                `/shop/${slug}/confirmation?order=${order.orderNumber}&paid=true&paymentId=${response.razorpay_payment_id}`
              );
            } else {
              toast.error('Payment verification failed. Contact the shop.');
            }
          } catch {
            toast.error('Payment done but verification failed. Note your order number and contact shop.');
            clearCart();
            router.push(`/shop/${slug}/confirmation?order=${order.orderNumber}&paid=pending`);
          }
        },

        prefill: {
          name:    values.name,
          contact: values.phone
        },

        notes: {
          order_number: order.orderNumber,
          platform:     'ApaniDukaan'
        },

        theme:  { color: '#f59e0b' },

        modal: {
          ondismiss: () => {
            toast.error('Payment cancelled. Your order is saved — you can pay later at pickup.');
            setLoading(false);
          },
          confirm_close:  true,
          escape:         false,
          animation:      true
        },

        // Show all payment methods including UPI
        method: {
          upi:        true,
          card:       true,
          netbanking: true,
          wallet:     true,
          emi:        false
        }
      };

      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', (response: any) => {
        toast.error(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });

      rzp.open();

    } catch (err: any) {
      toast.error(err.message || 'Failed to place order. Please try again.');
      setLoading(false);
    }
  }

  const deliveryCharge = deliveryType === 'delivery'
    ? (shopData?.deliverySettings?.deliveryCharge || 0)
    : 0;
  const total = subtotal() + deliveryCharge;

  const acceptsCash   = shopData?.paymentSettings?.acceptCash   !== false;
  const acceptsOnline = shopData?.paymentSettings?.acceptOnline !== false;
  const upiId         = shopData?.paymentSettings?.upiId;

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="max-w-lg mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href={`/shop/${slug}`}
            className="p-2 bg-white rounded-xl border border-amber-100 text-warm-600 hover:border-amber-300 transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-lg font-bold text-warm-900">Checkout</h1>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl border border-amber-100 p-5 mb-4 shadow-sm">
          <h2 className="font-bold text-warm-800 mb-3 text-sm uppercase tracking-wide">
            Order Summary ({items.length} items)
          </h2>
          <div className="space-y-2 mb-3">
            {items.map(item => (
              <div key={item.productId} className="flex justify-between text-sm">
                <span className="text-warm-600">
                  {item.productName}
                  <span className="text-warm-400 ml-1">× {item.quantity}</span>
                </span>
                <span className="text-warm-800 font-medium">
                  {formatCurrency((item.discountPrice || item.price) * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          {deliveryCharge > 0 && (
            <div className="flex justify-between text-sm text-warm-500 pt-2 border-t border-amber-50">
              <span>Delivery charge</span>
              <span>{formatCurrency(deliveryCharge)}</span>
            </div>
          )}
          <div className="flex justify-between pt-3 border-t border-amber-100 mt-2">
            <span className="font-bold text-warm-900">Total</span>
            <span className="font-bold text-warm-900 text-xl">{formatCurrency(total)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {/* Customer Details */}
          <div className="bg-white rounded-2xl border border-amber-100 p-5 shadow-sm">
            <h2 className="font-bold text-warm-800 mb-4 text-sm uppercase tracking-wide">Your Details</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-warm-600 mb-1.5 block">
                  Full Name <span className="text-amber-500">*</span>
                </label>
                <input {...register('name')} placeholder="Rahul Sharma"
                  className="w-full bg-amber-50 border-2 border-amber-100 rounded-xl px-4 py-3 text-sm text-warm-800 placeholder-warm-300 focus:outline-none focus:border-amber-400 transition-all" />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-warm-600 mb-1.5 block">
                  Mobile Number <span className="text-amber-500">*</span>
                </label>
                <input {...register('phone')} placeholder="9876543210" maxLength={10}
                  className="w-full bg-amber-50 border-2 border-amber-100 rounded-xl px-4 py-3 text-sm text-warm-800 placeholder-warm-300 focus:outline-none focus:border-amber-400 transition-all" />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-warm-600 mb-1.5 block">Note (optional)</label>
                <input {...register('note')} placeholder="Any special instructions..."
                  className="w-full bg-amber-50 border-2 border-amber-100 rounded-xl px-4 py-3 text-sm text-warm-800 placeholder-warm-300 focus:outline-none focus:border-amber-400 transition-all" />
              </div>
            </div>
          </div>

          {/* Delivery Type */}
          <div className="bg-white rounded-2xl border border-amber-100 p-5 shadow-sm">
            <h2 className="font-bold text-warm-800 mb-3 text-sm uppercase tracking-wide">How to Receive</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'pickup',   label: 'Store Pickup',   icon: MapPin,  desc: 'Collect from shop' },
                { value: 'delivery', label: 'Home Delivery',  icon: Truck,   desc: 'Delivered to you'  }
              ].map(opt => (
                <label key={opt.value} className="cursor-pointer">
                  <input type="radio" {...register('deliveryType')} value={opt.value} className="sr-only" />
                  <div className={`p-4 rounded-2xl border-2 transition-all
                    ${deliveryType === opt.value
                      ? 'border-amber-400 bg-amber-50 shadow-md shadow-amber-100'
                      : 'border-amber-100 bg-white hover:border-amber-200'}`}>
                    <opt.icon size={20} className={deliveryType === opt.value ? 'text-amber-500' : 'text-warm-400'} />
                    <p className="font-bold text-sm mt-2 text-warm-800">{opt.label}</p>
                    <p className="text-xs text-warm-400">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-2xl border border-amber-100 p-5 shadow-sm">
            <h2 className="font-bold text-warm-800 mb-3 text-sm uppercase tracking-wide">Payment Method</h2>
            <div className="space-y-3">

              {/* Cash */}
              {acceptsCash && (
                <label className="cursor-pointer">
                  <input type="radio" {...register('paymentMethod')} value="cash" className="sr-only" />
                  <div className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all
                    ${paymentMethod === 'cash'
                      ? 'border-amber-400 bg-amber-50'
                      : 'border-amber-100 hover:border-amber-200'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                      ${paymentMethod === 'cash' ? 'bg-amber-500' : 'bg-amber-100'}`}>
                      <Banknote size={18} className={paymentMethod === 'cash' ? 'text-white' : 'text-amber-600'} />
                    </div>
                    <div>
                      <p className="font-bold text-warm-800 text-sm">Cash on Pickup / Delivery</p>
                      <p className="text-warm-400 text-xs">Pay with cash when you receive your order</p>
                    </div>
                    <div className={`ml-auto w-5 h-5 rounded-full border-2 transition-all
                      ${paymentMethod === 'cash' ? 'bg-amber-500 border-amber-500' : 'border-warm-300'}`} />
                  </div>
                </label>
              )}

              {/* UPI QR */}
              {upiId && (
                <label className="cursor-pointer">
                  <input type="radio" {...register('paymentMethod')} value="upi" className="sr-only" />
                  <div className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all
                    ${paymentMethod === 'upi'
                      ? 'border-amber-400 bg-amber-50'
                      : 'border-amber-100 hover:border-amber-200'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                      ${paymentMethod === 'upi' ? 'bg-amber-500' : 'bg-amber-100'}`}>
                      <QrCode size={18} className={paymentMethod === 'upi' ? 'text-white' : 'text-amber-600'} />
                    </div>
                    <div>
                      <p className="font-bold text-warm-800 text-sm">UPI — Scan & Pay</p>
                      <p className="text-warm-400 text-xs">GPay, PhonePe, Paytm, BHIM — any UPI app</p>
                    </div>
                    <div className={`ml-auto w-5 h-5 rounded-full border-2 transition-all
                      ${paymentMethod === 'upi' ? 'bg-amber-500 border-amber-500' : 'border-warm-300'}`} />
                  </div>
                </label>
              )}

              {/* UPI QR Preview */}
              {paymentMethod === 'upi' && upiId && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-5 text-center">
                  <p className="text-warm-500 text-xs mb-3">
                    Scan after placing order, or pay now and show confirmation
                  </p>
                  <div className="bg-white rounded-2xl p-3 inline-block shadow-md border border-amber-100 mb-3">
                    <QRCodeSVG
                      value={`upi://pay?pa=${upiId}&pn=${encodeURIComponent(shopData?.shopName || 'ApaniDukaan')}&am=${total.toFixed(2)}&cu=INR&tn=${encodeURIComponent('ApaniDukaan Order')}`}
                      size={160}
                      level="H"
                      includeMargin
                    />
                  </div>
                  <div className="bg-white border border-amber-100 rounded-xl px-4 py-2.5 mb-2 inline-block min-w-[180px]">
                    <p className="text-xs text-warm-400">UPI ID</p>
                    <p className="font-bold text-warm-900 text-sm">{upiId}</p>
                  </div>
                  <p className="text-amber-600 font-extrabold text-2xl mt-2">{formatCurrency(total)}</p>
                </motion.div>
              )}

              {/* Online Card via Razorpay */}
              {acceptsOnline && (
                <label className="cursor-pointer">
                  <input type="radio" {...register('paymentMethod')} value="online" className="sr-only" />
                  <div className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all
                    ${paymentMethod === 'online'
                      ? 'border-amber-400 bg-amber-50'
                      : 'border-amber-100 hover:border-amber-200'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                      ${paymentMethod === 'online' ? 'bg-amber-500' : 'bg-amber-100'}`}>
                      <CreditCard size={18} className={paymentMethod === 'online' ? 'text-white' : 'text-amber-600'} />
                    </div>
                    <div>
                      <p className="font-bold text-warm-800 text-sm">Pay Online — Card / Netbanking</p>
                      <p className="text-warm-400 text-xs">Secured by Razorpay</p>
                    </div>
                    <div className={`ml-auto w-5 h-5 rounded-full border-2 transition-all
                      ${paymentMethod === 'online' ? 'bg-amber-500 border-amber-500' : 'border-warm-300'}`} />
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* Place Order Button */}
          <button type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400
                       disabled:opacity-60 text-white py-4 rounded-2xl font-bold text-base transition-all
                       shadow-lg shadow-amber-200 hover:shadow-xl hover:-translate-y-0.5 disabled:translate-y-0">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                {paymentMethod === 'online' ? 'Opening payment...' : 'Placing order...'}
              </span>
            ) : (
              <>
                {paymentMethod === 'online'
                  ? `Pay ${formatCurrency(total)} →`
                  : `Place Order · ${formatCurrency(total)}`
                }
              </>
            )}
          </button>

          <p className="text-center text-warm-400 text-xs">
            🔒 Your information is safe and secure
          </p>
        </form>
      </div>
    </div>
  );
}
