'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { shopApi } from '@/lib/api';
import { useCartStore } from '@/store';

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const slug = params.shopSlug as string;
  const { setShopSlug, clearCart, shopSlug } = useCartStore();

  useEffect(() => {
    // If user navigates to a different shop, clear cart
    if (shopSlug && shopSlug !== slug) {
      if (confirm('You have items from a different shop in your cart. Clear cart?')) {
        clearCart();
      }
    }
    setShopSlug(slug);
  }, [slug]);

  return <>{children}</>;
}
