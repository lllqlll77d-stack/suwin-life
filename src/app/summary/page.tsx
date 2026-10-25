'use client';

import { useState, useEffect, useCallback } from 'react';
import NavBar from '@/components/layout/NavBar';
import PageIntro from '@/components/layout/PageIntro';
import SummaryCard from '@/components/summary/SummaryCard';
import { getDB } from '@/lib/db';
import { todayStr, toDateString, getWeekId, getMonthId } from '@/lib/utils';
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
      if (records.length === 0) { setError('该日期还没有记录，先去 Chat 写下今天的故事吧。'); setGenerating(false); return; }
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
      if (records.length === 0) { setError('该周还没有记录。'); setWeeklyGenerating(false); return; }
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
      if (records.length === 0) { setError('该月还没有记录。'); setMonthlyGenerating(false); return; }
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
    { key: 'daily', label: '日 / DAILY' },
    { key: 'weekly', label: '周 / WEEKLY' },
    { key: 'monthly', label: '月 / MONTHLY' },
  ];
  const loading = tab === 'daily' ? dailyLoading : tab === 'weekly' ? weeklyLoading : monthlyLoading;
  const busy = tab === 'daily' ? generating : tab === 'weekly' ? weeklyGenerating : monthlyGenerating;
  const generate = tab === 'daily' ? handleGenerateDaily : tab === 'weekly' ? handleGenerateWeekly : handleGenerateMonthly;
  const current = tab === 'daily' ? isToday : tab === 'weekly' ? isCurrentWeek : isCurrentMonth;
  const periodLabel = tab === 'daily' ? `${selectedDate}${isToday ? ' · 今天' : ''}` : tab === 'weekly' ? `${selectedWeekId}${isCurrentWeek ? ' · 本周' : ''}` : `${selectedMonthId}${isCurrentMonth ? ' · 本月' : ''}`;
  const previous = () => { setError(''); if (tab === 'daily') goToPrevDay(); else if (tab === 'weekly') navigateWeek(-1); else navigateMonth(-1); };
  const next = () => { setError(''); if (tab === 'daily') goToNextDay(); else if (tab === 'weekly') navigateWeek(1); else navigateMonth(1); };
  const resetDate = () => { setError(''); if (tab === 'daily') goToToday(); else if (tab === 'weekly') setSelectedWeekId(currentWeek); else setSelectedMonthId(currentMonth); };
  const summary = tab === 'daily' ? daily : tab === 'weekly' && weekly ? {
    id: weekly.id, date: `${weekly.weekStart} ~ ${weekly.weekEnd}`, content: weekly.content, highlights: weekly.highlights, suggestions: [], generatedAt: weekly.generatedAt,
  } : tab === 'monthly' && monthly ? {
    id: monthly.id, date: `${monthly.year}年${monthly.month}月`, content: monthly.content, highlights: monthly.highlights, suggestions: [], generatedAt: monthly.generatedAt,
  } : null;
  const extraInfo = tab === 'weekly' && weekly ? `${weekly.recordCount} 条记录` : tab === 'monthly' && monthly ? `${monthly.recordCount} 条记录` : undefined;
  const emptyMessage = tab === 'daily' ? '' : tab === 'weekly' ? '回看这一周的起伏与收获。周日 18:00 后自动生成。' : '看看这个月，你走过了怎样的路。月末 18:00 后自动生成。';

  return (
    <div className="site-page">
      <NavBar />
      <main id="main-content" className="content-main">
        <PageIntro index="03" title="see how far you've come" />
        <div className="section-toolbar summary-toolbar">
          <div className="period-tabs" role="group" aria-label="总结周期">
            {tabs.map(item => <button key={item.key} onClick={() => { setTab(item.key); setError(''); }} className={`capsule-tab ${tab === item.key ? 'active' : ''}`} aria-pressed={tab === item.key} disabled={generating || weeklyGenerating || monthlyGenerating}>{item.label}</button>)}
          </div>
          <div className="date-navigation">
            <button className="mini-button" onClick={previous} disabled={busy} aria-label="上一周期">←</button>
            <button className="date-label" onClick={resetDate} disabled={busy} aria-label="回到当前周期">{periodLabel}</button>
            <button className="mini-button" onClick={next} disabled={current || busy} aria-label="下一周期">→</button>
          </div>
        </div>
        <div className="summary-panel" aria-busy={loading || busy}>
          {loading ? <div className="empty-state" role="status"><p>正在读取总结…</p></div> : summary ? <SummaryCard summary={summary} extraInfo={extraInfo} /> : (
            <div className="empty-state">
              <span className="empty-state-symbol" aria-hidden="true">✧</span>
              <h2>{tab === 'daily' ? '让今天，留下回响' : tab === 'weekly' ? '一周，慢慢看' : '给这个月，写一个小结'}</h2>
              {emptyMessage && <p>{emptyMessage}</p>}
              {error && <p className="error-text" role="alert">{error}</p>}
              <button className="outline-button" onClick={generate} disabled={busy}>{busy ? '正在整理你的回忆…' : error ? '重新生成 ↗' : '生成总结 ↗'}</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
