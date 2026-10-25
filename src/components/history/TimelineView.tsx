'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import type { Record as AppRecord, Category } from '@/types';
import { getDB } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import RecordCard from './RecordCard';

interface TimelineViewProps {
  selectedCategory?: Category | null;
}

export default function TimelineView({ selectedCategory = null }: TimelineViewProps) {
  const [records, setRecords] = useState<AppRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRecords = useCallback(async () => {
    try {
      const db = getDB();
      const query = db.records.orderBy('timestamp').reverse();
      if (selectedCategory) {
        const results = await query.toArray();
        setRecords(results.filter(r =>
          r.categories.includes(selectedCategory)
        ));
      } else {
        setRecords(await query.toArray());
      }
    } catch (err) {
      console.error('Failed to load records:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => { loadRecords(); }, [loadRecords]);

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

  const handleCategoriesChange = useCallback(async (id: number, categories: Category[]) => {
    try {
      const db = getDB();
      await db.records.update(id, { categories });
      setRecords(prev => prev.map(r => r.id === id ? { ...r, categories } : r));
    } catch (err) {
      console.error('Failed to update categories:', err);
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

  if (loading) return <div className="empty-state" role="status"><p>正在读取你的记忆…</p></div>;
  if (records.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-state-symbol" aria-hidden="true">✧</span>
        <h2>{selectedCategory ? '这里还没有这类记忆' : '故事，从第一条记录开始'}</h2>
        <p>{selectedCategory ? '换一个分类，看看其他生活片段。' : '那些平凡的小事，也值得被好好记住。'}</p>
        {!selectedCategory && <Link href="/chat" className="outline-button">写下第一条记录 ↗</Link>}
      </div>
    );
  }
  const entries = Object.entries(grouped).sort(([a], [b]) => Number(b) - Number(a));
  return (
    <div className="timeline">
      {entries.map(([timestamp, dayRecords]) => (
        <section key={timestamp}>
          <h2 className="timeline-date">{formatDate(Number(timestamp))} <span className="ml-3 opacity-60">/ {dayRecords.length} 条记录</span></h2>
          <div className="record-grid">
            {dayRecords.map((record, index) => <RecordCard key={record.id ?? index} record={record} onDelete={handleDelete} onEdit={handleEdit} onCategoriesChange={handleCategoriesChange} />)}
          </div>
        </section>
      ))}
    </div>
  );
}
