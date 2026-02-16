import { create } from 'zustand';
import {
  getAllOrders,
  updateOrderStatus as bridgeUpdateStatus,
  subscribeToBridge,
  RestaurantOrder,
  OrderStatus,
} from '../../services/orderBridge';

// ── Store ────────────────────────────────────────────────────────────────────

interface OrderStore {
  orders: RestaurantOrder[];
  selectedOrder: RestaurantOrder | null;
  statusFilter: OrderStatus | 'all';

  // Hydrate from localStorage
  loadOrders: () => void;

  // Real-time bridge subscription
  subscribe: () => () => void;

  setStatusFilter: (filter: OrderStatus | 'all') => void;
  selectOrder: (order: RestaurantOrder | null) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  addOrder: (order: RestaurantOrder) => void;
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  orders: getAllOrders(),
  selectedOrder: null,
  statusFilter: 'all',

  loadOrders: () => {
    set({ orders: getAllOrders() });
  },

  subscribe: () => {
    return subscribeToBridge(
      (order) => {
        set((state) => {
          // Prevent duplicates
          if (state.orders.some((o) => o.id === order.id)) return state;
          return { orders: [order, ...state.orders] };
        });
      },
      (orderId, status) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId ? { ...o, status } : o
          ),
          selectedOrder:
            state.selectedOrder?.id === orderId
              ? { ...state.selectedOrder, status }
              : state.selectedOrder,
        }));
      }
    );
  },

  setStatusFilter: (filter) => set({ statusFilter: filter }),

  selectOrder: (order) => set({ selectedOrder: order }),

  updateOrderStatus: (orderId, status) => {
    bridgeUpdateStatus(orderId, status);
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId ? { ...o, status } : o
      ),
      selectedOrder:
        state.selectedOrder?.id === orderId
          ? { ...state.selectedOrder, status }
          : state.selectedOrder,
    }));
  },

  addOrder: (order) =>
    set((state) => {
      if (state.orders.some((o) => o.id === order.id)) return state;
      return { orders: [order, ...state.orders] };
    }),
}));
