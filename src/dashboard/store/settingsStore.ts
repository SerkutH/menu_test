import { create } from 'zustand';
import { RestaurantSettings, WorkingHours, RestaurantProfile, DeliverySettings } from '../types';

// ── Persistence ──────────────────────────────────────────────────────────────

const SETTINGS_STORAGE_KEY = 'dashboard_settings';
const SETTINGS_CHANNEL = 'settings_sync';

function saveSettings(settings: RestaurantSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    const ch = new BroadcastChannel(SETTINGS_CHANNEL);
    ch.postMessage({ type: 'SETTINGS_UPDATED' });
    ch.close();
  } catch { /* storage unavailable */ }
}

function loadSettings(): RestaurantSettings | null {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as RestaurantSettings;
  } catch {
    return null;
  }
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

const initialSettings = loadSettings() || defaultSettings;
if (!loadSettings()) saveSettings(defaultSettings);

// ── Store ────────────────────────────────────────────────────────────────────

interface SettingsStore {
  settings: RestaurantSettings;
  isDirty: boolean;

  updateProfile: (updates: Partial<RestaurantProfile>) => void;
  updateWorkingHours: (dayKey: string, updates: Partial<WorkingHours>) => void;
  updateDelivery: (updates: Partial<DeliverySettings>) => void;
  setOrderAcceptMode: (mode: 'auto' | 'manual') => void;
  setNotificationPhone: (phone: string) => void;
  saveSettings: () => void;
  resetSettings: () => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: initialSettings,
  isDirty: false,

  updateProfile: (updates) =>
    set((state) => ({
      settings: {
        ...state.settings,
        profile: { ...state.settings.profile, ...updates },
      },
      isDirty: true,
    })),

  updateWorkingHours: (dayKey, updates) =>
    set((state) => ({
      settings: {
        ...state.settings,
        workingHours: state.settings.workingHours.map((wh) =>
          wh.dayKey === dayKey ? { ...wh, ...updates } : wh
        ),
      },
      isDirty: true,
    })),

  updateDelivery: (updates) =>
    set((state) => ({
      settings: {
        ...state.settings,
        delivery: { ...state.settings.delivery, ...updates },
      },
      isDirty: true,
    })),

  setOrderAcceptMode: (mode) =>
    set((state) => ({
      settings: { ...state.settings, orderAcceptMode: mode },
      isDirty: true,
    })),

  setNotificationPhone: (phone) =>
    set((state) => ({
      settings: { ...state.settings, notificationPhone: phone },
      isDirty: true,
    })),

  saveSettings: () => set({ isDirty: false }),

  resetSettings: () => set({ settings: defaultSettings, isDirty: false }),
}));

// Auto-persist settings to localStorage on every change
useSettingsStore.subscribe((state, prevState) => {
  if (state.settings !== prevState.settings) {
    saveSettings(state.settings);
  }
});
