import { memo, useState, isValidElement } from 'react';
import type { ReactNode, ReactElement } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Message } from '../types/chat';
import { IconCheck, IconCopy } from './Icons';
import { LogoMark } from './Logo';

/** Some reasoning models (Qwen, DeepSeek) stream their thinking in <think> tags. Hide it. */
const clean = (text: string) =>
  text
    .replace(/<think>[\s\S]*?<\/think>/g, '')
    .replace(/<think>[\s\S]*$/, '')
    .trimStart();

const useCopy = () => {
  const [copied, setCopied] = useState(false);
  const copy = (text: string) => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  };
  return { copied, copy };
};

const textOf = (node: ReactNode): string => {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (isValidElement(node)) return textOf((node.props as { children?: ReactNode }).children);
  return '';
};

const CodeBlock = ({ children }: { children?: ReactNode }) => {
  const { copied, copy } = useCopy();
  const code = isValidElement(children) ? (children as ReactElement<{ className?: string; children?: ReactNode }>) : null;
  const lang = code?.props.className?.replace('language-', '') ?? '';
  const raw = textOf(code?.props.children ?? children).replace(/\n$/, '');

  return (
    <div className="code-block">
      <div className="code-head">
        <span>{lang || 'code'}</span>
        <button onClick={() => copy(raw)} className="code-copy">
          {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre>
        <code>{raw}</code>
      </pre>
    </div>
  );
};

const mdComponents = {
  pre: CodeBlock,
  a: (props: { href?: string; children?: ReactNode }) => (
    <a href={props.href} target="_blank" rel="noreferrer noopener">
      {props.children}
    </a>
  ),
};

interface Props {
  message: Message;
  isStreaming?: boolean;
}

const ChatMessage = ({ message, isStreaming }: Props) => {
  const { copied, copy } = useCopy();
  const isUser = message.role === 'user';
  const content = isUser ? message.content : clean(message.content);

  if (isUser) {
    return (
      <div className="msg msg--user">
        <div className="bubble-user">{content}</div>
      </div>
    );
  }

  return (
    <div className="msg msg--ai">
      <div className="ai-avatar">
        <LogoMark size={30} />
      </div>
      <div className="ai-body">
        <div className="ai-meta">
          <span className="ai-name">{message.model || 'Aurora'}</span>
          {isStreaming && <span className="live-dot" aria-label="Streaming" />}
        </div>
        <div className={`markdown ${isStreaming ? 'is-streaming' : ''}`}>
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
            {content || ' '}
          </ReactMarkdown>
        </div>
        {!isStreaming && (
          <div className="msg-actions">
            <button className="ghost-btn small" onClick={() => copy(content)} title="Copy reply">
              {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <span className="msg-time">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(ChatMessage);
