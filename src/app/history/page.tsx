'use client';

import { useState } from 'react';
import NavBar from '@/components/layout/NavBar';
import AmbientVideo from '@/components/layout/AmbientVideo';
import PageIntro from '@/components/layout/PageIntro';
import CategoryFilter from '@/components/history/CategoryFilter';
import TimelineView from '@/components/history/TimelineView';
import type { Category } from '@/types';

export default function HistoryPage() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  return (
    <div className="site-page">
      <AmbientVideo subdued />
      <NavBar />
      <main id="main-content" className="content-main">
        <PageIntro index="02" title="a constellation of memories" description="那些随手记下的日常，慢慢连成了你的轨迹。" />
        <div className="section-toolbar"><CategoryFilter selected={selectedCategory} onChange={setSelectedCategory} /></div>
        <TimelineView selectedCategory={selectedCategory} />
      </main>
    </div>
  );
}
