import axios from 'axios';
import type { Message } from '../types/chat';

const GEMINI_KEY = import.meta.env.VITE_GEMINI_KEY;

export const sendGeminiMessage = async (
  messages: Message[],
  modelId: string
): Promise<string> => {
  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${GEMINI_KEY}`,
    { contents }
  );

  return response.data.candidates[0].content.parts[0].text;
};
