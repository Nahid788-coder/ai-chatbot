import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Conversation, ConversationRow, Message, MessageRow } from '../types/chat';

export const toConversation = (c: ConversationRow): Conversation => ({
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

/** A saved conversation: a full row for a new chat, or just the changed fields for an existing one. */
export type ConversationPatch = Pick<Conversation, 'id'> & Partial<Conversation>;

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

  // After a message is saved we already know what changed, so the list is updated here
  // instead of loading every conversation from the database again.
  const upsertConversation = useCallback((conv: ConversationPatch) => {
    setConversations((prev) => {
      const old = prev.find((c) => c.id === conv.id);
      if (!old && !conv.title) return prev;
      return [{ ...old, ...conv } as Conversation, ...prev.filter((c) => c.id !== conv.id)];
    });
  }, []);

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
    upsertConversation,
    loadMessages,
    renameConversation,
    deleteConversation,
  };
};
