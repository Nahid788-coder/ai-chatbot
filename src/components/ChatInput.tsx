import { useLayoutEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { IconSend, IconStop } from './Icons';

interface Props {
  onSend: (message: string) => void;
  onStop: () => void;
  loading: boolean;
  modelName: string;
}

const ChatInput = ({ onSend, onStop, loading, modelName }: Props) => {
  const [value, setValue] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 200) + 'px';
  }, [value]);

  const send = () => {
    if (!value.trim() || loading) return;
    onSend(value);
    setValue('');
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="composer-wrap">
      <div className="composer">
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKey}
          placeholder={`Message ${modelName}…`}
          rows={1}
          aria-label="Message"
          autoFocus
        />
        {loading ? (
          <button className="send-btn stop" onClick={onStop} title="Stop generating" aria-label="Stop">
            <IconStop size={18} />
          </button>
        ) : (
          <button className="send-btn" onClick={send} disabled={!value.trim()} title="Send" aria-label="Send">
            <IconSend size={18} />
          </button>
        )}
      </div>
      <p className="composer-hint">
        <kbd>Enter</kbd> to send · <kbd>Shift</kbd>+<kbd>Enter</kbd> for a new line · AI can make mistakes
      </p>
    </div>
  );
};

export default ChatInput;
