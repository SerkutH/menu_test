import { Plus } from 'lucide-react';
import { useMenuStore } from '../store/menuStore';
import { useSettingsStore } from '../store/settingsStore';
import CategoryCard from '../components/CategoryCard';
import ProductModal from '../components/ProductModal';
import CategoryModal from '../components/CategoryModal';

export default function MenuPage() {
  const menu = useMenuStore((s) => s.menu);
  const isProductModalOpen = useMenuStore((s) => s.isProductModalOpen);
  const isCategoryModalOpen = useMenuStore((s) => s.isCategoryModalOpen);
  const openCategoryModal = useMenuStore((s) => s.openCategoryModal);
  const restaurantName = useSettingsStore((s) => s.settings.profile.name);

  const statusConfig = {
    draft: { label: 'Taslak', color: 'bg-gray-100 text-gray-600' },
    live: { label: 'Yayında', color: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
    scheduled: { label: 'Planlandı', color: 'bg-blue-50 text-blue-700 border border-blue-200' },
  };

  const statusInfo = statusConfig[menu.status];

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Menü Oluşturucu</h1>
            <p className="text-sm text-gray-500 mt-1">Kategorilerinizi ve ürünlerinizi yönetin</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
          <button
            onClick={() => openCategoryModal()}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Plus size={16} />
            Kategori Ekle
          </button>
        </div>
      </div>

      {/* Restaurant name breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm text-gray-400">
        <span>{restaurantName}</span>
        <span>/</span>
        <span className="text-gray-600">{menu.name}</span>
      </div>

      {/* Categories */}
      <div className="space-y-4">
        {menu.categories
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}

        {menu.categories.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
            <p className="text-gray-400 mb-3">Henüz kategori eklenmemiş</p>
            <button
              onClick={() => openCategoryModal()}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Plus size={16} />
              İlk Kategoriyi Ekle
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {isProductModalOpen && <ProductModal />}
      {isCategoryModalOpen && <CategoryModal />}
    </div>
  );
}
