// ============================================================
// Personal AI Digital Companion — Type Definitions
// ============================================================

export const CATEGORIES = [
  '职业', '学习', '健康', '运动', '饮食',
  '情绪', '理财', '旅行', '关系', '灵感'
] as const;

export type Category = typeof CATEGORIES[number];

export interface Record {
  id?: number;              // auto-increment (Dexie)
  content: string;          // user's raw input
  timestamp: number;        // Date.now() when created
  categories: Category[];   // AI-assigned categories
  aiResponse: string;       // AI's full conversational reply
  aiFeedback: string;       // AI's brief insight/suggestion
}

export interface DailySummary {
  id: string;               // date string "2026-07-13"
  date: string;
  content: string;          // 2-3 paragraph warm summary
  highlights: string[];     // key moments of the day
  suggestions: string[];    // AI's gentle suggestions
  generatedAt: number;      // timestamp when generated
}

export interface WeeklySummary {
  id: string;               // "2026-W29"
  weekStart: string;        // "2026-07-13" (Monday)
  weekEnd: string;          // "2026-07-19" (Sunday)
  content: string;
  highlights: string[];
  recordCount: number;      // how many records this week
  generatedAt: number;
}

export interface MonthlySummary {
  id: string;               // "2026-07"
  year: number;
  month: number;
  content: string;
  highlights: string[];
  recordCount: number;
  generatedAt: number;
}

export interface Memory {
  id?: number;              // auto-increment
  key: string;              // short label, e.g. "career_job_title"
  content: string;          // the remembered fact
  createdAt: number;
  updatedAt: number;
  relatedRecordIds: number[];
}

// ---- Chat Types ----

export interface ChatMessage {
  id: string;               // uuid
  role: 'user' | 'assistant';
  content: string;
  categories?: Category[];
  timestamp: number;
  isStreaming?: boolean;
  recordId?: number;        // IndexedDB record id for edit/delete
}

export interface ChatRequest {
  message: string;
  history: { role: string; content: string }[];
  memories: { key: string; content: string }[];
}

// ---- DeepSeek API Response Types ----

export interface ClassifyBlock {
  categories: Category[];
  feedback?: string;
}

export interface MemoryExtraction {
  key: string;
  content: string;
}

// ---- Decoration Types ----

export interface Decoration {
  id: string;
  type: 'star' | 'heart' | 'butterfly';
  startX: number;    // 0-100 (%)
  startY: number;    // 0-100 (%)
  duration: number;  // seconds
  delay: number;     // seconds
  size: number;      // px
}
