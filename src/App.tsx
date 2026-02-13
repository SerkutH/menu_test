import { useState, useRef, useEffect, useCallback } from 'react';
import { restaurant, categories } from './data';
import { MenuItem } from './types';
import { useCartStore } from './store/cartStore';
import RestaurantHeader from './components/RestaurantHeader';
import CategoryNav from './components/CategoryNav';
import SearchBar from './components/SearchBar';
import MenuSection from './components/MenuSection';
import ItemDetailSheet from './components/ItemDetailSheet';
import FloatingCartBar from './components/FloatingCartBar';
import CartSheet from './components/CartSheet';
import CheckoutSheet from './components/CheckoutSheet';
import ClosedBanner from './components/ClosedBanner';

function App() {
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isNavSticky, setIsNavSticky] = useState(false);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const navRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const isCartOpen = useCartStore((s) => s.isCartOpen);
  const isCheckoutOpen = useCartStore((s) => s.isCheckoutOpen);
  const staleCartNotice = useCartStore((s) => s.staleCartNotice);
  const dismissStaleNotice = useCartStore((s) => s.dismissStaleNotice);

  // Handle scroll to detect active category and sticky nav
  const handleScroll = useCallback(() => {
    if (searchQuery) return;

    const headerEl = headerRef.current;
    if (headerEl) {
      const headerBottom = headerEl.getBoundingClientRect().bottom;
      setIsNavSticky(headerBottom <= 0);
    }

    const scrollTop = window.scrollY + 140;
    let currentCategory = categories[0]?.id || '';

    for (const cat of categories) {
      const el = sectionRefs.current[cat.id];
      if (el) {
        const { offsetTop } = el;
        if (scrollTop >= offsetTop) {
          currentCategory = cat.id;
        }
      }
    }

    setActiveCategory(currentCategory);
  }, [searchQuery]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const scrollToCategory = (categoryId: string) => {
    setSearchQuery('');
    const el = sectionRefs.current[categoryId];
    if (el) {
      const offset = 120;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  // Filter items by search
  const filteredItems = searchQuery.trim()
    ? categories
        .flatMap((c) => c.items)
        .filter(
          (item) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
    : null;

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Stale Cart Notice */}
      {staleCartNotice && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-amber-50 border-b border-amber-200 px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-amber-800">Your previous cart has expired.</p>
          <button
            onClick={dismissStaleNotice}
            className="text-amber-600 hover:text-amber-800 text-sm font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Closed Banner */}
      {!restaurant.isOpen && <ClosedBanner opensAt={restaurant.opensAt || ''} />}

      {/* Header */}
      <div ref={headerRef}>
        <RestaurantHeader restaurant={restaurant} />
      </div>

      {/* Sticky Category Nav */}
      <div
        ref={navRef}
        className={`${
          isNavSticky ? 'fixed top-0 left-0 right-0 z-40 shadow-sm' : ''
        } bg-white border-b border-gray-100 transition-shadow`}
      >
        <div className="max-w-5xl mx-auto">
          <CategoryNav
            categories={categories}
            activeCategory={activeCategory}
            onCategoryClick={scrollToCategory}
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 pt-4">
        {/* Search Bar */}
        <SearchBar query={searchQuery} onChange={setSearchQuery} />

        {/* Search Results */}
        {filteredItems !== null ? (
          <div className="mt-4">
            {filteredItems.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <p className="text-lg font-medium">No items found</p>
                <p className="text-sm mt-1">Try a different search term</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {filteredItems.map((item) => (
                  <div key={item.id}>
                    <MenuSection
                      item={item}
                      onItemClick={setSelectedItem}
                      isOpen={restaurant.isOpen}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Category Sections */
          categories.map((category) => (
            <div
              key={category.id}
              ref={(el) => {
                sectionRefs.current[category.id] = el;
              }}
              className="mb-8"
            >
              <div className="sticky top-[52px] z-20 bg-gray-50 pt-4 pb-2">
                <h2 className="text-xl font-bold text-gray-900">{category.name}</h2>
                {category.description && (
                  <p className="text-sm text-gray-500 mt-0.5">{category.description}</p>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mt-2">
                {category.items.map((item) => (
                  <MenuSection
                    key={item.id}
                    item={item}
                    onItemClick={setSelectedItem}
                    isOpen={restaurant.isOpen}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Item Detail Sheet */}
      {selectedItem && (
        <ItemDetailSheet
          item={selectedItem}
          isOpen={restaurant.isOpen}
          onClose={() => setSelectedItem(null)}
        />
      )}

      {/* Cart */}
      <FloatingCartBar />
      {isCartOpen && <CartSheet restaurant={restaurant} />}
      {isCheckoutOpen && <CheckoutSheet restaurant={restaurant} />}
    </div>
  );
}

export default App;
