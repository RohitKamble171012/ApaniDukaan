'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Search, Package } from 'lucide-react';
import { orderApi } from '@/lib/api';
import { formatCurrency, formatDateTime, ORDER_STATUS_COLORS, PAYMENT_STATUS_COLORS } from '@/lib/utils';

const STATUS_STEPS = ['pending', 'confirmed', 'preparing', 'ready', 'delivered'];

export default function TrackPage() {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm<{ orderNumber: string }>();

  async function onSubmit({ orderNumber }: { orderNumber: string }) {
    setLoading(true);
    try {
      const { data } = await orderApi.track(orderNumber.trim());
      setOrder(data.order);
    } catch {
      toast.error('Order not found');
      setOrder(null);
    } finally { setLoading(false); }
  }

  const currentStep = order ? STATUS_STEPS.indexOf(order.orderStatus) : -1;

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-lg mx-auto pt-10">
        <div className="text-center mb-8">
          <Package size={40} className="mx-auto text-indigo-600 mb-3" />
          <h1 className="text-2xl font-bold text-slate-900">Track Your Order</h1>
          <p className="text-slate-500 text-sm mt-1">Enter your order number to check status</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2 mb-8">
          <input {...register('orderNumber', { required: true })} placeholder="e.g. ORD-ABC123-DEF4"
            className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:border-indigo-300 shadow-sm" />
          <button type="submit" disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-xl transition-colors disabled:opacity-60">
            <Search size={18} />
          </button>
        </form>

        {order && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono font-bold text-slate-900">{order.orderNumber}</p>
                <p className="text-slate-500 text-xs">{formatDateTime(order.createdAt)}</p>
              </div>
              <span className={`text-xs px-3 py-1.5 rounded-full font-medium capitalize ${ORDER_STATUS_COLORS[order.orderStatus]}`}>
                {order.orderStatus}
              </span>
            </div>

            {/* Progress Steps */}
            {order.orderStatus !== 'cancelled' && (
              <div className="flex items-center justify-between">
                {STATUS_STEPS.map((step, i) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                      ${i <= currentStep ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                      {i < currentStep ? '✓' : i + 1}
                    </div>
                    {i < STATUS_STEPS.length - 1 && (
                      <div className={`h-1 flex-1 mx-1 w-8 ${i < currentStep ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-1 text-xs text-slate-500 text-center">
              {STATUS_STEPS.map((step, i) => (
                <span key={step} className={`capitalize ${i === currentStep ? 'text-indigo-600 font-medium' : ''}`}>
                  {i === currentStep ? `▶ ${step}` : ''}
                </span>
              ))}
            </div>

            {/* Items */}
            <div>
              <p className="text-xs font-medium text-slate-500 mb-2">ORDER ITEMS</p>
              {order.items.map((item: any, i: number) => (
                <div key={i} className="flex justify-between py-1.5 border-b border-slate-100 text-sm">
                  <span className="text-slate-700">{item.productName} × {item.quantity}</span>
                  <span className="text-slate-900 font-medium">{formatCurrency(item.subtotal)}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2 font-bold text-slate-900">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Payment</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${PAYMENT_STATUS_COLORS[order.paymentStatus]}`}>
                {order.paymentStatus}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
