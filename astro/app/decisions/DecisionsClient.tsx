'use client';

import { useState, useTransition } from 'react';
import { addDecision, removeDecision } from './actions';

// ─── Types ────────────────────────────────────────────────────────────────────

export type Decision = {
  id: number;
  description: string;
  direction: string | null;
  context: string | null;
  house: number | null;
  date: string | null;
};

// ─── Shared styles ────────────────────────────────────────────────────────────

const inputCls = [
  'w-full bg-bg border border-border rounded-sm px-3 py-2 text-sm text-primary',
  'placeholder:text-muted/50 focus:outline-none focus:border-muted resize-none transition-colors',
].join(' ');

const selectCls = [
  'w-full bg-[#0c0b09] border border-border rounded-sm px-3 py-2 text-sm text-primary',
  'focus:outline-none focus:border-muted transition-colors',
].join(' ');

// ─── Node Compass card ────────────────────────────────────────────────────────

function RatioBar({ stretch, total }: { stretch: number; total: number }) {
  const pct = total === 0 ? 50 : Math.round((stretch / total) * 100);
  return (
    <div className="space-y-1.5">
      <div className="h-1.5 rounded-full overflow-hidden bg-border">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: '#6BA89E' }}
        />
      </div>
      <div className="flex justify-between text-[10px] font-sans">
        <span style={{ color: '#6BA89E' }}>{stretch} stretch</span>
        <span style={{ color: '#B05A5A' }}>{total - stretch} default</span>
      </div>
    </div>
  );
}

function NodeCompass({ stretchCount, defaultCount }: { stretchCount: number; defaultCount: number }) {
  return (
    <div className="bg-card border border-border rounded-sm p-5 space-y-5">
      <div className="space-y-0.5">
        <p className="text-[10px] font-sans text-muted uppercase tracking-widest">Node Compass</p>
        <h2 className="font-display italic text-lg text-primary">Stretch vs Default</h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-base leading-none" style={{ color: '#6BA89E' }}>☊</span>
            <div>
              <p className="text-xs font-sans text-primary">Stretch</p>
              <p className="text-[10px] font-sans text-muted">Capricorn · 9th house</p>
            </div>
          </div>
          <p className="text-[11px] text-muted leading-snug">
            Authority, structure, public frameworks, intellectual visibility
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-base leading-none" style={{ color: '#B05A5A' }}>☋</span>
            <div>
              <p className="text-xs font-sans text-primary">Default</p>
              <p className="text-[10px] font-sans text-muted">Cancer · 3rd house</p>
            </div>
          </div>
          <p className="text-[11px] text-muted leading-snug">
            Emotional accommodation, caretaking, waiting to feel held
          </p>
        </div>
      </div>

      <RatioBar stretch={stretchCount} total={stretchCount + defaultCount} />
    </div>
  );
}

// ─── Log form ─────────────────────────────────────────────────────────────────

function LogForm() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await addDecision(fd);
      setOpen(false);
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full text-left text-xs font-sans px-4 py-3 rounded-sm border border-dashed border-border text-muted hover:text-body hover:border-border/80 transition-colors"
      >
        + Log a decision
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-sm p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-sans text-muted uppercase tracking-widest">Log a decision</p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-muted/50 hover:text-muted text-sm transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] text-muted font-sans uppercase tracking-widest">Description *</label>
        <textarea
          name="description"
          rows={2}
          placeholder="What did you decide?"
          required
          className={inputCls}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-[10px] text-muted font-sans uppercase tracking-widest">Direction</label>
          <select name="direction" defaultValue="stretch" className={selectCls}>
            <option value="stretch">☊ Stretch (North Node)</option>
            <option value="default">☋ Default (South Node)</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] text-muted font-sans uppercase tracking-widest">House (1–12)</label>
          <input
            type="number"
            name="house"
            min={1}
            max={12}
            placeholder="e.g. 9"
            className={inputCls}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] text-muted font-sans uppercase tracking-widest">Context</label>
        <textarea
          name="context"
          rows={2}
          placeholder="What was the situation or reasoning?"
          className={inputCls}
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 text-xs font-sans rounded-sm text-bg transition-colors disabled:opacity-50"
          style={{ backgroundColor: '#6BA89E' }}
        >
          {isPending ? 'Saving…' : 'Save'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-4 py-2 text-xs font-sans border border-border rounded-sm text-muted hover:text-body transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ─── Decision row ─────────────────────────────────────────────────────────────

function DecisionRow({ decision }: { decision: Decision }) {
  const [isPending, startTransition] = useTransition();
  const isStretch   = decision.direction !== 'default';
  const borderColor = isStretch ? '#6BA89E' : '#B05A5A';
  const nodeGlyph   = isStretch ? '☊' : '☋';
  const nodeLabel   = isStretch ? 'Stretch' : 'Default';

  function handleDelete() {
    if (!confirm('Delete this decision?')) return;
    startTransition(async () => {
      await removeDecision(decision.id);
    });
  }

  return (
    <div
      className={[
        'bg-card border rounded-sm pl-5 pr-4 py-4 space-y-1.5 transition-opacity',
        isPending ? 'opacity-40' : '',
      ].join(' ')}
      style={{
        borderColor: '#211e18',
        borderLeftColor: borderColor,
        borderLeftWidth: 2,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-sans" style={{ color: borderColor }}>
              {nodeGlyph} {nodeLabel}
            </span>
            {decision.house && (
              <span className="text-[10px] font-sans text-muted">· House {decision.house}</span>
            )}
            {decision.date && (
              <span className="text-[10px] font-sans text-muted">· {decision.date}</span>
            )}
          </div>
          <p className="text-sm text-primary leading-snug">{decision.description}</p>
          {decision.context && (
            <p className="text-xs text-muted leading-relaxed">{decision.context}</p>
          )}
        </div>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="text-muted/30 hover:text-muted/70 text-sm shrink-0 transition-colors disabled:opacity-30"
          aria-label="Delete decision"
        >
          ×
        </button>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function DecisionsClient({
  decisions,
  stretchCount,
  defaultCount,
}: {
  decisions: Decision[];
  stretchCount: number;
  defaultCount: number;
}) {
  return (
    <div className="space-y-4">
      <NodeCompass stretchCount={stretchCount} defaultCount={defaultCount} />
      <LogForm />
      {decisions.length === 0 ? (
        <p className="text-muted text-sm py-2">No decisions logged yet.</p>
      ) : (
        <div className="space-y-2">
          {decisions.map((d) => (
            <DecisionRow key={d.id} decision={d} />
          ))}
        </div>
      )}
    </div>
  );
}
