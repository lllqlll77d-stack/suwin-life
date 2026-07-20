// ============================================================
// Utility Functions
// ============================================================

import type { Category } from '@/types';
import { CATEGORIES } from '@/types';

// ---- Date Helpers ----

/** Get start-of-day timestamp (local time) for a given date string or Date */
export function dayStart(dateOrStr?: string | Date): number {
  const d = dateOrStr ? new Date(dateOrStr) : new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Get end-of-day timestamp (local time) */
export function dayEnd(dateOrStr?: string | Date): number {
  const d = dateOrStr ? new Date(dateOrStr) : new Date();
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}

/** Format a timestamp into YYYY-MM-DD string */
export function toDateString(ts: number): string {
  const d = new Date(ts);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/** Get today's date string */
export function todayStr(): string {
  return toDateString(Date.now());
}

/** Format timestamp for display (e.g. "7月13日 14:30") */
export function formatTime(ts: number): string {
  const d = new Date(ts);
  return `${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** Format date for timeline headers */
export function formatDate(ts: number): string {
  const d = new Date(ts);
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 星期${weekdays[d.getDay()]}`;
}

// ---- Category Helpers ----

/** Validate that an array of strings are valid categories */
export function validateCategories(input: string[]): Category[] {
  return input.filter((c): c is Category =>
    CATEGORIES.includes(c as Category)
  );
}

/** Category display config */
export const CATEGORY_CONFIG: Record<Category, { emoji: string; color: string }> = {
  '职业': { emoji: '💼', color: '#FF69B4' },
  '学习': { emoji: '📚', color: '#FF1493' },
  '健康': { emoji: '💪', color: '#FFB6C1' },
  '运动': { emoji: '🏃', color: '#FF85A2' },
  '饮食': { emoji: '🍽️', color: '#FFA0C5' },
  '情绪': { emoji: '💭', color: '#D8BFD8' },
  '理财': { emoji: '💰', color: '#FFC0CB' },
  '旅行': { emoji: '✈️', color: '#E6E6FA' },
  '关系': { emoji: '💕', color: '#FF91A4' },
  '灵感': { emoji: '✨', color: '#FFD1DC' },
};

// ---- Week & Month Helpers ----

/** Get ISO week id: "2026-W29" */
export function getWeekId(date: Date = new Date()): string {
  const d = new Date(date);
  const dayNum = d.getDay() || 7; // Make Sunday = 7
  d.setDate(d.getDate() + 4 - dayNum); // Adjust to Thursday
  const year = d.getFullYear();
  const weekNum = Math.ceil(
    ((d.getTime() - new Date(year, 0, 1).getTime()) / 86400000 + 1) / 7
  );
  return `${year}-W${String(weekNum).padStart(2, '0')}`;
}

/** Get month id: "2026-07" */
export function getMonthId(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

/** Is today Sunday? */
export function isSunday(date: Date = new Date()): boolean {
  return date.getDay() === 0;
}

/** Is today the last day of the month? */
export function isLastDayOfMonth(date: Date = new Date()): boolean {
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  return date.getDate() === lastDay;
}

/** Get Monday + Sunday date strings for a given date's week */
export function getWeekRange(date: Date = new Date()): { monday: string; sunday: string } {
  const d = new Date(date);
  const day = d.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diffToMonday);
  const monday = toDateString(d.getTime());
  d.setDate(d.getDate() + 6);
  const sunday = toDateString(d.getTime());
  return { monday, sunday };
}

/** Get first + last day strings for a given date's month */
export function getMonthRange(date: Date = new Date()): { first: string; last: string } {
  const year = date.getFullYear();
  const month = date.getMonth();
  const first = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const last = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  return { first, last };
}

/** Get the previous week's id */
export function getPreviousWeekId(): string {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return getWeekId(d);
}

/** Get the previous month's id */
export function getPreviousMonthId(): string {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return getMonthId(d);
}

/** Check if current time is at or after the given hour */
export function isPastHour(hour: number): boolean {
  return new Date().getHours() >= hour;
}

// ---- UUID Generator (simple, no dependency needed) ----
export function uuid(): string {
  return crypto.randomUUID?.() ??
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
}
