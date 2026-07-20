'use client';

import { useState } from 'react';
import NavBar from '@/components/layout/NavBar';
import CategoryFilter from '@/components/history/CategoryFilter';
import TimelineView from '@/components/history/TimelineView';
import type { Category } from '@/types';

export default function HistoryPage() {
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{
        backgroundImage: 'url(/图片/history-bg-new.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Category filter */}
      <div className="pt-6 pb-1 px-4">
        <CategoryFilter
          selected={selectedCategories}
          onChange={setSelectedCategories}
        />
      </div>

      {/* Timeline */}
      <main className="flex-1 flex flex-col pb-24 md:pb-0">
        <TimelineView selectedCategories={selectedCategories} />
      </main>

      <NavBar />
    </div>
  );
}
