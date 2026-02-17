/**
 * Menu Bridge — reads the menu + settings from Firebase Realtime Database
 * and converts them into the format the customer-facing app expects.
 *
 * Data flow:  Dashboard menuStore → Firebase → menuBridge → Customer App
 */

import type { Restaurant, Category, MenuItem, ModifierGroup, ModifierOption } from '../types';
import type {
  DashboardMenu,
  DashboardCategory,
  DashboardMenuItem,
  DashboardModifierGroup,
  RestaurantSettings,
} from '../dashboard/types';
import { dbOnValue } from './firebase';

// ── In-memory cache (populated by Firebase listeners) ─────────────────────────

let cachedMenu: DashboardMenu | null = null;
let cachedSettings: RestaurantSettings | null = null;
let menuListenerActive = false;
let settingsListenerActive = false;

/**
 * Start the Firebase listener for menu data.
 * Should be called once at app startup.
 */
export function startMenuListener(onChange?: () => void): () => void {
  if (menuListenerActive) return () => {};
  menuListenerActive = true;

  const unsub = dbOnValue<DashboardMenu>('menu', (data) => {
    cachedMenu = data;
    onChange?.();
  });

  return () => {
    unsub();
    menuListenerActive = false;
  };
}

/**
 * Start the Firebase listener for settings data.
 * Should be called once at app startup.
 */
export function startSettingsListener(onChange?: () => void): () => void {
  if (settingsListenerActive) return () => {};
  settingsListenerActive = true;

  const unsub = dbOnValue<RestaurantSettings>('settings', (data) => {
    cachedSettings = data;
    onChange?.();
  });

  return () => {
    unsub();
    settingsListenerActive = false;
  };
}

// ── Conversion: Dashboard → Customer format ──────────────────────────────────

function convertModifierGroup(dg: DashboardModifierGroup): ModifierGroup {
  if (dg.type === 'removal') {
    return {
      type: 'removal',
      name: dg.name,
      ingredients: dg.options.map((o) => o.name),
    };
  }

  if (dg.type === 'single') {
    const options: ModifierOption[] = dg.options.map((o) => ({
      id: o.id,
      name: o.name,
      priceDelta: o.priceDelta,
    }));
    const defaultOpt = dg.options.find((o) => o.isDefault);
    return {
      type: 'single',
      name: dg.name,
      required: dg.required,
      options,
      defaultOptionId: defaultOpt?.id,
    };
  }

  // multi
  const options: ModifierOption[] = dg.options.map((o) => ({
    id: o.id,
    name: o.name,
    priceDelta: o.priceDelta,
  }));
  return {
    type: 'multi',
    name: dg.name,
    minSelections: dg.minSelections,
    maxSelections: dg.maxSelections,
    options,
  };
}

function convertItem(di: DashboardMenuItem): MenuItem {
  return {
    id: di.id,
    name: di.name,
    description: di.description,
    price: di.basePrice,
    image: di.imageUrl,
    tags: di.tags as MenuItem['tags'],
    soldOut: di.stockStatus === 'sold_out',
    maxQuantity: 10,
    modifierGroups: (di.modifierGroups || [])
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map(convertModifierGroup),
  };
}

function convertCategory(dc: DashboardCategory): Category {
  const visibleItems = (dc.items || [])
    .filter((i) => i.stockStatus !== 'hidden')
    .sort((a, b) => a.displayOrder - b.displayOrder);

  return {
    id: dc.id,
    name: dc.name,
    description: dc.description || undefined,
    items: visibleItems.map(convertItem),
  };
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns the customer-facing menu categories from the Firebase cache.
 * Returns null if no dashboard menu has been configured yet.
 */
export function getPublishedCategories(): Category[] | null {
  const menu = cachedMenu;
  if (!menu || menu.status !== 'live') return null;

  return (menu.categories || [])
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map(convertCategory)
    .filter((c) => c.items.length > 0);
}

/**
 * Returns the customer-facing restaurant info from the Firebase cache.
 * Returns null if no settings have been configured yet.
 */
export function getPublishedRestaurant(): Restaurant | null {
  const settings = cachedSettings;
  if (!settings) return null;

  const now = new Date();
  const dayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const todayKey = dayKeys[now.getDay()];
  const todayHours = settings.workingHours.find((wh) => wh.dayKey === todayKey);

  let isOpen = false;
  let opensAt = '';

  if (todayHours?.isOpen) {
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [openH, openM] = todayHours.openTime.split(':').map(Number);
    const [closeH, closeM] = todayHours.closeTime.split(':').map(Number);
    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;
    isOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes;
    if (!isOpen && currentMinutes < openMinutes) {
      opensAt = todayHours.openTime;
    }
  }

  if (!isOpen && !opensAt) {
    for (let i = 1; i <= 7; i++) {
      const nextDayIdx = (now.getDay() + i) % 7;
      const nextKey = dayKeys[nextDayIdx];
      const nextHours = settings.workingHours.find((wh) => wh.dayKey === nextKey);
      if (nextHours?.isOpen) {
        opensAt = nextHours.openTime;
        break;
      }
    }
  }

  return {
    name: settings.profile.name,
    coverImage: settings.profile.coverImageUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=675&fit=crop',
    logo: settings.profile.logoUrl || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&h=200&fit=crop',
    isOpen,
    opensAt,
    prepTime: `${settings.delivery.avgPrepTime} dk`,
    minOrder: settings.delivery.minOrderAmount,
    deliveryFee: settings.delivery.deliveryFee,
    deliveryAvailable: settings.delivery.deliveryEnabled,
    pickupAvailable: settings.delivery.pickupEnabled,
    location: {
      address: settings.profile.address,
      lat: 40.9808,
      lng: 29.0562,
    },
    districts: [
      'Kadıköy', 'Üsküdar', 'Ataşehir', 'Maltepe', 'Beşiktaş',
      'Şişli', 'Beyoğlu', 'Bakırköy', 'Fatih', 'Kartal',
    ],
  };
}

/**
 * @deprecated — kept for backwards compatibility. Use startMenuListener / startSettingsListener instead.
 */
export function subscribeToMenuChanges(_onChange: () => void): () => void {
  return () => {};
}
