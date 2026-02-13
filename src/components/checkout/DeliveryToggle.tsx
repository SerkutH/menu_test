import { Truck, Store } from 'lucide-react';
import { OrderMode } from '../../types';

interface Props {
  mode: OrderMode;
  onModeChange: (mode: OrderMode) => void;
  deliveryAvailable: boolean;
  pickupAvailable: boolean;
}

export default function DeliveryToggle({
  mode,
  onModeChange,
  deliveryAvailable,
  pickupAvailable,
}: Props) {
  return (
    <div className="flex gap-2">
      {deliveryAvailable && (
        <button
          onClick={() => onModeChange('delivery')}
          className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-semibold border-2 transition-all ${
            mode === 'delivery'
              ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm'
              : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
          }`}
        >
          <Truck className="w-5 h-5" />
          Delivery
        </button>
      )}
      {pickupAvailable && (
        <button
          onClick={() => onModeChange('pickup')}
          className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-semibold border-2 transition-all ${
            mode === 'pickup'
              ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm'
              : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
          }`}
        >
          <Store className="w-5 h-5" />
          Pick-up
        </button>
      )}
    </div>
  );
}
