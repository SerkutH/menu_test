/**
 * Order Bridge — shared communication layer between customer app and restaurant dashboard.
 *
 * Uses Firebase Realtime Database for persistence and real-time
 * cross-device communication (customer → dashboard).
 */

import { OrderPayload } from './orderApi';
import { dbSet, dbGet, dbOnValue } from './firebase';

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

// ── Helpers ──────────────────────────────────────────────────────────────────

function uid(): string {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

async function getNextOrderNumber(): Promise<string> {
  const counter = (await dbGet<number>('orderCounter')) || 0;
  const next = counter + 1;
  await dbSet('orderCounter', next);
  return '#' + String(next).padStart(4, '0');
}

// ── Read / Write ─────────────────────────────────────────────────────────────

export async function getAllOrders(): Promise<RestaurantOrder[]> {
  const data = await dbGet<Record<string, RestaurantOrder>>('orders');
  if (!data) return [];
  return Object.values(data).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Called by the customer app after a successful order submission.
 * Converts the OrderPayload into a RestaurantOrder, persists it to Firebase,
 * and the dashboard receives it in real-time via onValue listener.
 */
export async function pushOrder(payload: OrderPayload): Promise<RestaurantOrder> {
  const orderNumber = await getNextOrderNumber();
  const orderId = payload.idempotencyKey || uid();

  const order: RestaurantOrder = {
    id: orderId,
    orderNumber,
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

  await dbSet(`orders/${orderId}`, order);
  return order;
}

/**
 * Called by the dashboard to update an order's status.
 * Firebase listeners on both sides pick up the change in real-time.
 */
export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  await dbSet(`orders/${orderId}/status`, status);
}

/**
 * Subscribe to real-time order changes from Firebase.
 * Returns an unsubscribe function.
 */
export function subscribeToOrders(
  onOrdersChanged: (orders: RestaurantOrder[]) => void
): () => void {
  return dbOnValue<Record<string, RestaurantOrder>>('orders', (data) => {
    if (!data) {
      onOrdersChanged([]);
      return;
    }
    const orders = Object.values(data).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    onOrdersChanged(orders);
  });
}

/**
 * @deprecated — kept for backwards compatibility
 */
export function subscribeToBridge(
  onNewOrder: (order: RestaurantOrder) => void,
  _onStatusUpdate: (orderId: string, status: OrderStatus) => void
): () => void {
  let previousOrderIds = new Set<string>();

  return subscribeToOrders((orders) => {
    for (const order of orders) {
      if (!previousOrderIds.has(order.id)) {
        onNewOrder(order);
      }
    }
    previousOrderIds = new Set(orders.map((o) => o.id));
  });
}
