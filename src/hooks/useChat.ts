import { useCallback, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { streamChat } from '../api/chat';
import type { AIModel, ChatState, Message } from '../types/chat';

const QUOTA = /quota|rate.?limit|429|limit exceeded|too many requests/i;

export const useChat = (userId: string | null, model: AIModel, onSaved?: () => void) => {
  const [state, setState] = useState<ChatState>({ messages: [], loading: false, error: null });
  const [streamingContent, setStreamingContent] = useState('');

  const messagesRef = useRef<Message[]>([]);
  const loadingRef = useRef(false);
  const conversationIdRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const setMessages = (messages: Message[]) => {
    messagesRef.current = messages;
    setState((prev) => ({ ...prev, messages }));
  };

  const reset = useCallback(() => {
    abortRef.current?.abort();
    conversationIdRef.current = null;
    messagesRef.current = [];
    loadingRef.current = false;
    setState({ messages: [], loading: false, error: null });
    setStreamingContent('');
  }, []);

  const loadConversation = useCallback((messages: Message[], convId: string) => {
    abortRef.current?.abort();
    conversationIdRef.current = convId;
    messagesRef.current = messages;
    loadingRef.current = false;
    setState({ messages, loading: false, error: null });
    setStreamingContent('');
  }, []);

  const save = useCallback(
    async (userMessage: Message, reply: string) => {
      if (!userId) return;
      let convId = conversationIdRef.current;

      if (!convId) {
        const text = userMessage.content;
        const title = text.slice(0, 60) + (text.length > 60 ? '…' : '');
        const { data, error } = await supabase
          .from('conversations')
          .insert({ user_id: userId, title, model_id: model.id, model_name: model.name, model_emoji: '✦' })
          .select()
          .single();
        if (error) throw error;
        convId = data.id as string;
        conversationIdRef.current = convId;
      } else {
        await supabase
          .from('conversations')
          .update({ updated_at: new Date().toISOString(), model_id: model.id, model_name: model.name })
          .eq('id', convId);
      }

      await supabase.from('messages').insert([
        { conversation_id: convId, role: 'user', content: userMessage.content },
        { conversation_id: convId, role: 'assistant', content: reply, model: model.name },
      ]);
      onSaved?.();
    },
    [userId, model, onSaved],
  );

  const sendMessage = useCallback(
    async (content: string) => {
      const text = content.trim();
      if (!text || loadingRef.current) return;

      const userMessage: Message = { id: crypto.randomUUID(), role: 'user', content: text, timestamp: new Date() };
      const history = [...messagesRef.current, userMessage];
      loadingRef.current = true;
      messagesRef.current = history;
      setState({ messages: history, loading: true, error: null });
      setStreamingContent('');

      const controller = new AbortController();
      abortRef.current = controller;
      let reply = '';

      try {
        reply = await streamChat(
          model,
          history,
          (t) => {
            reply = t;
            setStreamingContent(t);
          },
          controller.signal,
        );
      } catch (err) {
        const aborted = controller.signal.aborted;
        if (!aborted || !reply) {
          loadingRef.current = false;
          setStreamingContent('');
          if (aborted) {
            setState((prev) => ({ ...prev, loading: false }));
            return;
          }
          const msg = (err as Error)?.message || 'Failed to get a response.';
          setState((prev) => ({ ...prev, loading: false, error: QUOTA.test(msg) ? `QUOTA:${msg}` : msg }));
          return;
        }
        // Stopped by the user after some text arrived: keep what we have.
      }

      loadingRef.current = false;
      setStreamingContent('');

      const assistant: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: reply || '_(empty response)_',
        timestamp: new Date(),
        model: model.name,
      };
      // Only append if this conversation was not reset mid-stream.
      if (messagesRef.current === history) {
        setMessages([...history, assistant]);
        setState((prev) => ({ ...prev, loading: false }));
        try {
          await save(userMessage, assistant.content);
        } catch (e) {
          console.error('Could not save chat', e);
        }
      } else {
        setState((prev) => ({ ...prev, loading: false }));
      }
    },
    [model, save],
  );

  const stop = useCallback(() => abortRef.current?.abort(), []);

  const retry = useCallback(() => {
    const msgs = messagesRef.current;
    const last = msgs[msgs.length - 1];
    if (!last || last.role !== 'user') return;
    messagesRef.current = msgs.slice(0, -1);
    setState((prev) => ({ ...prev, messages: messagesRef.current, error: null }));
    sendMessage(last.content);
  }, [sendMessage]);

  const dismissError = useCallback(() => setState((prev) => ({ ...prev, error: null })), []);

  return { state, streamingContent, sendMessage, stop, retry, reset, loadConversation, dismissError };
};
