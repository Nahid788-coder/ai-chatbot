import type { Conversation } from '../types/chat';

interface Props {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (conv: Conversation) => void;
  onDelete: (id: string) => void;
}

const ConversationList = ({ conversations, activeId, onSelect, onDelete }: Props) => {
  if (conversations.length === 0) {
    return <p className="no-history">No chats yet. Start a conversation!</p>;
  }

  return (
    <div className="conv-list">
      {conversations.map((conv) => (
        <div
          key={conv.id}
          className={`conv-item ${conv.id === activeId ? 'active' : ''}`}
          onClick={() => onSelect(conv)}
        >
          <span className="conv-emoji">{conv.modelEmoji}</span>
          <div className="conv-info">
            <div className="conv-title">{conv.title}</div>
            <div className="conv-meta">{conv.modelName} · {conv.updatedAt.toLocaleDateString()}</div>
          </div>
          <button
            className="conv-del-btn"
            onClick={(e) => { e.stopPropagation(); onDelete(conv.id); }}
            title="Delete"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};

export default ConversationList;
