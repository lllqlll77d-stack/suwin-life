'use client';

import type { Category } from '@/types';
import { CATEGORIES } from '@/types';
import CategoryTag from '@/components/chat/CategoryTag';

interface CategoryFilterProps {
  selected: Category[];
  onChange: (selected: Category[]) => void;
}

export default function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  const toggleCategory = (cat: Category) => {
    if (selected.includes(cat)) {
      onChange(selected.filter(c => c !== cat));
    } else {
      onChange([...selected, cat]);
    }
  };

  const clearAll = () => onChange([]);

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 px-4 scrollbar-hide">
      {/* "All" button */}
      <button
        onClick={clearAll}
        className={`category-pill text-xs px-3 py-1 whitespace-nowrap ${selected.length === 0 ? 'selected' : ''}`}
      >
        🌸 全部
      </button>

      {CATEGORIES.map(cat => (
        <CategoryTag
          key={cat}
          category={cat}
          selected={selected.includes(cat)}
          onClick={() => toggleCategory(cat)}
        />
      ))}
    </div>
  );
}
