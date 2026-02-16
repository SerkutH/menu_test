import { create } from 'zustand';
import {
  DashboardMenu,
  DashboardCategory,
  DashboardMenuItem,
  DashboardModifierGroup,
  DashboardModifierOption,
  MenuStatus,
} from '../types';

function uid(): string {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

// ── Persistence ──────────────────────────────────────────────────────────────

const MENU_STORAGE_KEY = 'dashboard_menu';
const MENU_CHANNEL = 'menu_sync';

function saveMenu(menu: DashboardMenu): void {
  try {
    localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(menu));
    const ch = new BroadcastChannel(MENU_CHANNEL);
    ch.postMessage({ type: 'MENU_UPDATED' });
    ch.close();
  } catch { /* storage unavailable */ }
}

function loadMenu(): DashboardMenu | null {
  try {
    const raw = localStorage.getItem(MENU_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DashboardMenu;
  } catch {
    return null;
  }
}

// ── Default data (used only on very first launch) ────────────────────────────

const defaultMenu: DashboardMenu = {
  id: 'menu-1',
  name: 'Ana Menü',
  status: 'live',
  categories: [
    {
      id: 'cat-kebaplar',
      name: 'Kebaplar',
      description: 'Özenle hazırlanan geleneksel kebaplarimız',
      imageUrl: '',
      displayOrder: 0,
      items: [
        {
          id: 'item-adana',
          name: 'Adana Kebap',
          description: 'Acılı kıyma kebabı, közlenmiş biber ve domates ile servis edilir',
          imageUrl: '',
          basePrice: 180,
          taxRate: 10,
          tags: ['Acılı'],
          stockStatus: 'available',
          displayOrder: 0,
          modifierGroups: [
            {
              id: 'mg-porsiyon',
              name: 'Porsiyon',
              type: 'single',
              required: true,
              minSelections: 1,
              maxSelections: 1,
              displayOrder: 0,
              options: [
                { id: 'opt-tek', name: 'Tek', priceDelta: 0, isDefault: true, stockStatus: 'available' },
                { id: 'opt-birbucuk', name: 'Bir Buçuk', priceDelta: 60, isDefault: false, stockStatus: 'available' },
                { id: 'opt-ikili', name: 'İkili', priceDelta: 120, isDefault: false, stockStatus: 'available' },
              ],
            },
            {
              id: 'mg-ekstralar',
              name: 'Ekstralar',
              type: 'multi',
              required: false,
              minSelections: 0,
              maxSelections: 4,
              displayOrder: 1,
              options: [
                { id: 'opt-lavas', name: 'Ekstra Lavaş', priceDelta: 10, isDefault: false, stockStatus: 'available' },
                { id: 'opt-yogurt', name: 'Yoğurt', priceDelta: 15, isDefault: false, stockStatus: 'available' },
                { id: 'opt-kozpatlican', name: 'Közlenmiş Patlıcan', priceDelta: 20, isDefault: false, stockStatus: 'available' },
                { id: 'opt-acisos', name: 'Acı Sos', priceDelta: 5, isDefault: false, stockStatus: 'available' },
              ],
            },
            {
              id: 'mg-cikar',
              name: 'Malzeme Çıkar',
              type: 'removal',
              required: false,
              minSelections: 0,
              maxSelections: 10,
              displayOrder: 2,
              options: [
                { id: 'opt-r-biber', name: 'Közlenmiş Biber', priceDelta: 0, isDefault: false, stockStatus: 'available' },
                { id: 'opt-r-domates', name: 'Domates', priceDelta: 0, isDefault: false, stockStatus: 'available' },
                { id: 'opt-r-sogan', name: 'Soğan', priceDelta: 0, isDefault: false, stockStatus: 'available' },
              ],
            },
          ],
        },
        {
          id: 'item-urfa',
          name: 'Urfa Kebap',
          description: 'Acısız kıyma kebabı, yanında pilav ve salata',
          imageUrl: '',
          basePrice: 170,
          taxRate: 10,
          tags: [],
          stockStatus: 'available',
          displayOrder: 1,
          modifierGroups: [
            {
              id: 'mg-urfa-porsiyon',
              name: 'Porsiyon',
              type: 'single',
              required: true,
              minSelections: 1,
              maxSelections: 1,
              displayOrder: 0,
              options: [
                { id: 'opt-u-tek', name: 'Tek', priceDelta: 0, isDefault: true, stockStatus: 'available' },
                { id: 'opt-u-birbucuk', name: 'Bir Buçuk', priceDelta: 50, isDefault: false, stockStatus: 'available' },
                { id: 'opt-u-ikili', name: 'İkili', priceDelta: 100, isDefault: false, stockStatus: 'available' },
              ],
            },
          ],
        },
        {
          id: 'item-kusbasi',
          name: 'Kuşbaşı Kebap',
          description: 'Kuşbaşı et parçaları, sebzeler ile fırında pişirilir',
          imageUrl: '',
          basePrice: 220,
          taxRate: 10,
          tags: [],
          stockStatus: 'sold_out',
          displayOrder: 2,
          modifierGroups: [],
        },
      ],
    },
    {
      id: 'cat-pideler',
      name: 'Pideler',
      description: 'Taş fırında pişen özel pidelerimiz',
      imageUrl: '',
      displayOrder: 1,
      items: [
        {
          id: 'item-kiymali',
          name: 'Kıymalı Pide',
          description: 'Taze kıyma, domates, biber ve baharatlar ile',
          imageUrl: '',
          basePrice: 140,
          taxRate: 10,
          tags: [],
          stockStatus: 'available',
          displayOrder: 0,
          modifierGroups: [],
        },
        {
          id: 'item-kasarli',
          name: 'Kaşarlı Pide',
          description: 'Bol kaşar peyniri ile hazırlanan klasik pide',
          imageUrl: '',
          basePrice: 120,
          taxRate: 10,
          tags: [],
          stockStatus: 'available',
          displayOrder: 1,
          modifierGroups: [],
        },
        {
          id: 'item-karisik',
          name: 'Karışık Pide',
          description: 'Kıyma, kaşar, sucuk ve yumurta ile',
          imageUrl: '',
          basePrice: 160,
          taxRate: 10,
          tags: [],
          stockStatus: 'available',
          displayOrder: 2,
          modifierGroups: [],
        },
      ],
    },
    {
      id: 'cat-icecekler',
      name: 'İçecekler',
      description: 'Soğuk ve sıcak içeceklerimiz',
      imageUrl: '',
      displayOrder: 2,
      items: [
        {
          id: 'item-ayran',
          name: 'Ayran',
          description: 'Geleneksel yoğurt içeceği',
          imageUrl: '',
          basePrice: 20,
          taxRate: 10,
          tags: [],
          stockStatus: 'available',
          displayOrder: 0,
          modifierGroups: [],
        },
        {
          id: 'item-kola',
          name: 'Kola',
          description: 'Soğuk 330ml kutu',
          imageUrl: '',
          basePrice: 25,
          taxRate: 10,
          tags: [],
          stockStatus: 'available',
          displayOrder: 1,
          modifierGroups: [],
        },
        {
          id: 'item-salgam',
          name: 'Şalgam Suyu',
          description: 'Adana usulü acılı şalgam',
          imageUrl: '',
          basePrice: 15,
          taxRate: 10,
          tags: ['Acılı'],
          stockStatus: 'available',
          displayOrder: 2,
          modifierGroups: [],
        },
      ],
    },
  ],
};

// ── Store ────────────────────────────────────────────────────────────────────

interface MenuStore {
  menu: DashboardMenu;
  editingItem: DashboardMenuItem | null;
  editingCategoryId: string | null;
  isProductModalOpen: boolean;
  editingCategory: DashboardCategory | null;
  isCategoryModalOpen: boolean;

  // Menu status
  setMenuStatus: (status: MenuStatus) => void;

  // Category CRUD
  addCategory: (name: string, description: string) => void;
  updateCategory: (id: string, updates: Partial<DashboardCategory>) => void;
  deleteCategory: (id: string) => void;
  duplicateCategory: (id: string) => void;
  reorderCategories: (fromIndex: number, toIndex: number) => void;

  // Item CRUD
  addItem: (categoryId: string) => void;
  updateItem: (itemId: string, updates: Partial<DashboardMenuItem>) => void;
  deleteItem: (categoryId: string, itemId: string) => void;
  duplicateItem: (categoryId: string, itemId: string) => void;
  toggleItemStock: (categoryId: string, itemId: string) => void;

  // Modifier group CRUD
  addModifierGroup: (itemId: string, group: Omit<DashboardModifierGroup, 'id' | 'displayOrder'>) => void;
  updateModifierGroup: (itemId: string, groupId: string, updates: Partial<DashboardModifierGroup>) => void;
  deleteModifierGroup: (itemId: string, groupId: string) => void;

  // Modifier option CRUD
  addModifierOption: (itemId: string, groupId: string, option: Omit<DashboardModifierOption, 'id'>) => void;
  updateModifierOption: (itemId: string, groupId: string, optionId: string, updates: Partial<DashboardModifierOption>) => void;
  deleteModifierOption: (itemId: string, groupId: string, optionId: string) => void;

  // Modal control
  openProductModal: (item: DashboardMenuItem, categoryId: string) => void;
  closeProductModal: () => void;
  openCategoryModal: (category?: DashboardCategory) => void;
  closeCategoryModal: () => void;
}

function findItemInMenu(menu: DashboardMenu, itemId: string): { category: DashboardCategory; item: DashboardMenuItem; catIndex: number; itemIndex: number } | null {
  for (let ci = 0; ci < menu.categories.length; ci++) {
    const cat = menu.categories[ci];
    for (let ii = 0; ii < cat.items.length; ii++) {
      if (cat.items[ii].id === itemId) {
        return { category: cat, item: cat.items[ii], catIndex: ci, itemIndex: ii };
      }
    }
  }
  return null;
}

const initialMenu = loadMenu() || defaultMenu;

// Save initial default if nothing was persisted yet
if (!loadMenu()) saveMenu(defaultMenu);

export const useMenuStore = create<MenuStore>((set, get) => ({
  menu: initialMenu,
  editingItem: null,
  editingCategoryId: null,
  isProductModalOpen: false,
  editingCategory: null,
  isCategoryModalOpen: false,

  setMenuStatus: (status) =>
    set((state) => ({ menu: { ...state.menu, status } })),

  // ── Category ─────────────────────────────────────────────────────────────
  addCategory: (name, description) =>
    set((state) => {
      const newCat: DashboardCategory = {
        id: uid(),
        name,
        description,
        imageUrl: '',
        displayOrder: state.menu.categories.length,
        items: [],
      };
      return {
        menu: {
          ...state.menu,
          categories: [...state.menu.categories, newCat],
        },
      };
    }),

  updateCategory: (id, updates) =>
    set((state) => ({
      menu: {
        ...state.menu,
        categories: state.menu.categories.map((c) =>
          c.id === id ? { ...c, ...updates } : c
        ),
      },
    })),

  deleteCategory: (id) =>
    set((state) => ({
      menu: {
        ...state.menu,
        categories: state.menu.categories.filter((c) => c.id !== id),
      },
    })),

  duplicateCategory: (id) =>
    set((state) => {
      const cat = state.menu.categories.find((c) => c.id === id);
      if (!cat) return state;
      const newCat: DashboardCategory = {
        ...JSON.parse(JSON.stringify(cat)),
        id: uid(),
        name: `${cat.name} (Kopya)`,
        displayOrder: state.menu.categories.length,
        items: cat.items.map((item) => ({
          ...JSON.parse(JSON.stringify(item)),
          id: uid(),
          modifierGroups: item.modifierGroups.map((mg) => ({
            ...JSON.parse(JSON.stringify(mg)),
            id: uid(),
            options: mg.options.map((opt) => ({ ...opt, id: uid() })),
          })),
        })),
      };
      return {
        menu: {
          ...state.menu,
          categories: [...state.menu.categories, newCat],
        },
      };
    }),

  reorderCategories: (fromIndex, toIndex) =>
    set((state) => {
      const cats = [...state.menu.categories];
      const [moved] = cats.splice(fromIndex, 1);
      cats.splice(toIndex, 0, moved);
      return { menu: { ...state.menu, categories: cats.map((c, i) => ({ ...c, displayOrder: i })) } };
    }),

  // ── Item ──────────────────────────────────────────────────────────────────
  addItem: (categoryId) =>
    set((state) => {
      const catIndex = state.menu.categories.findIndex((c) => c.id === categoryId);
      if (catIndex === -1) return state;
      const cat = state.menu.categories[catIndex];
      const newItem: DashboardMenuItem = {
        id: uid(),
        name: 'Yeni Ürün',
        description: '',
        imageUrl: '',
        basePrice: 0,
        taxRate: 10,
        tags: [],
        stockStatus: 'available',
        displayOrder: cat.items.length,
        modifierGroups: [],
      };
      const newCategories = [...state.menu.categories];
      newCategories[catIndex] = { ...cat, items: [...cat.items, newItem] };
      return {
        menu: { ...state.menu, categories: newCategories },
        editingItem: newItem,
        editingCategoryId: categoryId,
        isProductModalOpen: true,
      };
    }),

  updateItem: (itemId, updates) =>
    set((state) => {
      const newCategories = state.menu.categories.map((cat) => ({
        ...cat,
        items: cat.items.map((item) =>
          item.id === itemId ? { ...item, ...updates } : item
        ),
      }));
      const found = findItemInMenu({ ...state.menu, categories: newCategories }, itemId);
      return {
        menu: { ...state.menu, categories: newCategories },
        editingItem: state.editingItem?.id === itemId && found ? found.item : state.editingItem,
      };
    }),

  deleteItem: (categoryId, itemId) =>
    set((state) => ({
      menu: {
        ...state.menu,
        categories: state.menu.categories.map((cat) =>
          cat.id === categoryId
            ? { ...cat, items: cat.items.filter((i) => i.id !== itemId) }
            : cat
        ),
      },
    })),

  duplicateItem: (categoryId, itemId) =>
    set((state) => {
      const cat = state.menu.categories.find((c) => c.id === categoryId);
      if (!cat) return state;
      const item = cat.items.find((i) => i.id === itemId);
      if (!item) return state;
      const newItem: DashboardMenuItem = {
        ...JSON.parse(JSON.stringify(item)),
        id: uid(),
        name: `${item.name} (Kopya)`,
        displayOrder: cat.items.length,
        modifierGroups: item.modifierGroups.map((mg) => ({
          ...JSON.parse(JSON.stringify(mg)),
          id: uid(),
          options: mg.options.map((opt) => ({ ...opt, id: uid() })),
        })),
      };
      return {
        menu: {
          ...state.menu,
          categories: state.menu.categories.map((c) =>
            c.id === categoryId ? { ...c, items: [...c.items, newItem] } : c
          ),
        },
      };
    }),

  toggleItemStock: (categoryId, itemId) =>
    set((state) => ({
      menu: {
        ...state.menu,
        categories: state.menu.categories.map((cat) =>
          cat.id === categoryId
            ? {
                ...cat,
                items: cat.items.map((item) =>
                  item.id === itemId
                    ? { ...item, stockStatus: item.stockStatus === 'available' ? 'sold_out' as const : 'available' as const }
                    : item
                ),
              }
            : cat
        ),
      },
    })),

  // ── Modifier Groups ────────────────────────────────────────────────────────
  addModifierGroup: (itemId, group) =>
    set((state) => {
      const newGroup: DashboardModifierGroup = {
        ...group,
        id: uid(),
        displayOrder: 0,
      };
      const newCategories = state.menu.categories.map((cat) => ({
        ...cat,
        items: cat.items.map((item) => {
          if (item.id !== itemId) return item;
          const updated = { ...item, modifierGroups: [...item.modifierGroups, { ...newGroup, displayOrder: item.modifierGroups.length }] };
          return updated;
        }),
      }));
      const found = findItemInMenu({ ...state.menu, categories: newCategories }, itemId);
      return {
        menu: { ...state.menu, categories: newCategories },
        editingItem: found ? found.item : state.editingItem,
      };
    }),

  updateModifierGroup: (itemId, groupId, updates) =>
    set((state) => {
      const newCategories = state.menu.categories.map((cat) => ({
        ...cat,
        items: cat.items.map((item) =>
          item.id === itemId
            ? {
                ...item,
                modifierGroups: item.modifierGroups.map((mg) =>
                  mg.id === groupId ? { ...mg, ...updates } : mg
                ),
              }
            : item
        ),
      }));
      const found = findItemInMenu({ ...state.menu, categories: newCategories }, itemId);
      return {
        menu: { ...state.menu, categories: newCategories },
        editingItem: found ? found.item : state.editingItem,
      };
    }),

  deleteModifierGroup: (itemId, groupId) =>
    set((state) => {
      const newCategories = state.menu.categories.map((cat) => ({
        ...cat,
        items: cat.items.map((item) =>
          item.id === itemId
            ? { ...item, modifierGroups: item.modifierGroups.filter((mg) => mg.id !== groupId) }
            : item
        ),
      }));
      const found = findItemInMenu({ ...state.menu, categories: newCategories }, itemId);
      return {
        menu: { ...state.menu, categories: newCategories },
        editingItem: found ? found.item : state.editingItem,
      };
    }),

  // ── Modifier Options ───────────────────────────────────────────────────────
  addModifierOption: (itemId, groupId, option) =>
    set((state) => {
      const newOpt: DashboardModifierOption = { ...option, id: uid() };
      const newCategories = state.menu.categories.map((cat) => ({
        ...cat,
        items: cat.items.map((item) =>
          item.id === itemId
            ? {
                ...item,
                modifierGroups: item.modifierGroups.map((mg) =>
                  mg.id === groupId ? { ...mg, options: [...mg.options, newOpt] } : mg
                ),
              }
            : item
        ),
      }));
      const found = findItemInMenu({ ...state.menu, categories: newCategories }, itemId);
      return {
        menu: { ...state.menu, categories: newCategories },
        editingItem: found ? found.item : state.editingItem,
      };
    }),

  updateModifierOption: (itemId, groupId, optionId, updates) =>
    set((state) => {
      const newCategories = state.menu.categories.map((cat) => ({
        ...cat,
        items: cat.items.map((item) =>
          item.id === itemId
            ? {
                ...item,
                modifierGroups: item.modifierGroups.map((mg) =>
                  mg.id === groupId
                    ? { ...mg, options: mg.options.map((o) => (o.id === optionId ? { ...o, ...updates } : o)) }
                    : mg
                ),
              }
            : item
        ),
      }));
      const found = findItemInMenu({ ...state.menu, categories: newCategories }, itemId);
      return {
        menu: { ...state.menu, categories: newCategories },
        editingItem: found ? found.item : state.editingItem,
      };
    }),

  deleteModifierOption: (itemId, groupId, optionId) =>
    set((state) => {
      const newCategories = state.menu.categories.map((cat) => ({
        ...cat,
        items: cat.items.map((item) =>
          item.id === itemId
            ? {
                ...item,
                modifierGroups: item.modifierGroups.map((mg) =>
                  mg.id === groupId
                    ? { ...mg, options: mg.options.filter((o) => o.id !== optionId) }
                    : mg
                ),
              }
            : item
        ),
      }));
      const found = findItemInMenu({ ...state.menu, categories: newCategories }, itemId);
      return {
        menu: { ...state.menu, categories: newCategories },
        editingItem: found ? found.item : state.editingItem,
      };
    }),

  // ── Modal control ──────────────────────────────────────────────────────────
  openProductModal: (item, categoryId) =>
    set({ editingItem: item, editingCategoryId: categoryId, isProductModalOpen: true }),

  closeProductModal: () =>
    set({ editingItem: null, editingCategoryId: null, isProductModalOpen: false }),

  openCategoryModal: (category) =>
    set({ editingCategory: category || null, isCategoryModalOpen: true }),

  closeCategoryModal: () =>
    set({ editingCategory: null, isCategoryModalOpen: false }),
}));

// Auto-persist menu to localStorage on every change
useMenuStore.subscribe((state, prevState) => {
  if (state.menu !== prevState.menu) {
    saveMenu(state.menu);
  }
});
