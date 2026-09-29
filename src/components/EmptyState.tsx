import { LogoMark } from './Logo';

const SUGGESTIONS = [
  { title: 'Explain a concept', text: 'Explain how React hooks work, with a simple example' },
  { title: 'Write code', text: 'Write a TypeScript function that debounces another function' },
  { title: 'Plan something', text: 'Make a 4-week plan to learn Node.js for a React developer' },
  { title: 'Polish writing', text: 'Rewrite this to sound more professional: "i will send the file tmrw"' },
];

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

interface Props {
  name: string;
  modelName: string;
  onPick: (text: string) => void;
}

const EmptyState = ({ name, modelName, onPick }: Props) => (
  <div className="empty">
    <div className="empty-mark">
      <LogoMark size={56} />
    </div>
    <h1>
      {greeting()}, <span className="grad-text">{name.split(' ')[0]}</span>
    </h1>
    <p className="empty-sub">How can I help you today? You are chatting with {modelName}.</p>
    <div className="suggestions">
      {SUGGESTIONS.map((s) => (
        <button key={s.title} className="suggestion" onClick={() => onPick(s.text)}>
          <span className="suggestion-title">{s.title}</span>
          <span className="suggestion-text">{s.text}</span>
        </button>
      ))}
    </div>
  </div>
);

export default EmptyState;
