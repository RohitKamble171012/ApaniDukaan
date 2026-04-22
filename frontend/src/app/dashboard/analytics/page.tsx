'use client';

import { useEffect, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, Radar,
  PolarGrid, PolarAngleAxis
} from 'recharts';
import { analyticsApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import {
  TrendingUp, AlertTriangle, Star, Lightbulb,
  Zap, Clock, Calendar, Users, Activity, ArrowUp
} from 'lucide-react';

const COLORS = ['#f59e0b','#f97316','#ef4444','#8b5cf6','#06b6d4'];
const HOUR_LABELS = ['12a','1a','2a','3a','4a','5a','6a','7a','8a','9a','10a','11a','12p','1p','2p','3p','4p','5p','6p','7p','8p','9p','10p','11p'];
const DAY_ORDER   = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

const PRIORITY_STYLES = {
  high:   'border-red-200 bg-red-50',
  medium: 'border-amber-200 bg-amber-50',
  low:    'border-blue-200 bg-blue-50'
};

export default function AnalyticsPage() {
  const [data, setData]     = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays]     = useState(30);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const { data: res } = await analyticsApi.dashboard(days);
        setData(res);
      } finally { setLoading(false); }
    }
    load();
  }, [days]);

  if (loading) return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-48 bg-white border border-amber-100 rounded-2xl"
          style={{ background: 'linear-gradient(90deg,#fffbeb 25%,#fef3c7 50%,#fffbeb 75%)', backgroundSize:'200% 100%', animation:'shimmer 1.5s infinite' }} />
      ))}
    </div>
  );

  // Normalise peak hours — fill missing hours with 0
  const peakHoursFull = Array.from({ length: 24 }, (_, h) => {
    const found = (data?.peakHours || []).find((p: any) => p._id === h);
    return { hour: HOUR_LABELS[h], orders: found?.orders || 0, revenue: found?.revenue || 0 };
  });

  // Normalise busy days
  const busyDaysFull = DAY_ORDER.map(day => {
    const found = (data?.busyDays || []).find((d: any) => d.day === day);
    return { day, orders: found?.orders || 0, revenue: found?.revenue || 0 };
  });

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-warm-900">Analytics</h1>
          <p className="text-warm-400 text-sm">Deep insights to grow your business</p>
        </div>
        <select value={days} onChange={e => setDays(Number(e.target.value))}
          className="bg-white border-2 border-amber-200 text-warm-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-400 font-medium">
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {/* Customer Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Customers',  value: data?.customerStats?.total || 0,    icon: Users,    color: 'bg-blue-500' },
          { label: 'Repeat Customers', value: data?.customerStats?.repeat || 0,   icon: Activity, color: 'bg-emerald-500' },
          { label: 'Products Tracked', value: data?.productVelocity?.length || 0, icon: TrendingUp, color: 'bg-amber-500' },
          { label: 'Surge Alerts',     value: data?.surgeAlerts?.length || 0,     icon: Zap,      color: 'bg-red-500' },
        ].map(stat => (
          <div key={stat.label} className="bg-white border border-amber-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between mb-2">
              <p className="text-warm-400 text-xs font-medium uppercase tracking-wide">{stat.label}</p>
              <div className={`w-8 h-8 rounded-xl ${stat.color} flex items-center justify-center`}>
                <stat.icon size={15} className="text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold text-warm-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Smart Recommendations */}
      {data?.recommendations?.length > 0 && (
        <div className="bg-white border border-amber-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
              <Lightbulb size={16} className="text-amber-600" />
            </div>
            <h2 className="font-bold text-warm-800">Smart Recommendations</h2>
          </div>
          <div className="space-y-2.5">
            {data.recommendations.map((rec: any, i: number) => (
              <div key={i} className={`flex items-start gap-3 p-3.5 rounded-xl border ${PRIORITY_STYLES[rec.priority as keyof typeof PRIORITY_STYLES]}`}>
                <span className="text-xs font-bold uppercase px-2 py-0.5 rounded-full bg-white border border-current mt-0.5
                  ${rec.priority === 'high' ? 'text-red-500' : rec.priority === 'medium' ? 'text-amber-600' : 'text-blue-500'}">
                  {rec.priority}
                </span>
                <p className="text-warm-700 text-sm">{rec.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Surge Alerts */}
      {data?.surgeAlerts?.length > 0 && (
        <div className="bg-white border border-red-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center">
              <Zap size={16} className="text-red-500" />
            </div>
            <h2 className="font-bold text-warm-800">Surge Alerts — Sales Spikes This Week</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.surgeAlerts.map((alert: any, i: number) => (
              <div key={i} className="bg-red-50 border border-red-100 rounded-xl p-4">
                <p className="font-semibold text-warm-800 text-sm mb-1">{alert.name}</p>
                <div className="flex items-center gap-2">
                  <ArrowUp size={14} className="text-red-500" />
                  <span className="text-red-600 font-bold text-lg">+{alert.surgePercent}%</span>
                </div>
                <p className="text-warm-400 text-xs mt-1">
                  {alert.prevQty === 0 ? 'New this week' : `${alert.prevQty} → ${alert.recentQty} units`}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sales Trend */}
      <div className="bg-white border border-amber-100 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp size={16} className="text-amber-500" />
          <h2 className="font-bold text-warm-800">Sales Trend</h2>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data?.salesTrend || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#fef3c7" />
            <XAxis dataKey="_id" tick={{ fill: '#a8a29e', fontSize: 11 }} />
            <YAxis tick={{ fill: '#a8a29e', fontSize: 11 }} tickFormatter={v => `₹${v}`} />
            <Tooltip
              contentStyle={{ background: '#fff', border: '1px solid #fde68a', borderRadius: 12 }}
              formatter={(v: any) => [formatCurrency(v), 'Revenue']} />
            <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* BEHAVIORAL: Peak Hours */}
      <div className="bg-white border border-amber-100 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center">
            <Clock size={16} className="text-orange-500" />
          </div>
          <div>
            <h2 className="font-bold text-warm-800">Peak Hours</h2>
            <p className="text-warm-400 text-xs">When do customers order most?</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={peakHoursFull} barSize={12}>
            <CartesianGrid strokeDasharray="3 3" stroke="#fef3c7" />
            <XAxis dataKey="hour" tick={{ fill: '#a8a29e', fontSize: 9 }} interval={1} />
            <YAxis tick={{ fill: '#a8a29e', fontSize: 10 }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: '#fff', border: '1px solid #fde68a', borderRadius: 10 }}
              formatter={(v: any) => [v, 'Orders']} />
            <Bar dataKey="orders" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        {/* Peak label */}
        {peakHoursFull.length > 0 && (() => {
          const peak = peakHoursFull.reduce((a, b) => a.orders >= b.orders ? a : b);
          return peak.orders > 0 ? (
            <p className="text-center text-amber-600 text-xs font-semibold mt-2">
              🔥 Busiest hour: {peak.hour} with {peak.orders} orders
            </p>
          ) : null;
        })()}
      </div>

      {/* BEHAVIORAL: Busy Days */}
      <div className="bg-white border border-amber-100 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center">
            <Calendar size={16} className="text-purple-500" />
          </div>
          <div>
            <h2 className="font-bold text-warm-800">Busy Days</h2>
            <p className="text-warm-400 text-xs">Which days bring the most orders?</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <RadarChart data={busyDaysFull}>
            <PolarGrid stroke="#fde68a" />
            <PolarAngleAxis dataKey="day" tick={{ fill: '#78716c', fontSize: 12 }} />
            <Radar name="Orders" dataKey="orders" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.35} strokeWidth={2} />
            <Tooltip contentStyle={{ background: '#fff', border: '1px solid #fde68a', borderRadius: 10 }} />
          </RadarChart>
        </ResponsiveContainer>
        {busyDaysFull.length > 0 && (() => {
          const busiest = [...busyDaysFull].sort((a, b) => b.orders - a.orders)[0];
          return busiest.orders > 0 ? (
            <p className="text-center text-purple-600 text-xs font-semibold mt-1">
              📅 Busiest day: {busiest.day} with {busiest.orders} orders
            </p>
          ) : null;
        })()}
      </div>

      {/* Product Velocity */}
      <div className="bg-white border border-amber-100 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
            <Activity size={16} className="text-emerald-600" />
          </div>
          <div>
            <h2 className="font-bold text-warm-800">Product Velocity</h2>
            <p className="text-warm-400 text-xs">Units sold per day — higher = faster moving</p>
          </div>
        </div>
        {(data?.productVelocity || []).length === 0 ? (
          <p className="text-warm-300 text-sm text-center py-6">No sales data yet</p>
        ) : (
          <div className="space-y-3">
            {(data.productVelocity || []).slice(0, 8).map((p: any, i: number) => {
              const maxV = data.productVelocity[0]?.velocity || 1;
              const pct  = Math.round((p.velocity / maxV) * 100);
              return (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-warm-700 font-medium truncate max-w-[60%]">{p.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-warm-400 text-xs">{p.totalSold} sold</span>
                      <span className="text-emerald-600 font-bold text-xs">{p.velocity}/day</span>
                    </div>
                  </div>
                  <div className="h-2 bg-amber-50 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all duration-500"
                      style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Top Products */}
        <div className="bg-white border border-amber-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Star size={16} className="text-amber-500" />
            <h2 className="font-bold text-warm-800">Top Selling Products</h2>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={(data?.topProducts || []).slice(0, 6)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#fef3c7" />
              <XAxis type="number" tick={{ fill: '#a8a29e', fontSize: 10 }} />
              <YAxis dataKey="_id" type="category" tick={{ fill: '#78716c', fontSize: 10 }} width={90} />
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid #fde68a', borderRadius: 10 }} />
              <Bar dataKey="totalSold" fill="#f59e0b" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Revenue */}
        <div className="bg-white border border-amber-100 rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-warm-800 mb-4">Revenue by Category</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={(data?.categoryPerformance || []).slice(0, 5)}
                dataKey="revenue" nameKey="_id"
                cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4}>
                {(data?.categoryPerformance || []).slice(0, 5).map((_: any, i: number) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid #fde68a', borderRadius: 10 }}
                formatter={(v: any) => formatCurrency(v)} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 justify-center">
            {(data?.categoryPerformance || []).slice(0, 5).map((c: any, i: number) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="text-warm-500 text-xs">{c._id}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Low Stock */}
      {data?.lowStock?.length > 0 && (
        <div className="bg-white border border-amber-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-amber-50">
            <AlertTriangle size={16} className="text-amber-500" />
            <h2 className="font-bold text-warm-800 text-sm">Low Stock Alerts</h2>
          </div>
          <div className="divide-y divide-amber-50">
            {data.lowStock.map((p: any) => (
              <div key={p._id} className="flex items-center justify-between px-5 py-3 hover:bg-amber-50/50">
                <div>
                  <p className="text-warm-800 text-sm font-medium">{p.productName}</p>
                  <p className="text-warm-400 text-xs">{p.category}</p>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${p.quantity <= 3 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'}`}>
                  {p.quantity} {p.unit} left
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Requested Items */}
      {data?.requestedItems?.length > 0 && (
        <div className="bg-white border border-amber-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-amber-50">
            <h2 className="font-bold text-warm-800 text-sm">Frequently Requested (Not in Stock)</h2>
          </div>
          <div className="divide-y divide-amber-50">
            {data.requestedItems.map((item: any) => (
              <div key={item._id} className="flex items-center justify-between px-5 py-3 hover:bg-amber-50/50">
                <p className="text-warm-700 text-sm capitalize">{item._id}</p>
                <span className="text-xs bg-orange-100 text-orange-600 font-bold px-2.5 py-1 rounded-full">
                  {item.count} requests
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}