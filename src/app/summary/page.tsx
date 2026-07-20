'use client';

import { useState, useEffect, useCallback } from 'react';
import NavBar from '@/components/layout/NavBar';
import SummaryCard from '@/components/summary/SummaryCard';
import { getDB } from '@/lib/db';
import { todayStr, toDateString, getWeekId, getMonthId, getWeekRange, getMonthRange } from '@/lib/utils';
import type { DailySummary, WeeklySummary, MonthlySummary } from '@/types';

type Tab = 'daily' | 'weekly' | 'monthly';

export default function SummaryPage() {
  const [tab, setTab] = useState<Tab>('daily');

  // Daily
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [daily, setDaily] = useState<DailySummary | null>(null);
  const [dailyLoading, setDailyLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  // Weekly
  const [selectedWeekId, setSelectedWeekId] = useState(getWeekId());
  const [weekly, setWeekly] = useState<WeeklySummary | null>(null);
  const [weeklyLoading, setWeeklyLoading] = useState(false);
  const [weeklyGenerating, setWeeklyGenerating] = useState(false);

  // Monthly
  const [selectedMonthId, setSelectedMonthId] = useState(getMonthId());
  const [monthly, setMonthly] = useState<MonthlySummary | null>(null);
  const [monthlyLoading, setMonthlyLoading] = useState(false);
  const [monthlyGenerating, setMonthlyGenerating] = useState(false);

  // ---- Daily ----

  const loadDaily = useCallback(async (date: string) => {
    setDailyLoading(true); setError(''); setDaily(null);
    try {
      const db = getDB();
      const cached = await db.dailySummaries.get(date);
      if (cached) setDaily(cached);
    } catch (err) {
      console.error('Failed to load daily summary:', err);
    } finally {
      setDailyLoading(false);
    }
  }, []);

  useEffect(() => { loadDaily(selectedDate); }, [selectedDate, loadDaily]);

  const handleGenerateDaily = async () => {
    setGenerating(true); setError('');
    try {
      const db = getDB();
      const d = new Date(selectedDate);
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const end = start + 24 * 60 * 60 * 1000 - 1;
      const records = await db.records.where('timestamp').between(start, end, true, true).toArray();
      if (records.length === 0) { setError('该日期还没有记录，先去记录点什么吧 ✨'); setGenerating(false); return; }
      const res = await fetch('/api/summarize', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate, records: records.map(r => ({ content: r.content, categories: r.categories, timestamp: r.timestamp })) }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed'); }
      const data = await res.json();
      await db.dailySummaries.put(data.summary);
      setDaily(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally { setGenerating(false); }
  };

  // ---- Weekly ----

  const loadWeekly = useCallback(async (weekId: string) => {
    setWeeklyLoading(true); setWeekly(null);
    try {
      const db = getDB();
      const cached = await db.weeklySummaries.get(weekId);
      if (cached) setWeekly(cached);
    } catch (err) {
      console.error('Failed to load weekly summary:', err);
    } finally { setWeeklyLoading(false); }
  }, []);

  useEffect(() => { loadWeekly(selectedWeekId); }, [selectedWeekId, loadWeekly]);

  const handleGenerateWeekly = async () => {
    setWeeklyGenerating(true);
    try {
      const db = getDB();
      const [yearStr, weekStr] = selectedWeekId.split('-W');
      const year = parseInt(yearStr!), week = parseInt(weekStr!);
      const jan1 = new Date(year, 0, 1);
      const dayOffset = jan1.getDay() === 0 ? -6 : 1 - jan1.getDay();
      const monday = new Date(year, 0, 1 + dayOffset + (week - 1) * 7);
      const sunday = new Date(monday); sunday.setDate(sunday.getDate() + 6);
      const startMs = monday.getTime();
      const endMs = sunday.getTime() + 24 * 60 * 60 * 1000 - 1;
      const records = await db.records.where('timestamp').between(startMs, endMs, true, true).toArray();
      if (records.length === 0) { setError('该周还没有记录 ✨'); setWeeklyGenerating(false); return; }
      const res = await fetch('/api/summarize-weekly', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weekStart: toDateString(startMs), weekEnd: toDateString(sunday.getTime()), records: records.map(r => ({ content: r.content, categories: r.categories, timestamp: r.timestamp })) }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      const summary: WeeklySummary = {
        id: selectedWeekId, weekStart: toDateString(startMs), weekEnd: toDateString(sunday.getTime()),
        content: data.summary.content, highlights: data.summary.highlights, recordCount: data.summary.recordCount, generatedAt: Date.now(),
      };
      await db.weeklySummaries.put(summary);
      setWeekly(summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败');
    } finally { setWeeklyGenerating(false); }
  };

  // ---- Monthly ----

  const loadMonthly = useCallback(async (monthId: string) => {
    setMonthlyLoading(true); setMonthly(null);
    try {
      const db = getDB();
      const cached = await db.monthlySummaries.get(monthId);
      if (cached) setMonthly(cached);
    } catch (err) {
      console.error('Failed to load monthly summary:', err);
    } finally { setMonthlyLoading(false); }
  }, []);

  useEffect(() => { loadMonthly(selectedMonthId); }, [selectedMonthId, loadMonthly]);

  const handleGenerateMonthly = async () => {
    setMonthlyGenerating(true);
    try {
      const db = getDB();
      const [y, m] = selectedMonthId.split('-');
      const year = parseInt(y!), month = parseInt(m!);
      const startMs = new Date(year, month - 1, 1).getTime();
      const endMs = new Date(year, month, 0).getTime() + 24 * 60 * 60 * 1000 - 1;
      const records = await db.records.where('timestamp').between(startMs, endMs, true, true).toArray();
      if (records.length === 0) { setError('该月还没有记录 ✨'); setMonthlyGenerating(false); return; }
      const res = await fetch('/api/summarize-monthly', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year, month, records: records.map(r => ({ content: r.content, categories: r.categories, timestamp: r.timestamp })) }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      const summary: MonthlySummary = {
        id: selectedMonthId, year, month, content: data.summary.content,
        highlights: data.summary.highlights, recordCount: data.summary.recordCount, generatedAt: Date.now(),
      };
      await db.monthlySummaries.put(summary);
      setMonthly(summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败');
    } finally { setMonthlyGenerating(false); }
  };

  // ---- Navigation helpers ----

  const navigateWeek = (dir: -1 | 1) => {
    const [y, w] = selectedWeekId.split('-W');
    const d = new Date(parseInt(y!), 0, 1 + (parseInt(w!) - 1 + dir * 1) * 7);
    setSelectedWeekId(getWeekId(d));
  };

  const navigateMonth = (dir: -1 | 1) => {
    const [y, m] = selectedMonthId.split('-');
    const d = new Date(parseInt(y!), parseInt(m!) - 1 + dir, 1);
    setSelectedMonthId(getMonthId(d));
  };

  const goToPrevDay = () => {
    const d = new Date(selectedDate); d.setDate(d.getDate() - 1); setSelectedDate(toDateString(d.getTime()));
  };
  const goToNextDay = () => {
    const d = new Date(selectedDate); d.setDate(d.getDate() + 1);
    if (toDateString(d.getTime()) <= todayStr()) setSelectedDate(toDateString(d.getTime()));
  };
  const goToToday = () => setSelectedDate(todayStr());
  const isToday = selectedDate === todayStr();

  const currentWeek = getWeekId();
  const currentMonth = getMonthId();
  const isCurrentWeek = selectedWeekId === currentWeek;
  const isCurrentMonth = selectedMonthId === currentMonth;

  const tabs: { key: Tab; label: string }[] = [
    { key: 'daily', label: '📅 日总结' },
    { key: 'weekly', label: '📊 周总结' },
    { key: 'monthly', label: '🌙 月总结' },
  ];

  // Generic empty state
  const renderEmptyState = (message: string, onGenerate: () => void, isLoading: boolean, btnLabel: string) => (
    <div className="text-center py-16 animate-fade-in">
      <span className="text-5xl mb-4 block">📝</span>
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">暂无总结</h3>
      <p className="text-sm text-[var(--text-secondary)] mb-6">{message}</p>
      <button
        onClick={onGenerate} disabled={isLoading}
        className="px-6 py-2.5 rounded-full text-sm font-medium text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
        style={{ background: 'linear-gradient(135deg, #FF69B4, #FF1493)', boxShadow: '0 4px 16px rgba(255,20,147,0.3)' }}
      >
        {isLoading ? '✨ 生成中...' : btnLabel}
      </button>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundImage: 'url(/图片/summary-bg-new.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundAttachment: 'fixed' }}>
      {/* Tabs */}
      <div className="flex justify-center gap-2 pt-6 pb-1 px-4">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setError(''); }}
            className={`capsule-tab ${tab === t.key ? 'active' : ''}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <main className="flex-1 flex flex-col pb-24 md:pb-0">
        {/* ---- Daily Tab ---- */}
        {tab === 'daily' && (
          <>
            <div className="flex items-center justify-center gap-3 px-4 pt-4 mb-6">
              <button onClick={goToPrevDay} className="w-8 h-8 rounded-full flex items-center justify-center text-lg" style={{ background: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.4)' }}>←</button>
              <button onClick={goToToday} className="text-sm font-medium px-4 py-1.5 rounded-full transition-all" style={{ background: isToday ? 'var(--pink-barbie)' : 'rgba(255,255,255,0.3)', color: isToday ? 'white' : 'var(--text-primary)', border: '1px solid rgba(255,255,255,0.4)' }}>
                {selectedDate}{isToday && ' (今天)'}
              </button>
              <button onClick={goToNextDay} disabled={isToday} className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${isToday ? 'opacity-30 cursor-not-allowed' : ''}`} style={{ background: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.4)' }}>→</button>
            </div>
            <div className="flex-1 px-4 flex items-center justify-center">
              <div className="max-w-2xl mx-auto w-full">
                {dailyLoading && <div className="text-center py-16"><p className="text-[var(--text-secondary)] animate-pulse">🌸 加载中...</p></div>}
                {!dailyLoading && daily && <SummaryCard summary={daily} />}
                {!dailyLoading && !daily && !error && renderEmptyState(
                  isToday ? '需要至少有一条今日记录才能生成总结哦' : '该日期暂无总结',
                  handleGenerateDaily, generating, '✨ 生成总结'
                )}
                {error && (
                  <div className="text-center py-16 animate-fade-in">
                    <span className="text-5xl mb-4 block">💦</span>
                    <p className="text-sm text-red-400 mb-4">{error}</p>
                    <button onClick={handleGenerateDaily} className="text-sm text-[var(--pink-barbie)] underline">再试一次</button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ---- Weekly Tab ---- */}
        {tab === 'weekly' && (
          <>
            <div className="flex items-center justify-center gap-3 px-4 pt-4 mb-6">
              <button onClick={() => navigateWeek(-1)} className="w-8 h-8 rounded-full flex items-center justify-center text-lg" style={{ background: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.4)' }}>←</button>
              <button onClick={() => setSelectedWeekId(currentWeek)} className="text-sm font-medium px-4 py-1.5 rounded-full transition-all" style={{ background: isCurrentWeek ? 'var(--pink-barbie)' : 'rgba(255,255,255,0.3)', color: isCurrentWeek ? 'white' : 'var(--text-primary)', border: '1px solid rgba(255,255,255,0.4)' }}>
                {selectedWeekId}{isCurrentWeek && ' (本周)'}
              </button>
              <button onClick={() => navigateWeek(1)} disabled={isCurrentWeek} className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${isCurrentWeek ? 'opacity-30 cursor-not-allowed' : ''}`} style={{ background: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.4)' }}>→</button>
            </div>
            <div className="flex-1 px-4 flex items-center justify-center">
              <div className="max-w-2xl mx-auto w-full">
                {weeklyLoading && <div className="text-center py-16"><p className="text-[var(--text-secondary)] animate-pulse">🌸 加载中...</p></div>}
                {!weeklyLoading && weekly && (
                  <SummaryCard summary={{ id: weekly.id, date: `${weekly.weekStart} ~ ${weekly.weekEnd}`, content: weekly.content, highlights: weekly.highlights, suggestions: [], generatedAt: weekly.generatedAt }} extraInfo={`📝 ${weekly.recordCount} 条记录`} />
                )}
                {!weeklyLoading && !weekly && !error && renderEmptyState(
                  isCurrentWeek ? '周日 18:00 后会自动生成本周总结' : '该周暂无总结',
                  handleGenerateWeekly, weeklyGenerating, '✨ 生成周总结'
                )}
                {error && (
                  <div className="text-center py-16 animate-fade-in">
                    <span className="text-5xl mb-4 block">💦</span>
                    <p className="text-sm text-red-400 mb-4">{error}</p>
                    <button onClick={handleGenerateWeekly} className="text-sm text-[var(--pink-barbie)] underline">再试一次</button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ---- Monthly Tab ---- */}
        {tab === 'monthly' && (
          <>
            <div className="flex items-center justify-center gap-3 px-4 pt-4 mb-6">
              <button onClick={() => navigateMonth(-1)} className="w-8 h-8 rounded-full flex items-center justify-center text-lg" style={{ background: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.4)' }}>←</button>
              <button onClick={() => setSelectedMonthId(currentMonth)} className="text-sm font-medium px-4 py-1.5 rounded-full transition-all" style={{ background: isCurrentMonth ? 'var(--pink-barbie)' : 'rgba(255,255,255,0.3)', color: isCurrentMonth ? 'white' : 'var(--text-primary)', border: '1px solid rgba(255,255,255,0.4)' }}>
                {selectedMonthId}{isCurrentMonth && ' (本月)'}
              </button>
              <button onClick={() => navigateMonth(1)} disabled={isCurrentMonth} className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${isCurrentMonth ? 'opacity-30 cursor-not-allowed' : ''}`} style={{ background: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.4)' }}>→</button>
            </div>
            <div className="flex-1 px-4 flex items-center justify-center">
              <div className="max-w-2xl mx-auto w-full">
                {monthlyLoading && <div className="text-center py-16"><p className="text-[var(--text-secondary)] animate-pulse">🌸 加载中...</p></div>}
                {!monthlyLoading && monthly && (
                  <SummaryCard summary={{ id: monthly.id, date: `${monthly.year}年${monthly.month}月`, content: monthly.content, highlights: monthly.highlights, suggestions: [], generatedAt: monthly.generatedAt }} extraInfo={`📝 ${monthly.recordCount} 条记录`} />
                )}
                {!monthlyLoading && !monthly && !error && renderEmptyState(
                  isCurrentMonth ? '月末 18:00 后会自动生成本月总结' : '该月暂无总结',
                  handleGenerateMonthly, monthlyGenerating, '✨ 生成月总结'
                )}
                {error && (
                  <div className="text-center py-16 animate-fade-in">
                    <span className="text-5xl mb-4 block">💦</span>
                    <p className="text-sm text-red-400 mb-4">{error}</p>
                    <button onClick={handleGenerateMonthly} className="text-sm text-[var(--pink-barbie)] underline">再试一次</button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>

      <NavBar />
    </div>
  );
}
