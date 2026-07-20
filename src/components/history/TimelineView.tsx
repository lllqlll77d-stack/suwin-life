'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Record as AppRecord, Category } from '@/types';
import { getDB } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import RecordCard from './RecordCard';

interface TimelineViewProps {
  selectedCategories?: Category[];
}

export default function TimelineView({ selectedCategories = [] }: TimelineViewProps) {
  const [records, setRecords] = useState<AppRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadRecords = useCallback(async () => {
    try {
      const db = getDB();
      const query = db.records.orderBy('timestamp').reverse();
      if (selectedCategories.length > 0) {
        const results = await query.toArray();
        setRecords(results.filter(r =>
          selectedCategories.some(cat => r.categories.includes(cat))
        ));
      } else {
        setRecords(await query.toArray());
      }
    } catch (err) {
      console.error('Failed to load records:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategories]);

  useEffect(() => { loadRecords(); }, [loadRecords, refreshKey]);

  const handleDelete = useCallback(async (id: number) => {
    try {
      const db = getDB();
      await db.records.delete(id);
      setRecords(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('Failed to delete record:', err);
    }
  }, []);

  const handleEdit = useCallback(async (id: number, content: string) => {
    try {
      const db = getDB();
      await db.records.update(id, { content });
      setRecords(prev => prev.map(r => r.id === id ? { ...r, content } : r));
    } catch (err) {
      console.error('Failed to edit record:', err);
    }
  }, []);

  // Group records by date
  const grouped: Record<number, AppRecord[]> = {};
  records.forEach((rec) => {
    const ds = new Date(rec.timestamp);
    ds.setHours(0, 0, 0, 0);
    const key = ds.getTime();
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(rec);
  });

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-[var(--text-secondary)] animate-pulse">🌸 加载中...</p>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-16 text-center">
        <span className="text-5xl mb-4">📔</span>
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
          {selectedCategories.length > 0 ? '该分类下暂无记录' : '还没有记录'}
        </h3>
        <p className="text-sm text-[var(--text-secondary)]">
          {selectedCategories.length > 0
            ? '试试选择其他分类标签吧 ✨'
            : '去聊天页面开始记录你的第一天吧 🌸'}
        </p>
      </div>
    );
  }

  // Sort timestamps descending and render
  const entries = Object.entries(grouped) as [string, AppRecord[]][];
  entries.sort(([a], [b]) => Number(b) - Number(a));

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-4">
      <div className="max-w-2xl mx-auto">
        {entries.map(([timestamp, dayRecords]) => (
          <div key={timestamp} className="mb-6">
            {/* Date header */}
            <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-3 px-1 sticky top-0 py-2"
              style={{ background: 'rgba(255,240,245,0.9)', backdropFilter: 'blur(8px)' }}>
              {formatDate(Number(timestamp))}
            </h3>

            {/* Cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {dayRecords.map((rec: AppRecord, i: number) => {
                // Stable pseudo-random rotation based on record id
                const rotation = rec.id != null
                  ? ((rec.id * 7) % 5) - 2
                  : (i % 5) - 2;
                return (
                  <RecordCard
                    key={rec.id ?? i}
                    record={rec}
                    rotation={rotation}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
