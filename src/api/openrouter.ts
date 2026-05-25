import axios from 'axios';
import type { Message } from '../types/chat';

const OPENROUTER_KEY = import.meta.env.VITE_OPENROUTER_KEY;

export const sendOpenRouterMessage = async (
  messages: Message[],
  modelId: string
): Promise<string> => {
  const response = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      model: modelId,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    },
    {
      headers: {
        Authorization: `Bearer ${OPENROUTER_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://github.com/Nahid788-coder',
        'X-Title': 'AI Chatbot',
      },
    }
  );

  return response.data.choices[0].message.content;
};
