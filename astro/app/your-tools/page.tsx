import { Suspense } from 'react';
import { connection } from 'next/server';
import { calcTransits } from '@/lib/ephemeris';
import { YourToolsClient, type NatalTransit } from './YourToolsClient';

const TOOL_PLANETS = ['Venus', 'Mars', 'Mercury', 'Jupiter', 'Saturn'] as const;

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ToolsSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="bg-card border border-border rounded-sm px-6 py-5 flex items-start gap-4">
          <div className="w-5 h-4 bg-border/40 rounded" />
          <div className="space-y-1.5 flex-1">
            <div className="h-5 bg-border rounded w-36" />
            <div className="h-3 bg-border/50 rounded w-52" />
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

  // Group transits by natal planet, for only the 5 tool planets
  const transitsByNatal: Record<string, NatalTransit[]> = {};
  for (const planet of TOOL_PLANETS) {
    transitsByNatal[planet] = transits.aspects
      .filter((a) => a.natalPlanet === planet)
      .map((a) => {
        const tp = transits.planets.find((p) => p.name === a.transitPlanet);
        return {
          transitPlanet: a.transitPlanet,
          aspect:        a.aspect,
          orb:           a.orb,
          applying:      a.applying,
          exactness:     a.exactness,
          retrograde:    tp?.retrograde ?? false,
        };
      });
  }

  return <YourToolsClient transitsByNatal={transitsByNatal} />;
}

// ─── Page entry point ─────────────────────────────────────────────────────────

export default function YourToolsPage() {
  return (
    <div className="space-y-6 pb-16">

      <div className="space-y-1 pt-1">
        <p className="text-muted text-xs font-sans uppercase tracking-widest">
          Personal Toolbox
        </p>
        <h1 className="font-display italic text-[2rem] leading-tight text-primary">
          Your Tools
        </h1>
        <p className="text-body text-sm max-w-lg">
          Five natal planets as instruments — how each works when used well, when overused, and when you're not using it at all.
        </p>
      </div>

      <Suspense fallback={<ToolsSkeleton />}>
        <PageContent />
      </Suspense>

    </div>
  );
}
