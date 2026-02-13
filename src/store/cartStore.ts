import { create } from 'zustand';
import { CartItem, OrderMode } from '../types';

const CART_STORAGE_KEY = 'flame-dough-cart';
const CART_EXPIRY_HOURS = 24;

interface CartState {
  items: CartItem[];
  isCartOpen: boolean;
  isCheckoutOpen: boolean;
  orderMode: OrderMode;
  staleCartNotice: boolean;
  addItem: (item: Omit<CartItem, 'cartLineId'>) => void;
  removeItem: (cartLineId: string) => void;
  updateQuantity: (cartLineId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  openCheckout: () => void;
  closeCheckout: () => void;
  setOrderMode: (mode: OrderMode) => void;
  dismissStaleNotice: () => void;
  getSubtotal: () => number;
  getDeliveryFee: (mode?: OrderMode) => number;
  getTotal: (mode?: OrderMode) => number;
  getItemCount: () => number;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

function saveCart(items: CartItem[]) {
  try {
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify({ items, timestamp: Date.now() })
    );
  } catch {
    // localStorage not available
  }
}

function loadCart(): { items: CartItem[]; isStale: boolean } {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return { items: [], isStale: false };
    const { items, timestamp } = JSON.parse(raw);
    const hoursElapsed = (Date.now() - timestamp) / (1000 * 60 * 60);
    if (hoursElapsed > CART_EXPIRY_HOURS) {
      localStorage.removeItem(CART_STORAGE_KEY);
      return { items: [], isStale: true };
    }
    return { items: items || [], isStale: false };
  } catch {
    return { items: [], isStale: false };
  }
}

const initialCart = loadCart();

export const useCartStore = create<CartState>((set, get) => ({
  items: initialCart.items,
  isCartOpen: false,
  isCheckoutOpen: false,
  orderMode: 'delivery' as OrderMode,
  staleCartNotice: initialCart.isStale,

  addItem: (item) => {
    const newItem: CartItem = {
      ...item,
      cartLineId: generateId(),
    };
    set((state) => {
      const newItems = [...state.items, newItem];
      saveCart(newItems);
      return { items: newItems };
    });
  },

  removeItem: (cartLineId) => {
    set((state) => {
      const newItems = state.items.filter((i) => i.cartLineId !== cartLineId);
      saveCart(newItems);
      return { items: newItems };
    });
  },

  updateQuantity: (cartLineId, quantity) => {
    set((state) => {
      if (quantity <= 0) {
        const newItems = state.items.filter((i) => i.cartLineId !== cartLineId);
        saveCart(newItems);
        return { items: newItems };
      }
      const newItems = state.items.map((i) =>
        i.cartLineId === cartLineId ? { ...i, quantity } : i
      );
      saveCart(newItems);
      return { items: newItems };
    });
  },

  clearCart: () => {
    saveCart([]);
    set({ items: [] });
  },

  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false, isCheckoutOpen: false }),
  openCheckout: () => set({ isCheckoutOpen: true, isCartOpen: false }),
  closeCheckout: () => set({ isCheckoutOpen: false }),
  setOrderMode: (mode) => set({ orderMode: mode }),
  dismissStaleNotice: () => set({ staleCartNotice: false }),

  getSubtotal: () => {
    return get().items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  },

  getDeliveryFee: (mode?: OrderMode) => {
    const m = mode ?? get().orderMode;
    return m === 'delivery' ? 15 : 0;
  },

  getTotal: (mode?: OrderMode) => {
    const subtotal = get().getSubtotal();
    return subtotal + get().getDeliveryFee(mode);
  },

  getItemCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },
}));
