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

// ---- UUID Generator (simple, no dependency needed) ----
export function uuid(): string {
  return crypto.randomUUID?.() ??
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
}
