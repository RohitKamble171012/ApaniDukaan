'use client';

import { useSearchParams, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { CheckCircle, ShoppingBag, Package } from 'lucide-react';

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const orderNumber = searchParams.get('order');
  const paid = searchParams.get('paid') === 'true';
  const slug = params.shopSlug as string;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl border border-slate-200 p-8 max-w-sm w-full text-center shadow-lg">

        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={40} className="text-emerald-600" />
        </motion.div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">Order Placed!</h1>
        <p className="text-slate-500 mb-5">
          {paid ? 'Payment successful. Your order is confirmed!' : 'Your order has been received. Pay when you collect.'}
        </p>

        {orderNumber && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-5">
            <p className="text-xs text-slate-500 mb-1">Order Number</p>
            <p className="font-mono font-bold text-slate-900 text-lg">{orderNumber}</p>
            <p className="text-slate-500 text-xs mt-1">Save this for tracking your order</p>
          </div>
        )}

        <div className="space-y-2 text-sm text-slate-500 mb-6">
          <p>📞 The shop will contact you shortly</p>
          <p>{paid ? '✅ Payment received' : '💵 Pay at pickup/delivery'}</p>
        </div>

        <div className="flex flex-col gap-2">
          <Link href={`/shop/${slug}`}
            className="bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-medium text-sm transition-colors">
            Continue Shopping
          </Link>
          {orderNumber && (
            <Link href={`/track/${orderNumber}`}
              className="border border-slate-200 text-slate-700 py-3 rounded-xl font-medium text-sm hover:bg-slate-50 transition-colors">
              Track Order
            </Link>
          )}
        </div>
      </motion.div>
    </div>
  );
}
