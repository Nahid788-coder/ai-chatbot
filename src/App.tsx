import { useEffect, useRef, useState } from 'react';
import { useAuth } from './context/AuthContext';
import { useChat } from './hooks/useChat';
import { useHistory } from './hooks/useHistory';
import { AI_MODELS } from './data/models';
import type { Conversation, Message } from './types/chat';
import ModelSelector from './components/ModelSelector';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import TypingIndicator from './components/TypingIndicator';
import LoginPage from './components/LoginPage';
import ConversationList from './components/ConversationList';
import './App.css';

function App() {
  const { user, loading: authLoading, logout } = useAuth();
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [shareMsg, setShareMsg] = useState('');

  const userId = user?.id ?? null;
  const userName = user?.user_metadata?.name ?? user?.email ?? 'User';
  const userEmail = user?.email ?? '';

  const { conversations, fetchConversations, loadMessages, deleteConversation } = useHistory(userId);
  const { state, streamingContent, sendMessage, selectModel, clearChat, startNewChat, loadConversation } =
    useChat(userId, fetchConversations);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages, state.loading, streamingContent]);

  const handleSelectConversation = async (conv: Conversation) => {
    const model = AI_MODELS.find((m) => m.id === conv.modelId) ?? AI_MODELS[2];
    const { messages } = await loadMessages(conv.id);
    loadConversation(messages, conv.id, model);
    setActiveConvId(conv.id);
  };

  const handleNewChat = () => {
    startNewChat();
    setActiveConvId(null);
  };

  const handleDelete = async (id: string) => {
    await deleteConversation(id);
    if (activeConvId === id) handleNewChat();
  };

  const handleRename = (_id: string, _newTitle: string) => {
    fetchConversations();
  };

  const handleShareChat = () => {
    const text = state.messages
      .map((m) => `${m.role === 'user' ? 'You' : 'AI'}: ${m.content}`)
      .join('\n\n');
    navigator.clipboard.writeText(text);
    setShareMsg('Chat copied to clipboard!');
    setTimeout(() => setShareMsg(''), 3000);
  };

  const isQuotaError = state.error?.startsWith('QUOTA_ERROR:');
  const errorDisplay = isQuotaError ? state.error?.replace('QUOTA_ERROR: ', '') : state.error;

  // Streaming message object for display
  const streamingMessage: Message | null = streamingContent
    ? { id: 'streaming', role: 'assistant', content: streamingContent, timestamp: new Date(), model: state.selectedModel.name }
    : null;

  if (authLoading) {
    return (
      <div className="app-loading">
        <div className="loading-dots"><span /><span /><span /></div>
      </div>
    );
  }

  if (!user) return <LoginPage />;

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <span>AI Chat</span>
        </div>

        <div className="user-info">
          <div className="user-avatar">{userName.charAt(0).toUpperCase()}</div>
          <div className="user-details">
            <div className="user-name">{userName}</div>
            <div className="user-email">{userEmail}</div>
          </div>
          <button className="logout-btn" onClick={logout} title="Logout">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>

        <button className="new-chat-btn" onClick={handleNewChat}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Chat
        </button>

        <div className="sidebar-section">
          <p className="sidebar-label">Select Model</p>
          <ModelSelector selected={state.selectedModel} onSelect={selectModel} />
        </div>

        <div className="sidebar-section" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <p className="sidebar-label">Chat History</p>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            <ConversationList
              conversations={conversations}
              activeId={activeConvId}
              onSelect={handleSelectConversation}
              onDelete={handleDelete}
              onRename={handleRename}
            />
          </div>
        </div>

        <div className="sidebar-footer">
          <span>{state.messages.length} messages in current chat</span>
        </div>
      </aside>

      <main className="chat-main">
        <div className="chat-header">
          <div className="chat-header-left">
            <span className="chat-model-emoji">{state.selectedModel.emoji}</span>
            <div>
              <div className="chat-model-name">{state.selectedModel.name}</div>
              <div className="chat-model-provider">{state.selectedModel.provider}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {state.messages.length > 0 && (
              <button className="clear-btn" onClick={handleShareChat} title="Copy chat to clipboard">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                  <polyline points="16 6 12 2 8 6"/>
                  <line x1="12" y1="2" x2="12" y2="15"/>
                </svg>
                {shareMsg || 'Share'}
              </button>
            )}
            <button className="clear-btn" onClick={() => { clearChat(); setActiveConvId(null); }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
              Clear
            </button>
          </div>
        </div>

        <div className="messages-area">
          {state.messages.length === 0 && !streamingContent && (
            <div className="empty-chat">
              <div className="empty-icon">{state.selectedModel.emoji}</div>
              <h2>Chat with {state.selectedModel.name}</h2>
              <p>{state.selectedModel.description}</p>
              <div className="suggestions">
                {['Explain quantum computing simply', 'Write a React TypeScript component', 'What is machine learning?'].map((s) => (
                  <button key={s} className="suggestion-btn" onClick={() => sendMessage(s)}>{s}</button>
                ))}
              </div>
            </div>
          )}

          {state.messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}

          {/* Streaming message */}
          {streamingMessage && (
            <ChatMessage message={streamingMessage} isStreaming={true} />
          )}

          {/* Typing indicator only before first chunk */}
          {state.loading && !streamingContent && <TypingIndicator />}

          {state.error && (
            <div className="error-msg">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>{errorDisplay}</span>
              {isQuotaError && state.messages.length > 0 && (
                <button className="share-quota-btn" onClick={handleShareChat}>
                  📋 Copy chat before switching model
                </button>
              )}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <ChatInput onSend={sendMessage} loading={state.loading} />
      </main>
    </div>
  );
}

export default App;
