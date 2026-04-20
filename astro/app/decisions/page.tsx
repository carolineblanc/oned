import { Suspense } from 'react';
import { connection } from 'next/server';
import db from '@/lib/db';
import { DecisionsClient, type Decision } from './DecisionsClient';

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function DecisionsSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="bg-card border border-border rounded-sm p-5 h-44" />
      <div className="h-10 bg-card border border-dashed border-border rounded-sm" />
    </div>
  );
}

// ─── Data component ───────────────────────────────────────────────────────────

async function PageContent() {
  await connection();

  type DbDecision = {
    id: number; description: string; direction: string | null;
    context: string | null; house: number | null; date: string | null;
  };

  const rows = db.prepare(
    'SELECT id, description, direction, context, house, date FROM decisions ORDER BY id DESC',
  ).all() as DbDecision[];

  const decisions: Decision[] = rows;
  const stretchCount = decisions.filter((d) => d.direction !== 'default').length;
  const defaultCount = decisions.filter((d) => d.direction === 'default').length;

  return (
    <DecisionsClient
      decisions={decisions}
      stretchCount={stretchCount}
      defaultCount={defaultCount}
    />
  );
}

// ─── Page entry point ─────────────────────────────────────────────────────────

export default function DecisionsPage() {
  return (
    <div className="space-y-6 pb-16">

      <div className="space-y-1 pt-1">
        <p className="text-muted text-xs font-sans uppercase tracking-widest">Navigation</p>
        <h1 className="font-display italic text-[2rem] leading-tight text-primary">Decisions</h1>
        <p className="text-body text-sm max-w-lg">
          Log choices as stretch or default — building awareness of which node is driving.
        </p>
      </div>

      <Suspense fallback={<DecisionsSkeleton />}>
        <PageContent />
      </Suspense>

    </div>
  );
}
