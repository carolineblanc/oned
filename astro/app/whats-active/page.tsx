import { Suspense } from 'react';
import { connection } from 'next/server';
import {
  calcTransits,
  getUpcomingLunations,
  NATAL_POSITIONS,
  type TransitAspect,
  type PlanetPosition,
  type MoonPhase,
  type UpcomingLunation,
} from '@/lib/ephemeris';
import { buildWhatsActiveContext, getWhatsActiveInterpretation } from '@/lib/now-data';
import { HOUSES } from '@/lib/houses-data';

// ─── Shared constants ─────────────────────────────────────────────────────────

type ActionState = 'initiate' | 'expand' | 'refine' | 'pause' | 'close';

const ACTION: Record<ActionState, { label: string; color: string }> = {
  initiate: { label: 'initiate', color: '#6BA89E' },
  expand:   { label: 'expand',   color: '#C4956A' },
  refine:   { label: 'refine',   color: '#9B8EC4' },
  pause:    { label: 'pause',    color: '#7A8B99' },
  close:    { label: 'close',    color: '#B05A5A' },
};

const PLANET_GLYPH: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆',
  Pluto: '♇', 'North Node': '☊',
};

const ASPECT_GLYPH: Record<string, string> = {
  conjunction: '☌', opposition: '☍', square: '□', trine: '△', sextile: '⚹',
};

