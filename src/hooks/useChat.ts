import { useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { Message, AIModel, ChatState } from '../types/chat';
import { sendGeminiMessage } from '../api/gemini';
import { sendGroqMessage } from '../api/groq';
import { sendOpenRouterMessage } from '../api/openrouter';
import { AI_MODELS } from '../data/models';

export const useChat = (userId: string | null, onConversationSaved?: () => void) => {
  const [state, setState] = useState<ChatState>({
    messages: [],
    loading: false,
    error: null,
    selectedModel: AI_MODELS[2],
  });

  const conversationIdRef = useRef<string | null>(null);

  const startNewChat = useCallback(() => {
    conversationIdRef.current = null;
    setState((prev) => ({ ...prev, messages: [], error: null }));
  }, []);

  const loadConversation = useCallback((messages: Message[], convId: string, model: AIModel) => {
    conversationIdRef.current = convId;
    setState((prev) => ({ ...prev, messages, selectedModel: model, error: null }));
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || state.loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      loading: true,
      error: null,
    }));

    try {
      const allMessages = [...state.messages, userMessage];
      const { provider, id: modelId } = state.selectedModel;

      let responseText = '';
      if (provider === 'gemini') {
        responseText = await sendGeminiMessage(allMessages, modelId);
      } else if (provider === 'groq') {
        responseText = await sendGroqMessage(allMessages, modelId);
      } else {
        responseText = await sendOpenRouterMessage(allMessages, modelId);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText,
        timestamp: new Date(),
        model: state.selectedModel.name,
      };

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        loading: false,
      }));

      // Save to Supabase if logged in
      if (userId) {
        let convId = conversationIdRef.current;

        if (!convId) {
          // Create new conversation
          const title = content.trim().slice(0, 60) + (content.length > 60 ? '...' : '');
          const { data: conv, error } = await supabase
            .from('conversations')
            .insert({
              user_id: userId,
              title,
              model_id: state.selectedModel.id,
              model_name: state.selectedModel.name,
              model_emoji: state.selectedModel.emoji,
            })
            .select()
            .single();

          if (error) throw error;
          convId = conv.id;
          conversationIdRef.current = convId;
        } else {
          // Update timestamp
          await supabase
            .from('conversations')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', convId);
        }

        // Save messages
        await supabase.from('messages').insert([
          { conversation_id: convId, role: 'user', content: userMessage.content },
          { conversation_id: convId, role: 'assistant', content: responseText, model: state.selectedModel.name },
        ]);

        onConversationSaved?.();
      }
    } catch (err: any) {
      console.error('Error:', err?.response?.data || err?.message || err);
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        'Failed to get response.';
      setState((prev) => ({ ...prev, loading: false, error: `Error: ${msg}` }));
    }
  }, [state, userId, onConversationSaved]);

  const selectModel = useCallback((model: AIModel) => {
    setState((prev) => ({ ...prev, selectedModel: model, error: null }));
  }, []);

  const clearChat = useCallback(() => {
    conversationIdRef.current = null;
    setState((prev) => ({ ...prev, messages: [], error: null }));
  }, []);

  return { state, sendMessage, selectModel, clearChat, startNewChat, loadConversation };
};
