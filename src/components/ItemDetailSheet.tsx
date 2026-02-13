import { useState, useEffect, useMemo, useCallback } from 'react';
import { MenuItem, ModifierGroup, RemovalGroup, SingleSelectGroup, MultiSelectGroup, ModifierOption, SelectedModifier } from '../types';
import { useCartStore } from '../store/cartStore';
import { X, Minus, Plus, Check, Loader2 } from 'lucide-react';

interface Props {
  item: MenuItem;
  isOpen: boolean;
  onClose: () => void;
}

type AddButtonState = 'disabled' | 'enabled' | 'loading' | 'added';

export default function ItemDetailSheet({ item, isOpen, onClose }: Props) {
  const addItemToCart = useCartStore((s) => s.addItem);

  // State for modifiers
  const [removedIngredients, setRemovedIngredients] = useState<Set<string>>(new Set());
  const [singleSelections, setSingleSelections] = useState<Record<string, string>>({});
  const [multiSelections, setMultiSelections] = useState<Record<string, Set<string>>>({});
  const [quantity, setQuantity] = useState(1);
  const [buttonState, setButtonState] = useState<AddButtonState>('enabled');

  // Initialize defaults
  useEffect(() => {
    const singles: Record<string, string> = {};
    const multis: Record<string, Set<string>> = {};

    for (const group of item.modifierGroups) {
      if (group.type === 'single') {
        const sg = group as SingleSelectGroup;
        if (sg.defaultOptionId) {
          singles[sg.name] = sg.defaultOptionId;
        }
      }
      if (group.type === 'multi') {
        multis[group.name] = new Set();
      }
    }

    setSingleSelections(singles);
    setMultiSelections(multis);
  }, [item]);

  // Compute validation
  const unmetRequiredGroup = useMemo(() => {
    for (const group of item.modifierGroups) {
      if (group.type === 'single') {
        const sg = group as SingleSelectGroup;
        if (sg.required && !singleSelections[sg.name]) {
          return sg.name;
        }
      }
      if (group.type === 'multi') {
        const mg = group as MultiSelectGroup;
        const selected = multiSelections[mg.name]?.size || 0;
        if (mg.minSelections > 0 && selected < mg.minSelections) {
          return mg.name;
        }
      }
    }
    return null;
  }, [item.modifierGroups, singleSelections, multiSelections]);

  // Compute total price
  const unitPrice = useMemo(() => {
    let price = item.price;
    for (const group of item.modifierGroups) {
      if (group.type === 'single') {
        const sg = group as SingleSelectGroup;
        const selectedId = singleSelections[sg.name];
        if (selectedId) {
          const opt = sg.options.find((o) => o.id === selectedId);
          if (opt) price += opt.priceDelta;
        }
      }
      if (group.type === 'multi') {
        const mg = group as MultiSelectGroup;
        const selectedIds = multiSelections[mg.name];
        if (selectedIds) {
          for (const id of selectedIds) {
            const opt = mg.options.find((o) => o.id === id);
            if (opt) price += opt.priceDelta;
          }
        }
      }
    }
    return price;
  }, [item, singleSelections, multiSelections]);

  const totalPrice = unitPrice * quantity;

  // Handlers
  const toggleIngredient = (ingredient: string) => {
    setRemovedIngredients((prev) => {
      const next = new Set(prev);
      if (next.has(ingredient)) {
        next.delete(ingredient);
      } else {
        next.add(ingredient);
      }
      return next;
    });
  };

  const selectSingle = (groupName: string, optionId: string) => {
    setSingleSelections((prev) => ({ ...prev, [groupName]: optionId }));
  };

  const toggleMulti = (groupName: string, optionId: string, maxSelections: number) => {
    setMultiSelections((prev) => {
      const current = new Set(prev[groupName] || []);
      if (current.has(optionId)) {
        current.delete(optionId);
      } else {
        if (current.size < maxSelections) {
          current.add(optionId);
        }
      }
      return { ...prev, [groupName]: current };
    });
  };

  const effectiveButtonState: AddButtonState =
    buttonState === 'loading' || buttonState === 'added'
      ? buttonState
      : unmetRequiredGroup
        ? 'disabled'
        : 'enabled';

  const handleAddToCart = useCallback(() => {
    if (effectiveButtonState !== 'enabled') return;

    setButtonState('loading');

    // Build selected modifiers
    const selectedModifiers: SelectedModifier[] = [];

    for (const group of item.modifierGroups) {
      if (group.type === 'single') {
        const sg = group as SingleSelectGroup;
        const selectedId = singleSelections[sg.name];
        if (selectedId) {
          const opt = sg.options.find((o) => o.id === selectedId);
          if (opt) {
            selectedModifiers.push({
              groupName: sg.name,
              groupType: 'single',
              options: [opt],
            });
          }
        }
      }
      if (group.type === 'multi') {
        const mg = group as MultiSelectGroup;
        const selectedIds = multiSelections[mg.name];
        if (selectedIds && selectedIds.size > 0) {
          const opts: ModifierOption[] = [];
          for (const id of selectedIds) {
            const opt = mg.options.find((o) => o.id === id);
            if (opt) opts.push(opt);
          }
          selectedModifiers.push({
            groupName: mg.name,
            groupType: 'multi',
            options: opts,
          });
        }
      }
    }

    setTimeout(() => {
      addItemToCart({
        menuItemId: item.id,
        name: item.name,
        image: item.image,
        basePrice: item.price,
        quantity,
        removedIngredients: Array.from(removedIngredients),
        selectedModifiers,
        unitPrice,
      });

      setButtonState('added');
      setTimeout(() => {
        onClose();
      }, 600);
    }, 400);
  }, [
    effectiveButtonState,
    item,
    singleSelections,
    multiSelections,
    removedIngredients,
    quantity,
    unitPrice,
    addItemToCart,
    onClose,
  ]);

  // Get button text
  const getButtonContent = () => {
    switch (effectiveButtonState) {
      case 'disabled':
        return `Select ${unmetRequiredGroup} to continue`;
      case 'enabled':
        return `Add to Cart — ₺${totalPrice}`;
      case 'loading':
        return (
          <span className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Adding...
          </span>
        );
      case 'added':
        return (
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            Added!
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="relative w-full md:max-w-lg md:mx-4 bg-white md:rounded-2xl rounded-t-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-slide-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1">
          {/* Image */}
          <div className="aspect-[16/10] overflow-hidden bg-gray-100">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-5">
            {/* Name & Description */}
            <h2 className="text-xl font-bold text-gray-900">{item.name}</h2>
            <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{item.description}</p>
            <p className="text-lg font-bold text-gray-900 mt-2">₺{item.price}</p>

            {/* Tags */}
            {item.tags.length > 0 && (
              <div className="flex gap-2 mt-3">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600"
                  >
                    {tag === 'vegan' && '🌱 Vegan'}
                    {tag === 'spicy' && '🌶 Spicy'}
                    {tag === 'gluten-free' && '🌾 Gluten-Free'}
                  </span>
                ))}
              </div>
            )}

            {/* Modifier Groups */}
            <div className="mt-5 space-y-6">
              {item.modifierGroups.map((group, idx) => (
                <ModifierGroupRenderer
                  key={`${group.name}-${idx}`}
                  group={group}
                  removedIngredients={removedIngredients}
                  singleSelections={singleSelections}
                  multiSelections={multiSelections}
                  onToggleIngredient={toggleIngredient}
                  onSelectSingle={selectSingle}
                  onToggleMulti={toggleMulti}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer: Quantity + Add to Cart */}
        <div className="border-t border-gray-100 p-4 bg-white">
          <div className="flex items-center gap-4">
            {/* Quantity Stepper */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-1 py-1">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-30 hover:bg-gray-200"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-semibold text-sm">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(item.maxQuantity, quantity + 1))}
                disabled={quantity >= item.maxQuantity}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-30 hover:bg-gray-200"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={effectiveButtonState === 'disabled' || effectiveButtonState === 'loading' || !isOpen}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all ${
                effectiveButtonState === 'added'
                  ? 'bg-emerald-500 text-white'
                  : effectiveButtonState === 'enabled' && isOpen
                    ? 'bg-brand-500 hover:bg-brand-600 text-white active:scale-[0.98]'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {!isOpen ? 'Restaurant is closed' : getButtonContent()}
            </button>
          </div>
        </div>
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

// --- Sub-components for modifier groups ---

interface ModifierGroupRendererProps {
  group: ModifierGroup;
  removedIngredients: Set<string>;
  singleSelections: Record<string, string>;
  multiSelections: Record<string, Set<string>>;
  onToggleIngredient: (ingredient: string) => void;
  onSelectSingle: (groupName: string, optionId: string) => void;
  onToggleMulti: (groupName: string, optionId: string, max: number) => void;
}

function ModifierGroupRenderer({
  group,
  removedIngredients,
  singleSelections,
  multiSelections,
  onToggleIngredient,
  onSelectSingle,
  onToggleMulti,
}: ModifierGroupRendererProps) {
  if (group.type === 'removal') {
    return (
      <RemovalGroupComponent
        group={group}
        removedIngredients={removedIngredients}
        onToggle={onToggleIngredient}
      />
    );
  }

  if (group.type === 'single') {
    return (
      <SingleSelectGroupComponent
        group={group}
        selectedId={singleSelections[group.name] || ''}
        onSelect={(optionId) => onSelectSingle(group.name, optionId)}
      />
    );
  }

  if (group.type === 'multi') {
    return (
      <MultiSelectGroupComponent
        group={group}
        selectedIds={multiSelections[group.name] || new Set()}
        onToggle={(optionId) => onToggleMulti(group.name, optionId, group.maxSelections)}
      />
    );
  }

  return null;
}

// Removal Group — Ingredient Chips
function RemovalGroupComponent({
  group,
  removedIngredients,
  onToggle,
}: {
  group: RemovalGroup;
  removedIngredients: Set<string>;
  onToggle: (ingredient: string) => void;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-2">{group.name}</h3>
      <div className="flex flex-wrap gap-2">
        {group.ingredients.map((ingredient) => {
          const isRemoved = removedIngredients.has(ingredient);
          return (
            <button
              key={ingredient}
              onClick={() => onToggle(ingredient)}
              className={`ingredient-chip inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                isRemoved
                  ? 'bg-red-50 border-red-200 text-red-400 line-through'
                  : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-150'
              }`}
            >
              {isRemoved && <X className="w-3 h-3 text-red-400" />}
              {ingredient}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Single Select — Radio List
function SingleSelectGroupComponent({
  group,
  selectedId,
  onSelect,
}: {
  group: SingleSelectGroup;
  selectedId: string;
  onSelect: (optionId: string) => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-sm font-semibold text-gray-700">{group.name}</h3>
        {group.required && !selectedId && (
          <span className="pulse-badge text-xs font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
            Required
          </span>
        )}
      </div>
      <div className="space-y-1">
        {group.options.map((option) => {
          const isSelected = selectedId === option.id;
          return (
            <button
              key={option.id}
              onClick={() => onSelect(option.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all ${
                isSelected
                  ? 'bg-brand-50 border border-brand-200'
                  : 'bg-gray-50 border border-transparent hover:border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    isSelected ? 'border-brand-500' : 'border-gray-300'
                  }`}
                >
                  {isSelected && <div className="w-2 h-2 rounded-full bg-brand-500" />}
                </div>
                <span className={isSelected ? 'font-medium text-gray-900' : 'text-gray-600'}>
                  {option.name}
                </span>
              </div>
              <span className="text-xs text-gray-400 font-medium">
                {option.priceDelta > 0 ? `+₺${option.priceDelta}` : option.priceDelta === 0 ? '' : `₺${option.priceDelta}`}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Multi Select — Checkbox List
function MultiSelectGroupComponent({
  group,
  selectedIds,
  onToggle,
}: {
  group: MultiSelectGroup;
  selectedIds: Set<string>;
  onToggle: (optionId: string) => void;
}) {
  const isMaxReached = selectedIds.size >= group.maxSelections;

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-sm font-semibold text-gray-700">{group.name}</h3>
        <span className="text-xs text-gray-400">
          {selectedIds.size} / {group.maxSelections}
        </span>
        {group.minSelections > 0 && selectedIds.size < group.minSelections && (
          <span className="pulse-badge text-xs font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
            Min {group.minSelections}
          </span>
        )}
      </div>
      <div className="space-y-1">
        {group.options.map((option) => {
          const isSelected = selectedIds.has(option.id);
          const isDisabled = !isSelected && isMaxReached;

          return (
            <button
              key={option.id}
              onClick={() => !isDisabled && onToggle(option.id)}
              disabled={isDisabled}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all ${
                isSelected
                  ? 'bg-brand-50 border border-brand-200'
                  : isDisabled
                    ? 'bg-gray-50 border border-transparent opacity-40 cursor-not-allowed'
                    : 'bg-gray-50 border border-transparent hover:border-gray-200'
              }`}
              title={isDisabled ? 'Maximum reached' : undefined}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-4.5 h-4.5 rounded-md border-2 flex items-center justify-center transition-colors ${
                    isSelected ? 'border-brand-500 bg-brand-500' : 'border-gray-300'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className={isSelected ? 'font-medium text-gray-900' : 'text-gray-600'}>
                  {option.name}
                </span>
              </div>
              <span className="text-xs text-gray-400 font-medium">
                {option.priceDelta > 0 ? `+₺${option.priceDelta}` : ''}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
