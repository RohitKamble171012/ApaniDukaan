'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { ShoppingBag, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { signInWithGoogle, signInWithEmail, registerWithEmail } from '@/lib/firebase';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setShop } = useAuthStore();
  const [isRegister, setIsRegister] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema)
  });

  async function syncUser(firebaseUser: any) {
    const { data } = await authApi.register({
      firebaseUid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
      photoURL: firebaseUser.photoURL
    });
    setUser(data.user);
    if (data.shop) setShop(data.shop);
    return data;
  }

  async function handleGoogleLogin() {
    setLoading(true);
    try {
      const user = await signInWithGoogle();
      const data = await syncUser(user);
      toast.success(`Welcome, ${user.displayName || 'there'}!`);
      router.push(data.user.onboardingComplete ? '/dashboard' : '/auth/onboard');
    } catch (err: any) {
      toast.error(err.message || 'Google login failed');
    } finally { setLoading(false); }
  }

  async function onSubmit(values: FormData) {
    setLoading(true);
    try {
      const user = isRegister
        ? await registerWithEmail(values.email, values.password)
        : await signInWithEmail(values.email, values.password);
      const data = await syncUser(user);
      toast.success(isRegister ? 'Account created!' : 'Welcome back!');
      router.push(data.user.onboardingComplete ? '/dashboard' : '/auth/onboard');
    } catch (err: any) {
      toast.error(err.message || 'Authentication failed');
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-200">
              <ShoppingBag size={22} className="text-white" />
            </div>
            <span className="font-bold text-2xl text-warm-900">SmartShop</span>
          </Link>
          <p className="text-warm-400 mt-3 text-sm">
            {isRegister ? 'Create your shopkeeper account' : 'Sign in to your dashboard'}
          </p>
        </div>

        <div className="bg-white border border-amber-100 rounded-3xl p-8 shadow-xl shadow-amber-100">
          {/* Google */}
          <button onClick={handleGoogleLogin} disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-warm-900 hover:bg-warm-800 text-white font-semibold py-3 px-4 rounded-2xl transition-all mb-6 disabled:opacity-60 shadow-md">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M5.26 9.77A7.49 7.49 0 0 1 12 4.5c1.96 0 3.73.72 5.1 1.9l3.78-3.78A12 12 0 0 0 12 0C7.39 0 3.37 2.59 1.26 6.39l4 3.38Z"/>
              <path fill="#34A853" d="M16.04 18.01A7.46 7.46 0 0 1 12 19.5c-3.04 0-5.66-1.81-6.89-4.44l-4 3.08A12 12 0 0 0 12 24c3.24 0 6.2-1.23 8.44-3.24l-4.4-2.75Z"/>
              <path fill="#4A90D9" d="M20.45 5.1H12v4.5h4.8a6.46 6.46 0 0 1-1.76 3.33l4.4 2.75C21.4 13.9 22.5 11.1 22.5 12c0-.96-.12-1.9-.33-2.78l-1.72-4.12Z"/>
              <path fill="#FBBC05" d="M5.11 14.06A7.49 7.49 0 0 1 4.5 12c0-.72.1-1.42.26-2.1L.76 6.52A12 12 0 0 0 0 12c0 1.93.46 3.75 1.26 5.36l3.85-3.3Z"/>
            </svg>
            Continue with Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-amber-100" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-white text-warm-400 text-xs font-medium">or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-warm-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warm-400" />
                <input {...register('email')} type="email" placeholder="you@example.com"
                  className="w-full bg-amber-50 border border-amber-200 rounded-xl pl-10 pr-4 py-2.5 text-warm-800 placeholder-warm-300 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 text-sm transition-all" />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-warm-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warm-400" />
                <input {...register('password')} type={showPass ? 'text' : 'password'} placeholder="••••••••"
                  className="w-full bg-amber-50 border border-amber-200 rounded-xl pl-10 pr-10 py-2.5 text-warm-800 placeholder-warm-300 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 text-sm transition-all" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-warm-400 hover:text-warm-600">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 text-white font-bold py-3 rounded-2xl transition-all disabled:opacity-60 shadow-md shadow-amber-200 hover:shadow-lg hover:shadow-amber-300 hover:-translate-y-0.5 mt-2">
              {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-warm-400 text-sm mt-5">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button onClick={() => setIsRegister(!isRegister)} className="text-amber-600 hover:text-amber-700 font-semibold">
              {isRegister ? 'Sign In' : 'Register'}
            </button>
          </p>
        </div>

        
      </motion.div>
    </div>
  );
}