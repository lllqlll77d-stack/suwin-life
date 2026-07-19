'use client';

import type { Category } from '@/types';
import { CATEGORY_CONFIG } from '@/lib/utils';

interface CategoryTagProps {
  category: Category;
  size?: 'sm' | 'md';
  selected?: boolean;
  onClick?: () => void;
}

export default function CategoryTag({
  category,
  size = 'sm',
  selected = false,
  onClick,
}: CategoryTagProps) {
  const config = CATEGORY_CONFIG[category];
  const sizeClass = size === 'md' ? 'text-xs px-3 py-1' : 'text-[10px] px-2 py-0.5';

  return (
    <span
      className={`category-pill ${sizeClass} ${selected ? 'selected' : ''} ${onClick ? 'cursor-pointer hover:scale-105' : ''}`}
      onClick={onClick}
    >
      <span>{config.emoji}</span>
      <span>{category}</span>
    </span>
  );
}
