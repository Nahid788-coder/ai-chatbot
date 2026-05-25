import { useState, useRef, useEffect } from 'react';
import type { KeyboardEvent } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  loading: boolean;
}

const ChatInput = ({ onSend, loading }: ChatInputProps) => {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px';
    }
  }, [value]);

  const handleSend = () => {
    if (!value.trim() || loading) return;
    onSend(value.trim());
    setValue('');
  };

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-input-wrap">
      <div className="chat-input-inner">
        <textarea
          ref={textareaRef}
          className="chat-textarea"
          placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKey}
          disabled={loading}
          rows={1}
        />
        <button
          className="send-btn"
          onClick={handleSend}
          disabled={loading || !value.trim()}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>
      <p className="input-hint">Enter to send · Shift+Enter for new line</p>
    </div>
  );
};

export default ChatInput;
