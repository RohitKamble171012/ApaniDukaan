'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { X, ChevronDown, ShoppingCart } from 'lucide-react';
import { orderApi } from '@/lib/api';
import { formatCurrency, formatDateTime, ORDER_STATUS_COLORS, PAYMENT_STATUS_COLORS } from '@/lib/utils';

const STATUS_OPTIONS = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [updating, setUpdating] = useState(false);

  async function load(status = filter) {
    setLoading(true);
    try {
      const { data } = await orderApi.list({ status: status || undefined, limit: 50 });
      setOrders(data.orders); setTotal(data.total);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(id: string, status: string) {
    setUpdating(true);
    try {
      await orderApi.updateStatus(id, status);
      toast.success(`Order ${status}`);
      if (selected?._id === id) setSelected((prev: any) => ({ ...prev, orderStatus: status }));
      load(filter);
    } catch (err: any) { toast.error(err.message); }
    finally { setUpdating(false); }
  }

  async function markPaid(id: string) {
    try {
      await orderApi.updatePayment(id, 'paid');
      toast.success('Marked as paid');
      if (selected?._id === id) setSelected((prev: any) => ({ ...prev, paymentStatus: 'paid' }));
      load(filter);
    } catch (err: any) { toast.error(err.message); }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-stone-800">Orders</h1>
          <p className="text-amber-600 text-sm">{total} total orders</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {['', ...STATUS_OPTIONS].map(s => (
          <button key={s} onClick={() => { setFilter(s); load(s); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${filter === s ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="bg-white border border-amber-100 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-amber-50/50 border-b border-amber-200">
              <tr>
                {['Order', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-amber-600 font-medium text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}><td colSpan={8} className="px-4 py-3"><div className="h-4 bg-amber-100/50 rounded shimmer" /></td></tr>
                ))
              ) : orders.length === 0 ? (
                <tr><td colSpan={8} className="py-16 text-center">
                  <ShoppingCart size={40} className="mx-auto text-amber-800 mb-3" />
                  <p className="text-amber-500">No orders yet</p>
                </td></tr>
              ) : orders.map(order => (
                <tr key={order._id} className="hover:bg-amber-50 transition-colors cursor-pointer" onClick={() => setSelected(order)}>
                  <td className="px-4 py-3"><span className="text-amber-600 font-mono text-xs">{order.orderNumber}</span></td>
                  <td className="px-4 py-3">
                    <p className="text-stone-800 text-sm">{order.customer.name}</p>
                    <p className="text-amber-500 text-xs">{order.customer.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-amber-600">{order.items.length} items</td>
                  <td className="px-4 py-3 text-stone-800 font-medium">{formatCurrency(order.total)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${PAYMENT_STATUS_COLORS[order.paymentStatus]}`}>
                      {order.paymentMethod === 'cash' ? 'Cash' : 'Online'} · {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${ORDER_STATUS_COLORS[order.orderStatus]}`}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-amber-500 text-xs">{formatDateTime(order.createdAt)}</td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <div className="flex gap-1">
                      {order.orderStatus === 'pending' && (
                        <>
                          <button onClick={() => updateStatus(order._id, 'confirmed')} className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 px-2 py-1 rounded transition-colors">Confirm</button>
                          <button onClick={() => updateStatus(order._id, 'cancelled')} className="text-xs bg-red-50 hover:bg-red-100 text-red-500 px-2 py-1 rounded transition-colors">Reject</button>
                        </>
                      )}
                      {order.orderStatus === 'confirmed' && <button onClick={() => updateStatus(order._id, 'preparing')} className="text-xs bg-orange-50 hover:bg-orange-100 text-orange-500 px-2 py-1 rounded transition-colors">Preparing</button>}
                      {order.orderStatus === 'preparing' && <button onClick={() => updateStatus(order._id, 'ready')} className="text-xs bg-purple-50 hover:bg-purple-100 text-purple-500 px-2 py-1 rounded transition-colors">Ready</button>}
                      {order.orderStatus === 'ready' && <button onClick={() => updateStatus(order._id, 'delivered')} className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-600 px-2 py-1 rounded transition-colors">Delivered</button>}
                      {order.paymentMethod === 'cash' && order.paymentStatus === 'pending' && order.orderStatus !== 'cancelled' && (
                        <button onClick={() => markPaid(order._id)} className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-600 px-2 py-1 rounded transition-colors">Mark Paid</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30 }}
              className="bg-white border border-amber-100 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-4 border-b border-amber-200 sticky top-0 bg-white">
                <div>
                  <h2 className="font-semibold text-stone-800">{selected.orderNumber}</h2>
                  <p className="text-amber-600 text-xs">{formatDateTime(selected.createdAt)}</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-amber-600 hover:text-stone-800"><X size={18} /></button>
              </div>
              <div className="p-6 space-y-5">
                {/* Customer */}
                <div className="bg-amber-50 rounded-xl p-4">
                  <p className="text-amber-600 text-xs mb-2">CUSTOMER</p>
                  <p className="text-stone-800 font-medium">{selected.customer.name}</p>
                  <p className="text-amber-600 text-sm">{selected.customer.phone}</p>
                  {selected.customer.note && <p className="text-amber-500 text-xs mt-1">Note: {selected.customer.note}</p>}
                </div>

                {/* Items */}
                <div>
                  <p className="text-amber-600 text-xs mb-3">ORDER ITEMS</p>
                  <div className="space-y-2">
                    {selected.items.map((item: any, i: number) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-amber-100">
                        <div>
                          <p className="text-stone-800 text-sm">{item.productName}</p>
                          <p className="text-amber-500 text-xs">{item.quantity} × {formatCurrency(item.discountPrice || item.price)}</p>
                        </div>
                        <p className="text-stone-800 font-medium">{formatCurrency(item.subtotal)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between pt-3">
                    <span className="text-amber-600">Subtotal</span>
                    <span className="text-stone-800">{formatCurrency(selected.subtotal)}</span>
                  </div>
                  {selected.deliveryCharge > 0 && (
                    <div className="flex justify-between">
                      <span className="text-amber-600">Delivery</span>
                      <span className="text-stone-800">{formatCurrency(selected.deliveryCharge)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-amber-200 mt-2">
                    <span className="text-stone-800 font-semibold">Total</span>
                    <span className="text-stone-800 font-bold text-lg">{formatCurrency(selected.total)}</span>
                  </div>
                </div>

                {/* Status Update */}
                <div className="flex gap-2 flex-wrap">
                  {STATUS_OPTIONS.map(s => (
                    <button key={s} onClick={() => updateStatus(selected._id, s)} disabled={updating || selected.orderStatus === s}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${selected.orderStatus === s ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-600 hover:bg-amber-100 disabled:opacity-50'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}