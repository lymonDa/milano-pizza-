import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useBranch } from '@/contexts/BranchContext';

export interface CartAddon {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  description: string;
  imageUrl: string;
  size: 'M' | 'L';
  quantity: number;
  unitPrice: number;
  addons: CartAddon[];
  lineTotal: number;
}

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  discount: number;
  total: number;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  isSyncing: boolean;
}

const CART_STORAGE_KEY = 'milano_pizza_cart';

const CartContext = createContext<CartContextValue | undefined>(undefined);

function loadCartFromStorage(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CartItem[];
  } catch {
    return [];
  }
}

function saveCartToStorage(items: CartItem[]) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage full or unavailable — silent fail, cart still works in memory
  }
}

function computeAddonsTotal(addons: CartAddon[]) {
  return addons.reduce((sum, a) => sum + a.price * a.quantity, 0);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => loadCartFromStorage());
  const [isSyncing, setIsSyncing] = useState(false);
  const { branch } = useBranch();
  const prevBranch = useRef(branch);

  // Clear cart when branch changes (skip initial load)
  useEffect(() => {
    if (prevBranch.current !== null && prevBranch.current !== branch) {
      setItems([]);
    }
    prevBranch.current = branch;
  }, [branch]);

  // Persist to localStorage on every change
  useEffect(() => {
    saveCartToStorage(items);
  }, [items]);

  // Sync with Supabase when user is logged in
  useEffect(() => {
    let cancelled = false;

    async function syncWithSupabase() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      setIsSyncing(true);
      try {
        if (items.length > 0) {
          // Upsert cart items — clear existing and insert current
          await supabase.from('cart_items').delete().eq('user_id', session.user.id);

          const cartRows = items.map((item) => ({
            user_id: session.user.id,
            menu_item_id: item.menuItemId,
            size: item.size,
            quantity: item.quantity,
            addon_ids: item.addons.map((a) => a.id),
          }));

          await supabase.from('cart_items').insert(cartRows);
        } else {
          await supabase.from('cart_items').delete().eq('user_id', session.user.id);
        }
      } catch {
        // Sync failure is non-blocking — cart still works from localStorage
      } finally {
        if (!cancelled) setIsSyncing(false);
      }
    }

    // Debounce sync to avoid rapid-fire writes
    const timeout = setTimeout(syncWithSupabase, 500);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [items]);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => {
    const addonTotal = computeAddonsTotal(item.addons);
    return sum + (item.unitPrice + addonTotal) * item.quantity;
  }, 0);

  // Discount — placeholder, will be computed server-side in Edge Function later
  const discount = 0;
  const total = subtotal - discount;

  const addItem = useCallback((newItem: Omit<CartItem, 'id'>) => {
    setItems((prev) => {
      const existing = prev.find(
        (i) =>
          i.menuItemId === newItem.menuItemId &&
          i.size === newItem.size &&
          JSON.stringify(i.addons.map((a) => a.id).sort()) ===
            JSON.stringify(newItem.addons.map((a) => a.id).sort()),
      );
      if (existing) {
        return prev.map((i) =>
          i.id === existing.id
            ? {
                ...i,
                quantity: i.quantity + newItem.quantity,
                lineTotal: i.lineTotal + newItem.lineTotal,
              }
            : i,
        );
      }
      return [...prev, { ...newItem, id: `${newItem.menuItemId}-${Date.now()}` }];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity < 1) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      return;
    }
    setItems((prev) =>
      prev.map((i) => {
        if (i.id === id) {
          const addonTotal = computeAddonsTotal(i.addons);
          const newLineTotal = (i.unitPrice + addonTotal) * quantity;
          return { ...i, quantity, lineTotal: newLineTotal };
        }
        return i;
      }),
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  return (
    <CartContext.Provider
      value={{ items, itemCount, subtotal, discount, total, addItem, removeItem, updateQuantity, clearCart, isSyncing }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}