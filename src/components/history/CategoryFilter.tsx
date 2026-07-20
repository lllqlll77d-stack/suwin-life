'use client';

import type { Category } from '@/types';
import { CATEGORIES } from '@/types';
import CategoryTag from '@/components/chat/CategoryTag';

interface CategoryFilterProps {
  selected: Category | null;
  onChange: (selected: Category | null) => void;
}

export default function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  const toggleCategory = (cat: Category) => {
    if (selected === cat) {
      onChange(null); // deselect
    } else {
      onChange(cat); // select this one, deselects any previous
    }
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 px-4 scrollbar-hide">
      {/* "All" button */}
      <button
        onClick={() => onChange(null)}
        className={`category-pill text-xs px-3 py-1 whitespace-nowrap ${selected === null ? 'selected' : ''}`}
      >
        🌸 全部
      </button>

      {CATEGORIES.map(cat => (
        <CategoryTag
          key={cat}
          category={cat}
          selected={selected === cat}
          onClick={() => toggleCategory(cat)}
        />
      ))}
    </div>
  );
}
