import { Suspense } from 'react';
import Link from 'next/link';
import { connection } from 'next/server';
import { calcTransits, NATAL_POSITIONS, type TransitAspect, type PlanetPosition, type TransitsResult } from '@/lib/ephemeris';
import { getInterpretation, buildTransitContext } from '@/lib/now-data';
import db from '@/lib/db';

// ─── Static content ────────────────────────────────────────────────────────────

const QUARTERS = [
  {
    n: 1 as const,
    label: 'Q1', range: 'Jan – Mar',
    title: 'Strategic Isolation & Vision Refinement',
    energy: 'Quiet. Deliberate. Building in private.',
    actions: ['Define pillars', 'Write / map / research', '1:1 outreach', 'Outline monetization'],
  },
  {
    n: 2 as const,
    label: 'Q2', range: 'Apr – Jun',
    title: 'Soft Launch & Network Activation',
    energy: 'Keep it curated. Small room > large audience. Money → light, experimental.',
    actions: ['Host salons', 'Test formats', 'Podcast pilot', 'Publish essays', 'Collaborative canvos'],
  },
  {
    n: 3 as const,
    label: 'Q3', range: 'Jul – Sep',
    title: 'Identity Shift & Revenue Innovation',
    energy: "Financial volatility is creative, not destructive. Don't panic if money feels non-linear.",
    actions: ['Income experimentation', 'New money streams', 'Membership tiers', 'Advisory offerings', 'Structured packages'],
  },
  {
    n: 4 as const,
    label: 'Q4', range: 'Oct – Dec',
    title: 'Brand Authority & Public Recognition',
    energy: "If you've done the inner work → powerful. If not → chaotic.",
    actions: ['Invited to speak', 'Seen as connector', 'Solidify reputation', 'Attract serious collaborators'],
  },
] as const;

// ─── Glyphs ────────────────────────────────────────────────────────────────────

const PLANET_GLYPH: Record<string, string> = {
  'Sun': '☉', 'Moon': '☽', 'Mercury': '☿', 'Venus': '♀', 'Mars': '♂',
  'Jupiter': '♃', 'Saturn': '♄', 'Uranus': '♅', 'Neptune': '♆',
  'Pluto': '♇', 'North Node': '☊',
};

const ASPECT_GLYPH: Record<string, string> = {
  conjunction: '☌', opposition: '☍', square: '□', trine: '△', sextile: '⚹',
};

// ─── Action state ──────────────────────────────────────────────────────────────

type ActionState = 'initiate' | 'expand' | 'refine' | 'pause' | 'close';

const ACTION: Record<ActionState, { label: string; color: string }> = {
  initiate: { label: 'initiate', color: '#6BA89E' },
  expand:   { label: 'expand',   color: '#C4956A' },
  refine:   { label: 'refine',   color: '#9B8EC4' },
  pause:    { label: 'pause',    color: '#7A8B99' },
  close:    { label: 'close',    color: '#B05A5A' },
};

