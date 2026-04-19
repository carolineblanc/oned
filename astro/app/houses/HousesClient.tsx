'use client';

import { useState } from 'react';
import { HOUSES } from '@/lib/houses-data';

const PLANET_GLYPH: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆',
  Pluto: '♇', 'North Node': '☊',
};

const ACTIVATION_DOT: Record<string, string> = {
  'VERY HIGH': '#C4956A',
  HIGH:        '#9B8EC4',
  MEDIUM:      '#6a5f4f',
  LOW:         '#3a3530',
};

export interface TransitPlanet {
  name: string;
  sign: string;
  degreeInSign: number;
  retrograde: boolean;
}

export interface HouseTransit {
  planet: TransitPlanet;
  line: string;
}

export interface Project {
  id: number;
  name: string;
  intention: string | null;
  domain: string | null;
  state: string | null;
}

interface Props {
  projectsByHouse: Record<number, Project[]>;
  transitsByHouse: Record<number, HouseTransit[]>;
}

export function HousesClient({ projectsByHouse, transitsByHouse }: Props) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  function toggle(n: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  }

  return (
    <div className="space-y-2">
      {HOUSES.map((h) => {
        const isOpen      = expanded.has(h.n);
        const projects    = projectsByHouse[h.n] ?? [];
        const transits    = transitsByHouse[h.n] ?? [];
        const dotColor    = ACTIVATION_DOT[h.activation];

        return (
          <div
            key={h.n}
            className={[
              'rounded-sm border overflow-hidden transition-colors',
              h.isKey
                ? 'border-accent/30 bg-card'
                : 'border-border bg-card',
            ].join(' ')}
          >
            {/* ── Card header (always visible) ── */}
            <button
              onClick={() => toggle(h.n)}
              className="w-full text-left px-5 py-4 flex items-center gap-4 group"
            >
              {/* House number */}
              <span className="font-display italic text-2xl leading-none text-muted/60 w-8 shrink-0">
                {h.n}
              </span>

              {/* Title block */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span className="font-display italic text-[17px] leading-snug text-primary">
                    {h.verb}
                  </span>
                  <span className="text-xs text-muted font-sans">{h.sign}</span>
                  {h.natalPlanets && (
                    <span className="text-xs text-body font-sans">{h.natalPlanets}</span>
                  )}
                </div>
              </div>

              {/* Tags + activation + chevron */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Activation dot */}
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: dotColor }}
                />

                {h.isKey && (
                  <span
                    className="text-[10px] font-sans px-2 py-0.5 rounded-sm border tracking-wide"
                    style={{ color: '#C4956A', borderColor: '#C4956A44' }}
                  >
                    key house
                  </span>
                )}
                {h.isActivated && (
                  <span
                    className="text-[10px] font-sans px-2 py-0.5 rounded-sm border tracking-wide"
                    style={{ color: '#9B8EC4', borderColor: '#9B8EC444' }}
                  >
                    activated
                  </span>
                )}

                <span className="text-muted text-xs ml-1 transition-transform duration-200"
                  style={{ display: 'inline-block', transform: isOpen ? 'rotate(180deg)' : 'none' }}>
                  ↓
                </span>
              </div>
            </button>

            {/* ── Expanded content ── */}
            {isOpen && (
              <div className="px-5 pb-6 space-y-5 border-t border-border/50">

                {/* Story */}
                <p className="text-body text-sm leading-relaxed pt-5 max-w-2xl">
                  {h.story}
                </p>

                {/* Ask */}
                <p className="text-sm leading-relaxed max-w-2xl italic"
                  style={{ color: '#C4956A' }}>
                  → {h.ask}
                </p>

                {/* Current Transits */}
                {transits.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-sans text-muted uppercase tracking-widest">
                      Transiting through now
                    </p>
                    <div className="space-y-2">
                      {transits.map(({ planet, line }) => {
                        const g = PLANET_GLYPH[planet.name] ?? '';
                        return (
                          <div
                            key={planet.name}
                            className="flex items-start gap-3 py-2 border-t border-border/40 first:border-t-0"
                          >
                            <span className="text-accent text-sm shrink-0 mt-0.5">{g}</span>
                            <div className="min-w-0 space-y-0.5">
                              <p className="text-sm text-primary">
                                {planet.name}
                                <span className="text-body font-sans ml-1.5 text-xs">
                                  {planet.sign} {planet.degreeInSign}°
                                  {planet.retrograde && (
                                    <span className="text-accent/60 ml-1">Rx</span>
                                  )}
                                </span>
                              </p>
                              {line && (
                                <p className="text-xs text-body leading-relaxed">{line}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Projects */}
                <div className="space-y-2">
                  <p className="text-[10px] font-sans text-muted uppercase tracking-widest">
                    Projects linked here
                  </p>
                  {projects.length === 0 ? (
                    <p className="text-xs text-muted italic">No projects linked to this house yet.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {projects.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-start gap-2 py-2 border-t border-border/40 first:border-t-0"
                        >
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <p className="text-sm text-primary">{p.name}</p>
                            {p.intention && (
                              <p className="text-xs text-body">{p.intention}</p>
                            )}
                          </div>
                          {p.state && (
                            <span className="text-[10px] font-sans text-muted border border-border rounded-sm px-1.5 py-0.5 shrink-0">
                              {p.state}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
