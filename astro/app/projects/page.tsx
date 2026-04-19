import { Suspense } from 'react';
import { connection } from 'next/server';
import { calcTransits, NATAL_POSITIONS } from '@/lib/ephemeris';
import { HOUSES } from '@/lib/houses-data';
import db from '@/lib/db';
import { ProjectsClient, type Project } from './ProjectsClient';

// ─── Transit note ─────────────────────────────────────────────────────────────

const ASPECT_GLYPH: Record<string, string> = {
  conjunction: '☌', opposition: '☍', square: '□', trine: '△', sextile: '⚹',
};

function getTransitNote(
  house: number | null,
  transits: ReturnType<typeof calcTransits>,
): string | null {
  if (!house) return null;

  // Most exact aspect whose natal planet lives in this house
  const asp = transits.aspects.find(
    (a) => NATAL_POSITIONS[a.natalPlanet].house === house,
  );
  if (asp) {
    const ag = ASPECT_GLYPH[asp.aspect] ?? asp.aspect;
    return `${asp.transitPlanet} ${ag} natal ${asp.natalPlanet} — ${asp.applying ? 'applying' : 'separating'}`;
  }

  // Transiting planet physically in this house
  const planet = transits.planets.find((p) => p.house === house);
  if (planet) {
    return `${planet.name} transiting through this house${planet.retrograde ? ' (Rx)' : ''}`;
  }

  return null;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ProjectsSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="bg-card border border-border/60 rounded-sm px-5 py-3.5">
        <div className="h-4 bg-border/50 rounded w-24" />
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} className="bg-card border border-border rounded-sm p-5 space-y-3">
          <div className="flex justify-between">
            <div className="h-4 bg-border/60 rounded w-16" />
            <div className="h-4 bg-border/30 rounded w-12" />
          </div>
          <div className="h-5 bg-border rounded w-40" />
          <div className="h-3 bg-border/60 rounded w-56" />
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((j) => (
              <div key={j} className="h-6 bg-border/40 rounded-sm w-14" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Async data component ─────────────────────────────────────────────────────

async function PageContent() {
  await connection();

  const transits = calcTransits();

  type DbProject = {
    id: number; name: string; intention: string | null;
    domain: string | null; house: number | null;
    state: string | null; value_model: string | null;
    created_at: string;
  };

  const raw = db.prepare(
    'SELECT id, name, intention, domain, house, state, value_model, created_at FROM projects ORDER BY created_at DESC',
  ).all() as DbProject[];

  const projects: Project[] = raw.map((p) => ({
    id:          p.id,
    name:        p.name,
    intention:   p.intention,
    domain:      p.domain,
    house:       p.house,
    state:       p.state,
    value_model: p.value_model,
    transitNote: getTransitNote(p.house, transits),
    houseVerb:   p.house ? (HOUSES.find((h) => h.n === p.house)?.verb ?? null) : null,
  }));

  return <ProjectsClient projects={projects} />;
}

// ─── Page entry point ─────────────────────────────────────────────────────────

export default function ProjectsPage() {
  return (
    <div className="space-y-6 pb-16">

      <div className="space-y-1 pt-1">
        <p className="text-muted text-xs font-sans uppercase tracking-widest">Active Work</p>
        <h1 className="font-display italic text-[2rem] leading-tight text-primary">Projects</h1>
        <p className="text-body text-sm max-w-lg">
          Everything you're building, testing, or incubating — anchored to your natal houses.
        </p>
      </div>

      <Suspense fallback={<ProjectsSkeleton />}>
        <PageContent />
      </Suspense>

    </div>
  );
}
