import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from './context/auth';
import { useChat } from './hooks/useChat';
import { useHistory } from './hooks/useHistory';
import { useModels } from './hooks/useModels';
import { useTheme } from './hooks/useTheme';
import { pickDefault } from './data/models';
import type { AIModel, Conversation, Message } from './types/chat';
import Sidebar from './components/Sidebar';
import ModelSelector from './components/ModelSelector';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import TypingIndicator from './components/TypingIndicator';
import LoginPage from './components/LoginPage';
import EmptyState from './components/EmptyState';
import { LogoMark } from './components/Logo';
import { IconAlert, IconCheck, IconClose, IconMenu, IconPlus, IconRefresh, IconShare } from './components/Icons';
import './App.css';

const MODEL_KEY = 'aurora-model';
const readSavedModel = () => {
  try {
    return localStorage.getItem(MODEL_KEY);
  } catch {
    return null;
  }
};

function App() {
  const { user, loading: authLoading, logout } = useAuth();
  const { theme, toggle: toggleTheme } = useTheme();
  const { models } = useModels();

  const [modelKey, setModelKey] = useState<string | null>(readSavedModel);
  const model: AIModel = models.find((m) => `${m.provider}:${m.id}` === modelKey) ?? pickDefault(models);

  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [shared, setShared] = useState(false);

  const userId = user?.id ?? null;
  const userName: string = user?.user_metadata?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'there';
  const userEmail = user?.email ?? '';

  const { conversations, refresh, loadMessages, renameConversation, deleteConversation } = useHistory(userId);
  const { state, streamingContent, sendMessage, stop, retry, reset, loadConversation, dismissError } = useChat(
    userId,
    model,
    refresh,
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);

  useEffect(() => {
    const el = scrollRef.current;
    if (el && stickToBottom.current) el.scrollTop = el.scrollHeight;
  }, [state.messages, state.loading, streamingContent]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (el) stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
  };

  const selectModel = (m: AIModel) => {
    const key = `${m.provider}:${m.id}`;
    setModelKey(key);
    try {
      localStorage.setItem(MODEL_KEY, key);
    } catch {
      /* storage blocked */
    }
  };

  const newChat = useCallback(() => {
    reset();
    setActiveConvId(null);
    setSidebarOpen(false);
    stickToBottom.current = true;
  }, [reset]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        newChat();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [newChat]);

  const openConversation = async (conv: Conversation) => {
    setSidebarOpen(false);
    const messages = await loadMessages(conv.id);
    const m = models.find((x) => x.id === conv.modelId);
    if (m) selectModel(m);
    stickToBottom.current = true;
    loadConversation(messages, conv.id);
    setActiveConvId(conv.id);
  };

  const removeConversation = async (id: string) => {
    await deleteConversation(id);
    if (activeConvId === id) newChat();
  };

  const shareChat = () => {
    const text = state.messages.map((m) => `${m.role === 'user' ? 'You' : m.model || 'AI'}: ${m.content}`).join('\n\n');
    navigator.clipboard?.writeText(text).then(() => {
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    });
  };

  if (authLoading) {
    return (
      <div className="splash">
        <LogoMark size={48} />
        <div className="typing"><span /><span /><span /></div>
      </div>
    );
  }

  if (!user) return <LoginPage theme={theme} onToggleTheme={toggleTheme} />;

  const streamingMessage: Message | null = streamingContent
    ? { id: 'streaming', role: 'assistant', content: streamingContent, timestamp: new Date(), model: model.name }
    : null;

  const isQuota = state.error?.startsWith('QUOTA:');
  const errorText = isQuota ? state.error!.slice(6) : state.error;
  const empty = state.messages.length === 0 && !streamingContent;

  return (
    <div className="app">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userName={userName}
        userEmail={userEmail}
        conversations={conversations}
        activeId={activeConvId}
        onNewChat={newChat}
        onSelect={openConversation}
        onDelete={removeConversation}
        onRename={renameConversation}
        onLogout={logout}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main className="main">
        <header className="topbar">
          <button className="icon-btn only-mobile" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <IconMenu />
          </button>
          <ModelSelector models={models} selected={model} onSelect={selectModel} />
          <div className="topbar-actions">
            {state.messages.length > 0 && (
              <button className="ghost-btn" onClick={shareChat} title="Copy the whole chat">
                {shared ? <IconCheck size={16} /> : <IconShare size={16} />}
                <span className="hide-sm">{shared ? 'Copied' : 'Share'}</span>
              </button>
            )}
            <button className="icon-btn only-mobile" onClick={newChat} aria-label="New chat">
              <IconPlus />
            </button>
          </div>
        </header>

        <div className="scroll" ref={scrollRef} onScroll={onScroll}>
          <div className={`thread ${empty ? 'is-empty' : ''}`}>
            {empty ? (
              <EmptyState name={userName} modelName={model.name} onPick={sendMessage} />
            ) : (
              <>
                {state.messages.map((msg) => (
                  <ChatMessage key={msg.id} message={msg} />
                ))}
                {streamingMessage && <ChatMessage message={streamingMessage} isStreaming />}
                {state.loading && !streamingContent && <TypingIndicator label={model.name} />}
              </>
            )}

            {errorText && (
              <div className="error-card" role="alert">
                <IconAlert size={18} />
                <div className="error-text">
                  <strong>{isQuota ? 'This model is busy or out of quota' : 'Something went wrong'}</strong>
                  <span>{errorText}</span>
                  {isQuota && <span>Pick another model from the menu above and try again.</span>}
                </div>
                <div className="error-actions">
                  <button className="ghost-btn small" onClick={retry}>
                    <IconRefresh size={14} /> Retry
                  </button>
                  <button className="icon-btn small" onClick={dismissError} aria-label="Dismiss">
                    <IconClose size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <ChatInput onSend={sendMessage} onStop={stop} loading={state.loading} modelName={model.name} />
      </main>
    </div>
  );
}

export default App;
