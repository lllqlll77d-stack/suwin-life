// ============================================================
// IndexedDB Database Setup via Dexie.js
// ============================================================

import Dexie, { type EntityTable } from 'dexie';
import type { Record, DailySummary, Memory } from '@/types';

export class CompanionDB extends Dexie {
  records!: EntityTable<Record, 'id'>;
  dailySummaries!: EntityTable<DailySummary, 'id'>;
  memories!: EntityTable<Memory, 'id'>;

  constructor() {
    super('PersonalAICompanion');

    this.version(1).stores({
      // auto-increment id; index timestamp for date-range queries;
      // multi-entry index on categories array for filtering
      records: '++id, timestamp, *categories',

      // date string as primary key (e.g. "2026-07-13")
      dailySummaries: 'id, date',

      // auto-increment id; index on key for upsert lookups;
      // index on updatedAt for recency sorting
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
