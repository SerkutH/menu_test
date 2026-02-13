import { useRef, useEffect } from 'react';
import { Category } from '../types';

interface Props {
  categories: Category[];
  activeCategory: string;
  onCategoryClick: (id: string) => void;
}

export default function CategoryNav({ categories, activeCategory, onCategoryClick }: Props) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll to keep active tab visible
  useEffect(() => {
    if (activeRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const button = activeRef.current;
      const containerRect = container.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();

      if (
        buttonRect.left < containerRect.left ||
        buttonRect.right > containerRect.right
      ) {
        button.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }
  }, [activeCategory]);

  return (
    <div
      ref={scrollContainerRef}
      className="flex overflow-x-auto hide-scrollbar px-4 gap-1"
    >
      {categories.map((cat) => {
        const isActive = cat.id === activeCategory;
        return (
          <button
            key={cat.id}
            ref={isActive ? activeRef : null}
            onClick={() => onCategoryClick(cat.id)}
            className={`whitespace-nowrap px-4 py-3 text-sm font-medium transition-all border-b-2 flex-shrink-0 ${
              isActive
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-200'
            }`}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}
