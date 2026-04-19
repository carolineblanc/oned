import { Suspense } from 'react';
import { connection } from 'next/server';
import db from '@/lib/db';

// ─── Static card data ─────────────────────────────────────────────────────────

const STATE_COLORS: Record<string, string> = {
  incubate: '#9B8EC4', build: '#C4956A',
  share: '#6BA89E', scale: '#D4A853', pause: '#7A8B99',
};

const CARDS = [
  {
    id: 'retainer',
    title: 'Retainer / Advisory',
    statusWord: 'Strong',
    statusColor: '#6BA89E',
    status: 'Your most stable architecture.',
    body: 'Ongoing strategic counsel. Phoodle is the template — steady, deep. Venus in Scorpio 7th makes this natural: depth-based, loyal.',
  },
  {
    id: 'membership',
    title: 'Membership / Salon',
    statusWord: 'Building',
    statusColor: '#C4956A',
    status: 'Q2 is launch window. Keep curated.',
    body: 'OOC salons, curated gatherings. Small room > large audience. Gemini Moon + Sag stellium = intimate intellectual exchange as product.',
  },
  {
    id: 'content',
    title: 'Paid Intellectual Content',
    statusWord: 'Emerging',
    statusColor: '#9B8EC4',
    status: 'Revenue comes later — positioning comes now.',
    body: 'Essays, podcast, frameworks. Mercury in Sag 8th articulates hidden value. North Node 9th: teach.',
  },
  {
    id: 'access',
    title: 'Private Curated Access',
    statusWord: 'Long-term',
    statusColor: '#7A8B99',
    status: 'Seed in 2026, harvest 2027–28.',
    body: 'Bespoke experiences, collector introductions. Value through exclusive access.',
  },
] as const;

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ValueFlowSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 animate-pulse">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="bg-card border border-border rounded-sm p-5 space-y-3">
          <div className="h-5 bg-border rounded w-40" />
          <div className="h-3 bg-border/60 rounded w-28" />
          <div className="h-10 bg-border/40 rounded w-full" />
        </div>
      ))}
    </div>
  );
}

// ─── Async data component ─────────────────────────────────────────────────────

async function PageContent() {
  await connection();

  type DbProject = {
    id: number; name: string;
    state: string | null; value_model: string | null;
  };

  const rows = db.prepare(
    'SELECT id, name, state, value_model FROM projects WHERE value_model IS NOT NULL ORDER BY created_at DESC',
  ).all() as DbProject[];

  const byModel: Record<string, DbProject[]> = {};
  for (const p of rows) {
    if (p.value_model) (byModel[p.value_model] ??= []).push(p);
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {CARDS.map((card) => {
        const linked = byModel[card.id] ?? [];
        return (
          <div
            key={card.id}
            className="bg-card border border-border rounded-sm p-5 space-y-4"
          >
            {/* Header */}
            <div className="space-y-1">
              <h2 className="font-display italic text-lg text-primary leading-tight">
                {card.title}
              </h2>
              <div className="flex items-center gap-1.5">
                <span
                  className="text-[10px] font-sans px-2 py-0.5 rounded-sm border tracking-wide"
                  style={{ color: card.statusColor, borderColor: `${card.statusColor}44` }}
                >
                  {card.statusWord}
                </span>
                <span className="text-muted text-xs font-sans">{card.status}</span>
              </div>
            </div>

            {/* Body */}
            <p className="text-body text-sm leading-relaxed">{card.body}</p>

            {/* Linked projects */}
            {linked.length > 0 && (
              <div className="space-y-1.5 pt-1 border-t border-border/40">
                <p className="text-[10px] font-sans text-muted uppercase tracking-widest">
                  Projects
                </p>
                {linked.map((p) => {
                  const color = STATE_COLORS[p.state ?? 'incubate'] ?? '#6a5f4f';
                  return (
                    <div key={p.id} className="flex items-center justify-between gap-2">
                      <span className="text-xs text-body truncate">{p.name}</span>
                      <span
                        className="text-[10px] font-sans px-1.5 py-0.5 rounded-sm shrink-0"
                        style={{ color, backgroundColor: `${color}18` }}
                      >
                        {p.state ?? 'incubate'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Page entry point ─────────────────────────────────────────────────────────

export default function ValueFlowPage() {
  return (
    <div className="space-y-6 pb-16">

      <div className="space-y-2 pt-1">
        <p className="text-muted text-xs font-sans uppercase tracking-widest">Revenue Architecture</p>
        <h1 className="font-display italic text-[2rem] leading-tight text-primary">Value Flow</h1>
        <p className="font-display italic text-base text-body/80">
          Not "how do I earn more" — "how do I build recurring value?"
        </p>
        <p className="text-body text-sm">
          Bridges: luxury + tech · intellect + intimacy · aesthetics + invisible systems
        </p>
      </div>

      <Suspense fallback={<ValueFlowSkeleton />}>
        <PageContent />
      </Suspense>

    </div>
  );
}
