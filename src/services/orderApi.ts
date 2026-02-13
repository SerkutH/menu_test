import { CartItem, CheckoutFormData, OrderMode } from '../types';

// ── Order payload that n8n receives ──────────────────────────────────────────

export interface OrderPayload {
  /** Unique idempotency key — prevents duplicate orders on retry */
  idempotencyKey: string;

  /** ISO-8601 timestamp */
  createdAt: string;

  /** "delivery" | "pickup" */
  mode: OrderMode;

  /** Customer details */
  customer: {
    fullName: string;
    phone: string;
    email: string | null;
    /** Source of the session — "whatsapp" if token was present, otherwise "web" */
    source: 'whatsapp' | 'web';
  };

  /** Delivery address — null when mode is "pickup" */
  delivery: {
    addressLine: string;
    buildingNo: string;
    district: string;
    city: string;
    deliveryNote: string;
    lat: number;
    lng: number;
  } | null;

  /** Line items */
  items: OrderLineItem[];

  /** Price breakdown */
  totals: {
    subtotal: number;
    deliveryFee: number;
    total: number;
    currency: 'TRY';
  };
}

export interface OrderLineItem {
  menuItemId: string;
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
}

// ── Build the payload ────────────────────────────────────────────────────────

export function buildOrderPayload(
  form: CheckoutFormData,
  items: CartItem[],
  subtotal: number,
  deliveryFee: number,
  total: number,
  idempotencyKey: string,
  whatsappSession: boolean
): OrderPayload {
  return {
    idempotencyKey,
    createdAt: new Date().toISOString(),
    mode: form.mode,
    customer: {
      fullName: form.fullName.trim(),
      phone: form.phone.replace(/[\s\-()]/g, ''),
      email: form.email.trim() || null,
      source: whatsappSession ? 'whatsapp' : 'web',
    },
    delivery:
      form.mode === 'delivery'
        ? {
            addressLine: form.addressLine.trim(),
            buildingNo: form.buildingNo.trim(),
            district: form.district,
            city: form.city,
            deliveryNote: form.deliveryNote.trim(),
            lat: form.pinLat,
            lng: form.pinLng,
          }
        : null,
    items: items.map((item) => ({
      menuItemId: item.menuItemId,
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.unitPrice * item.quantity,
      removedIngredients: item.removedIngredients,
      modifiers: item.selectedModifiers.map((mod) => ({
        groupName: mod.groupName,
        type: mod.groupType,
        selectedOptions: mod.options.map((o) => ({
          name: o.name,
          priceDelta: o.priceDelta,
        })),
      })),
    })),
    totals: {
      subtotal,
      deliveryFee,
      total,
      currency: 'TRY',
    },
  };
}

// ── Submit to n8n webhook ────────────────────────────────────────────────────

export interface SubmitResult {
  success: boolean;
  error?: string;
}

export async function submitOrderToN8n(payload: OrderPayload): Promise<SubmitResult> {
  const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;

  if (!webhookUrl) {
    console.error('[orderApi] VITE_N8N_WEBHOOK_URL is not set');
    return { success: false, error: 'Webhook URL is not configured. Please contact support.' };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Idempotency-Key': payload.idempotencyKey,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.error(`[orderApi] n8n returned ${response.status}:`, text);
      return {
        success: false,
        error: `Order submission failed (${response.status}). Please try again.`,
      };
    }

    return { success: true };
  } catch (err) {
    console.error('[orderApi] Network error:', err);
    return {
      success: false,
      error: 'Could not reach the server. Please check your connection and try again.',
    };
  }
}
