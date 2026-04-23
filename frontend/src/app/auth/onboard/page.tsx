'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, MapPin, Phone, CreditCard,
  ChevronRight, ChevronLeft, Check, Store,
  Truck, Banknote, Wifi
} from 'lucide-react';
import { shopApi } from '@/lib/api';
import { useAuthStore } from '@/store';
import { SHOP_TYPES } from '@/lib/utils';

const schema = z.object({
  shopName:        z.string().min(2, 'Shop name must be at least 2 characters'),
  shopType:        z.string().min(1, 'Select a shop type'),
  tagline:         z.string().optional(),
  description:     z.string().optional(),
  street:          z.string().min(3, 'Enter street address'),
  city:            z.string().min(2, 'Enter city'),
  state:           z.string().min(2, 'Enter state'),
  pincode:         z.string().regex(/^\d{6}$/, '6-digit pincode required'),
  phone:           z.string().regex(/^[6-9]\d{9}$/, 'Valid Indian mobile number required'),
  email:           z.string().email().optional().or(z.literal('')),
  acceptCash:      z.boolean().default(true),
  acceptOnline:    z.boolean().default(false),
  upiId:           z.string().optional(),
  offersDelivery:  z.boolean().default(false),
  offersPickup:    z.boolean().default(true),
});
type FormData = z.infer<typeof schema>;

const steps = [
  { id: 1, title: 'Shop Details',        subtitle: 'Name, type & description',  icon: Store },
  { id: 2, title: 'Location',            subtitle: 'Where is your shop?',        icon: MapPin },
  { id: 3, title: 'Contact & Payment',   subtitle: 'How customers reach you',    icon: Phone },
  { id: 4, title: 'Delivery Options',    subtitle: 'Pickup or delivery?',        icon: Truck },
];

