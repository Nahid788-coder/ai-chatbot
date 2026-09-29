import type { AIModel, Provider } from '../types/chat';

export const PROVIDERS: Record<Provider, { label: string; color: string }> = {
  groq: { label: 'Groq', color: '#F97354' },
  gemini: { label: 'Gemini', color: '#5B8CFF' },
  openrouter: { label: 'OpenRouter', color: '#A78BFA' },
};

/**
 * Used until /api/models answers (or if it fails).
 * The live list from the server replaces this, so retired models disappear on their own.
 */
export const FALLBACK_MODELS: AIModel[] = [
  { id: 'openai/gpt-oss-120b', name: 'GPT OSS 120B', provider: 'groq' },
  { id: 'openai/gpt-oss-20b', name: 'GPT OSS 20B', provider: 'groq' },
  { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant', provider: 'groq' },
  { id: 'gemini-flash-latest', name: 'Gemini Flash (latest)', provider: 'gemini' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'gemini' },
];

/** Preferred default, first one that is actually available wins. */
export const PREFERRED = ['openai/gpt-oss-120b', 'llama-3.3-70b-versatile', 'gemini-2.5-flash'];

export const pickDefault = (models: AIModel[]): AIModel =>
  PREFERRED.map((id) => models.find((m) => m.id === id)).find(Boolean) ?? models[0] ?? FALLBACK_MODELS[0];
