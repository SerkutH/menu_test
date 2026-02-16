export interface Restaurant {
  name: string;
  coverImage: string;
  logo: string;
  isOpen: boolean;
  opensAt?: string;
  prepTime: string;
  minOrder: number;
  deliveryFee: number;
  deliveryAvailable: boolean;
  pickupAvailable: boolean;
  location: RestaurantLocation;
  districts: string[];
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  items: MenuItem[];
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  tags: DietaryTag[];
  soldOut: boolean;
  maxQuantity: number;
  modifierGroups: ModifierGroup[];
}

export type DietaryTag = string;

export type ModifierGroup = RemovalGroup | SingleSelectGroup | MultiSelectGroup;

export interface RemovalGroup {
  type: 'removal';
  name: string;
  ingredients: string[];
}

export interface SingleSelectGroup {
  type: 'single';
  name: string;
  required: boolean;
  options: ModifierOption[];
  defaultOptionId?: string;
}

export interface MultiSelectGroup {
  type: 'multi';
  name: string;
  minSelections: number;
  maxSelections: number;
  options: ModifierOption[];
}

export interface ModifierOption {
  id: string;
  name: string;
  priceDelta: number;
}

export interface CartItem {
  cartLineId: string;
  menuItemId: string;
  name: string;
  image: string;
  basePrice: number;
  quantity: number;
  removedIngredients: string[];
  selectedModifiers: SelectedModifier[];
  unitPrice: number;
}

export interface SelectedModifier {
  groupName: string;
  groupType: 'single' | 'multi';
  options: ModifierOption[];
}

export interface ItemConfiguration {
  removedIngredients: string[];
  singleSelections: Record<string, string>; // groupName -> optionId
  multiSelections: Record<string, string[]>; // groupName -> optionId[]
  quantity: number;
}

// --- Checkout types ---

export type OrderMode = 'delivery' | 'pickup';

export interface CheckoutFormData {
  mode: OrderMode;
  fullName: string;
  phone: string;
  email: string;
  addressLine: string;
  buildingNo: string;
  district: string;
  city: string;
  deliveryNote: string;
  pinLat: number;
  pinLng: number;
}

export type CheckoutFieldErrors = Partial<Record<keyof CheckoutFormData, string>>;

export type OrderStatus = 'IDLE' | 'PENDING_PAYMENT' | 'SUBMITTING' | 'PAYMENT_OPEN' | 'CONFIRMED' | 'FAILED';

export interface RestaurantLocation {
  address: string;
  lat: number;
  lng: number;
}
