'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { analyticsApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

export default function SalesPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [groupBy, setGroupBy] = useState('day');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const { data } = await analyticsApi.sales({ groupBy });
        setSales(data.sales || []);
      } finally { setLoading(false); }
    }
    load();
  }, [groupBy]);

  const totalSales = sales.reduce((sum, s) => sum + s.totalSales, 0);
  const totalOrders = sales.reduce((sum, s) => sum + s.orderCount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-stone-800">Sales</h1>
          <p className="text-amber-600 text-sm">Sales performance overview</p>
        </div>
        <select value={groupBy} onChange={e => setGroupBy(e.target.value)}
          className="bg-amber-50 border border-amber-200 text-stone-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400">
          <option value="day">Daily</option>
          <option value="week">Weekly</option>
          <option value="month">Monthly</option>
        </select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Sales', value: formatCurrency(totalSales) },
          { label: 'Total Orders', value: totalOrders },
          { label: 'Avg Order Value', value: totalOrders ? formatCurrency(totalSales / totalOrders) : '₹0' }
        ].map(s => (
          <div key={s.label} className="bg-white border border-amber-100 rounded-xl p-5 text-center">
            <p className="text-amber-600 text-sm mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-stone-800">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-amber-100 rounded-xl p-5">
        <h2 className="font-semibold text-stone-800 mb-5">Sales Trend</h2>
        {loading ? (
          <div className="h-64 shimmer rounded-xl bg-amber-50" />
        ) : sales.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-amber-500">No sales data yet</div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={sales}>
              <CartesianGrid strokeDasharray="3 3" stroke="#fde68a" />
              <XAxis dataKey="_id" tick={{ fill: '#d97706', fontSize: 11 }} />
              <YAxis tick={{ fill: '#d97706', fontSize: 11 }} tickFormatter={v => `₹${v}`} />
              <Tooltip contentStyle={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8 }}
                formatter={(v: any, name: string) => [name === 'totalSales' ? formatCurrency(v) : v, name === 'totalSales' ? 'Revenue' : 'Orders']} />
              <Line type="monotone" dataKey="totalSales" stroke="#f59e0b" strokeWidth={2} dot={false} name="totalSales" />
              <Line type="monotone" dataKey="orderCount" stroke="#10b981" strokeWidth={2} dot={false} name="orderCount" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Sales Table */}
      <div className="bg-white border border-amber-100 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-amber-100">
          <h2 className="font-semibold text-stone-800 text-sm">Sales Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-amber-50/50 border-b border-amber-200">
              <tr>
                {['Period', 'Orders', 'Paid Orders', 'Total Sales'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-amber-600 text-xs font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100">
              {sales.length === 0 ? (
                <tr><td colSpan={4} className="py-10 text-center text-amber-500">No data</td></tr>
              ) : sales.map((s, i) => (
                <tr key={i} className="hover:bg-amber-50">
                  <td className="px-4 py-3 text-stone-800 font-mono text-xs">{s._id}</td>
                  <td className="px-4 py-3 text-amber-700">{s.orderCount}</td>
                  <td className="px-4 py-3 text-emerald-600">{s.paidOrders}</td>
                  <td className="px-4 py-3 text-stone-800 font-medium">{formatCurrency(s.totalSales)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}