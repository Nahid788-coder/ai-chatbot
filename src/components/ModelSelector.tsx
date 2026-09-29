import { useEffect, useMemo, useRef, useState } from 'react';
import type { AIModel, Provider } from '../types/chat';
import { PROVIDERS } from '../data/models';
import { IconCheck, IconChevron, IconSearch } from './Icons';

interface Props {
  models: AIModel[];
  selected: AIModel;
  onSelect: (model: AIModel) => void;
}

type Filter = 'all' | Provider;

const fmtContext = (n: number) => (n >= 1_000_000 ? `${Math.round(n / 1_000_000)}M` : `${Math.round(n / 1000)}K`);

const ProviderDot = ({ provider }: { provider: Provider }) => (
  <span className="provider-dot" style={{ background: PROVIDERS[provider].color }} />
);

const ModelSelector = ({ models, selected, onSelect }: Props) => {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const providers = useMemo(() => [...new Set(models.map((m) => m.provider))], [models]);
  const visible = models.filter(
    (m) =>
      (filter === 'all' || m.provider === filter) &&
      (!query || `${m.name} ${m.id}`.toLowerCase().includes(query.toLowerCase())),
  );

  return (
    <div className="model-select" ref={rootRef}>
      <button className="model-trigger" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <ProviderDot provider={selected.provider} />
        <span className="model-trigger-name">{selected.name}</span>
        <IconChevron size={16} className={`chev ${open ? 'up' : ''}`} />
      </button>

      {open && (
        <div className="model-menu" role="listbox">
          <div className="model-search">
            <IconSearch size={15} />
            <input autoFocus placeholder="Search models" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          {providers.length > 1 && (
            <div className="model-tabs">
              {(['all', ...providers] as Filter[]).map((p) => (
                <button key={p} className={`tab ${filter === p ? 'active' : ''}`} onClick={() => setFilter(p)}>
                  {p === 'all' ? 'All' : PROVIDERS[p].label}
                </button>
              ))}
            </div>
          )}
          <div className="model-list">
            {visible.length === 0 && <p className="model-empty">No models match.</p>}
            {visible.map((m) => (
              <button
                key={`${m.provider}:${m.id}`}
                role="option"
                aria-selected={m.id === selected.id}
                className={`model-row ${m.id === selected.id ? 'active' : ''}`}
                onClick={() => {
                  onSelect(m);
                  setOpen(false);
                }}
              >
                <ProviderDot provider={m.provider} />
                <span className="model-row-text">
                  <span className="model-row-name">{m.name}</span>
                  <span className="model-row-sub">
                    {PROVIDERS[m.provider].label}
                    {m.context ? ` · ${fmtContext(m.context)} context` : ''}
                  </span>
                </span>
                {m.id === selected.id && <IconCheck size={16} className="model-row-check" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelSelector;
