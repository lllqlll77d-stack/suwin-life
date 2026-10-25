'use client';

import type { Category } from '@/types';

interface CategoryTagProps {
  category: Category;
  size?: 'sm' | 'md';
  selected?: boolean;
  onClick?: () => void;
}

export default function CategoryTag({ category, size = 'sm', selected = false, onClick }: CategoryTagProps) {
  const className = `category-pill ${size === 'md' ? 'text-xs' : 'text-[10px]'} ${selected ? 'selected' : ''}`;
  return onClick
    ? <button type="button" className={className} onClick={onClick} aria-pressed={selected}>{category}</button>
    : <span className={className}>{category}</span>;
}
