'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { orderApi } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { DollarSign, TrendingUp, Clock, XCircle } from 'lucide-react';

export default function RevenuePage() {
  const [stats, setStats] = useState<any>(null);
  const [recentPaid, setRecentPaid] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, paidRes] = await Promise.all([
          orderApi.stats(),
          orderApi.list({ paymentStatus: 'paid', limit: 10 })
        ]);
        setStats(statsRes.data);
        setRecentPaid(paidRes.data.orders || []);

        const allRes = await orderApi.list({ limit: 200 });
        const orders = allRes.data.orders || [];
        const monthly: Record<string, number> = {};
        orders.filter((o: any) => o.paymentStatus === 'paid').forEach((o: any) => {
          const key = new Date(o.createdAt).toLocaleString('en-IN', { month: 'short', year: '2-digit' });
          monthly[key] = (monthly[key] || 0) + o.total;
        });
        setMonthlyData(Object.entries(monthly).map(([name, revenue]) => ({ name, revenue })).slice(-6));
      } finally { setLoading(false); }
    }
    load();
  }, []);

  if (loading) return <div className="h-64 bg-amber-50 rounded-xl shimmer" />;

  const cards = [
    { label: 'Total Revenue', value: formatCurrency(stats?.totalRevenue || 0), icon: DollarSign, color: 'bg-emerald-500', sub: 'All completed orders' },
    { label: "Today's Revenue", value: formatCurrency(stats?.todayRevenue || 0), icon: TrendingUp, color: 'bg-amber-500', sub: `${stats?.todayOrders || 0} orders today` },
    { label: 'Pending Payments', value: stats?.pendingOrders || 0, icon: Clock, color: 'bg-amber-400', sub: 'Awaiting payment' },
    { label: 'Cancelled Orders', value: stats?.cancelledOrders || 0, icon: XCircle, color: 'bg-red-400', sub: 'Lost revenue potential' }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-stone-800">Revenue</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(c => (
          <div key={c.label} className="bg-white border border-amber-100 rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-amber-600 text-sm">{c.label}</p>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${c.color}`}>
                <c.icon size={15} className="text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-stone-800">{c.value}</p>
            <p className="text-amber-500 text-xs mt-1">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Monthly Revenue Chart */}
      {monthlyData.length > 0 && (
        <div className="bg-white border border-amber-100 rounded-xl p-5">
          <h2 className="font-semibold text-stone-800 mb-5">Monthly Revenue</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#fde68a" />
              <XAxis dataKey="name" tick={{ fill: '#d97706', fontSize: 12 }} />
              <YAxis tick={{ fill: '#d97706', fontSize: 12 }} tickFormatter={v => `₹${v}`} />
              <Tooltip contentStyle={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8 }} formatter={(v: any) => [formatCurrency(v), 'Revenue']} />
              <Bar dataKey="revenue" fill="#f59e0b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Paid Orders */}
      <div className="bg-white border border-amber-100 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-amber-100">
          <h2 className="font-semibold text-stone-800 text-sm">Recent Paid Orders</h2>
        </div>
        <div className="divide-y divide-amber-100">
          {recentPaid.length === 0 ? (
            <div className="py-10 text-center text-amber-500 text-sm">No paid orders yet</div>
          ) : recentPaid.map(order => (
            <div key={order._id} className="flex items-center justify-between px-5 py-3.5">
              <div>
                <p className="text-amber-600 text-sm font-mono">{order.orderNumber}</p>
                <p className="text-amber-600 text-xs">{order.customer.name} · {formatDate(order.createdAt)}</p>
              </div>
              <div className="text-right">
                <p className="text-emerald-600 font-semibold">{formatCurrency(order.total)}</p>
                <p className="text-amber-500 text-xs">{order.paymentMethod === 'cash' ? 'Cash' : 'Online'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}