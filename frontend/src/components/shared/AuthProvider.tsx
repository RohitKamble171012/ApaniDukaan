'use client';

import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setShop, setLoading, clear } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Register/sync with backend
          await authApi.register({
            firebaseUid: firebaseUser.uid,
            email: firebaseUser.email!,
            displayName: firebaseUser.displayName || firebaseUser.email!.split('@')[0],
            photoURL: firebaseUser.photoURL || undefined
          });

          const { data } = await authApi.me();
          setUser(data.user);
          if (data.shop) setShop(data.shop);
        } catch (err) {
          console.error('Auth sync error:', err);
          setUser(null);
        }
      } else {
        clear();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setShop, setLoading, clear]);

  return <>{children}</>;
}
