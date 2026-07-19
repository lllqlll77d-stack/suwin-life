// ============================================================
// Classification Parser — extracts <<<CLASSIFY>>> block from AI responses
// ============================================================

import type { Category } from '@/types';
import { validateCategories } from './utils';

interface ClassifyResult {
  cleanText: string;
  categories: Category[];
  feedback: string;
}

/**
 * Parse the classification block from an AI response.
 * Returns the cleaned text (without the classify block) and parsed categories.
 */
export function parseClassification(fullText: string): ClassifyResult {
  const classifyRegex = /<<<CLASSIFY>>>\s*([\s\S]*?)\s*<<<END>>>/i;
  const match = fullText.match(classifyRegex);

  let categories: Category[] = [];
  let feedback = '';

  if (match) {
    try {
      const parsed = JSON.parse(match[1].trim());
      categories = validateCategories(parsed.categories ?? []);
      feedback = parsed.feedback ?? '';
    } catch {
      // If JSON parsing fails, try to extract categories from text
      console.warn('Failed to parse classification JSON:', match[1]);
    }
  }

  // Remove the classification block from the displayed text
  const cleanText = fullText.replace(classifyRegex, '').trim();

  return { cleanText, categories, feedback };
}
