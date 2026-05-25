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
  provider: 'gemini' | 'groq' | 'openrouter';
  description: string;
  color: string;
  emoji: string;
}

export interface ChatState {
  messages: Message[];
  loading: boolean;
  error: string | null;
  selectedModel: AIModel;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  modelId: string;
  modelName: string;
  modelEmoji: string;
  createdAt: Date;
  updatedAt: Date;
}
