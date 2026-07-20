'use client';

import { useEffect, useRef } from 'react';
import { getDB } from '@/lib/db';
import { getWeekId, getMonthId, getWeekRange, getMonthRange, isSunday, isLastDayOfMonth, isPastHour, getPreviousWeekId, getPreviousMonthId, toDateString } from '@/lib/utils';

/**
 * Runs once on app load. Checks if a weekly or monthly summary
 * is due (Sunday / month-end, after 6pm) and auto-generates it.
 * Also catches up on missed summaries from previous periods.
 * Only generates if there are records for that period.
 */
export default function AutoSummaryGenerator() {
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const AUTO_HOUR = 18; // 6pm

    async function tryGenerate() {
      const now = new Date();
      const db = getDB();

      // ---- Weekly ----
      const triggerWeekly = isSunday(now) && isPastHour(AUTO_HOUR);
      const weekIds: string[] = [];
      if (triggerWeekly) {
        weekIds.push(getWeekId(now)); // this week
      }
      // Always check previous week (catch-up)
      weekIds.push(getPreviousWeekId());

      for (const wid of weekIds) {
        try {
          const existing = await db.weeklySummaries.get(wid);
          if (existing) continue; // already generated

          // Compute the date range for this week
          // Week id "2026-W29" → parse to get Monday
          const [yearStr, weekStr] = wid.split('-W');
          const year = parseInt(yearStr!);
          const week = parseInt(weekStr!);
          // Monday of that ISO week
          const jan1 = new Date(year, 0, 1);
          const dayOffset = jan1.getDay() === 0 ? -6 : 1 - jan1.getDay(); // first Monday
          const monday = new Date(year, 0, 1 + dayOffset + (week - 1) * 7);
          const sunday = new Date(monday);
          sunday.setDate(sunday.getDate() + 6);

          const startMs = monday.getTime();
          const endMs = sunday.getTime() + 24 * 60 * 60 * 1000 - 1;

          const dayRecords = await db.records
            .where('timestamp').between(startMs, endMs, true, true).toArray();

          if (dayRecords.length === 0) continue;

          const weekStart = toDateString(startMs);
          const weekEnd = toDateString(sunday.getTime());

          const res = await fetch('/api/summarize-weekly', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              weekStart, weekEnd,
              records: dayRecords.map(r => ({ content: r.content, categories: r.categories, timestamp: r.timestamp })),
            }),
          });
          if (!res.ok) continue;
          const data = await res.json();
          await db.weeklySummaries.put({
            id: wid,
            weekStart,
            weekEnd,
            content: data.summary.content,
            highlights: data.summary.highlights,
            recordCount: data.summary.recordCount,
            generatedAt: Date.now(),
          });
          console.log(`✅ Weekly summary generated: ${wid}`);
        } catch (err) {
          console.warn('Weekly auto-gen failed:', err);
        }
      }

      // ---- Monthly ----
      const triggerMonthly = isLastDayOfMonth(now) && isPastHour(AUTO_HOUR);
      const monthIds: string[] = [];
      if (triggerMonthly) {
        monthIds.push(getMonthId(now));
      }
      monthIds.push(getPreviousMonthId());

      for (const mid of monthIds) {
        try {
          const existing = await db.monthlySummaries.get(mid);
          if (existing) continue;

          const [y, m] = mid.split('-');
          const year = parseInt(y!);
          const month = parseInt(m!);
          const startMs = new Date(year, month - 1, 1).getTime();
          const endMs = new Date(year, month, 0).getTime() + 24 * 60 * 60 * 1000 - 1;

          const dayRecords = await db.records
            .where('timestamp').between(startMs, endMs, true, true).toArray();

          if (dayRecords.length === 0) continue;

          const res = await fetch('/api/summarize-monthly', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              year, month,
              records: dayRecords.map(r => ({ content: r.content, categories: r.categories, timestamp: r.timestamp })),
            }),
          });
          if (!res.ok) continue;
          const data = await res.json();
          await db.monthlySummaries.put({
            id: mid,
            year,
            month,
            content: data.summary.content,
            highlights: data.summary.highlights,
            recordCount: data.summary.recordCount,
            generatedAt: Date.now(),
          });
          console.log(`✅ Monthly summary generated: ${mid}`);
        } catch (err) {
          console.warn('Monthly auto-gen failed:', err);
        }
      }
    }

    tryGenerate();
  }, []);

  return null; // invisible component
}
