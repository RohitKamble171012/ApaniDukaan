'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingCart, CreditCard, Banknote, Truck, MapPin } from 'lucide-react';
import Link from 'next/link';
import { orderApi, paymentApi } from '@/lib/api';
import { useCartStore } from '@/store';
import { formatCurrency } from '@/lib/utils';

const schema = z.object({
  name: z.string().min(2, 'Name required'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Valid 10-digit mobile number required'),
  note: z.string().optional(),
  paymentMethod: z.enum(['cash', 'online']),
  deliveryType: z.enum(['pickup', 'delivery'])
});
type FormData = z.infer<typeof schema>;

declare global {
  interface Window { Razorpay: any; }
}

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.shopSlug as string;
  const { items, subtotal, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { paymentMethod: 'cash', deliveryType: 'pickup' }
  });

  const paymentMethod = watch('paymentMethod');

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <ShoppingCart size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 mb-4">Your cart is empty</p>
          <Link href={`/shop/${slug}`} className="text-indigo-600 font-medium">← Back to shop</Link>
        </div>
      </div>
    );
  }

  async function loadRazorpay(): Promise<boolean> {
    return new Promise(resolve => {
      if (window.Razorpay) { resolve(true); return; }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  async function onSubmit(values: FormData) {
    setLoading(true);
    try {
      // Create order in backend
      const orderPayload = {
        customer: { name: values.name, phone: values.phone, note: values.note },
        items: items.map(item => ({ productId: item.productId, productName: item.productName, quantity: item.quantity })),
        paymentMethod: values.paymentMethod,
        deliveryType: values.deliveryType
      };

      const { data: orderData } = await orderApi.place(slug, orderPayload);
      const order = orderData.order;

      if (values.paymentMethod === 'cash') {
        clearCart();
        router.push(`/shop/${slug}/confirmation?order=${order.orderNumber}`);
        return;
      }

      // Razorpay payment flow
      const loaded = await loadRazorpay();
      if (!loaded) { toast.error('Payment gateway failed to load'); setLoading(false); return; }

      const { data: razorpayData } = await paymentApi.createOrder({
        orderId: order._id,
        amount: order.total
      });

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: razorpayData.amount,
        currency: razorpayData.currency,
        name: 'SmartShop',
        description: `Order ${order.orderNumber}`,
        order_id: razorpayData.razorpayOrderId,
        handler: async (response: any) => {
          try {
            await paymentApi.verify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: order._id
            });
            clearCart();
            router.push(`/shop/${slug}/confirmation?order=${order.orderNumber}&paid=true`);
          } catch {
            toast.error('Payment verification failed. Please contact the shop.');
          }
        },
        prefill: { name: values.name, contact: values.phone },
        theme: { color: '#6366f1' },
        modal: { ondismiss: () => { setLoading(false); toast.error('Payment cancelled'); } }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast.error(err.message || 'Failed to place order');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href={`/shop/${slug}`} className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 hover:border-slate-300">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-lg font-bold text-slate-900">Checkout</h1>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-5">
          <h2 className="font-semibold text-slate-800 mb-3">Your Order ({items.length} items)</h2>
          <div className="space-y-2 mb-3">
            {items.map(item => (
              <div key={item.productId} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{item.productName} × {item.quantity}</span>
                <span className="text-slate-800 font-medium">{formatCurrency((item.discountPrice || item.price) * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between pt-3 border-t border-slate-100">
            <span className="font-bold text-slate-900">Total</span>
            <span className="font-bold text-slate-900 text-lg">{formatCurrency(subtotal())}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Customer Details */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-800 mb-4">Your Details</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Full Name *</label>
                <input {...register('name')} placeholder="Rahul Sharma"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-300" />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Mobile Number *</label>
                <input {...register('phone')} placeholder="9876543210" maxLength={10}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-300" />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Order Note (optional)</label>
                <input {...register('note')} placeholder="Any special instructions..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-300" />
              </div>
            </div>
          </div>

          {/* Delivery Type */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-800 mb-3">Delivery Option</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'pickup', label: 'Store Pickup', icon: MapPin, desc: 'Collect from shop' },
                { value: 'delivery', label: 'Home Delivery', icon: Truck, desc: 'Delivered to you' }
              ].map(opt => (
                <label key={opt.value} className="relative cursor-pointer">
                  <input type="radio" {...register('deliveryType')} value={opt.value} className="sr-only" />
                  <div className={`p-4 rounded-xl border-2 transition-all ${watch('deliveryType') === opt.value ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white'}`}>
                    <opt.icon size={18} className={watch('deliveryType') === opt.value ? 'text-indigo-600' : 'text-slate-400'} />
                    <p className="font-medium text-sm mt-1 text-slate-800">{opt.label}</p>
                    <p className="text-xs text-slate-500">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-800 mb-3">Payment Method</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'cash', label: 'Cash', icon: Banknote, desc: 'Pay at pickup/delivery' },
                { value: 'online', label: 'Pay Online', icon: CreditCard, desc: 'UPI, cards, wallets' }
              ].map(opt => (
                <label key={opt.value} className="relative cursor-pointer">
                  <input type="radio" {...register('paymentMethod')} value={opt.value} className="sr-only" />
                  <div className={`p-4 rounded-xl border-2 transition-all ${paymentMethod === opt.value ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white'}`}>
                    <opt.icon size={18} className={paymentMethod === opt.value ? 'text-indigo-600' : 'text-slate-400'} />
                    <p className="font-medium text-sm mt-1 text-slate-800">{opt.label}</p>
                    <p className="text-xs text-slate-500">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white py-4 rounded-2xl font-semibold text-base transition-colors shadow-lg shadow-indigo-200">
            {loading ? 'Placing order...' : paymentMethod === 'online' ? `Pay ${formatCurrency(subtotal())}` : `Place Order · ${formatCurrency(subtotal())}`}
          </button>
        </form>
      </div>
    </div>
  );
}