function getActionState(
  aspect: TransitAspect,
  moonPhase: string,
  moonPct: number,
): ActionState {
  const { transitPlanet, applying } = aspect;
  if (transitPlanet === 'Moon') {
    if (moonPct < 15) return 'initiate';
    if (moonPct > 85) return applying ? 'close' : 'refine';
  }
  if (transitPlanet === 'Jupiter') return 'expand';
  if (transitPlanet === 'Saturn')  return applying ? 'pause' : 'refine';
  if (transitPlanet === 'Pluto')   return 'refine';
  if (transitPlanet === 'Uranus' && applying) return 'initiate';
  return applying ? 'initiate' : 'close';
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

function getQuarter(d: Date): 1 | 2 | 3 | 4 {
  const m = d.getMonth() + 1;
  if (m <= 3) return 1;
  if (m <= 6) return 2;
  if (m <= 9) return 3;
  return 4;
}

// ─── Async sub-component: interpretations ─────────────────────────────────────
// Suspends while Claude generates text; renders instantly on cache hit.

async function ActiveTransits({ transits }: { transits: TransitsResult }) {
  const now = new Date();
  const bucket12h = `${now.toISOString().slice(0, 10)}-${now.getHours() < 12 ? '0' : '1'}`;
  const topAspects = transits.aspects.slice(0, 6);

  const rows = await Promise.all(
    topAspects.map(async (asp) => {
      const tp  = transits.planets.find((p) => p.name === asp.transitPlanet)!;
      const key = `${asp.transitPlanet.toLowerCase().replace(' ', '-')}-${asp.aspect}-${asp.natalPlanet.toLowerCase().replace(' ', '-')}`;
      const ctx = buildTransitContext(asp, tp, transits.moonPhase.phase);
      const [text] = await Promise.all([getInterpretation(key, bucket12h, ctx)]);
      const state  = getActionState(asp, transits.moonPhase.phase, transits.moonPhase.illumination);
      return { asp, tp, text, state };
    }),
  );

  return (
    <section className="bg-card border border-border rounded-sm p-6">
      <h2 className="font-display italic text-xl text-primary mb-5">Asking for your attention</h2>
      <div className="divide-y divide-border">
        {rows.map(({ asp, tp, text, state }) => {
          const natalHouse = NATAL_POSITIONS[asp.natalPlanet].house;
          const { color, label } = ACTION[state];
          const pg = PLANET_GLYPH[tp.name] ?? '';
          const ag = ASPECT_GLYPH[asp.aspect] ?? asp.aspect;
          const ng = PLANET_GLYPH[asp.natalPlanet] ?? '';

          return (
            <div key={`${asp.transitPlanet}-${asp.aspect}-${asp.natalPlanet}`} className="py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-1">

                  {/* Headline */}
                  <p className="text-sm leading-snug flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                    <span className="text-accent">{pg}</span>
                    <span className="text-primary font-medium">{tp.name}</span>
                    <span className="text-body">{tp.sign} {tp.degreeInSign}°</span>
                    <span className="text-muted">{ag}</span>
                    <span className="text-body">natal {ng} {asp.natalPlanet}</span>
                    <span
                      className="text-xs px-1.5 py-px rounded-sm ml-0.5"
                      style={{ backgroundColor: `${color}1a`, color }}
                    >H{natalHouse}</span>
                  </p>

                  {/* Technical metadata */}
                  <p className="text-xs text-muted flex items-center gap-1.5">
                    <span>{asp.applying ? '↑ applying' : '↓ separating'}</span>
                    <span>·</span>
                    <span>{asp.orb}° orb</span>
                    <span>·</span>
                    <span>{asp.exactness}% exact</span>
                    {tp.retrograde && (
                      <><span>·</span><span className="text-accent/60">Rx</span></>
                    )}
                  </p>

                  {/* Claude interpretation */}
                  {text && (
                    <p className="text-body text-sm leading-relaxed pt-1 max-w-2xl">{text}</p>
                  )}
                </div>

                {/* Action badge */}
                <span
                  className="shrink-0 mt-0.5 text-xs px-2.5 py-1 rounded-sm border tracking-wide"
                  style={{ color, borderColor: `${color}55` }}
                >
                  {label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// Shown while ActiveTransits fetches interpretations
function TransitsSkeleton() {
  return (
    <section className="bg-card border border-border rounded-sm p-6">
      <h2 className="font-display italic text-xl text-primary mb-5">Asking for your attention</h2>
      <div className="divide-y divide-border">
        {[0, 1, 2].map((i) => (
          <div key={i} className="py-4 animate-pulse space-y-2">
            <div className="h-4 bg-border rounded w-2/3" />
            <div className="h-3 bg-border/60 rounded w-1/3" />
            <div className="h-10 bg-border/40 rounded w-full mt-2" />
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Async inner component: all request-time content ─────────────────────────
// Lives inside <Suspense> because it uses connection() + new Date().

async function PageContent() {
  // Signals this component requires a live request (no prerender).
  await connection();

  const transits = calcTransits();
  const today    = new Date();
  const currentQ = getQuarter(today);
  const qTitle   = QUARTERS.find((q) => q.n === currentQ)?.title ?? '';

  // Node Compass — synchronous SQLite query
  const decisionRows = db.prepare(
    `SELECT direction, COUNT(*) as count FROM decisions
     WHERE direction IN ('stretch','default') GROUP BY direction`,
  ).all() as { direction: string; count: number }[];

  const stretch      = decisionRows.find((r) => r.direction === 'stretch')?.count  ?? 0;
  const defaultCount = decisionRows.find((r) => r.direction === 'default')?.count  ?? 0;

  return (
    <>
      {/* 1 — Date & context */}
      <section className="space-y-1 pt-1">
        <p className="text-muted text-xs font-sans uppercase tracking-widest">
          {formatDate(today)}
        </p>
        <p className="text-body text-sm">
          Personal Year 5
          <span className="mx-2" style={{ color: '#211e18' }}>·</span>
          Q{currentQ}: {qTitle}
        </p>
      </section>

      {/* 2 — Central question */}
      <section>
        <h1 className="font-display text-[2.6rem] leading-[1.15] italic text-primary">
          How do I turn inspiration<br />into tangible impact?
        </h1>
      </section>

      {/* 3 — Year frame */}
      <p className="text-body text-sm leading-relaxed max-w-2xl -mt-3">
        This year is about structuring ambition, monetizing your voice,
        clearing psychological residue, and aligning with higher-quality,
        calibrated circles.
      </p>

      {/* 4 — Active transits (inner Suspense: waits for Claude) */}
      <Suspense fallback={<TransitsSkeleton />}>
        <ActiveTransits transits={transits} />
      </Suspense>

      {/* 5 — Quarterly arc */}
      <section className="space-y-4">
        <h2 className="font-display italic text-xl text-primary">Where you are in the year</h2>
        <div className="grid grid-cols-4 gap-3">
          {QUARTERS.map((q) => {
            const isCurrent = q.n === currentQ;
            const isPast    = q.n < currentQ;
            return (
              <div
                key={q.n}
                className={[
                  'bg-card border rounded-sm p-4 relative',
                  isCurrent ? 'border-accent/35' : 'border-border',
                  isPast ? 'opacity-40' : !isCurrent ? 'opacity-60' : '',
                ].join(' ')}
              >
                {isCurrent && (
                  <span className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full bg-accent" />
                )}
                <p className="text-muted text-xs font-sans">{q.label} · {q.range}</p>
                <h3 className={[
                  'font-display italic mt-1.5 leading-snug',
                  isCurrent ? 'text-primary text-[15px]' : 'text-body text-sm',
                ].join(' ')}>
                  {q.title}
                </h3>
                {isCurrent && (
                  <>
                    <p className="text-body text-xs italic mt-3 leading-relaxed">{q.energy}</p>
                    <ul className="mt-3 space-y-1">
                      {q.actions.map((a) => (
                        <li key={a} className="text-muted text-xs">· {a}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 6 — Bottom cards */}
      <div className="grid grid-cols-2 gap-4">

        {/* Year 5 numerology */}
        <div className="bg-card border border-border rounded-sm p-5 space-y-2.5">
          <p className="text-muted text-xs font-sans uppercase tracking-widest">Year 5 · Numerology</p>
          <p className="text-body text-sm leading-relaxed">
            Move. More air. More deliberately. Go but don&apos;t scatter.
            Old comfort zones become liberating to leave.
          </p>
        </div>

        {/* Node Compass */}
        <div className="bg-card border border-border rounded-sm p-5 space-y-3">
          <p className="text-muted text-xs font-sans uppercase tracking-widest">Node Compass</p>
          <div className="flex items-end gap-8">
            <div className="space-y-0.5">
              <p className="font-display text-4xl leading-none" style={{ color: '#6BA89E' }}>
                {stretch}
              </p>
              <p className="text-muted text-xs">stretch</p>
            </div>
            <div className="space-y-0.5">
              <p className="font-display text-4xl leading-none" style={{ color: '#B05A5A' }}>
                {defaultCount}
              </p>
              <p className="text-muted text-xs">default</p>
            </div>
          </div>
          {stretch + defaultCount === 0 && (
            <p className="text-muted text-xs italic">No decisions logged yet.</p>
          )}
        </div>

      </div>

      {/* 7 — CTA */}
      <Link href="/ask">
        <div className="bg-card border border-border/60 hover:border-accent/40 rounded-sm px-6 py-5 transition-colors group cursor-pointer">
          <p className="text-body text-sm group-hover:text-accent/80 transition-colors">
            ✧ Ask anything about your chart, a decision, or a project →
          </p>
        </div>
      </Link>
    </>
  );
}

// Thin skeleton shown during the brief connection() resolution
function PageSkeleton() {
  return (
    <div className="space-y-8 pt-1 animate-pulse">
      <div className="h-3 bg-border rounded-sm w-40" />
      <div className="h-10 bg-border/50 rounded-sm w-3/4 mt-3" />
      <div className="h-4 bg-border/30 rounded-sm w-full" />
    </div>
  );
}

// ─── Page entry point ─────────────────────────────────────────────────────────

export default function NowPage() {
  return (
    <div className="space-y-8 pb-16">
      <Suspense fallback={<PageSkeleton />}>
        <PageContent />
      </Suspense>
    </div>
  );
}
