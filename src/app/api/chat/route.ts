// ============================================================
// POST /api/chat — Chat completions with streaming + classification
// ============================================================

import { NextRequest } from 'next/server';
import { deepseekChatStream } from '@/lib/deepseek';
import { buildChatSystemPrompt } from '@/lib/prompts';
import { parseClassification } from '@/lib/classifier';
import { getRelevantMemories, extractAndStoreMemories } from '@/lib/memory';
import { uuid } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const { message, history = [] } = await request.json();

    if (!message || typeof message !== 'string') {
      return Response.json({ error: 'Message is required' }, { status: 400 });
    }

    // 1. Retrieve relevant memories
    const memories = await getRelevantMemories(message);

    // 2. Build system prompt with memory context
    const systemPrompt = buildChatSystemPrompt(memories);

    // 3. Build messages array
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...history.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user' as const, content: message },
    ];

    // 4. Generate a unique message ID for this AI response
    const aiMsgId = uuid();

    // 5. Set up SSE stream
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        // Send the message ID first
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ msgId: aiMsgId })}\n\n`)
        );

        try {
          let fullText = '';

          await deepseekChatStream(messages, (chunk) => {
            fullText += chunk;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ token: chunk })}\n\n`)
            );
          });

          // 6. Parse classification from the full response
          const { cleanText, categories, feedback } = parseClassification(fullText);

          // 7. Send final event with categories
          // If the classification was stripped, the clean text is what the user sees
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                done: true,
                fullText: cleanText || fullText,
                categories,
                feedback,
              })}\n\n`
            )
          );

          // 8. Non-blocking: extract memories in the background
          // Fire and forget — don't block the response
          extractAndStoreMemories(message, cleanText || fullText).catch(err =>
            console.warn('Background memory extraction failed:', err)
          );
        } catch (err) {
          console.error('Stream error:', err);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                error: err instanceof Error ? err.message : 'Stream failed',
              })}\n\n`
            )
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (err) {
    console.error('Chat API error:', err);
    return Response.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
