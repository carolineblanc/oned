import { Suspense } from 'react';
import { connection } from 'next/server';
import { calcTransits } from '@/lib/ephemeris';
import { getHouseTransitLine } from '@/lib/now-data';
import { HOUSES } from '@/lib/houses-data';
import db from '@/lib/db';
import { HousesClient, type HouseTransit, type Project } from './HousesClient';

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function HousesSkeleton() {
  return (
    <div className="space-y-2 animate-pulse">
      {Array.from({ length: 12 }, (_, i) => (
        <div key={i} className="bg-card border border-border rounded-sm px-5 py-4 flex items-center gap-4">
          <div className="w-8 h-6 bg-border/40 rounded" />
          <div className="flex-1 space-y-1.5">
            <div className="h-4 bg-border rounded w-32" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Async data component ─────────────────────────────────────────────────────

async function PageContent() {
  await connection();

  const transits  = calcTransits();
  const today     = new Date();
  const bucket12h = `${today.toISOString().slice(0, 10)}-${today.getHours() < 12 ? '0' : '1'}`;

  // Projects grouped by house
  type DbProject = Project & { house: number };
  const rawProjects = db.prepare(
    'SELECT id, name, intention, domain, state, house FROM projects WHERE house IS NOT NULL ORDER BY created_at DESC',
  ).all() as DbProject[];

  const projectsByHouse: Record<number, Project[]> = {};
  for (const p of rawProjects) {
    (projectsByHouse[p.house] ??= []).push({
      id: p.id, name: p.name, intention: p.intention, domain: p.domain, state: p.state,
    });
  }

  // Transit planets by natal house with one-line Claude interpretations
  const transitsByHouse: Record<number, HouseTransit[]> = {};

  await Promise.all(
    transits.planets.map(async (tp) => {
      const houseContent = HOUSES.find((h) => h.n === tp.house);
      const ctx =
        `${tp.name} transiting ${tp.sign} ${tp.degreeInSign}°` +
        `${tp.retrograde ? ' (retrograde)' : ''} ` +
        `through House ${tp.house}${houseContent ? ` — ${houseContent.verb}` : ''}. ` +
        `One sentence: what energy does this activate in this life area right now?`;

      const line = await getHouseTransitLine(
        tp.name.toLowerCase().replace(' ', '-'),
        tp.house,
        bucket12h,
        ctx,
      );

      (transitsByHouse[tp.house] ??= []).push({
        planet: {
          name:         tp.name,
          sign:         tp.sign,
          degreeInSign: tp.degreeInSign,
          retrograde:   tp.retrograde,
        },
        line,
      });
    }),
  );

  return (
    <HousesClient
      projectsByHouse={projectsByHouse}
      transitsByHouse={transitsByHouse}
    />
  );
}

// ─── Page entry point ─────────────────────────────────────────────────────────

export default function HousesPage() {
  return (
    <div className="space-y-6 pb-16">

      <div className="space-y-1 pt-1">
        <p className="text-muted text-xs font-sans uppercase tracking-widest">
          Natal Chart
        </p>
        <h1 className="font-display italic text-[2rem] leading-tight text-primary">
          Your 12 Houses
        </h1>
        <p className="text-body text-sm max-w-lg">
          Each house is a domain of life. Your natal planets show permanent character;
          transiting planets show what's active now.
        </p>
      </div>

      <Suspense fallback={<HousesSkeleton />}>
        <PageContent />
      </Suspense>

    </div>
  );
}
