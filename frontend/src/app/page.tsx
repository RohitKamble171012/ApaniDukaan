'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingBag, BarChart3, QrCode, Zap, Shield, Smartphone } from 'lucide-react';

const features = [
  { icon: ShoppingBag, title: 'Digital Storefront',  desc: 'Your shop online in minutes. Customers browse and order from their phones.' },
  { icon: QrCode,      title: 'QR Code Access',      desc: 'Generate a QR code. Customers scan to instantly reach your shop page.' },
  { icon: BarChart3,   title: 'Smart Analytics',     desc: 'Know your best sellers, low stock alerts, and revenue trends at a glance.' },
  { icon: Zap,         title: 'Excel Inventory',     desc: 'Upload your existing Excel sheet to bulk-import hundreds of products instantly.' },
  { icon: Shield,      title: 'Razorpay Payments',   desc: 'Accept UPI, cards, and wallets. Cash on delivery also supported.' },
  { icon: Smartphone,  title: 'Voice Shopping',      desc: 'Customers speak their list. AI parses and adds items to cart automatically.' },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50 text-warm-900">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto border-b border-amber-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center shadow-md shadow-amber-200">
            <ShoppingBag size={18} className="text-white" />
          </div>
          <span className="font-bold text-xl text-warm-900 tracking-tight">ApaniDukaan</span>
        </div>
        <Link href="/auth/login"
          className="bg-amber-500 hover:bg-amber-400 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-all shadow-md shadow-amber-200 hover:shadow-lg hover:shadow-amber-300 hover:-translate-y-0.5">
           Login →
        </Link>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight text-warm-900">
            Your Shop.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-400">
              Now Digital.
            </span>
          </h1>
          <p className="text-warm-500 text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Create your online storefront, manage inventory with Excel, accept payments,
            track orders, and grow your local business — all from one dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/login"
              className="bg-amber-500 hover:bg-amber-400 text-white px-10 py-4 rounded-2xl font-bold text-lg transition-all hover:-translate-y-1 shadow-xl shadow-amber-200 hover:shadow-2xl hover:shadow-amber-300">
              Start Free — Create Your Shop
            </Link>
            <a href="#features"
              className="border-2 border-amber-200 text-warm-700 hover:border-amber-400 hover:bg-amber-50 px-10 py-4 rounded-2xl font-semibold text-lg transition-all">
              See Features
            </a>
          </div>
        </motion.div>

        {/* Dashboard preview */}
        <motion.div
          initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mt-20"
        >
          <div className="bg-white border border-amber-100 rounded-3xl p-6 max-w-4xl mx-auto shadow-xl shadow-amber-100">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
              {[
                { label: 'Products',       value: '247',    color: 'text-amber-600' },
                { label: "Today's Orders", value: '18',     color: 'text-emerald-600' },
                { label: "Revenue",        value: '₹4,820', color: 'text-orange-600' },
                { label: 'Pending',        value: '3',      color: 'text-red-500' },
              ].map(stat => (
                <div key={stat.label} className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-left">
                  <p className="text-warm-400 text-xs mb-1">{stat.label}</p>
                  <p className={`font-bold text-2xl ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>
            <div className="h-28 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl flex items-center justify-center border border-amber-100">
              <div className="flex items-end gap-2 h-16 px-6">
                {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 100].map((h, i) => (
                  <div key={i} className="w-4 rounded-t-md bg-gradient-to-t from-amber-400 to-amber-300"
                    style={{ height: `${h}%`, opacity: 0.7 + i * 0.025 }} />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-24">
        <h2 className="text-4xl font-bold text-center mb-3 text-warm-900">Everything you need</h2>
        <p className="text-warm-400 text-center mb-14 text-lg">Built specifically for Indian local retailers</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <motion.div key={feature.title}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }} viewport={{ once: true }}
              className="bg-white border border-amber-100 rounded-2xl p-6 hover:border-amber-300 hover:shadow-lg hover:shadow-amber-100 transition-all hover:-translate-y-0.5">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center mb-4">
                <feature.icon size={20} className="text-amber-600" />
              </div>
              <h3 className="font-bold text-warm-900 text-lg mb-2">{feature.title}</h3>
              <p className="text-warm-500 text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <div className="bg-gradient-to-br from-amber-400 to-orange-400 rounded-3xl p-12 shadow-2xl shadow-amber-200">
          <h2 className="text-4xl font-bold mb-4 text-white">Ready to go digital?</h2>
          <p className="text-amber-100 mb-8 text-lg">Set up your shop in under 5 minutes. No tech skills needed.</p>
          <Link href="/auth/login"
            className="inline-block bg-white hover:bg-amber-50 text-amber-600 font-bold px-10 py-4 rounded-2xl text-lg transition-all hover:-translate-y-1 shadow-lg">
            Create Your Shop Now →
          </Link>
        </div>
      </section>

      <footer className="border-t border-amber-100 py-8 text-center text-warm-400 text-sm">
        © 2026 ApaniDukaan. Built for local businesses.
      </footer>
    </main>
  );
}
