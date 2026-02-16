import { GripVertical, Pencil, Copy, Image } from 'lucide-react';
import { DashboardMenuItem } from '../types';
import { useMenuStore } from '../store/menuStore';

interface Props {
  item: DashboardMenuItem;
  categoryId: string;
}

export default function MenuItemRow({ item, categoryId }: Props) {
  const openProductModal = useMenuStore((s) => s.openProductModal);
  const toggleItemStock = useMenuStore((s) => s.toggleItemStock);
  const duplicateItem = useMenuStore((s) => s.duplicateItem);

  const isAvailable = item.stockStatus === 'available';
  const groupCount = item.modifierGroups.length;

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
        isAvailable
          ? 'bg-white border-gray-100 hover:border-gray-200'
          : 'bg-gray-50 border-gray-100 opacity-75'
      }`}
    >
      {/* Drag handle */}
      <div className="cursor-grab text-gray-300 hover:text-gray-400 flex-shrink-0">
        <GripVertical size={18} />
      </div>

      {/* Image placeholder */}
      <div className="w-14 h-14 rounded-lg bg-gray-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <Image size={20} className="text-gray-300" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-sm text-gray-900 truncate">{item.name}</h4>
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-red-50 text-red-600 border border-red-100 flex-shrink-0"
            >
              {tag}
            </span>
          ))}
          {!isAvailable && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-red-500 text-white flex-shrink-0">
              Tükendi
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 truncate mt-0.5">{item.description}</p>
        {groupCount > 0 && (
          <p className="text-[11px] text-gray-400 mt-0.5">{groupCount} seçenek grubu</p>
        )}
      </div>

      {/* Price */}
      <div className="text-sm font-semibold text-gray-900 flex-shrink-0 mr-2">
        ₺{item.basePrice}
      </div>

      {/* Toggle */}
      <button
        onClick={() => toggleItemStock(categoryId, item.id)}
        className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
          isAvailable ? 'bg-teal-500' : 'bg-gray-300'
        }`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
            isAvailable ? 'left-[22px]' : 'left-0.5'
          }`}
        />
      </button>

      {/* Actions */}
      <button
        onClick={() => openProductModal(item, categoryId)}
        className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0"
        title="Düzenle"
      >
        <Pencil size={15} />
      </button>
      <button
        onClick={() => duplicateItem(categoryId, item.id)}
        className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0"
        title="Kopyala"
      >
        <Copy size={15} />
      </button>
    </div>
  );
}