export default function OnboardPage() {
  const router = useRouter();
  const { setShop, setUser, user } = useAuthStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, trigger, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { acceptCash: true, offersPickup: true, acceptOnline: false, offersDelivery: false },
  });

  const acceptOnline  = watch('acceptOnline');
  const offersDelivery = watch('offersDelivery');

  async function validateStep(s: number) {
    const fieldMap: Record<number, (keyof FormData)[]> = {
      1: ['shopName', 'shopType'],
      2: ['street', 'city', 'state', 'pincode'],
      3: ['phone'],
    };
    return fieldMap[s] ? await trigger(fieldMap[s]) : true;
  }

  async function nextStep() {
    if (await validateStep(step)) setStep(s => Math.min(s + 1, 4));
  }

  async function onSubmit(values: FormData) {
    setLoading(true);
    try {
      const { data } = await shopApi.onboard({
        shopName:    values.shopName,
        shopType:    values.shopType,
        tagline:     values.tagline,
        description: values.description,
        address:     { street: values.street, city: values.city, state: values.state, pincode: values.pincode, country: 'India' },
        contact:     { phone: values.phone, email: values.email },
        paymentSettings:  { acceptCash: values.acceptCash, acceptOnline: values.acceptOnline, upiId: values.upiId },
        deliverySettings: { offersDelivery: values.offersDelivery, offersPickup: values.offersPickup },
      });
      setShop(data.shop);
      if (user) setUser({ ...user, shopId: data.shop._id, onboardingComplete: true });
      toast.success('🎉 Your shop is live!');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create shop');
    } finally { setLoading(false); }
  }

  const InputField = ({ label, name, placeholder = '', type = 'text', required = false }: any) => (
    <div>
      <label className="block text-sm font-semibold text-warm-700 mb-1.5">
        {label} {required && <span className="text-amber-500">*</span>}
      </label>
      <input
        {...register(name)} type={type} placeholder={placeholder}
        className="w-full bg-amber-50 border-2 border-amber-100 rounded-xl px-4 py-3 text-warm-800
                   placeholder-warm-300 focus:outline-none focus:border-amber-400 focus:bg-white
                   transition-all text-sm font-medium"
      />
      {errors[name as keyof FormData] && (
        <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
          ⚠ {(errors[name as keyof FormData] as any)?.message}
        </p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 flex">

      {/* Left Panel — Progress */}
      <div className="hidden lg:flex w-80 flex-col bg-gradient-to-b from-amber-500 to-orange-500 p-10 flex-shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-16">
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
            <ShoppingBag size={20} className="text-white" />
          </div>
          <span className="font-bold text-white text-xl">ApaniDukaan</span>
        </div>

        <div>
          <h2 className="text-white font-bold text-2xl mb-2">Set up your shop</h2>
          <p className="text-amber-100 text-sm mb-10">Get your digital storefront live in under 5 minutes.</p>

          {/* Steps */}
          <div className="space-y-1">
            {steps.map((s) => {
              const done    = step > s.id;
              const current = step === s.id;
              return (
                <div key={s.id}
                  className={`flex items-center gap-4 p-3 rounded-2xl transition-all
                    ${current ? 'bg-white/20' : done ? 'opacity-70' : 'opacity-40'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all
                    ${done ? 'bg-white text-amber-500' : current ? 'bg-white/30 text-white' : 'bg-white/10 text-white/60'}`}>
                    {done ? <Check size={18} /> : <s.icon size={18} />}
                  </div>
                  <div>
                    <p className={`font-semibold text-sm ${current ? 'text-white' : done ? 'text-amber-100' : 'text-white/60'}`}>
                      {s.title}
                    </p>
                    <p className="text-amber-200/70 text-xs">{s.subtitle}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-auto">
          <div className="bg-white/10 rounded-2xl p-4">
            <p className="text-amber-100 text-xs leading-relaxed">
              ✨ Once done, you'll get a <strong className="text-white">public shop URL</strong> and
              a <strong className="text-white">QR code</strong> to share with customers instantly.
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center gap-3 px-6 py-5 border-b border-amber-100 bg-white">
          <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center">
            <ShoppingBag size={16} className="text-white" />
          </div>
          <span className="font-bold text-warm-900">SmartShop Setup</span>
          <div className="ml-auto flex gap-1">
            {steps.map(s => (
              <div key={s.id} className={`w-2 h-2 rounded-full transition-all ${step >= s.id ? 'bg-amber-500' : 'bg-amber-200'}`} />
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="max-w-2xl mx-auto px-6 py-10 lg:py-16">

            {/* Step header */}
            <AnimatePresence mode="wait">
              <motion.div key={`header-${step}`}
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center">
                    {(() => { const S = steps[step-1].icon; return <S size={20} className="text-amber-600" />; })()}
                  </div>
                  <div>
                    <p className="text-amber-500 text-xs font-bold uppercase tracking-widest">Step {step} of 4</p>
                    <h1 className="text-2xl font-extrabold text-warm-900">{steps[step-1].title}</h1>
                  </div>
                </div>
                <p className="text-warm-400 text-sm ml-[52px]">{steps[step-1].subtitle}</p>
              </motion.div>
            </AnimatePresence>

            {/* Form Steps */}
            <form onSubmit={handleSubmit(onSubmit)}>
              <AnimatePresence mode="wait">

                {/* STEP 1 */}
                {step === 1 && (
                  <motion.div key="s1"
                    initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                    className="space-y-5">

                    <InputField label="Shop Name" name="shopName" placeholder="e.g. Sharma General Store" required />

                    <div>
                      <label className="block text-sm font-semibold text-warm-700 mb-1.5">
                        Shop Type <span className="text-amber-500">*</span>
                      </label>
                      <select {...register('shopType')}
                        className="w-full bg-amber-50 border-2 border-amber-100 rounded-xl px-4 py-3 text-warm-800
                                   focus:outline-none focus:border-amber-400 focus:bg-white transition-all text-sm font-medium">
                        <option value="">Select your shop type</option>
                        {SHOP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      {errors.shopType && <p className="text-red-500 text-xs mt-1.5">⚠ {errors.shopType.message}</p>}
                    </div>

                    <InputField label="Tagline" name="tagline" placeholder="e.g. Fresh goods, every day" />

                    <div>
                      <label className="block text-sm font-semibold text-warm-700 mb-1.5">Description</label>
                      <textarea {...register('description')} rows={3}
                        placeholder="Tell customers what you sell and what makes your shop special..."
                        className="w-full bg-amber-50 border-2 border-amber-100 rounded-xl px-4 py-3 text-warm-800
                                   placeholder-warm-300 focus:outline-none focus:border-amber-400 focus:bg-white
                                   transition-all text-sm font-medium resize-none" />
                    </div>
                  </motion.div>
                )}

                {/* STEP 2 */}
                {step === 2 && (
                  <motion.div key="s2"
                    initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                    className="space-y-5">
                    <InputField label="Street Address" name="street" placeholder="Shop No., Street / Colony Name" required />
                    <div className="grid grid-cols-2 gap-4">
                      <InputField label="City"  name="city"  placeholder="Pune" required />
                      <InputField label="State" name="state" placeholder="Maharashtra" required />
                    </div>
                    <InputField label="Pincode" name="pincode" placeholder="411001" required />

                    <div className="bg-amber-50 border-2 border-amber-100 rounded-2xl p-4">
                      <p className="text-warm-500 text-xs leading-relaxed">
                        📍 Your address will be shown on your public shop page so customers know where to find you or pick up their orders.
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3 */}
                {step === 3 && (
                  <motion.div key="s3"
                    initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                    className="space-y-5">

                    <InputField label="Mobile Number" name="phone" placeholder="9876543210" required />
                    <InputField label="Email" name="email" type="email" placeholder="shop@example.com" />

                    <div>
                      <label className="block text-sm font-semibold text-warm-700 mb-3">Payment Methods Accepted</label>
                      <div className="grid grid-cols-2 gap-3">
                        <label className="relative cursor-pointer">
                          <input type="checkbox" {...register('acceptCash')} className="sr-only peer" />
                          <div className="p-4 rounded-2xl border-2 border-amber-100 bg-amber-50 peer-checked:border-amber-400 peer-checked:bg-amber-50 transition-all">
                            <Banknote size={22} className="text-amber-500 mb-2" />
                            <p className="font-semibold text-warm-800 text-sm">Cash</p>
                            <p className="text-warm-400 text-xs">On pickup / delivery</p>
                          </div>
                        </label>
                        <label className="relative cursor-pointer">
                          <input type="checkbox" {...register('acceptOnline')} className="sr-only peer" />
                          <div className="p-4 rounded-2xl border-2 border-amber-100 bg-amber-50 peer-checked:border-amber-400 peer-checked:bg-amber-50 transition-all">
                            <Wifi size={22} className="text-amber-500 mb-2" />
                            <p className="font-semibold text-warm-800 text-sm">Online</p>
                            <p className="text-warm-400 text-xs">Razorpay / UPI</p>
                          </div>
                        </label>
                      </div>
                    </div>

                    {acceptOnline && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                        <InputField label="UPI ID" name="upiId" placeholder="yourname@upi" />
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* STEP 4 */}
                {step === 4 && (
                  <motion.div key="s4"
                    initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                    className="space-y-5">

                    <div className="grid grid-cols-1 gap-3">
                      <label className="cursor-pointer">
                        <input type="checkbox" {...register('offersPickup')} className="sr-only peer" />
                        <div className="flex items-center gap-4 p-5 rounded-2xl border-2 border-amber-100 bg-amber-50 peer-checked:border-amber-400 peer-checked:bg-white transition-all">
                          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                            <Store size={22} className="text-amber-600" />
                          </div>
                          <div>
                            <p className="font-bold text-warm-800">Store Pickup</p>
                            <p className="text-warm-400 text-sm">Customers come to collect from your shop</p>
                          </div>
                          <div className="ml-auto w-5 h-5 rounded-full border-2 border-amber-300 peer-checked:bg-amber-500 peer-checked:border-amber-500 flex-shrink-0" />
                        </div>
                      </label>

                      <label className="cursor-pointer">
                        <input type="checkbox" {...register('offersDelivery')} className="sr-only peer" />
                        <div className="flex items-center gap-4 p-5 rounded-2xl border-2 border-amber-100 bg-amber-50 peer-checked:border-amber-400 peer-checked:bg-white transition-all">
                          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                            <Truck size={22} className="text-amber-600" />
                          </div>
                          <div>
                            <p className="font-bold text-warm-800">Home Delivery</p>
                            <p className="text-warm-400 text-sm">You deliver orders to customers nearby</p>
                          </div>
                          <div className="ml-auto w-5 h-5 rounded-full border-2 border-amber-300 flex-shrink-0" />
                        </div>
                      </label>
                    </div>

                    {/* Summary */}
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-5">
                      <p className="font-bold text-warm-800 mb-3 flex items-center gap-2">
                        <span className="text-lg">🚀</span> Almost there!
                      </p>
                      <div className="space-y-1.5 text-sm text-warm-500">
                        <p> After setup your shop goes live instantly</p>
                        <p> You'll get a unique QR code to share</p>
                        <p> Add products via Excel upload in the dashboard</p>
                        <p> Start accepting orders right away</p>
                      </div>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>

              {/* Navigation */}
              <div className="flex justify-between items-center mt-10 pt-6 border-t border-amber-100">
                <button type="button"
                  onClick={() => setStep(s => Math.max(s - 1, 1))}
                  disabled={step === 1}
                  className="flex items-center gap-2 text-warm-400 hover:text-warm-700 disabled:opacity-20 disabled:cursor-not-allowed transition-colors font-medium text-sm">
                  <ChevronLeft size={18} /> Back
                </button>

                <div className="flex items-center gap-2">
                  {steps.map(s => (
                    <div key={s.id}
                      className={`rounded-full transition-all ${step === s.id ? 'w-6 h-2 bg-amber-500' : step > s.id ? 'w-2 h-2 bg-amber-400' : 'w-2 h-2 bg-amber-200'}`} />
                  ))}
                </div>

                {step < 4 ? (
                  <button type="button" onClick={nextStep}
                    className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-md shadow-amber-200 hover:shadow-lg hover:-translate-y-0.5">
                    Continue <ChevronRight size={16} />
                  </button>
                ) : (
                  <button type="submit" disabled={loading}
                    className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white px-8 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-amber-200 hover:shadow-xl disabled:opacity-60 hover:-translate-y-0.5">
                    {loading ? (
                      <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Creating shop...</>
                    ) : (
                      <><span>🚀</span> Launch My Shop</>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
