import type { Message } from '../types/chat';

const GEMINI_KEY = import.meta.env.VITE_GEMINI_KEY;

export const sendGeminiMessage = async (
  messages: Message[],
  modelId: string,
  onChunk: (content: string) => void
): Promise<string> => {
  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:streamGenerateContent?alt=sse&key=${GEMINI_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents }),
    }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || `Gemini error ${response.status}`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let fullContent = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    for (const line of chunk.split('\n')) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6).trim();
      if (!data) continue;
      try {
        const parsed = JSON.parse(data);
        const delta = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (delta) {
          fullContent += delta;
          onChunk(fullContent);
        }
      } catch {}
    }
  }

  return fullContent;
};
