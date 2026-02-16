import { useState } from 'react';
import { ChevronDown, GripVertical, Pencil, Copy, Trash2, Plus } from 'lucide-react';
import { DashboardCategory } from '../types';
import { useMenuStore } from '../store/menuStore';
import MenuItemRow from './MenuItemRow';

interface Props {
  category: DashboardCategory;
}

export default function CategoryCard({ category }: Props) {
  const [isExpanded, setIsExpanded] = useState(true);
  const addItem = useMenuStore((s) => s.addItem);
  const deleteCategory = useMenuStore((s) => s.deleteCategory);
  const duplicateCategory = useMenuStore((s) => s.duplicateCategory);
  const openCategoryModal = useMenuStore((s) => s.openCategoryModal);

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      {/* Category Header */}
      <div className="px-4 py-3 border-b border-gray-50">
        <div className="flex items-center gap-2">
          {/* Drag handle */}
          <div className="cursor-grab text-gray-300 hover:text-gray-400">
            <GripVertical size={18} />
          </div>

          {/* Expand toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ChevronDown
              size={18}
              className={`transition-transform ${isExpanded ? '' : '-rotate-90'}`}
            />
          </button>

          {/* Category name */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900">{category.name}</h3>
              <span className="text-sm text-gray-400">({category.items.length} ürün)</span>
            </div>
          </div>

          {/* Actions */}
          <button
            onClick={() => openCategoryModal(category)}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            title="Düzenle"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => duplicateCategory(category.id)}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            title="Kopyala"
          >
            <Copy size={15} />
          </button>
          <button
            onClick={() => {
              if (confirm(`"${category.name}" kategorisini silmek istediğinize emin misiniz?`)) {
                deleteCategory(category.id);
              }
            }}
            className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Sil"
          >
            <Trash2 size={15} />
          </button>
        </div>

        {/* Description */}
        {category.description && (
          <p className="text-sm text-gray-500 mt-1 ml-10">{category.description}</p>
        )}
      </div>

      {/* Items */}
      {isExpanded && (
        <div className="p-3 space-y-2">
          {category.items
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((item) => (
              <MenuItemRow key={item.id} item={item} categoryId={category.id} />
            ))}

          {/* Add item button */}
          <button
            onClick={() => addItem(category.id)}
            className="w-full py-3 rounded-lg border-2 border-dashed border-gray-200 text-sm font-medium text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus size={16} />
            Ürün Ekle
          </button>
        </div>
      )}
    </div>
  );
}
