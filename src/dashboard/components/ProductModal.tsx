import { useState } from 'react';
import { X, Plus, Pencil, Trash2, Upload } from 'lucide-react';
import { useMenuStore } from '../store/menuStore';
import { DashboardModifierGroup, DashboardModifierOption } from '../types';

type Tab = 'basic' | 'modifiers' | 'availability';

export default function ProductModal() {
  const item = useMenuStore((s) => s.editingItem);
  const closeProductModal = useMenuStore((s) => s.closeProductModal);
  const updateItem = useMenuStore((s) => s.updateItem);
  const addModifierGroup = useMenuStore((s) => s.addModifierGroup);
  const updateModifierGroup = useMenuStore((s) => s.updateModifierGroup);
  const deleteModifierGroup = useMenuStore((s) => s.deleteModifierGroup);
  const addModifierOption = useMenuStore((s) => s.addModifierOption);
  const deleteModifierOption = useMenuStore((s) => s.deleteModifierOption);
  const updateModifierOption = useMenuStore((s) => s.updateModifierOption);

  const [activeTab, setActiveTab] = useState<Tab>('basic');
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupType, setNewGroupType] = useState<'single' | 'multi' | 'removal'>('single');
  const [newGroupRequired, setNewGroupRequired] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [newOptionName, setNewOptionName] = useState('');
  const [newOptionPrice, setNewOptionPrice] = useState(0);

  if (!item) return null;

  const tabs = [
    { key: 'basic' as const, label: 'Temel Bilgiler' },
    { key: 'modifiers' as const, label: 'Ek Seçenekler' },
    { key: 'availability' as const, label: 'Uygunluk' },
  ];

  const groupTypeLabels: Record<string, string> = {
    single: 'Tek Seçim',
    multi: 'Çoklu Seçim',
    removal: 'Malzeme Çıkar',
  };

  const handleAddGroup = () => {
    if (!newGroupName.trim()) return;
    addModifierGroup(item.id, {
      name: newGroupName.trim(),
      type: newGroupType,
      required: newGroupRequired,
      minSelections: newGroupRequired ? 1 : 0,
      maxSelections: newGroupType === 'single' ? 1 : 10,
      options: [],
    });
    setNewGroupName('');
    setNewGroupType('single');
    setNewGroupRequired(false);
    setShowAddGroup(false);
  };

  const handleAddOption = (groupId: string) => {
    if (!newOptionName.trim()) return;
    addModifierOption(item.id, groupId, {
      name: newOptionName.trim(),
      priceDelta: newOptionPrice,
      isDefault: false,
      stockStatus: 'available',
    });
    setNewOptionName('');
    setNewOptionPrice(0);
    setEditingGroupId(null);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={closeProductModal} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col mx-4">
        {/* Header */}
        <div className="px-6 pt-5 pb-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">{item.name}</h2>
            <button
              onClick={closeProductModal}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Ürün Adı</label>
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateItem(item.id, { name: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Açıklama</label>
                <textarea
                  value={item.description}
                  onChange={(e) => updateItem(item.id, { description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 resize-y"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Fiyat (₺)</label>
                  <input
                    type="number"
                    value={item.basePrice}
                    onChange={(e) => updateItem(item.id, { basePrice: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">KDV Oranı (%)</label>
                  <input
                    type="number"
                    value={item.taxRate}
                    onChange={(e) => updateItem(item.id, { taxRate: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Etiketler</label>
                <input
                  type="text"
                  value={item.tags.join(', ')}
                  onChange={(e) =>
                    updateItem(item.id, {
                      tags: e.target.value
                        .split(',')
                        .map((t) => t.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder="Acılı, Vejetaryen, Glutensiz..."
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300"
                />
                <p className="text-xs text-gray-400 mt-1">Virgülle ayırarak birden fazla etiket ekleyebilirsiniz</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Ürün Görseli</label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-gray-300 transition-colors cursor-pointer">
                  <Upload size={24} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-400">Görsel yüklemek için tıklayın</p>
                </div>
              </div>
            </div>
          )}

          {/* Modifiers Tab */}
          {activeTab === 'modifiers' && (
            <div className="space-y-4">
              {item.modifierGroups.map((group) => (
                <ModifierGroupSection
                  key={group.id}
                  group={group}
                  itemId={item.id}
                  groupTypeLabels={groupTypeLabels}
                  editingGroupId={editingGroupId}
                  setEditingGroupId={setEditingGroupId}
                  newOptionName={newOptionName}
                  setNewOptionName={setNewOptionName}
                  newOptionPrice={newOptionPrice}
                  setNewOptionPrice={setNewOptionPrice}
                  onAddOption={handleAddOption}
                  onDeleteGroup={deleteModifierGroup}
                  onDeleteOption={deleteModifierOption}
                  onUpdateGroup={updateModifierGroup}
                  onSetDefault={(groupId, optionId) => {
                    group.options.forEach((opt) => {
                      updateModifierOption(item.id, groupId, opt.id, {
                        isDefault: opt.id === optionId,
                      });
                    });
                  }}
                />
              ))}

              {/* Add Modifier Group */}
              {!showAddGroup ? (
                <button
                  onClick={() => setShowAddGroup(true)}
                  className="w-full py-3 rounded-lg border-2 border-dashed border-gray-200 text-sm font-medium text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Plus size={16} />
                  Seçenek Grubu Ekle
                </button>
              ) : (
                <div className="border border-gray-200 rounded-xl p-4 space-y-3">
                  <h4 className="font-medium text-sm text-gray-900">Yeni Seçenek Grubu</h4>
                  <input
                    type="text"
                    placeholder="Grup adı (ör. Porsiyon, Ekstralar)"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  />
                  <div className="flex gap-2">
                    {(['single', 'multi', 'removal'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setNewGroupType(type)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          newGroupType === type
                            ? 'bg-slate-900 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {groupTypeLabels[type]}
                      </button>
                    ))}
                  </div>
                  {newGroupType !== 'removal' && (
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                      <input
                        type="checkbox"
                        checked={newGroupRequired}
                        onChange={(e) => setNewGroupRequired(e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      Zorunlu
                    </label>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddGroup}
                      className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      Ekle
                    </button>
                    <button
                      onClick={() => setShowAddGroup(false)}
                      className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      İptal
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Availability Tab */}
          {activeTab === 'availability' && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Stok Durumu</label>
                <div className="space-y-2">
                  {(['available', 'sold_out', 'hidden'] as const).map((status) => {
                    const labels: Record<string, { label: string; desc: string }> = {
                      available: { label: 'Mevcut', desc: 'Ürün müşteriler tarafından sipariş edilebilir' },
                      sold_out: { label: 'Tükendi', desc: 'Ürün geçici olarak mevcut değil' },
                      hidden: { label: 'Gizli', desc: 'Ürün menüde görünmez' },
                    };
                    return (
                      <label
                        key={status}
                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          item.stockStatus === status
                            ? 'border-slate-900 bg-slate-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="stockStatus"
                          checked={item.stockStatus === status}
                          onChange={() => updateItem(item.id, { stockStatus: status })}
                          className="mt-0.5"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{labels[status].label}</p>
                          <p className="text-xs text-gray-500">{labels[status].desc}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
          <button
            onClick={closeProductModal}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modifier Group Section Component ─────────────────────────────────────────

interface ModifierGroupSectionProps {
  group: DashboardModifierGroup;
  itemId: string;
  groupTypeLabels: Record<string, string>;
  editingGroupId: string | null;
  setEditingGroupId: (id: string | null) => void;
  newOptionName: string;
  setNewOptionName: (v: string) => void;
  newOptionPrice: number;
  setNewOptionPrice: (v: number) => void;
  onAddOption: (groupId: string) => void;
  onDeleteGroup: (itemId: string, groupId: string) => void;
  onDeleteOption: (itemId: string, groupId: string, optionId: string) => void;
  onUpdateGroup: (itemId: string, groupId: string, updates: Partial<DashboardModifierGroup>) => void;
  onSetDefault: (groupId: string, optionId: string) => void;
}

function ModifierGroupSection({
  group,
  itemId,
  groupTypeLabels,
  editingGroupId,
  setEditingGroupId,
  newOptionName,
  setNewOptionName,
  newOptionPrice,
  setNewOptionPrice,
  onAddOption,
  onDeleteGroup,
  onDeleteOption,
  onSetDefault,
}: ModifierGroupSectionProps) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Group Header */}
      <div className="px-4 py-3 bg-gray-50/50 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm text-gray-900">{group.name}</h4>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
              {groupTypeLabels[group.type]}
            </span>
            {group.required && (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                Zorunlu
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() =>
                setEditingGroupId(editingGroupId === group.id ? null : group.id)
              }
              className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => onDeleteGroup(itemId, group.id)}
              className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="px-4 py-2">
        {group.options.map((option) => (
          <OptionRow
            key={option.id}
            option={option}
            group={group}
            itemId={itemId}
            onDelete={onDeleteOption}
            onSetDefault={onSetDefault}
          />
        ))}

        {/* Add option inline form */}
        {editingGroupId === group.id && (
          <div className="flex items-center gap-2 py-2 border-t border-gray-100 mt-1">
            <input
              type="text"
              placeholder="Seçenek adı"
              value={newOptionName}
              onChange={(e) => setNewOptionName(e.target.value)}
              className="flex-1 px-2.5 py-1.5 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-slate-300"
              onKeyDown={(e) => e.key === 'Enter' && onAddOption(group.id)}
            />
            {group.type !== 'removal' && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-400">+₺</span>
                <input
                  type="number"
                  value={newOptionPrice}
                  onChange={(e) => setNewOptionPrice(Number(e.target.value))}
                  className="w-20 px-2 py-1.5 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-slate-300"
                />
              </div>
            )}
            <button
              onClick={() => onAddOption(group.id)}
              className="px-3 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-md hover:bg-slate-800 transition-colors"
            >
              Ekle
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Option Row ───────────────────────────────────────────────────────────────

interface OptionRowProps {
  option: DashboardModifierOption;
  group: DashboardModifierGroup;
  itemId: string;
  onDelete: (itemId: string, groupId: string, optionId: string) => void;
  onSetDefault: (groupId: string, optionId: string) => void;
}

function OptionRow({ option, group, itemId, onDelete, onSetDefault }: OptionRowProps) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-700">{option.name}</span>
      <div className="flex items-center gap-3">
        {option.priceDelta > 0 && (
          <span className="text-sm text-gray-500">+₺{option.priceDelta}</span>
        )}
        {option.isDefault && group.type === 'single' && (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-600">
            Varsayılan
          </span>
        )}
        {!option.isDefault && group.type === 'single' && (
          <button
            onClick={() => onSetDefault(group.id, option.id)}
            className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
          >
            Varsayılan yap
          </button>
        )}
        <button
          onClick={() => onDelete(itemId, group.id, option.id)}
          className="p-1 rounded text-gray-300 hover:text-red-500 transition-colors"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}
