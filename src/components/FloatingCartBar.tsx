import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '../store/cartStore';

export default function FloatingCartBar() {
  const items = useCartStore((s) => s.items);
  const openCart = useCartStore((s) => s.openCart);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const getItemCount = useCartStore((s) => s.getItemCount);

  const itemCount = getItemCount();
  const subtotal = getSubtotal();

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-3 md:p-4">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={openCart}
          className="w-full bg-brand-500 hover:bg-brand-600 text-white rounded-2xl px-5 py-3.5 flex items-center justify-between shadow-xl shadow-brand-500/25 transition-all active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-2 -right-2 w-4.5 h-4.5 bg-white text-brand-600 text-[10px] font-bold rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            </div>
            <span className="font-semibold text-sm">View Cart</span>
          </div>
          <span className="font-bold text-sm">₺{subtotal}</span>
        </button>
      </div>
    </div>
  );
}
