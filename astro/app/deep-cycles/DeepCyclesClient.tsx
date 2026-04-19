'use client';

import { useState } from 'react';

const CYCLES = [
  {
    id: 'direction',
    title: 'The Direction',
    subtitle: 'North Node · Capricorn 9th',
    body: `You're here to build systems of meaning — not just understand them. Every time you choose to teach rather than study, to structure rather than explore, to claim authority rather than seek more credentials, you're moving toward your growth edge. The South Node in Cancer 3rd says your default is nurturing through communication. That instinct served you — now lead with what you know.`,
    rightNow: `Transiting NN in Pisces (11th) supports this by pushing you into networks. Growth isn't solitary — it's through sharing your frameworks.`,
  },
  {
    id: 'metamorphosis',
    title: 'The Metamorphosis',
    subtitle: 'Pluto conjunct Saturn · 10th House',
    body: `Pluto is sitting on your natal Saturn — the planet governing your entire career structure. Everything about professional identity, how you hold authority, what "a career" should look like — permanently transforming. The Kering structures, the institutional path, the idea that credibility comes from someone else's brand — Pluto is dissolving all of it. What remains has to be genuinely yours.`,
    rightNow: `Exact conjunction ~2026. This is why the fractional path, Allora, OOC — they feel both terrifying and inevitable.`,
  },
  {
    id: 'inner-work',
    title: 'The Inner Work',
    subtitle: 'Saturn in Aries · 12th House',
    body: `Saturn entered your 12th — the unconscious, the hidden, the unprocessed. Your 12th is Aries: hidden fire, suppressed boldness, impulse-before-thought. Saturn says: you can't skip this. Suppressed ambition, old self-sabotage, blocks around independence — surfacing to be structured, not just felt.`,
    rightNow: `If you resist, Q4 becomes chaotic. This is a pruning year. External results come after internal clearing.`,
  },
  {
    id: 'voice',
    title: 'The Voice',
    subtitle: 'Jupiter in Cancer · 3rd House',
    body: `Jupiter is expanding your communication zone through Cancer, your South Node sign. Growth in your voice AND amplified temptation to default. Jupiter conjuncts your South Node (~mid-2026) — once in 12 years. Maximum awareness of default patterns. The opportunity: massive expansion of intellectual presence. The risk: doing it the comfortable way.`,
    rightNow: `Use Q2 for salons, podcasts, essays. Push toward authority, not accommodation.`,
  },
] as const;

export function DeepCyclesClient() {
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
      {CYCLES.map((cycle, i) => {
        const isOpen = expanded.has(cycle.id);
        return (
          <div
            key={cycle.id}
            className={[
              'border rounded-sm overflow-hidden transition-colors',
              isOpen ? 'border-accent/25 bg-card' : 'border-border bg-card',
            ].join(' ')}
          >
            {/* Header */}
            <button
              onClick={() => toggle(cycle.id)}
              className="w-full text-left px-6 py-5 flex items-start justify-between gap-6 group"
            >
              <div className="space-y-0.5">
                <div className="flex items-baseline gap-2.5">
                  <span className="text-muted text-xs font-sans tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                  <h2 className="font-display italic text-[1.4rem] leading-tight text-primary group-hover:text-accent/90 transition-colors">
                    {cycle.title}
                  </h2>
                </div>
                <p className="text-muted text-xs font-sans pl-[1.85rem]">{cycle.subtitle}</p>
              </div>
              <span
                className="text-muted text-sm mt-1 shrink-0 transition-transform duration-200"
                style={{ display: 'inline-block', transform: isOpen ? 'rotate(180deg)' : 'none' }}
              >
                ↓
              </span>
            </button>

            {/* Expanded content */}
            {isOpen && (
              <div className="px-6 pb-6 space-y-5 border-t border-border/40">
                <p className="text-body text-sm leading-relaxed pt-5 max-w-2xl">
                  {cycle.body}
                </p>

                {/* Right now */}
                <div
                  className="border-l-2 pl-4 py-1 space-y-1"
                  style={{ borderColor: '#C4956A55' }}
                >
                  <p className="text-[10px] font-sans text-muted uppercase tracking-widest">Right now</p>
                  <p className="text-sm leading-relaxed" style={{ color: '#C4956A' }}>
                    {cycle.rightNow}
                  </p>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