function getActionState(asp: TransitAspect, moonPct: number): ActionState {
  const { transitPlanet, applying } = asp;
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

// ─── Shared row type ──────────────────────────────────────────────────────────

interface TransitRow {
  asp: TransitAspect;
  tp: PlanetPosition;
  text: string;
  state: ActionState;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MoonBanner({ moonPhase }: { moonPhase: MoonPhase }) {
  return (
    <div className="bg-card border border-border rounded-sm px-5 py-4 flex flex-wrap items-center gap-x-6 gap-y-2">
      <div className="flex items-center gap-2">
        <span className="text-accent">☽</span>
        <span className="font-display italic text-lg text-primary">{moonPhase.phase}</span>
        <span className="text-muted text-xs font-sans">{moonPhase.illumination}%</span>
      </div>
      <span className="text-border hidden sm:inline">·</span>
      <p className="text-body text-xs font-sans">
        NM {moonPhase.newMoon.sign} · {moonPhase.newMoon.date}
        <span className="mx-2 text-muted">→</span>
        FM {moonPhase.fullMoon.sign} · {moonPhase.fullMoon.date}
      </p>
    </div>
  );
}

function TransitCard({ row, dim }: { row: TransitRow; dim: boolean }) {
  const { asp, tp, text, state } = row;
  const natalHouse = NATAL_POSITIONS[asp.natalPlanet].house;
  const houseVerb  = HOUSES.find((h) => h.n === natalHouse)?.verb;
  const { color, label } = ACTION[state];
  const pg = PLANET_GLYPH[tp.name] ?? '';
  const ag = ASPECT_GLYPH[asp.aspect] ?? asp.aspect;
  const ng = PLANET_GLYPH[asp.natalPlanet] ?? '';

  return (
    <div className={['py-4', dim ? 'opacity-45' : ''].join(' ')}>
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
              style={{ backgroundColor: `${color}18`, color }}
            >H{natalHouse}</span>
            {houseVerb && (
              <span className="text-muted text-xs italic">{houseVerb}</span>
            )}
          </p>

          {/* Metadata */}
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

          {/* Interpretation */}
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
}

function TransitSection({
  title,
  subtitle,
  rows,
  dim = false,
}: {
  title: string;
  subtitle: string;
  rows: TransitRow[];
  dim?: boolean;
}) {
  if (rows.length === 0) return null;
  return (
    <section className="bg-card border border-border rounded-sm p-6">
      <div className="mb-4">
        <h2 className="font-display italic text-xl text-primary">{title}</h2>
        <p className="text-muted text-xs font-sans mt-0.5">{subtitle}</p>
      </div>
      <div className="divide-y divide-border">
        {rows.map((row) => (
          <TransitCard
            key={`${row.asp.transitPlanet}-${row.asp.aspect}-${row.asp.natalPlanet}`}
            row={row}
            dim={dim}
          />
        ))}
      </div>
    </section>
  );
}

function LunationCard({ lunation }: { lunation: UpcomingLunation }) {
  const houseVerb = HOUSES.find((h) => h.n === lunation.house)?.verb ?? '';
  const isNew     = lunation.type === 'new';
  return (
    <div className="flex items-start gap-3 py-3.5 border-t border-border/40 first:border-t-0">
      <span className="text-muted shrink-0 mt-0.5 text-base">{isNew ? '●' : '○'}</span>
      <div className="space-y-1 min-w-0">
        <p className="text-sm text-primary leading-snug">
          {isNew ? 'New Moon' : 'Full Moon'}
          <span className="font-sans text-xs text-body ml-2">
            {lunation.degree}° {lunation.sign}
          </span>
          <span
            className="text-xs px-1.5 py-px rounded-sm ml-2"
            style={{ backgroundColor: '#C4956A18', color: '#C4956A' }}
          >
            H{lunation.house}{houseVerb ? ` · ${houseVerb}` : ''}
          </span>
        </p>
        <p className="text-xs text-muted font-sans">{lunation.date}</p>
        {lunation.nearNatal.length > 0 && (
          <p className="text-xs font-sans" style={{ color: '#C4956A' }}>
            Touches natal{' '}
            {lunation.nearNatal
              .map((n) => `${PLANET_GLYPH[n.planet] ?? ''}${n.planet} (${n.orb}°)`)
              .join(' · ')}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function WhatsActiveSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="bg-card border border-border rounded-sm px-5 py-4 flex gap-6">
        <div className="h-5 bg-border rounded w-36" />
        <div className="h-5 bg-border/50 rounded w-52" />
      </div>
      {[6, 3].map((count, si) => (
        <div key={si} className="bg-card border border-border rounded-sm p-6 space-y-1">
          <div className="h-5 bg-border rounded w-28 mb-4" />
          {Array.from({ length: count }, (_, i) => (
            <div key={i} className="py-4 space-y-2 border-t border-border first:border-t-0">
              <div className="h-4 bg-border rounded w-3/5" />
              <div className="h-3 bg-border/60 rounded w-2/5" />
              <div className="h-10 bg-border/40 rounded w-full mt-1" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Async data component ─────────────────────────────────────────────────────

async function PageContent() {
  await connection();

  const transits  = calcTransits();
  const lunations = getUpcomingLunations();
  const today     = new Date();
  const bucket12h = `${today.toISOString().slice(0, 10)}-${today.getHours() < 12 ? '0' : '1'}`;

  // Group aspects into three buckets
  const activeNow   = transits.aspects.filter((a) => a.orb <= 1.0);
  const approaching = transits.aspects.filter((a) => a.orb >  1.0 && a.applying);
  const separating  = transits.aspects.filter((a) => a.orb >  1.0 && !a.applying);

  async function buildRows(aspects: TransitAspect[]): Promise<TransitRow[]> {
    return Promise.all(
      aspects.map(async (asp) => {
        const tp   = transits.planets.find((p) => p.name === asp.transitPlanet)!;
        const slug = `${asp.transitPlanet}-${asp.aspect}-${asp.natalPlanet}`.toLowerCase().replace(/\s+/g, '-');
        const key  = `wa-${slug}`;
        const ctx  = buildWhatsActiveContext(asp, tp, transits.moonPhase.phase);
        const text = await getWhatsActiveInterpretation(key, bucket12h, ctx);
        const state = getActionState(asp, transits.moonPhase.illumination);
        return { asp, tp, text, state };
      }),
    );
  }

  const [activeRows, approachRows, sepRows] = await Promise.all([
    buildRows(activeNow),
    buildRows(approaching),
    buildRows(separating),
  ]);

  const noTransits = activeRows.length + approachRows.length + sepRows.length === 0;

  // Activated houses with verb labels
  const activatedHouseInfo = transits.activatedHouses
    .map((n) => {
      const h = HOUSES.find((h) => h.n === n);
      return h ? { n, verb: h.verb } : null;
    })
    .filter(Boolean) as { n: number; verb: string }[];

  return (
    <div className="space-y-4">

      {/* Moon phase */}
      <MoonBanner moonPhase={transits.moonPhase} />

      {noTransits && (
        <p className="text-muted text-sm italic px-1">No active transits found for today.</p>
      )}

      {/* Active now — tightest orb, most felt */}
      <TransitSection
        title="Active now"
        subtitle="Within 1° of exact — fully in effect"
        rows={activeRows}
      />

      {/* Approaching — applying, building */}
      <TransitSection
        title="Approaching"
        subtitle="Applying — building toward exact"
        rows={approachRows}
      />

      {/* Separating — past peak, muted */}
      <TransitSection
        title="Separating"
        subtitle="Past exact — releasing"
        rows={sepRows}
        dim
      />

      {/* Activated houses */}
      {activatedHouseInfo.length > 0 && (
        <section className="bg-card border border-border rounded-sm p-5 space-y-3">
          <div>
            <h2 className="font-display italic text-lg text-primary">Activated houses</h2>
            <p className="text-muted text-xs font-sans mt-0.5">
              Houses currently lit up by transiting or aspected natal planets
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {activatedHouseInfo.map(({ n, verb }) => (
              <span
                key={n}
                className="text-xs font-sans px-3 py-1.5 border border-border rounded-sm"
              >
                <span className="text-muted">H{n}</span>
                <span className="text-body italic ml-1.5">{verb}</span>
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Upcoming lunations */}
      <section className="bg-card border border-border rounded-sm p-5">
        <h2 className="font-display italic text-lg text-primary">Upcoming lunations</h2>
        <p className="text-muted text-xs font-sans mt-0.5 mb-1">
          New and full moons within 30 days — and what they touch in your chart
        </p>
        {lunations.map((l) => (
          <LunationCard key={`${l.type}-${l.date}`} lunation={l} />
        ))}
      </section>

    </div>
  );
}

// ─── Page entry point ─────────────────────────────────────────────────────────

export default function WhatsActivePage() {
  return (
    <div className="space-y-6 pb-16">

      <div className="space-y-1 pt-1">
        <p className="text-muted text-xs font-sans uppercase tracking-widest">Live</p>
        <h1 className="font-display italic text-[2rem] leading-tight text-primary">
          {"What's Active"}
        </h1>
        <p className="text-body text-sm max-w-lg">
          Every transit currently within orb of a natal planet — sorted by intensity and direction.
        </p>
      </div>

      <Suspense fallback={<WhatsActiveSkeleton />}>
        <PageContent />
      </Suspense>

    </div>
  );
}
