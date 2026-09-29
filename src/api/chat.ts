import type { AIModel, Message } from '../types/chat';

const ERROR_MARK = '[[error]]';

/**
 * Streams a reply through our own /api/chat function.
 * API keys stay on the server; the browser only ever sees the text.
 */
export async function streamChat(
  model: AIModel,
  messages: Message[],
  onText: (fullText: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    signal,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      provider: model.provider,
      model: model.id,
      messages: messages.map(({ role, content }) => ({ role, content })),
    }),
  });

  if (!res.ok || !res.body) {
    let msg = `Request failed (${res.status})`;
    try {
      const j = await res.json();
      msg = j.error || msg;
    } catch {
      /* not JSON */
    }
    throw new Error(msg);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let text = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    text += decoder.decode(value, { stream: true });
    const cut = text.indexOf(ERROR_MARK);
    if (cut !== -1) throw new Error(text.slice(cut + ERROR_MARK.length).trim() || 'Stream interrupted');
    onText(text);
  }
  text += decoder.decode();
  return text;
}

export async function fetchModels(): Promise<AIModel[]> {
  const res = await fetch('/api/models');
  if (!res.ok) throw new Error(`models ${res.status}`);
  const { models } = (await res.json()) as { models: AIModel[] };
  return models;
}
