import { create } from 'zustand';
import { RestaurantSettings, WorkingHours, RestaurantProfile, DeliverySettings } from '../types';
import { dbSet, dbOnValue } from '../../services/firebase';

// ── Firebase persistence ─────────────────────────────────────────────────────

function saveSettings(settings: RestaurantSettings): void {
  dbSet('settings', settings).catch((err) => console.error('[settingsStore] Firebase save error:', err));
}

// ── Defaults ─────────────────────────────────────────────────────────────────

const defaultWorkingHours: WorkingHours[] = [
  { day: 'Pazartesi', dayKey: 'mon', isOpen: true, openTime: '10:00', closeTime: '22:00' },
  { day: 'Salı', dayKey: 'tue', isOpen: true, openTime: '10:00', closeTime: '22:00' },
  { day: 'Çarşamba', dayKey: 'wed', isOpen: true, openTime: '10:00', closeTime: '22:00' },
  { day: 'Perşembe', dayKey: 'thu', isOpen: true, openTime: '10:00', closeTime: '22:00' },
  { day: 'Cuma', dayKey: 'fri', isOpen: true, openTime: '10:00', closeTime: '23:00' },
  { day: 'Cumartesi', dayKey: 'sat', isOpen: true, openTime: '11:00', closeTime: '23:00' },
  { day: 'Pazar', dayKey: 'sun', isOpen: true, openTime: '11:00', closeTime: '22:00' },
];

const defaultSettings: RestaurantSettings = {
  profile: {
    name: "Ahmet'in Kebap Evi",
    slug: 'ahmet-kebap-evi',
    tagline: 'Geleneksel lezzetler, modern sunum',
    logoUrl: '',
    coverImageUrl: '',
    address: 'Bağdat Cad. No:45, Kadıköy, İstanbul',
    phone: '+90 216 345 67 89',
    email: 'info@ahmetkebap.com',
  },
  workingHours: defaultWorkingHours,
  delivery: {
    deliveryEnabled: true,
    pickupEnabled: true,
    deliveryFee: 15,
    freeDeliveryThreshold: 200,
    deliveryRadius: 5,
    minOrderAmount: 80,
    avgPrepTime: 30,
  },
  orderAcceptMode: 'auto',
  notificationPhone: '+90 532 123 45 67',
};

// ── Store ────────────────────────────────────────────────────────────────────

interface SettingsStore {
  settings: RestaurantSettings;
  isLoading: boolean;
  isDirty: boolean;

  hydrateFromFirebase: () => () => void;

  updateProfile: (updates: Partial<RestaurantProfile>) => void;
  updateWorkingHours: (dayKey: string, updates: Partial<WorkingHours>) => void;
  updateDelivery: (updates: Partial<DeliverySettings>) => void;
  setOrderAcceptMode: (mode: 'auto' | 'manual') => void;
  setNotificationPhone: (phone: string) => void;
  saveSettings: () => void;
  resetSettings: () => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: defaultSettings,
  isLoading: true,
  isDirty: false,

  hydrateFromFirebase: () => {
    return dbOnValue<RestaurantSettings>('settings', (data) => {
      if (data) {
        set({ settings: data, isLoading: false });
      } else {
        saveSettings(defaultSettings);
        set({ settings: defaultSettings, isLoading: false });
      }
    });
  },

  updateProfile: (updates) =>
    set((state) => {
      const updated = {
        ...state.settings,
        profile: { ...state.settings.profile, ...updates },
      };
      saveSettings(updated);
      return { settings: updated, isDirty: true };
    }),

  updateWorkingHours: (dayKey, updates) =>
    set((state) => {
      const updated = {
        ...state.settings,
        workingHours: state.settings.workingHours.map((wh) =>
          wh.dayKey === dayKey ? { ...wh, ...updates } : wh
        ),
      };
      saveSettings(updated);
      return { settings: updated, isDirty: true };
    }),

  updateDelivery: (updates) =>
    set((state) => {
      const updated = {
        ...state.settings,
        delivery: { ...state.settings.delivery, ...updates },
      };
      saveSettings(updated);
      return { settings: updated, isDirty: true };
    }),

  setOrderAcceptMode: (mode) =>
    set((state) => {
      const updated = { ...state.settings, orderAcceptMode: mode };
      saveSettings(updated);
      return { settings: updated, isDirty: true };
    }),

  setNotificationPhone: (phone) =>
    set((state) => {
      const updated = { ...state.settings, notificationPhone: phone };
      saveSettings(updated);
      return { settings: updated, isDirty: true };
    }),

  saveSettings: () => set({ isDirty: false }),

  resetSettings: () => {
    saveSettings(defaultSettings);
    set({ settings: defaultSettings, isDirty: false });
  },
}));
