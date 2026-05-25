import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Conversation, Message } from '../types/chat';

export const useHistory = (userId: string | null) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const fetchConversations = useCallback(async () => {
    if (!userId) { setConversations([]); return; }

    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) { console.error(error); return; }

    setConversations(
      (data ?? []).map((c: any) => ({
        id: c.id,
        userId: c.user_id,
        title: c.title,
        modelId: c.model_id,
        modelName: c.model_name,
        modelEmoji: c.model_emoji ?? '🤖',
        createdAt: new Date(c.created_at),
        updatedAt: new Date(c.updated_at),
      }))
    );
  }, [userId]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const loadMessages = useCallback(async (conversationId: string): Promise<{ messages: Message[]; modelId: string; modelName: string; modelEmoji: string }> => {
    const { data: conv } = await supabase
      .from('conversations')
      .select('model_id, model_name, model_emoji')
      .eq('id', conversationId)
      .single();

    const { data: msgs } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    const messages: Message[] = (msgs ?? []).map((m: any) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      timestamp: new Date(m.created_at),
      model: m.model,
    }));

    return {
      messages,
      modelId: conv?.model_id ?? '',
      modelName: conv?.model_name ?? '',
      modelEmoji: conv?.model_emoji ?? '🤖',
    };
  }, []);

  const deleteConversation = useCallback(async (conversationId: string) => {
    await supabase.from('conversations').delete().eq('id', conversationId);
    setConversations((prev) => prev.filter((c) => c.id !== conversationId));
  }, []);

  return { conversations, fetchConversations, loadMessages, deleteConversation };
};
