'use client';

import { useState, useEffect, useCallback } from 'react';
import NavBar from '@/components/layout/NavBar';
import SummaryCard from '@/components/summary/SummaryCard';
import { getDB } from '@/lib/db';
import { todayStr, toDateString } from '@/lib/utils';
import type { DailySummary } from '@/types';

export default function SummaryPage() {
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const loadSummary = useCallback(async (date: string) => {
    setLoading(true);
    setError('');
    setSummary(null);
    try {
      const db = getDB();
      const cached = await db.dailySummaries.get(date);
      if (cached) setSummary(cached);
    } catch (err) {
      console.error('Failed to load summary:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSummary(selectedDate);
  }, [selectedDate, loadSummary]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    try {
      const db = getDB();
      const d = new Date(selectedDate);
      const dayStartMs = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const dayEndMs = dayStartMs + 24 * 60 * 60 * 1000 - 1;

      const dayRecords = await db.records
        .where('timestamp')
        .between(dayStartMs, dayEndMs, true, true)
        .toArray();

      if (dayRecords.length === 0) {
        setError('该日期还没有记录，先去记录点什么吧 ✨');
        setGenerating(false);
        return;
      }

      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          records: dayRecords.map(r => ({
            content: r.content,
            categories: r.categories,
            timestamp: r.timestamp,
          })),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate summary');
      }

      const data = await response.json();
      const newSummary = data.summary;
      await db.dailySummaries.put(newSummary);
      setSummary(newSummary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setGenerating(false);
    }
  };

  const goToPrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(toDateString(d.getTime()));
  };

  const goToNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    const next = toDateString(d.getTime());
    if (next <= todayStr()) setSelectedDate(next);
  };

  const goToToday = () => setSelectedDate(todayStr());
  const isToday = selectedDate === todayStr();

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{
        backgroundImage: 'url(/图片/summary-bg-new.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      <main className="flex-1 flex flex-col pb-24 md:pb-0">
        {/* Date picker */}
        <div className="flex items-center justify-center gap-3 px-4 pt-20 mb-6">
          <button
            onClick={goToPrevDay}
            className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
            style={{
              background: 'rgba(255,255,255,0.3)',
              border: '1px solid rgba(255,255,255,0.4)',
            }}
          >
            ←
          </button>

          <button
            onClick={goToToday}
            className="text-sm font-medium px-4 py-1.5 rounded-full transition-all"
            style={{
              background: isToday ? 'var(--pink-barbie)' : 'rgba(255,255,255,0.3)',
              color: isToday ? 'white' : 'var(--text-primary)',
              border: '1px solid rgba(255,255,255,0.4)',
            }}
          >
            {selectedDate}
            {isToday && ' (今天)'}
          </button>

          <button
            onClick={goToNextDay}
            disabled={isToday}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${
              isToday ? 'opacity-30 cursor-not-allowed' : ''
            }`}
            style={{
              background: 'rgba(255,255,255,0.3)',
              border: '1px solid rgba(255,255,255,0.4)',
            }}
          >
            →
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 px-4 flex items-center justify-center">
          <div className="max-w-2xl mx-auto">
            {loading && (
              <div className="text-center py-16">
                <p className="text-[var(--text-secondary)] animate-pulse">🌸 加载中...</p>
              </div>
            )}

            {!loading && summary && (
              <SummaryCard summary={summary} />
            )}

            {!loading && !summary && isToday && !error && (
              <div className="text-center py-16 animate-fade-in">
                <img src="/图片/summary-empty.png" alt="" className="w-24 h-24 mb-4 object-contain mx-auto block" />
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                  今日总结还未生成
                </h3>
                <p className="text-sm text-[var(--text-secondary)] mb-6">
                  需要至少有一条今日记录才能生成总结哦
                </p>
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="px-6 py-2.5 rounded-full text-sm font-medium text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, #FF69B4, #FF1493)',
                    boxShadow: '0 4px 16px rgba(255,20,147,0.3)',
                  }}
                >
                  {generating ? '✨ 生成中...' : '✨ 生成今日总结'}
                </button>
              </div>
            )}

            {!loading && !summary && !isToday && !error && (
              <div className="text-center py-16 animate-fade-in">
                <span className="text-5xl mb-4 block">📅</span>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                  该日期暂无总结
                </h3>
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="px-6 py-2.5 rounded-full text-sm font-medium text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, #FF69B4, #FF1493)',
                    boxShadow: '0 4px 16px rgba(255,20,147,0.3)',
                  }}
                >
                  {generating ? '✨ 生成中...' : '✨ 生成总结'}
                </button>
              </div>
            )}

            {error && (
              <div className="text-center py-16 animate-fade-in">
                <span className="text-5xl mb-4 block">💦</span>
                <p className="text-sm text-red-400 mb-4">{error}</p>
                <button
                  onClick={handleGenerate}
                  className="text-sm text-[var(--pink-barbie)] underline"
                >
                  再试一次
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <NavBar />
    </div>
  );
}
