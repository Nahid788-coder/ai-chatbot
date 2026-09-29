import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Conversation, ConversationRow, Message, MessageRow } from '../types/chat';

const toConversation = (c: ConversationRow): Conversation => ({
  id: c.id,
  userId: c.user_id,
  title: c.title,
  modelId: c.model_id,
  modelName: c.model_name,
  createdAt: new Date(c.created_at),
  updatedAt: new Date(c.updated_at),
});

async function loadConversations(userId: string): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  if (error) {
    console.error(error);
    return [];
  }
  return ((data ?? []) as ConversationRow[]).map(toConversation);
}

export const useHistory = (userId: string | null) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    if (!userId) return;
    let alive = true;
    loadConversations(userId).then((list) => {
      if (alive) setConversations(list);
    });
    return () => {
      alive = false;
    };
  }, [userId]);

  const refresh = useCallback(async () => {
    if (!userId) return;
    setConversations(await loadConversations(userId));
  }, [userId]);

  const loadMessages = useCallback(async (conversationId: string): Promise<Message[]> => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    return ((data ?? []) as MessageRow[]).map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      timestamp: new Date(m.created_at),
      model: m.model ?? undefined,
    }));
  }, []);

  const renameConversation = useCallback(async (id: string, title: string) => {
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, title } : c)));
    await supabase.from('conversations').update({ title }).eq('id', id);
  }, []);

  const deleteConversation = useCallback(async (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    await supabase.from('conversations').delete().eq('id', id);
  }, []);

  return {
    conversations: userId ? conversations : [],
    refresh,
    loadMessages,
    renameConversation,
    deleteConversation,
  };
};
