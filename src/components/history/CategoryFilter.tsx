'use client';

import type { Category } from '@/types';
import { CATEGORIES } from '@/types';
import CategoryTag from '@/components/chat/CategoryTag';

export default function CategoryFilter({ selected, onChange }: { selected: Category | null; onChange: (selected: Category | null) => void }) {
  return (
    <div className="category-filter" role="group" aria-label="按分类筛选记录">
      <button className={`category-pill ${selected === null ? 'selected' : ''}`} onClick={() => onChange(null)} aria-pressed={selected === null}>全部</button>
      {CATEGORIES.map(category => <CategoryTag key={category} category={category} selected={selected === category} onClick={() => onChange(selected === category ? null : category)} />)}
    </div>
  );
}
