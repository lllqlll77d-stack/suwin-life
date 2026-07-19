// ============================================================
// POST /api/summarize — Generate daily summary from client records
// ============================================================

import { NextRequest } from 'next/server';
import { deepseekChat } from '@/lib/deepseek';
import { SUMMARY_SYSTEM_PROMPT } from '@/lib/prompts';

interface RecordInput {
  content: string;
  categories: string[];
  timestamp: number;
}

export async function POST(request: NextRequest) {
  try {
    const { date, records } = await request.json();

    if (!date || typeof date !== 'string') {
      return Response.json({ error: 'Date is required' }, { status: 400 });
    }

    if (!Array.isArray(records) || records.length === 0) {
      return Response.json(
        { error: 'No records for this date' },
        { status: 404 }
      );
    }

    // Build record summaries
    const recordSummaries = records.map((r: RecordInput) => ({
      time: new Date(r.timestamp).toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      content: r.content,
      categories: r.categories,
    }));

    const messages = [
      { role: 'system' as const, content: SUMMARY_SYSTEM_PROMPT },
      {
        role: 'user' as const,
        content: `今天是 ${date}。以下是今天的记录：\n\n${JSON.stringify(recordSummaries, null, 2)}\n\n请为这一天生成总结。只输出JSON，不要其他内容。`,
      },
    ];

    const result = await deepseekChat(messages);

    // Parse JSON response
    let summary;
    try {
      const cleaned = result
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/g, '')
        .trim();
      summary = JSON.parse(cleaned);
    } catch {
      summary = {
        content: result.trim(),
        highlights: [],
        suggestions: [],
      };
    }

    const dailySummary = {
      id: date,
      date,
      content: summary.content || '',
      highlights: summary.highlights || [],
      suggestions: summary.suggestions || [],
      generatedAt: Date.now(),
    };

    return Response.json({ summary: dailySummary });
  } catch (err) {
    console.error('Summarize API error:', err);
    return Response.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
