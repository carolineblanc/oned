// ─── 9-Year Cycle Bar ─────────────────────────────────────────────────────────

function CycleBar() {
  const CURRENT = 5;
  return (
    <div className="space-y-3">
      {/* Squares */}
      <div className="flex items-end gap-2">
        {Array.from({ length: 9 }, (_, i) => {
          const year      = i + 1;
          const isCurrent = year === CURRENT;
          const isPast    = year < CURRENT;

          return (
            <div key={year} className="flex flex-col items-center gap-1.5">
              {isCurrent && (
                <span className="text-[10px] font-sans" style={{ color: '#C4956A' }}>now</span>
              )}
              <div
                className="rounded-sm flex items-center justify-center"
                style={{
                  width:           isCurrent ? 52 : 36,
                  height:          isCurrent ? 52 : 36,
                  backgroundColor: isCurrent ? '#C4956A' : isPast ? '#1e1b16' : '#13110e',
                  border:          `1px solid ${isCurrent ? '#C4956A' : isPast ? '#2e2a22' : '#1a1712'}`,
                  opacity:         (!isCurrent && !isPast) ? 0.45 : 1,
                }}
              >
                <span
                  className="font-display text-sm"
                  style={{ color: isCurrent ? '#0c0b09' : isPast ? '#6a5f4f' : '#3a3530' }}
                >
                  {year}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Labels */}
      <div className="flex items-center justify-between px-0.5">
        <span className="text-xs text-muted font-sans">Foundation · 1–4</span>
        <span className="text-xs font-sans font-medium" style={{ color: '#C4956A' }}>
          Pivot · 5
        </span>
        <span className="text-xs text-muted/50 font-sans">Harvest · 6–9</span>
      </div>
    </div>
  );
}

// ─── Keyword tag ──────────────────────────────────────────────────────────────

function Keyword({ label }: { label: string }) {
  return (
    <span
      className="text-xs font-sans px-3 py-1.5 rounded-sm border"
      style={{ color: '#C4956A', borderColor: '#C4956A44', backgroundColor: '#C4956A0e' }}
    >
      {label}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Year5Page() {
  const keywords = [
    'Movement', 'Experimentation', 'Freedom', 'Disruption',
    'Travel', 'Sensory expansion', 'Breaking patterns',
  ];

  return (
    <div className="space-y-6 pb-16">

      {/* Header */}
      <div className="space-y-1 pt-1">
        <p className="text-muted text-xs font-sans uppercase tracking-widest">
          Numerology
        </p>
        <h1 className="font-display italic text-[2rem] leading-tight text-primary">
          Year 5
        </h1>
        <p className="text-body text-sm max-w-lg">
          Life Path 6 in a Personal Year 5 — the nurturer learning to move.
        </p>
      </div>

      {/* Life Path 6 */}
      <section className="bg-card border border-border rounded-sm p-6 space-y-3">
        <div className="space-y-0.5">
          <p className="text-[10px] font-sans text-muted uppercase tracking-widest">Life Path</p>
          <h2 className="font-display italic text-xl text-primary">6 — The Nurturer-Creator</h2>
        </div>
        <p className="text-body text-sm leading-relaxed max-w-2xl">
          Responsibility, beauty, service, harmony. Your life path is about creating beauty that serves — not decorative, but structurally meaningful. The tension: you feel responsible for everything and everyone, which feeds the South Node accommodation pattern. The gift: when you channel this toward building beautiful systems (not just caring for people), it's extraordinary.
        </p>
      </section>

      {/* Personal Year 5 */}
      <section className="bg-card border border-accent/20 rounded-sm p-6 space-y-3">
        <div className="space-y-0.5">
          <p className="text-[10px] font-sans text-muted uppercase tracking-widest">Personal Year</p>
          <h2 className="font-display italic text-xl text-primary">
            5 — Change, Movement, Freedom
          </h2>
        </div>
        <p className="text-body text-sm leading-relaxed max-w-2xl">
          A Year 5 doesn't ask you to build — it asks you to move. Experiment. Try things that feel risky. Let old forms collapse. This is NOT a year for perfecting the plan; it's a year for testing, pivoting, and allowing disruption. The freedom you experience this year is proportional to how much you release.
        </p>
      </section>

      {/* Keywords */}
      <section className="space-y-3">
        <p className="text-[10px] font-sans text-muted uppercase tracking-widest">Year 5 keywords</p>
        <div className="flex flex-wrap gap-2">
          {keywords.map((kw) => <Keyword key={kw} label={kw} />)}
        </div>
      </section>

      {/* Guidance quote */}
      <section
        className="border-l-2 pl-5 py-1"
        style={{ borderColor: '#C4956A55' }}
      >
        <p className="font-display italic text-lg leading-relaxed" style={{ color: '#e8ddd0cc' }}>
          "Move. More air. More deliberately. Go but don't scatter.<br />
          Old comfort zones become liberating to leave.<br />
          Volatility that leads to growth."
        </p>
      </section>

      {/* 9-Year Cycle */}
      <section className="bg-card border border-border rounded-sm p-6 space-y-5">
        <div className="space-y-0.5">
          <p className="text-[10px] font-sans text-muted uppercase tracking-widest">9-Year Cycle</p>
          <h2 className="font-display italic text-lg text-primary">Where you are</h2>
        </div>

        <CycleBar />

        <p className="text-body text-sm leading-relaxed max-w-2xl pt-1">
          You're in the middle of your 9-year cycle — past the foundation-building years (1–4), entering the pivot point. Year 5 is the hinge. What you decide to release this year determines what can be built in Years 6–9. Don't cling.
        </p>
      </section>

    </div>
  );
}
