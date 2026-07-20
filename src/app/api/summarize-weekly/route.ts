// ============================================================
// POST /api/summarize-weekly — Generate weekly summary
// ============================================================

import { NextRequest } from 'next/server';
import { deepseekChat } from '@/lib/deepseek';
import { WEEKLY_SUMMARY_PROMPT } from '@/lib/prompts';

interface RecordInput {
  content: string;
  categories: string[];
  timestamp: number;
}

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { weekStart, weekEnd, records } = await request.json();

    if (!weekStart || !weekEnd) {
      return Response.json({ error: 'Week range required' }, { status: 400 });
    }

    if (!Array.isArray(records) || records.length === 0) {
      return Response.json(
        { error: 'No records for this week' },
        { status: 404 }
      );
    }

    const summaries = records.map((r: RecordInput) => ({
      time: new Date(r.timestamp).toLocaleDateString('zh-CN', {
        month: 'short', day: 'numeric', weekday: 'short',
      }),
      content: r.content,
      categories: r.categories,
    }));

    const messages = [
      { role: 'system' as const, content: WEEKLY_SUMMARY_PROMPT },
      {
        role: 'user' as const,
        content: `这是 ${weekStart} 到 ${weekEnd} 这一周的记录：\n\n${JSON.stringify(summaries, null, 2)}\n\n请为这一周生成总结。只输出JSON，不要其他内容。`,
      },
    ];

    const result = await deepseekChat(messages);
    let summary;
    try {
      const cleaned = result.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
      summary = JSON.parse(cleaned);
    } catch {
      summary = { content: result.trim(), highlights: [], suggestions: [] };
    }

    return Response.json({
      summary: {
        content: summary.content || '',
        highlights: summary.highlights || [],
        suggestions: summary.suggestions || [],
        recordCount: records.length,
      },
    });
  } catch (err) {
    console.error('Weekly summary API error:', err);
    return Response.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
