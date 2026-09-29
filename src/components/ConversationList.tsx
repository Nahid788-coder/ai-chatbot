import { useState } from 'react';
import type { KeyboardEvent, MouseEvent } from 'react';
import type { Conversation } from '../types/chat';
import { IconEdit, IconTrash } from './Icons';

interface Props {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (conv: Conversation) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
}

const DAY = 86_400_000;
const groupOf = (d: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const t = today.getTime();
  const x = d.getTime();
  if (x >= t) return 'Today';
  if (x >= t - DAY) return 'Yesterday';
  if (x >= t - 7 * DAY) return 'Previous 7 days';
  if (x >= t - 30 * DAY) return 'Previous 30 days';
  return 'Older';
};

const ConversationList = ({ conversations, activeId, onSelect, onDelete, onRename }: Props) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [confirmId, setConfirmId] = useState<string | null>(null);

  if (conversations.length === 0) {
    return <p className="history-empty">Your chats will appear here.</p>;
  }

  const startEdit = (c: Conversation, e: MouseEvent) => {
    e.stopPropagation();
    setEditingId(c.id);
    setDraft(c.title);
  };

  const commit = (id: string) => {
    const t = draft.trim();
    if (t) onRename(id, t);
    setEditingId(null);
  };

  const onKey = (e: KeyboardEvent, id: string) => {
    if (e.key === 'Enter') commit(id);
    if (e.key === 'Escape') setEditingId(null);
  };

  const groups: [string, Conversation[]][] = [];
  for (const c of conversations) {
    const g = groupOf(c.updatedAt);
    const last = groups[groups.length - 1];
    if (last && last[0] === g) last[1].push(c);
    else groups.push([g, [c]]);
  }

  return (
    <nav className="history" aria-label="Chat history">
      {groups.map(([label, items]) => (
        <div key={label} className="history-group">
          <p className="history-label">{label}</p>
          {items.map((c) => (
            <div
              key={c.id}
              className={`history-item ${c.id === activeId ? 'active' : ''}`}
              onClick={() => editingId !== c.id && onSelect(c)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && editingId !== c.id && onSelect(c)}
              title={c.title}
            >
              {editingId === c.id ? (
                <input
                  className="history-rename"
                  value={draft}
                  autoFocus
                  onChange={(e) => setDraft(e.target.value)}
                  onBlur={() => commit(c.id)}
                  onKeyDown={(e) => onKey(e, c.id)}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="history-title" onDoubleClick={(e) => startEdit(c, e)}>
                  {c.title}
                </span>
              )}

              {confirmId === c.id ? (
                <span className="history-confirm" onClick={(e) => e.stopPropagation()}>
                  <button className="danger" onClick={() => { onDelete(c.id); setConfirmId(null); }}>Delete</button>
                  <button onClick={() => setConfirmId(null)}>Cancel</button>
                </span>
              ) : (
                editingId !== c.id && (
                  <span className="history-actions">
                    <button onClick={(e) => startEdit(c, e)} title="Rename" aria-label="Rename">
                      <IconEdit size={14} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setConfirmId(c.id); }}
                      title="Delete"
                      aria-label="Delete"
                    >
                      <IconTrash size={14} />
                    </button>
                  </span>
                )
              )}
            </div>
          ))}
        </div>
      ))}
    </nav>
  );
};

export default ConversationList;
