import { useState } from 'react';
import { MenuItem } from '../types';
import { Plus } from 'lucide-react';
import { useCartStore } from '../store/cartStore';

interface Props {
  item: MenuItem;
  onItemClick: (item: MenuItem) => void;
  isOpen: boolean;
}

const tagConfig: Record<string, { emoji: string; label: string }> = {
  vegan: { emoji: '🌱', label: 'Vegan' },
  spicy: { emoji: '🌶', label: 'Spicy' },
  'gluten-free': { emoji: '🌾', label: 'GF' },
};

export default function MenuSection({ item, onItemClick, isOpen }: Props) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const hasModifiers = item.modifierGroups.length > 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.soldOut || !isOpen) return;

    if (hasModifiers) {
      onItemClick(item);
      return;
    }

    addItem({
      menuItemId: item.id,
      name: item.name,
      image: item.image,
      basePrice: item.price,
      quantity: 1,
      removedIngredients: [],
      selectedModifiers: [],
      unitPrice: item.price,
    });
  };

  return (
    <div
      onClick={() => !item.soldOut && onItemClick(item)}
      className={`relative bg-white rounded-2xl overflow-hidden border border-gray-100 transition-all hover:shadow-md cursor-pointer group ${
        item.soldOut ? 'opacity-60' : ''
      }`}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        {!imgLoaded && <div className="absolute inset-0 skeleton" />}
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
            imgLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Sold Out Overlay */}
        {item.soldOut && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="bg-gray-800 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
              Sold Out
            </span>
          </div>
        )}

        {/* Tags */}
        {item.tags.length > 0 && !item.soldOut && (
          <div className="absolute top-2 left-2 flex gap-1">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="bg-white/90 backdrop-blur-sm text-xs px-1.5 py-0.5 rounded-md shadow-sm"
                title={tagConfig[tag]?.label}
              >
                {tagConfig[tag]?.emoji}
              </span>
            ))}
          </div>
        )}

        {/* Quick Add Button */}
        {!item.soldOut && isOpen && (
          <button
            onClick={handleQuickAdd}
            className="absolute bottom-2 right-2 w-8 h-8 bg-brand-500 hover:bg-brand-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95"
          >
            <Plus className="w-4.5 h-4.5" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="font-semibold text-sm text-gray-900 leading-tight">{item.name}</h3>
        <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
          {item.description}
        </p>
        <p className="mt-2 font-bold text-sm text-gray-900">₺{item.price}</p>
      </div>
    </div>
  );
}
