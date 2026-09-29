import { useState } from 'react';
import type { Conversation } from '../types/chat';
import type { Theme } from '../hooks/useTheme';
import ConversationList from './ConversationList';
import { Logo } from './Logo';
import { IconClose, IconLogout, IconMoon, IconPlus, IconSearch, IconSun } from './Icons';

interface Props {
  open: boolean;
  onClose: () => void;
  userName: string;
  userEmail: string;
  conversations: Conversation[];
  activeId: string | null;
  onNewChat: () => void;
  onSelect: (c: Conversation) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onLogout: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}

const Sidebar = (p: Props) => {
  const [query, setQuery] = useState('');
  const list = query
    ? p.conversations.filter((c) => c.title.toLowerCase().includes(query.toLowerCase()))
    : p.conversations;

  return (
    <>
      <div className={`scrim ${p.open ? 'show' : ''}`} onClick={p.onClose} aria-hidden />
      <aside className={`sidebar ${p.open ? 'open' : ''}`}>
        <div className="sidebar-top">
          <Logo size={30} />
          <button className="icon-btn only-mobile" onClick={p.onClose} aria-label="Close menu">
            <IconClose />
          </button>
        </div>

        <button className="new-chat" onClick={p.onNewChat}>
          <IconPlus size={17} />
          New chat
          <kbd className="new-chat-kbd">Ctrl K</kbd>
        </button>

        <label className="search">
          <IconSearch size={15} />
          <input placeholder="Search chats" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>

        <div className="sidebar-scroll">
          <ConversationList
            conversations={list}
            activeId={p.activeId}
            onSelect={p.onSelect}
            onDelete={p.onDelete}
            onRename={p.onRename}
          />
        </div>

        <div className="sidebar-foot">
          <div className="user-card">
            <div className="avatar">{p.userName.charAt(0).toUpperCase()}</div>
            <div className="user-text">
              <span className="user-name">{p.userName}</span>
              <span className="user-email">{p.userEmail}</span>
            </div>
            <button className="icon-btn" onClick={p.onToggleTheme} title="Toggle theme" aria-label="Toggle theme">
              {p.theme === 'dark' ? <IconSun size={17} /> : <IconMoon size={17} />}
            </button>
            <button className="icon-btn danger-hover" onClick={p.onLogout} title="Log out" aria-label="Log out">
              <IconLogout size={17} />
            </button>
          </div>
          <a className="credit" href="https://portfolio-coral-nu-78.vercel.app" target="_blank" rel="noreferrer">
            Built by Nahid Husain Doi
          </a>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
