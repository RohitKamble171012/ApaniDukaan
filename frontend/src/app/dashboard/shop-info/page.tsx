'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Save, Upload } from 'lucide-react';
import { shopApi } from '@/lib/api';
import { useAuthStore } from '@/store';
import { SHOP_TYPES } from '@/lib/utils';

export default function ShopInfoPage() {
  const { shop, setShop } = useAuthStore();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState('');

  const { register, handleSubmit } = useForm({
    defaultValues: {
      shopName: shop?.shopName || '',
      shopType: shop?.shopType || '',
      tagline: shop?.tagline || '',
      description: shop?.description || '',
      street: shop?.address?.street || '',
      city: shop?.address?.city || '',
      state: shop?.address?.state || '',
      pincode: shop?.address?.pincode || '',
      phone: shop?.contact?.phone || '',
      email: shop?.contact?.email || '',
      whatsapp: shop?.contact?.whatsapp || '',
      instagram: shop?.socialLinks?.instagram || '',
      facebook: shop?.socialLinks?.facebook || '',
      website: shop?.socialLinks?.website || ''
    }
  });

  async function onSubmit(values: any) {
    setSaving(true);
    try {
      const { data } = await shopApi.update({
        shopName: values.shopName, shopType: values.shopType,
        tagline: values.tagline, description: values.description,
        address: { street: values.street, city: values.city, state: values.state, pincode: values.pincode, country: 'India' },
        contact: { phone: values.phone, email: values.email, whatsapp: values.whatsapp },
        socialLinks: { instagram: values.instagram, facebook: values.facebook, website: values.website }
      });
      setShop(data.shop);
      toast.success('Shop info updated!');
    } catch (err: any) { toast.error(err.message); }
    finally { setSaving(false); }
  }

  async function handleImageUpload(type: 'logo' | 'banner', file: File) {
    setUploading(type);
    try {
      const { data } = type === 'logo' ? await shopApi.uploadLogo(file) : await shopApi.uploadBanner(file);
      setShop({ ...shop!, [`${type}Url`]: data[`${type}Url`] });
      toast.success(`${type === 'logo' ? 'Logo' : 'Banner'} updated`);
    } catch (err: any) { toast.error(err.message); }
    finally { setUploading(''); }
  }

  const Input = ({ label, name, placeholder = '', type = 'text' }: any) => (
    <div>
      <label className="text-xs text-amber-600 mb-1 block">{label}</label>
      <input {...register(name)} type={type} placeholder={placeholder}
        className="w-full bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 text-stone-800 text-sm focus:outline-none focus:border-amber-400 placeholder-amber-300" />
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-stone-800">Shop Info</h1>
        <button type="submit" disabled={saving}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60">
          <Save size={15} /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Images */}
      <div className="bg-white border border-amber-100 rounded-xl p-5">
        <h2 className="font-semibold text-stone-800 text-sm mb-4">Branding</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-amber-600 mb-2">Logo</p>
            <div className="flex items-center gap-3">
              {shop?.logoUrl ? (
                <img src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${shop.logoUrl}`} alt="Logo" className="w-16 h-16 rounded-xl object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-amber-100 flex items-center justify-center text-amber-500 text-2xl">
                  {shop?.shopName?.[0] || '?'}
                </div>
              )}
              <label className="flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-400 cursor-pointer">
                <Upload size={13} /> {uploading === 'logo' ? 'Uploading...' : 'Upload'}
                <input type="file" accept="image/*" className="hidden" disabled={uploading === 'logo'}
                  onChange={e => e.target.files?.[0] && handleImageUpload('logo', e.target.files[0])} />
              </label>
            </div>
          </div>
          <div>
            <p className="text-xs text-amber-600 mb-2">Banner</p>
            <div className="flex items-center gap-3">
              {shop?.bannerUrl ? (
                <img src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${shop.bannerUrl}`} alt="Banner" className="w-24 h-12 rounded-xl object-cover" />
              ) : (
                <div className="w-24 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-500 text-xs">No banner</div>
              )}
              <label className="flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-400 cursor-pointer">
                <Upload size={13} /> {uploading === 'banner' ? 'Uploading...' : 'Upload'}
                <input type="file" accept="image/*" className="hidden" disabled={uploading === 'banner'}
                  onChange={e => e.target.files?.[0] && handleImageUpload('banner', e.target.files[0])} />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Basic Details */}
      <div className="bg-white border border-amber-100 rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-stone-800 text-sm">Basic Details</h2>
        <Input label="Shop Name" name="shopName" />
        <div>
          <label className="text-xs text-amber-600 mb-1 block">Shop Type</label>
          <select {...register('shopType')} className="w-full bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 text-stone-800 text-sm focus:outline-none focus:border-amber-400">
            {SHOP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <Input label="Tagline" name="tagline" placeholder="e.g. Fresh goods daily" />
        <div>
          <label className="text-xs text-amber-600 mb-1 block">Description</label>
          <textarea {...register('description')} rows={3} placeholder="Tell customers about your shop..."
            className="w-full bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 text-stone-800 text-sm focus:outline-none focus:border-amber-400 resize-none placeholder-amber-300" />
        </div>
      </div>

      {/* Address */}
      <div className="bg-white border border-amber-100 rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-stone-800 text-sm">Address</h2>
        <Input label="Street Address" name="street" />
        <div className="grid grid-cols-2 gap-4">
          <Input label="City" name="city" />
          <Input label="State" name="state" />
        </div>
        <Input label="Pincode" name="pincode" />
      </div>

      {/* Contact */}
      <div className="bg-white border border-amber-100 rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-stone-800 text-sm">Contact</h2>
        <Input label="Phone" name="phone" />
        <Input label="Email" name="email" type="email" />
        <Input label="WhatsApp" name="whatsapp" placeholder="Same as phone or different" />
      </div>

      {/* Social Links */}
      <div className="bg-white border border-amber-100 rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-stone-800 text-sm">Social Links</h2>
        <Input label="Instagram" name="instagram" placeholder="https://instagram.com/yourshop" />
        <Input label="Facebook" name="facebook" placeholder="https://facebook.com/yourshop" />
        <Input label="Website" name="website" placeholder="https://yourshop.com" />
      </div>
    </form>
  );
}