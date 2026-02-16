import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useMenuStore } from '../store/menuStore';

export default function CategoryModal() {
  const editingCategory = useMenuStore((s) => s.editingCategory);
  const isCategoryModalOpen = useMenuStore((s) => s.isCategoryModalOpen);
  const closeCategoryModal = useMenuStore((s) => s.closeCategoryModal);
  const addCategory = useMenuStore((s) => s.addCategory);
  const updateCategory = useMenuStore((s) => s.updateCategory);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name);
      setDescription(editingCategory.description);
    } else {
      setName('');
      setDescription('');
    }
  }, [editingCategory, isCategoryModalOpen]);

  if (!isCategoryModalOpen) return null;

  const isEditing = !!editingCategory;

  const handleSubmit = () => {
    if (!name.trim()) return;
    if (isEditing) {
      updateCategory(editingCategory!.id, { name: name.trim(), description: description.trim() });
    } else {
      addCategory(name.trim(), description.trim());
    }
    closeCategoryModal();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={closeCategoryModal} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">
            {isEditing ? 'Kategori Düzenle' : 'Yeni Kategori'}
          </h2>
          <button
            onClick={closeCategoryModal}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Kategori Adı</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ör. Kebaplar, Pideler, İçecekler"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Açıklama</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Kategori açıklaması (isteğe bağlı)"
              rows={2}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={closeCategoryModal}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            İptal
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="px-5 py-2.5 rounded-lg text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 transition-colors disabled:opacity-40"
          >
            {isEditing ? 'Kaydet' : 'Ekle'}
          </button>
        </div>
      </div>
    </div>
  );
}
