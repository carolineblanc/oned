'use client';

import { useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NatalTransit {
  transitPlanet: string;
  aspect: string;
  orb: number;
  applying: boolean;
  exactness: number;
  retrograde: boolean;
}

// ─── Static data ──────────────────────────────────────────────────────────────

const ASPECT_GLYPH: Record<string, string> = {
  conjunction: '☌', opposition: '☍', square: '□', trine: '△', sextile: '⚹',
};

const PLANET_GLYPH: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆',
  Pluto: '♇', 'North Node': '☊',
};

const TOOLS = [
  {
    id: 'venus',
    planet: 'Venus',
    natalKey: 'Venus',
    glyph: '♀',
    sign: 'Scorpio',
    house: 7,
    tagline: 'Your Chart Ruler — the lens everything passes through',
    story: `Venus rules your entire chart. In Scorpio in the 7th, you attract through depth, intensity, emotional truth. Not by being approachable — by being undeniably real. The connections that moved the needle — Briony, Christophe Robin — engaged your depth. The ones that went nowhere asked you to soften.`,
    optimal: `Be unflinchingly honest about what you want. Your magnetism increases when you stop being accessible and start being precise.`,
    overuse: `Testing people. Withholding vulnerability while demanding depth. The Scorpio sting when someone disappoints.`,
    underuse: `Softening preferences to seem less intimidating. Underpricing because intensity feels "too much."`,
  },
  {
    id: 'mars',
    planet: 'Mars',
    natalKey: 'Mars',
    glyph: '♂',
    sign: 'Sagittarius',
    house: 8,
    tagline: 'How you take action',
    story: `You don't move incrementally — you bet big on things that mean something. Mars in the 8th means your action involves other people's stakes. This is why the auction concept excites you, why OOC with Briony felt more alive than solo. You ACT best when co-invested.`,
    optimal: `Bold moves in shared territory. Propose the deal. Put skin in the game alongside someone you respect.`,
    overuse: `Too many big bets at once. OOC AND auction AND First Call AND the novel simultaneously.`,
    underuse: `Waiting for permission. Having the boldest idea in the room and framing it as tentative.`,
  },
  {
    id: 'mercury',
    planet: 'Mercury',
    natalKey: 'Mercury',
    glyph: '☿',
    sign: 'Sagittarius',
    house: 8,
    tagline: 'How you think and articulate',
    story: `Your mind is a synthesizer. You see a piece of jewelry and understand its cultural biography. You bridge luxury strategy and collector psychology in one conversation. Mercury in the 8th goes beneath surfaces — not what things look like, but what they mean, what they're really worth.`,
    optimal: `Articulate the hidden value. Name what nobody else is naming. Write, teach, structure your insights.`,
    overuse: `Over-philosophizing when someone needs a clear answer. Building intellectual architectures for things that need a pitch.`,
    underuse: `Not sharing because insights feel "too abstract." Deferring to packaged expertise. Silence when you have the most interesting thing to say.`,
  },
  {
    id: 'jupiter',
    planet: 'Jupiter',
    natalKey: 'Jupiter',
    glyph: '♃',
    sign: 'Virgo',
    house: 6,
    tagline: 'How you grow',
    story: `You grow through refinement, not accumulation. Not bigger — more precise, more elegant, more functional. The 6th house grounds it in daily practice. The danger? Building the perfect system for a project with zero traction. The Notion workspace. The brand architecture before the first client call.`,
    optimal: `Channel refinement into what's alive. Your operational intelligence IS strategic. Stop dismissing it as "just being organized."`,
    overuse: `Perfectionism as procrastination. Optimizing before traction. Confusing improvement with progress.`,
    underuse: `Dismissing your curatorial instinct. Not trusting that your ability to refine IS what people pay for.`,
  },
  {
    id: 'saturn',
    planet: 'Saturn',
    natalKey: 'Saturn',
    glyph: '♄',
    sign: 'Aquarius',
    house: 10,
    tagline: 'How you build lasting structures',
    story: `Your career is unconventional by design. You're not meant to follow templates — the discipline is maintaining your own framework when nobody validates it. This is Allora, OOC, the fractional path. They feel unstable compared to a Kering salary, but Saturn says: the instability IS the structure. You're building something that didn't exist before. With Pluto now here, the old structures are being permanently dismantled anyway.`,
    optimal: `Stay disciplined on your unconventional path. Don't borrow other people's career templates. Consistency compounds.`,
    overuse: `Over-systematizing before experimenting. Demanding structure from a career still finding its shape.`,
    underuse: `Abandoning your framework for someone else's institution. The reflex to apply for the safe role. That door is closing because it's supposed to.`,
  },
] as const;

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  transitsByNatal: Record<string, NatalTransit[]>;
}

