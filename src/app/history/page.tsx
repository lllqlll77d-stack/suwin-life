'use client';

import { useState } from 'react';
import NavBar from '@/components/layout/NavBar';
import PageIntro from '@/components/layout/PageIntro';
import CategoryFilter from '@/components/history/CategoryFilter';
import TimelineView from '@/components/history/TimelineView';
import type { Category } from '@/types';

export default function HistoryPage() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  return (
    <div className="site-page">
      <NavBar />
      <main id="main-content" className="content-main">
        <PageIntro index="02" title="a constellation of memories" />
        <div className="section-toolbar"><CategoryFilter selected={selectedCategory} onChange={setSelectedCategory} /></div>
        <div className="summary-panel"><TimelineView selectedCategory={selectedCategory} /></div>
      </main>
    </div>
  );
}
