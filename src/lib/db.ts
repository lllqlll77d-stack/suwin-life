// ============================================================
// IndexedDB Database Setup via Dexie.js
// ============================================================

import Dexie, { type EntityTable } from 'dexie';
import type { Record, DailySummary, WeeklySummary, MonthlySummary, Memory } from '@/types';

export class CompanionDB extends Dexie {
  records!: EntityTable<Record, 'id'>;
  dailySummaries!: EntityTable<DailySummary, 'id'>;
  weeklySummaries!: EntityTable<WeeklySummary, 'id'>;
  monthlySummaries!: EntityTable<MonthlySummary, 'id'>;
  memories!: EntityTable<Memory, 'id'>;

  constructor() {
    super('PersonalAICompanion');

    this.version(2).stores({
      records: '++id, timestamp, *categories',
      dailySummaries: 'id, date',
      // New tables for v2: weekly & monthly summaries
      weeklySummaries: 'id, weekStart',
      monthlySummaries: 'id',
      memories: '++id, key, updatedAt',
    });
  }
}

// Singleton instance — created once client-side
let dbInstance: CompanionDB | null = null;

export function getDB(): CompanionDB {
  if (!dbInstance) {
    dbInstance = new CompanionDB();
  }
  return dbInstance;
}
