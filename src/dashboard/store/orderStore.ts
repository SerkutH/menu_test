import { create } from 'zustand';
import {
  updateOrderStatus as bridgeUpdateStatus,
  subscribeToOrders,
  RestaurantOrder,
  OrderStatus,
} from '../../services/orderBridge';

// ── Store ────────────────────────────────────────────────────────────────────

interface OrderStore {
  orders: RestaurantOrder[];
  isLoading: boolean;
  selectedOrder: RestaurantOrder | null;
  statusFilter: OrderStatus | 'all';

  // Real-time Firebase subscription
  subscribe: () => () => void;

  setStatusFilter: (filter: OrderStatus | 'all') => void;
  selectOrder: (order: RestaurantOrder | null) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  addOrder: (order: RestaurantOrder) => void;
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  orders: [],
  isLoading: true,
  selectedOrder: null,
  statusFilter: 'all',

  subscribe: () => {
    return subscribeToOrders((orders) => {
      const currentSelected = get().selectedOrder;
      set({
        orders,
        isLoading: false,
        selectedOrder: currentSelected
          ? orders.find((o) => o.id === currentSelected.id) || null
          : null,
      });
    });
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
