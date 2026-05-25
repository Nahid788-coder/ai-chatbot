import { useState } from 'react';
import type { AIModel } from '../types/chat';
import { AI_MODELS } from '../data/models';

interface ModelSelectorProps {
  selected: AIModel;
  onSelect: (model: AIModel) => void;
}

const PROVIDERS = ['all', 'gemini', 'groq', 'openrouter'] as const;

const ModelSelector = ({ selected, onSelect }: ModelSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'gemini' | 'groq' | 'openrouter'>('all');

  const filtered = filter === 'all' ? AI_MODELS : AI_MODELS.filter((m) => m.provider === filter);

  return (
    <div className="model-selector">
      <button className="model-trigger" onClick={() => setOpen(!open)}>
        <span className="model-emoji">{selected.emoji}</span>
        <span className="model-trigger-name">{selected.name}</span>
        <span className="model-provider-badge" style={{ background: selected.color + '22', color: selected.color }}>
          {selected.provider}
        </span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s' }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="model-dropdown">
          {/* Filter tabs */}
          <div className="model-filters">
            {PROVIDERS.map((p) => (
              <button
                key={p}
                className={`filter-tab ${filter === p ? 'active' : ''}`}
                onClick={() => setFilter(p)}
              >
                {p === 'all' ? 'All' : p === 'openrouter' ? 'OpenRouter' : p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>

          {/* Model list */}
          <div className="model-list">
            {filtered.map((model) => (
              <button
                key={model.id}
                className={`model-item ${selected.id === model.id ? 'active' : ''}`}
                onClick={() => { onSelect(model); setOpen(false); }}
              >
                <span className="model-item-emoji">{model.emoji}</span>
                <div className="model-item-info">
                  <div className="model-item-name">{model.name}</div>
                  <div className="model-item-desc">{model.description}</div>
                </div>
                <span className="model-item-badge" style={{ background: model.color + '22', color: model.color }}>
                  {model.provider}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelSelector;
