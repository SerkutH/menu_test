import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { CartItem, OrderMode } from '../../types';

interface Props {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  mode: OrderMode;
}

export default function OrderSummary({ items, subtotal, deliveryFee, total, mode }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      {/* Toggle Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-600 text-xs font-bold flex items-center justify-center">
            {mode === 'delivery' ? '3' : '3'}
          </span>
          <span className="text-sm font-semibold text-gray-800">Order Summary</span>
          <span className="text-xs text-gray-400 font-medium">
            ({items.length} {items.length === 1 ? 'item' : 'items'})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-900">₺{total}</span>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-gray-100">
          {/* Items */}
          <div className="divide-y divide-gray-50">
            {items.map((item) => (
              <div key={item.cartLineId} className="px-4 py-3 flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.quantity}x {item.name}
                      </p>
                      {item.removedIngredients.length > 0 && (
                        <p className="text-[11px] text-red-400 mt-0.5">
                          without: {item.removedIngredients.join(', ')}
                        </p>
                      )}
                      {item.selectedModifiers.map((mod) => (
                        <p key={mod.groupName} className="text-[11px] text-gray-400 mt-0.5">
                          {mod.groupType === 'single' ? '' : '+ '}
                          {mod.options.map((o) => o.name).join(', ')}
                        </p>
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-gray-700 flex-shrink-0">
                      ₺{item.unitPrice * item.quantity}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="px-4 py-3 border-t border-gray-100 space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-medium text-gray-700">₺{subtotal}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">
                {mode === 'delivery' ? 'Delivery Fee' : 'Pick-up'}
              </span>
              <span className="font-medium text-gray-700">
                {deliveryFee === 0 ? 'Free' : `₺${deliveryFee}`}
              </span>
            </div>
            <div className="flex items-center justify-between text-base pt-1.5 border-t border-gray-100">
              <span className="font-bold text-gray-900">Total</span>
              <span className="font-bold text-gray-900">₺{total}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
