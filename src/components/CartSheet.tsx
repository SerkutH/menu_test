import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { Restaurant } from '../types';

interface Props {
  restaurant: Restaurant;
}

export default function CartSheet({ restaurant }: Props) {
  const items = useCartStore((s) => s.items);
  const closeCart = useCartStore((s) => s.closeCart);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const getDeliveryFee = useCartStore((s) => s.getDeliveryFee);
  const getTotal = useCartStore((s) => s.getTotal);

  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee();
  const total = getTotal();
  const minOrder = restaurant.minOrder;
  const remaining = minOrder - subtotal;
  const canCheckout = subtotal >= minOrder && restaurant.isOpen;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeCart} />

      {/* Sheet */}
      <div className="relative w-full md:max-w-lg md:mx-4 bg-white md:rounded-2xl rounded-t-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-bold text-gray-900">Your Order</h2>
            <span className="text-xs text-gray-400 font-medium">
              ({items.length} {items.length === 1 ? 'item' : 'items'})
            </span>
          </div>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-red-500 hover:text-red-600 font-medium px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
              >
                Clear All
              </button>
            )}
            <button
              onClick={closeCart}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <ShoppingBag className="w-12 h-12 mb-3 text-gray-300" />
              <p className="font-medium">Your cart is empty</p>
              <p className="text-sm mt-1">Add items from the menu to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {items.map((item) => (
                <div key={item.cartLineId} className="px-5 py-4">
                  <div className="flex gap-3">
                    {/* Item Image */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-gray-900 truncate">
                        {item.name}
                      </h3>

                      {/* Modifier Summary */}
                      <div className="mt-1 space-y-0.5">
                        {item.removedIngredients.length > 0 && (
                          <p className="text-xs text-red-400">
                            without: {item.removedIngredients.join(', ')}
                          </p>
                        )}
                        {item.selectedModifiers.map((mod) => (
                          <p key={mod.groupName} className="text-xs text-gray-400">
                            {mod.groupType === 'single' ? '' : '+ '}
                            {mod.options.map((o) => o.name).join(', ')}
                          </p>
                        ))}
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <span className="font-bold text-sm text-gray-900">
                          ₺{item.unitPrice * item.quantity}
                        </span>

                        {/* Quantity Stepper */}
                        <div className="flex items-center gap-1.5 bg-gray-100 rounded-lg px-0.5 py-0.5">
                          <button
                            onClick={() => updateQuantity(item.cartLineId, item.quantity - 1)}
                            className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${
                              item.quantity === 1
                                ? 'text-red-500 hover:bg-red-50'
                                : 'hover:bg-gray-200'
                            }`}
                          >
                            {item.quantity === 1 ? (
                              <X className="w-3.5 h-3.5" />
                            ) : (
                              <Minus className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <span className="w-6 text-center text-sm font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.cartLineId, item.quantity + 1)}
                            className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-gray-200 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-4 bg-white">
            {/* Totals */}
            <div className="space-y-1.5 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium text-gray-700">₺{subtotal}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Delivery Fee</span>
                <span className="font-medium text-gray-700">₺{deliveryFee}</span>
              </div>
              <div className="flex items-center justify-between text-base pt-1.5 border-t border-gray-100">
                <span className="font-bold text-gray-900">Total</span>
                <span className="font-bold text-gray-900">₺{total}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              disabled={!canCheckout}
              onClick={() => {
                if (canCheckout) {
                  useCartStore.getState().openCheckout();
                }
              }}
              className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all ${
                canCheckout
                  ? 'bg-brand-500 hover:bg-brand-600 text-white active:scale-[0.98]'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {!restaurant.isOpen
                ? 'Restaurant is closed'
                : remaining > 0
                  ? `Add ₺${remaining} more to reach minimum (₺${minOrder})`
                  : 'Proceed to Checkout'}
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
