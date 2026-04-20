import { Suspense } from 'react';
import { connection } from 'next/server';
import db from '@/lib/db';
import { AskClient } from './AskClient';

async function PageContent() {
  await connection();

  type DbMessage = { role: string; content: string };
  const rows = db.prepare(
    'SELECT role, content FROM messages ORDER BY id ASC LIMIT 50',
  ).all() as DbMessage[];

  const messages = rows.map((r) => ({
    role: r.role as 'user' | 'assistant',
    content: r.content,
  }));

  return <AskClient initialMessages={messages} />;
}

export default function AskPage() {
  return (
    <div className="space-y-4 pb-4">

      <div className="space-y-1 pt-1">
        <p className="text-muted text-xs font-sans uppercase tracking-widest">Dialogue</p>
        <h1 className="font-display italic text-[2rem] leading-tight text-primary">Ask</h1>
        <p className="text-body text-sm max-w-lg">
          Conversational astrology support powered by Claude — grounded in your chart, patterns, and live transits.
        </p>
      </div>

      <Suspense fallback={<div className="text-muted text-sm animate-pulse py-4">Loading…</div>}>
        <PageContent />
      </Suspense>

    </div>
  );
}
