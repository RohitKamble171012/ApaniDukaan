import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  shopId?: string;
  onboardingComplete: boolean;
}

interface Shop {
  _id: string;
  shopSlug: string;
  shopName: string;
  shopType: string;
  logoUrl?: string;
  bannerUrl?: string;
  isActive: boolean;
  [key: string]: any;
}

interface AuthState {
  user: User | null;
  shop: Shop | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setShop: (shop: Shop | null) => void;
  setLoading: (loading: boolean) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      shop: null,
      isLoading: true,
      setUser: (user) => set({ user }),
      setShop: (shop) => set({ shop }),
      setLoading: (isLoading) => set({ isLoading }),
      clear: () => set({ user: null, shop: null, isLoading: false })
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({ user: state.user, shop: state.shop })
    }
  )
);

// Cart store
export interface CartItem {
  productId: string;
  productName: string;
  price: number;
  discountPrice?: number;
  quantity: number;
  unit: string;
  imageUrl?: string;
}

interface CartState {
  items: CartItem[];
  shopSlug: string | null;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setShopSlug: (slug: string) => void;
  subtotal: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      shopSlug: null,
      addItem: (item) => {
        const items = get().items;
        const existing = items.find(i => i.productId === item.productId);
        if (existing) {
          set({ items: items.map(i => i.productId === item.productId ? { ...i, quantity: i.quantity + item.quantity } : i) });
        } else {
          set({ items: [...items, item] });
        }
      },
      removeItem: (productId) => set({ items: get().items.filter(i => i.productId !== productId) }),
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter(i => i.productId !== productId) });
        } else {
          set({ items: get().items.map(i => i.productId === productId ? { ...i, quantity } : i) });
        }
      },
      clearCart: () => set({ items: [], shopSlug: null }),
      setShopSlug: (shopSlug) => set({ shopSlug }),
      subtotal: () => get().items.reduce((sum, item) => sum + (item.discountPrice || item.price) * item.quantity, 0),
      itemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0)
    }),
    { name: 'cart-store' }
  )
);
