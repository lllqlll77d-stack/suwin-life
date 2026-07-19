// ============================================================
// DeepSeek API Client
// ============================================================

const DEEPSEEK_BASE = 'https://api.deepseek.com';
const MODEL = 'deepseek-chat';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

function getApiKey(): string {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key || key === 'placeholder') {
    throw new Error('DEEPSEEK_API_KEY is not configured. Add it to .env.local');
  }
  return key;
}

// ---- Non-streaming call (used for classification + summary) ----
export async function deepseekChat(messages: Message[]): Promise<string> {
  const apiKey = getApiKey();

  const response = await fetch(`${DEEPSEEK_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`DeepSeek API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content ?? '';
}

// ---- Streaming call (used for main chat response) ----
export async function deepseekChatStream(
  messages: Message[],
  onChunk: (chunk: string) => void
): Promise<string> {
  const apiKey = getApiKey();

  const response = await fetch(`${DEEPSEEK_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 2048,
      stream: true,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`DeepSeek API error (${response.status}): ${errText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body reader available');

  const decoder = new TextDecoder();
  let fullText = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data: ')) continue;

      const dataStr = trimmed.slice(6);
      if (dataStr === '[DONE]') continue;

      try {
        const parsed = JSON.parse(dataStr);
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) {
          fullText += delta;
          onChunk(delta);
        }
      } catch {
        // Skip malformed JSON lines
      }
    }
  }

  return fullText;
}
