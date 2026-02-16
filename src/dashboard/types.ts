// Re-export shared order types from the bridge
export type { RestaurantOrder as DashboardOrder, OrderStatus as DashboardOrderStatus } from '../services/orderBridge';

// ── Menu Management ──────────────────────────────────────────────────────────

export interface DashboardModifierOption {
  id: string;
  name: string;
  priceDelta: number;
  isDefault: boolean;
  stockStatus: 'available' | 'sold_out';
}

export interface DashboardModifierGroup {
  id: string;
  name: string;
  type: 'single' | 'multi' | 'removal';
  required: boolean;
  minSelections: number;
  maxSelections: number;
  displayOrder: number;
  options: DashboardModifierOption[];
}

export interface DashboardMenuItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  basePrice: number;
  taxRate: number;
  tags: string[];
  stockStatus: 'available' | 'sold_out' | 'hidden';
  displayOrder: number;
  modifierGroups: DashboardModifierGroup[];
}

export interface DashboardCategory {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  displayOrder: number;
  items: DashboardMenuItem[];
}

export type MenuStatus = 'draft' | 'live' | 'scheduled';

export interface DashboardMenu {
  id: string;
  name: string;
  status: MenuStatus;
  categories: DashboardCategory[];
}

// ── Settings ─────────────────────────────────────────────────────────────────

export interface WorkingHours {
  day: string;
  dayKey: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export interface RestaurantProfile {
  name: string;
  slug: string;
  tagline: string;
  logoUrl: string;
  coverImageUrl: string;
  address: string;
  phone: string;
  email: string;
}

export interface DeliverySettings {
  deliveryEnabled: boolean;
  pickupEnabled: boolean;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  deliveryRadius: number;
  minOrderAmount: number;
  avgPrepTime: number;
}

export interface RestaurantSettings {
  profile: RestaurantProfile;
  workingHours: WorkingHours[];
  delivery: DeliverySettings;
  orderAcceptMode: 'auto' | 'manual';
  notificationPhone: string;
}
