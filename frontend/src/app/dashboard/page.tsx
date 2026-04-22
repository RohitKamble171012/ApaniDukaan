'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingCart, Package, TrendingUp, DollarSign, AlertTriangle, Plus, Upload, QrCode, BarChart3 } from 'lucide-react';
import { orderApi, productApi } from '@/lib/api';
import { useAuthStore } from '@/store';
import { formatCurrency, formatDateTime, ORDER_STATUS_COLORS } from '@/lib/utils';

const StatCard = ({ label, value, icon: Icon, color, sub, delay = 0 }: any) => (
  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
    className="bg-white border border-amber-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-amber-200 transition-all">
    <div className="flex items-start justify-between mb-3">
      <p className="text-warm-400 text-xs font-medium uppercase tracking-wide">{label}</p>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={16} className="text-white" />
      </div>
    </div>
    <p className="text-3xl font-bold text-warm-900">{value}</p>
    {sub && <p className="text-warm-400 text-xs mt-1.5">{sub}</p>}
  </motion.div>
);

export default function DashboardPage() {
  const { shop } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, ordersRes] = await Promise.all([
          orderApi.stats(),
          orderApi.list({ limit: 5 }),
        ]);
        setStats(statsRes.data);
        setRecentOrders(ordersRes.data.orders || []);
        const lowRes = await productApi.list({ limit: 50 });
        setLowStock((lowRes.data.products || []).filter((p: any) => p.quantity <= 10).slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally { setLoading(false); }
    }
    load();
  }, []);

  if (loading) return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl h-28 border border-amber-100" style={{
          background: 'linear-gradient(90deg, #fffbeb 25%, #fef3c7 50%, #fffbeb 75%)',
          backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite'
        }} />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-warm-900">Good morning! 👋</h1>
          <p className="text-warm-400 text-sm mt-0.5">
            {shop?.shopName} · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <Link href="/dashboard/products"
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-amber-200 hover:-translate-y-0.5">
          <Plus size={16} /> Add Product
        </Link>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard delay={0}    label="Today's Revenue"  value={formatCurrency(stats?.todayRevenue || 0)}  icon={DollarSign}   color="bg-amber-500"   sub={`${stats?.todayOrders || 0} orders today`} />
        <StatCard delay={0.05} label="Total Revenue"    value={formatCurrency(stats?.totalRevenue || 0)}  icon={TrendingUp}   color="bg-orange-500"  sub="All time" />
        <StatCard delay={0.1}  label="Pending Orders"   value={stats?.pendingOrders || 0}                 icon={ShoppingCart} color="bg-red-400"     sub="Need your action" />
        <StatCard delay={0.15} label="Total Products"   value={shop?.totalProducts || 0}                  icon={Package}      color="bg-emerald-500" sub="In inventory" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard delay={0.2}  label="Total Orders"   value={stats?.totalOrders || 0}    icon={ShoppingCart} color="bg-blue-400"  />
        <StatCard delay={0.25} label="Completed"      value={stats?.completedOrders || 0} icon={TrendingUp}   color="bg-emerald-600" />
        <StatCard delay={0.3}  label="Confirmed"      value={stats?.confirmedOrders || 0} icon={Package}      color="bg-sky-500" />
        <StatCard delay={0.35} label="Cancelled"      value={stats?.cancelledOrders || 0} icon={AlertTriangle} color="bg-warm-400" />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: '/dashboard/products', icon: Plus,     label: 'Add Product',   bg: 'bg-amber-500 hover:bg-amber-400 text-white',         shadow: 'shadow-amber-200' },
          { href: '/dashboard/products', icon: Upload,   label: 'Import Excel',  bg: 'bg-emerald-500 hover:bg-emerald-400 text-white',      shadow: 'shadow-emerald-200' },
          { href: '/dashboard/qr',       icon: QrCode,   label: 'View QR',       bg: 'bg-orange-500 hover:bg-orange-400 text-white',        shadow: 'shadow-orange-200' },
          { href: '/dashboard/analytics',icon: BarChart3, label: 'Analytics',    bg: 'bg-blue-500 hover:bg-blue-400 text-white',            shadow: 'shadow-blue-200' },
        ].map(a => (
          <Link key={a.label} href={a.href}
            className={`flex items-center gap-2.5 p-4 rounded-2xl text-sm font-semibold transition-all shadow-md ${a.bg} ${a.shadow} hover:-translate-y-0.5 hover:shadow-lg`}>
            <a.icon size={16} />{a.label}
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Recent Orders */}
        <div className="bg-white border border-amber-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-amber-50">
            <h2 className="font-bold text-warm-800 text-sm">Recent Orders</h2>
            <Link href="/dashboard/orders" className="text-amber-600 text-xs font-medium hover:text-amber-700">View all →</Link>
          </div>
          <div className="divide-y divide-amber-50">
            {recentOrders.length === 0 ? (
              <div className="py-12 text-center text-warm-300 text-sm">No orders yet</div>
            ) : recentOrders.map(order => (
              <div key={order._id} className="flex items-center justify-between px-5 py-3.5 hover:bg-amber-50/50 transition-colors">
                <div>
                  <p className="text-warm-800 text-sm font-semibold">{order.orderNumber}</p>
                  <p className="text-warm-400 text-xs">{order.customer.name} · {formatDateTime(order.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="text-warm-900 text-sm font-bold">{formatCurrency(order.total)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${ORDER_STATUS_COLORS[order.orderStatus]}`}>
                    {order.orderStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock */}
        <div className="bg-white border border-amber-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-amber-50">
            <h2 className="font-bold text-warm-800 text-sm">Low Stock Alerts</h2>
            <Link href="/dashboard/products" className="text-amber-600 text-xs font-medium hover:text-amber-700">Manage →</Link>
          </div>
          <div className="divide-y divide-amber-50">
            {lowStock.length === 0 ? (
              <div className="py-12 text-center text-warm-300 text-sm">All products well stocked ✓</div>
            ) : lowStock.map(product => (
              <div key={product._id} className="flex items-center justify-between px-5 py-3.5 hover:bg-amber-50/50 transition-colors">
                <div>
                  <p className="text-warm-800 text-sm font-semibold">{product.productName}</p>
                  <p className="text-warm-400 text-xs">{product.category}</p>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${product.quantity <= 3 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'}`}>
                  {product.quantity} {product.unit} left
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}