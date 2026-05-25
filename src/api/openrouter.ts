import type { Message } from '../types/chat';

const OPENROUTER_KEY = import.meta.env.VITE_OPENROUTER_KEY;

export const sendOpenRouterMessage = async (
  messages: Message[],
  modelId: string,
  onChunk: (content: string) => void
): Promise<string> => {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://github.com/Nahid788-coder',
      'X-Title': 'AI Chatbot',
    },
    body: JSON.stringify({
      model: modelId,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      stream: true,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || `OpenRouter error ${response.status}`);
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
      const data = line.slice(6);
      if (data === '[DONE]') continue;
      try {
        const parsed = JSON.parse(data);
        const delta = parsed.choices[0]?.delta?.content || '';
        if (delta) {
          fullContent += delta;
          onChunk(fullContent);
        }
      } catch {}
    }
  }

  return fullContent;
};
