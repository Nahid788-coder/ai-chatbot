import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Conversation } from '../types/chat';

interface Props {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (conv: Conversation) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
}

const ConversationList = ({ conversations, activeId, onSelect, onDelete, onRename }: Props) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const startEdit = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditValue(conv.title);
  };

  const saveEdit = async (id: string) => {
    const trimmed = editValue.trim();
    if (trimmed) {
      await supabase.from('conversations').update({ title: trimmed }).eq('id', id);
      onRename(id, trimmed);
    }
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') saveEdit(id);
    if (e.key === 'Escape') setEditingId(null);
  };

  if (conversations.length === 0) {
    return <p className="no-history">No chats yet. Start a conversation!</p>;
  }

  return (
    <div className="conv-list">
      {conversations.map((conv) => (
        <div
          key={conv.id}
          className={`conv-item ${conv.id === activeId ? 'active' : ''}`}
          onClick={() => editingId !== conv.id && onSelect(conv)}
        >
          <span className="conv-emoji">{conv.modelEmoji}</span>
          <div className="conv-info">
            {editingId === conv.id ? (
              <input
                className="conv-rename-input"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => saveEdit(conv.id)}
                onKeyDown={(e) => handleKeyDown(e, conv.id)}
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
            ) : (
              <div
                className="conv-title"
                onDoubleClick={(e) => startEdit(conv, e)}
                title="Double-click to rename"
              >
                {conv.title}
              </div>
            )}
            <div className="conv-meta">{conv.modelName} · {conv.updatedAt.toLocaleDateString()}</div>
          </div>
          <div className="conv-actions">
            <button
              className="conv-action-btn"
              onClick={(e) => { e.stopPropagation(); startEdit(conv, e); }}
              title="Rename"
            >
              ✎
            </button>
            <button
              className="conv-del-btn"
              onClick={(e) => { e.stopPropagation(); onDelete(conv.id); }}
              title="Delete"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ConversationList;
