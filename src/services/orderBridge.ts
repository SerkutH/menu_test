/**
 * Order Bridge — shared communication layer between customer app and restaurant dashboard.
 *
 * Uses localStorage for persistence and BroadcastChannel for real-time
 * cross-tab communication (customer tab → dashboard tab).
 */

import { OrderPayload } from './orderApi';

// ── Types ────────────────────────────────────────────────────────────────────

export type OrderStatus = 'new' | 'preparing' | 'on_the_way' | 'delivered' | 'cancelled';

export interface RestaurantOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  createdAt: string;
  customer: {
    name: string;
    phone: string;
    source: 'whatsapp' | 'web';
  };
  deliveryType: 'delivery' | 'pickup';
  address: {
    addressLine: string;
    district: string;
    city: string;
    deliveryNote: string;
  } | null;
  items: {
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    removedIngredients: string[];
    modifiers: {
      groupName: string;
      type: 'single' | 'multi';
      selectedOptions: { name: string; priceDelta: number }[];
    }[];
  }[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  note: string;
}

type BridgeMessage =
  | { type: 'NEW_ORDER'; order: RestaurantOrder }
  | { type: 'ORDER_STATUS_UPDATE'; orderId: string; status: OrderStatus };

// ── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'restaurant_orders';
const CHANNEL_NAME = 'order_bridge';

// ── Helpers ──────────────────────────────────────────────────────────────────

let orderCounter = parseInt(localStorage.getItem('order_counter') || '0', 10);

function nextOrderNumber(): string {
  orderCounter += 1;
  localStorage.setItem('order_counter', String(orderCounter));
  return '#' + String(orderCounter).padStart(4, '0');
}

function uid(): string {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

function getChannel(): BroadcastChannel | null {
  try {
    return new BroadcastChannel(CHANNEL_NAME);
  } catch {
    return null;
  }
}

// ── Read / Write ─────────────────────────────────────────────────────────────

export function getAllOrders(): RestaurantOrder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as RestaurantOrder[];
  } catch {
    return [];
  }
}

function saveAllOrders(orders: RestaurantOrder[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch {
    // storage full or unavailable
  }
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Called by the customer app after a successful order submission.
 * Converts the OrderPayload into a RestaurantOrder, persists it,
 * and broadcasts to the dashboard tab.
 */
export function pushOrder(payload: OrderPayload): RestaurantOrder {
  const order: RestaurantOrder = {
    id: payload.idempotencyKey || uid(),
    orderNumber: nextOrderNumber(),
    status: 'new',
    createdAt: payload.createdAt,
    customer: {
      name: payload.customer.fullName,
      phone: payload.customer.phone,
      source: payload.customer.source,
    },
    deliveryType: payload.mode,
    address: payload.delivery
      ? {
          addressLine: payload.delivery.addressLine,
          district: payload.delivery.district,
          city: payload.delivery.city,
          deliveryNote: payload.delivery.deliveryNote,
        }
      : null,
    items: payload.items.map((item) => ({
      id: uid(),
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.lineTotal,
      removedIngredients: item.removedIngredients,
      modifiers: item.modifiers,
    })),
    subtotal: payload.totals.subtotal,
    deliveryFee: payload.totals.deliveryFee,
    total: payload.totals.total,
    note: '',
  };

  const orders = getAllOrders();
  orders.unshift(order);
  saveAllOrders(orders);

  // Broadcast to dashboard
  const ch = getChannel();
  if (ch) {
    ch.postMessage({ type: 'NEW_ORDER', order } satisfies BridgeMessage);
    ch.close();
  }

  return order;
}

/**
 * Called by the dashboard to update an order's status.
 * Persists and broadcasts back (in case multiple dashboard tabs).
 */
export function updateOrderStatus(orderId: string, status: OrderStatus): void {
  const orders = getAllOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx === -1) return;
  orders[idx] = { ...orders[idx], status };
  saveAllOrders(orders);

  const ch = getChannel();
  if (ch) {
    ch.postMessage({ type: 'ORDER_STATUS_UPDATE', orderId, status } satisfies BridgeMessage);
    ch.close();
  }
}

/**
 * Subscribe to real-time order events from other tabs.
 * Returns an unsubscribe function.
 */
export function subscribeToBridge(
  onNewOrder: (order: RestaurantOrder) => void,
  onStatusUpdate: (orderId: string, status: OrderStatus) => void
): () => void {
  const ch = getChannel();
  if (!ch) return () => {};

  const handler = (event: MessageEvent<BridgeMessage>) => {
    if (event.data.type === 'NEW_ORDER') {
      onNewOrder(event.data.order);
    } else if (event.data.type === 'ORDER_STATUS_UPDATE') {
      onStatusUpdate(event.data.orderId, event.data.status);
    }
  };

  ch.addEventListener('message', handler);
  return () => {
    ch.removeEventListener('message', handler);
    ch.close();
  };
}