export function YourToolsClient({ transitsByNatal }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-3">
      {TOOLS.map((tool, i) => {
        const isOpen   = expanded.has(tool.id);
        const transits = transitsByNatal[tool.natalKey] ?? [];

        return (
          <div
            key={tool.id}
            className={[
              'border rounded-sm overflow-hidden transition-colors',
              isOpen ? 'border-accent/25 bg-card' : 'border-border bg-card',
            ].join(' ')}
          >
            {/* ── Header ── */}
            <button
              onClick={() => toggle(tool.id)}
              className="w-full text-left px-6 py-5 flex items-start justify-between gap-6 group"
            >
              <div className="flex items-start gap-4 min-w-0">
                {/* Index */}
                <span className="font-sans text-xs text-muted/50 mt-1 shrink-0 w-5">
                  {String(i + 1).padStart(2, '0')}
                </span>

                {/* Planet glyph + name block */}
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-accent text-lg leading-none">{tool.glyph}</span>
                    <span className="font-display italic text-[1.35rem] leading-tight text-primary group-hover:text-accent/90 transition-colors">
                      {tool.planet}
                    </span>
                    <span className="text-muted text-xs font-sans">
                      {tool.sign} · H{tool.house}
                    </span>
                  </div>
                  <p className="text-body text-xs italic">{tool.tagline}</p>
                </div>
              </div>

              {/* Chevron + transit indicator */}
              <div className="flex items-center gap-2 shrink-0 mt-0.5">
                {transits.length > 0 && (
                  <span
                    className="text-[10px] font-sans px-1.5 py-0.5 rounded-sm border"
                    style={{ color: '#6BA89E', borderColor: '#6BA89E44' }}
                  >
                    {transits.length} transit{transits.length > 1 ? 's' : ''}
                  </span>
                )}
                <span
                  className="text-muted text-sm transition-transform duration-200"
                  style={{ display: 'inline-block', transform: isOpen ? 'rotate(180deg)' : 'none' }}
                >
                  ↓
                </span>
              </div>
            </button>

            {/* ── Expanded content ── */}
            {isOpen && (
              <div className="px-6 pb-6 space-y-5 border-t border-border/40">

                {/* Story */}
                <p className="text-body text-sm leading-relaxed pt-5 max-w-2xl">
                  {tool.story}
                </p>

                {/* Optimal / Overuse / Underuse */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Optimal — teal */}
                  <div
                    className="rounded-sm p-4 space-y-1.5"
                    style={{ backgroundColor: '#6BA89E12', border: '1px solid #6BA89E33' }}
                  >
                    <p className="text-[10px] font-sans uppercase tracking-widest" style={{ color: '#6BA89E' }}>
                      Optimal use
                    </p>
                    <p className="text-xs text-body leading-relaxed">{tool.optimal}</p>
                  </div>

                  {/* Overuse — gold */}
                  <div
                    className="rounded-sm p-4 space-y-1.5"
                    style={{ backgroundColor: '#C4956A12', border: '1px solid #C4956A33' }}
                  >
                    <p className="text-[10px] font-sans uppercase tracking-widest" style={{ color: '#C4956A' }}>
                      Overuse
                    </p>
                    <p className="text-xs text-body leading-relaxed">{tool.overuse}</p>
                  </div>

                  {/* Underuse — red */}
                  <div
                    className="rounded-sm p-4 space-y-1.5"
                    style={{ backgroundColor: '#B05A5A12', border: '1px solid #B05A5A33' }}
                  >
                    <p className="text-[10px] font-sans uppercase tracking-widest" style={{ color: '#B05A5A' }}>
                      Underuse
                    </p>
                    <p className="text-xs text-body leading-relaxed">{tool.underuse}</p>
                  </div>
                </div>

                {/* Current transits */}
                {transits.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-sans text-muted uppercase tracking-widest">
                      Current transits
                    </p>
                    <div className="space-y-1.5">
                      {transits.map((t, idx) => {
                        const pg = PLANET_GLYPH[t.transitPlanet] ?? '';
                        const ag = ASPECT_GLYPH[t.aspect] ?? t.aspect;
                        return (
                          <p key={idx} className="text-xs text-body font-sans">
                            <span className="text-accent mr-0.5">{pg}</span>
                            <span className="text-primary">{t.transitPlanet}</span>
                            {t.retrograde && <span className="text-accent/60 ml-0.5 text-[10px]">Rx</span>}
                            <span className="text-muted mx-1.5">{ag}</span>
                            <span>your {tool.planet}</span>
                            <span className="text-muted mx-1.5">·</span>
                            <span className="text-muted">{t.applying ? '↑ applying' : '↓ separating'}</span>
                            <span className="text-muted mx-1">·</span>
                            <span className="text-muted">{t.orb}° orb</span>
                          </p>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
