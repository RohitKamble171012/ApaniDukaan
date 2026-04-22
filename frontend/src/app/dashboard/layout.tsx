'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, ShoppingCart, BarChart3, TrendingUp,
  DollarSign, Store, Settings, QrCode, MessageSquare, Menu, X,
  LogOut, Bell, ShoppingBag
} from 'lucide-react';
import { logout } from '@/lib/firebase';
import { useAuthStore } from '@/store';
import { getInitials } from '@/lib/utils';
import toast from 'react-hot-toast';

const navItems = [
  { href: '/dashboard',             label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/orders',      label: 'Orders',    icon: ShoppingCart },
  { href: '/dashboard/products',    label: 'Products',  icon: Package },
  { href: '/dashboard/analytics',   label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/sales',       label: 'Sales',     icon: TrendingUp },
  { href: '/dashboard/revenue',     label: 'Revenue',   icon: DollarSign },
  { href: '/dashboard/shop-info',   label: 'Shop Info', icon: Store },
  { href: '/dashboard/qr',          label: 'QR Code',   icon: QrCode },
  { href: '/dashboard/feedback',    label: 'Feedback',  icon: MessageSquare },
  { href: '/dashboard/settings',    label: 'Settings',  icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const { user, shop, isLoading, clear } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) router.push('/auth/login');
    if (!isLoading && user && !user.onboardingComplete) router.push('/auth/onboard');
  }, [user, isLoading, router]);

  async function handleLogout() {
    try { await logout(); clear(); router.push('/'); }
    catch { toast.error('Logout failed'); }
  }

  if (isLoading) return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) return null;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-amber-100">
        <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center shadow-md shadow-amber-200 flex-shrink-0">
          <ShoppingBag size={18} className="text-white" />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-warm-900 text-sm truncate leading-tight">
            {shop?.shopName || 'SmartShop'}
          </p>
          <p className="text-warm-400 text-xs truncate">{shop?.shopType || 'Dashboard'}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(item => {
          const active = pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-200'
                  : 'text-warm-600 hover:bg-amber-50 hover:text-warm-900'
              }`}>
              <item.icon size={17} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-amber-100">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {getInitials(user.displayName)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-warm-800 text-xs font-semibold truncate">{user.displayName}</p>
            <p className="text-warm-400 text-xs truncate">{user.email}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-warm-500 hover:bg-red-50 hover:text-red-600 transition-colors">
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-amber-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-56 flex-col bg-white border-r border-amber-100 shadow-sm flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden fixed inset-0 bg-warm-900/40 backdrop-blur-sm z-40" />
            <motion.aside
              initial={{ x: -256 }} animate={{ x: 0 }} exit={{ x: -256 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-56 bg-white border-r border-amber-100 z-50 flex flex-col shadow-xl">
              <button onClick={() => setSidebarOpen(false)}
                className="absolute top-4 right-4 text-warm-400 hover:text-warm-700">
                <X size={20} />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-amber-100 shadow-sm flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-warm-500 hover:text-warm-800">
            <Menu size={22} />
          </button>
          <div className="flex-1 lg:flex-none">
            <h1 className="text-sm font-semibold text-warm-700 lg:hidden">
              {navItems.find(n => pathname.startsWith(n.href))?.label || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            {shop && (
              <Link href={`/shop/${shop.shopSlug}`} target="_blank"
                className="hidden sm:flex items-center gap-1.5 text-xs text-amber-700 hover:text-amber-900 border border-amber-200 hover:border-amber-400 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-all">
                <Store size={13} /> View Store
              </Link>
            )}
            <button className="p-2 text-warm-400 hover:text-warm-700 hover:bg-amber-50 rounded-lg transition-colors">
              <Bell size={18} />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}