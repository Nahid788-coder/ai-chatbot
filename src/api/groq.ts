import axios from 'axios';
import type { Message } from '../types/chat';

const GROQ_KEY = import.meta.env.VITE_GROQ_KEY;

export const sendGroqMessage = async (
  messages: Message[],
  modelId: string
): Promise<string> => {
  const response = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model: modelId,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      max_tokens: 1024,
    },
    {
      headers: {
        Authorization: `Bearer ${GROQ_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data.choices[0].message.content;
};
