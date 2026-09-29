import { LogoMark } from './Logo';

const TypingIndicator = ({ label }: { label: string }) => (
  <div className="msg msg--ai">
    <div className="ai-avatar thinking">
      <LogoMark size={30} />
    </div>
    <div className="ai-body">
      <div className="ai-meta">
        <span className="ai-name">{label}</span>
      </div>
      <div className="typing" aria-label="Thinking">
        <span />
        <span />
        <span />
      </div>
    </div>
  </div>
);

export default TypingIndicator;
