// ============================================================
// Long-term Memory Management
// ============================================================

import { getDB } from './db';
import type { Memory, MemoryExtraction } from '@/types';
import { deepseekChat } from './deepseek';
import { MEMORY_EXTRACTION_PROMPT } from './prompts';

// ---- Memory Retrieval (Keyword-based for Phase 1) ----

/**
 * Score how relevant a memory is to the current user message.
 * Uses character bigram overlap for Chinese + word overlap for English.
 */
function relevanceScore(memory: Memory, userMessage: string): number {
  const message = userMessage.toLowerCase();
  const key = memory.key.toLowerCase();
  const content = memory.content.toLowerCase();

  // Extract character bigrams from Chinese text
  const getBigrams = (s: string): Set<string> => {
    const bigrams = new Set<string>();
    for (let i = 0; i < s.length - 1; i++) {
      bigrams.add(s.slice(i, i + 2));
    }
    return bigrams;
  };

  const msgBigrams = getBigrams(message);
  const memBigrams = getBigrams(key + ' ' + content);

  // Jaccard-like overlap
  let overlap = 0;
  for (const bg of msgBigrams) {
    if (memBigrams.has(bg)) overlap++;
  }

  const union = new Set([...msgBigrams, ...memBigrams]).size;
  const bigramScore = union > 0 ? overlap / union : 0;

  // Boost by recency (newer = higher)
  const now = Date.now();
  const ageInDays = (now - memory.updatedAt) / (1000 * 60 * 60 * 24);
  const recencyBoost = Math.max(0, 1 - ageInDays / 30); // decay over 30 days

  return bigramScore * 0.7 + recencyBoost * 0.3;
}

/**
 * Get memories most relevant to the current user message.
 */
export async function getRelevantMemories(
  userMessage: string,
  limit: number = 5
): Promise<{ key: string; content: string }[]> {
  try {
    const db = getDB();
    const allMemories = await db.memories.toArray();

  if (allMemories.length === 0) return [];

  // Score and sort
  const scored = allMemories
    .map(m => ({ memory: m, score: relevanceScore(m, userMessage) }))
    .filter(s => s.score > 0.05) // minimum relevance threshold
    .sort((a, b) => b.score - a.score);

    return scored.slice(0, limit).map(s => ({
      key: s.memory.key,
      content: s.memory.content,
    }));
  } catch {
    // IndexedDB not available (server-side) — return empty
    return [];
  }
}

// ---- Memory Extraction ----

/**
 * Extract long-term memories from a conversation.
 * Called as a non-blocking side-effect after each chat response.
 */
export async function extractAndStoreMemories(
  userMessage: string,
  aiResponse: string
): Promise<void> {
  try {
    const messages = [
      { role: 'system' as const, content: MEMORY_EXTRACTION_PROMPT },
      {
        role: 'user' as const,
        content: `User: ${userMessage}\n\nAssistant: ${aiResponse}\n\nExtract key facts about the user from this exchange.`,
      },
    ];

    const result = await deepseekChat(messages);
    const trimmed = result.trim();

    // Try to parse JSON array
    let extractions: MemoryExtraction[] = [];
    try {
      // Handle possible markdown code block wrapping
      const jsonStr = trimmed
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/g, '')
        .trim();
      extractions = JSON.parse(jsonStr);
    } catch {
      console.warn('Failed to parse memory extraction result:', trimmed);
      return;
    }

    if (!Array.isArray(extractions) || extractions.length === 0) return;

    try {
      const db = getDB();
      const now = Date.now();

      for (const ext of extractions) {
        if (!ext.key || !ext.content) continue;

        const existing = await db.memories.where('key').equals(ext.key).first();

        if (existing?.id != null) {
          await db.memories.update(existing.id, {
            content: ext.content,
            updatedAt: now,
          });
        } else {
          await db.memories.add({
            key: ext.key,
            content: ext.content,
            createdAt: now,
            updatedAt: now,
            relatedRecordIds: [],
          });
        }
      }
    } catch {
      // IndexedDB not available (server-side) — skip
    }
  } catch (err) {
    // Non-blocking: silently fail — memory extraction is best-effort
    console.warn('Memory extraction failed:', err);
  }
}

/**
 * Get all memories (for display/management).
 */
export async function getAllMemories(): Promise<Memory[]> {
  const db = getDB();
  return db.memories.orderBy('updatedAt').reverse().toArray();
}
