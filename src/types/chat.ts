export type Provider = 'gemini' | 'groq' | 'openrouter';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  model?: string;
}

export interface AIModel {
  id: string;
  name: string;
  provider: Provider;
  context?: number;
}

export interface ChatState {
  messages: Message[];
  loading: boolean;
  error: string | null;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  modelId: string;
  modelName: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Row shapes as stored in Supabase. */
export interface ConversationRow {
  id: string;
  user_id: string;
  title: string;
  model_id: string;
  model_name: string;
  model_emoji?: string | null;
  created_at: string;
  updated_at: string;
}

export interface MessageRow {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  model?: string | null;
  created_at: string;
}
