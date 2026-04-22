'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { shopApi } from '@/lib/api';
import { useAuthStore } from '@/store';
import { Save, Eye, EyeOff } from 'lucide-react';

export default function SettingsPage() {
  const { shop, setShop } = useAuthStore();
  const [saving, setSaving] = useState(false);
  const [visibility, setVisibility] = useState(shop?.isVisible ?? true);
  const [payment, setPayment] = useState({
    acceptCash: shop?.paymentSettings?.acceptCash ?? true,
    acceptOnline: shop?.paymentSettings?.acceptOnline ?? false,
    upiId: shop?.paymentSettings?.upiId || ''
  });
  const [delivery, setDelivery] = useState({
    offersDelivery: shop?.deliverySettings?.offersDelivery ?? false,
    offersPickup: shop?.deliverySettings?.offersPickup ?? true,
    deliveryCharge: shop?.deliverySettings?.deliveryCharge ?? 0,
    minOrderForDelivery: shop?.deliverySettings?.minOrderForDelivery ?? 0
  });

  async function saveSettings() {
    setSaving(true);
    try {
      const { data } = await shopApi.update({
        isVisible: visibility,
        paymentSettings: payment,
        deliverySettings: delivery
      });
      setShop(data.shop);
      toast.success('Settings saved!');
    } catch (err: any) { toast.error(err.message); }
    finally { setSaving(false); }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-stone-800">Settings</h1>
        <button onClick={saveSettings} disabled={saving}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60">
          <Save size={15} /> {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Visibility */}
      <div className="bg-white border border-amber-100 rounded-xl p-5">
        <h2 className="font-semibold text-stone-800 text-sm mb-4">Shop Visibility</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-stone-800 text-sm">{visibility ? 'Shop is visible to customers' : 'Shop is hidden from customers'}</p>
            <p className="text-amber-600 text-xs mt-0.5">{visibility ? 'Customers can find and shop from your store' : 'Your store is currently offline'}</p>
          </div>
          <button onClick={() => setVisibility(!visibility)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${visibility ? 'bg-emerald-500 text-white hover:bg-emerald-400' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`}>
            {visibility ? <Eye size={15} /> : <EyeOff size={15} />}
            {visibility ? 'Online' : 'Offline'}
          </button>
        </div>
      </div>

      {/* Payment */}
      <div className="bg-white border border-amber-100 rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-stone-800 text-sm">Payment Settings</h2>
        <div className="space-y-2">
          <label className="flex items-center justify-between cursor-pointer py-2 border-b border-amber-100">
            <div>
              <p className="text-stone-800 text-sm">Accept Cash</p>
              <p className="text-amber-600 text-xs">Cash on pickup or delivery</p>
            </div>
            <input type="checkbox" checked={payment.acceptCash} onChange={e => setPayment(p => ({ ...p, acceptCash: e.target.checked }))} className="w-4 h-4 accent-amber-500" />
          </label>
          <label className="flex items-center justify-between cursor-pointer py-2 border-b border-amber-100">
            <div>
              <p className="text-stone-800 text-sm">Accept Online Payments</p>
              <p className="text-amber-600 text-xs">Via Razorpay (UPI, cards, wallets)</p>
            </div>
            <input type="checkbox" checked={payment.acceptOnline} onChange={e => setPayment(p => ({ ...p, acceptOnline: e.target.checked }))} className="w-4 h-4 accent-amber-500" />
          </label>
        </div>
        {payment.acceptOnline && (
          <div>
            <label className="text-xs text-amber-600 mb-1 block">UPI ID</label>
            <input value={payment.upiId} onChange={e => setPayment(p => ({ ...p, upiId: e.target.value }))} placeholder="yourname@upi"
              className="w-full bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 text-stone-800 text-sm focus:outline-none focus:border-amber-400" />
          </div>
        )}
      </div>

      {/* Delivery */}
      <div className="bg-white border border-amber-100 rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-stone-800 text-sm">Delivery Settings</h2>
        <div className="space-y-2">
          <label className="flex items-center justify-between cursor-pointer py-2 border-b border-amber-100">
            <div>
              <p className="text-stone-800 text-sm">Store Pickup</p>
              <p className="text-amber-600 text-xs">Customers collect from your shop</p>
            </div>
            <input type="checkbox" checked={delivery.offersPickup} onChange={e => setDelivery(d => ({ ...d, offersPickup: e.target.checked }))} className="w-4 h-4 accent-amber-500" />
          </label>
          <label className="flex items-center justify-between cursor-pointer py-2 border-b border-amber-100">
            <div>
              <p className="text-stone-800 text-sm">Home Delivery</p>
              <p className="text-amber-600 text-xs">You deliver to customers nearby</p>
            </div>
            <input type="checkbox" checked={delivery.offersDelivery} onChange={e => setDelivery(d => ({ ...d, offersDelivery: e.target.checked }))} className="w-4 h-4 accent-amber-500" />
          </label>
        </div>
        {delivery.offersDelivery && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-amber-600 mb-1 block">Delivery Charge (₹)</label>
              <input type="number" value={delivery.deliveryCharge} onChange={e => setDelivery(d => ({ ...d, deliveryCharge: Number(e.target.value) }))}
                className="w-full bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 text-stone-800 text-sm focus:outline-none focus:border-amber-400" />
            </div>
            <div>
              <label className="text-xs text-amber-600 mb-1 block">Min Order for Delivery (₹)</label>
              <input type="number" value={delivery.minOrderForDelivery} onChange={e => setDelivery(d => ({ ...d, minOrderForDelivery: Number(e.target.value) }))}
                className="w-full bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 text-stone-800 text-sm focus:outline-none focus:border-amber-400" />
            </div>
          </div>
        )}
      </div>

      {/* Shop URL */}
      {shop && (
        <div className="bg-white border border-amber-100 rounded-xl p-5">
          <h2 className="font-semibold text-stone-800 text-sm mb-3">Your Shop URL</h2>
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 text-amber-600 font-mono text-sm break-all">
            {process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/shop/{shop.shopSlug}
          </div>
          <p className="text-amber-500 text-xs mt-2">This is your permanent shop URL. Share it with customers!</p>
        </div>
      )}
    </div>
  );
}