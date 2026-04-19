// ─── Static data ─────────────────────────────────────────────────────────────

const DERAILMENTS = [
  {
    id: 'simultaneous',
    title: 'Too many simultaneous projects',
    body: 'Art, tech, jewelry, auctions — all at once. Sagittarius stellium wants everything. Jupiter builds systems for all of it. Nothing launches.',
  },
  {
    id: 'over-social',
    title: 'Over-socialising without strategic filtering',
    body: 'Pisces 11th dissolves boundaries. You connect with everyone. Not all circles return value.',
  },
  {
    id: 'waiting-community',
    title: 'Waiting for the perfect community',
    body: 'South Node default: needing to feel held before moving. North Node says move first — community forms around authority.',
  },
  {
    id: 'infrastructure',
    title: 'Building infrastructure before testing',
    body: 'Notion with 47 databases. Brand architecture before the first client. Jupiter in 6th overuse.',
  },
  {
    id: 'neptune-dreams',
    title: "Neptune's beautiful dreams without structure",
    body: 'MC conjunct Neptune creates gorgeous visions. Without Saturn grounding them, inspiration stays inspiration.',
  },
  {
    id: 'impulsive-spending',
    title: 'Impulsive spending',
    body: 'Aries 12th impulse meets Sagittarius 8th expansiveness. Hidden fire spends before thinking.',
  },
] as const;

const COUNTER_MOVES = [
  'Redefine yourself publicly',
  'Begin publishing',
  'Become intellectually visible',
  'Expand internationally',
  'Depth over volume',
  'Clean thesis first',
] as const;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WatchListPage() {
  return (
    <div className="space-y-6 pb-16">

      <div className="space-y-1 pt-1">
        <p className="text-muted text-xs font-sans uppercase tracking-widest">Awareness</p>
        <h1 className="font-display italic text-[2rem] leading-tight text-primary">Watch List</h1>
        <p className="text-body text-sm max-w-lg">
          Recurring patterns to notice — not to shame, but to catch early. Each one has a counter-move.
        </p>
      </div>

      {/* Derailment cards */}
      <div className="space-y-2">
        {DERAILMENTS.map((d, i) => (
          <div
            key={d.id}
            className="bg-card border-l-2 border border-border rounded-sm pl-5 pr-5 py-4 space-y-1.5"
            style={{ borderLeftColor: '#B05A5A66', borderTopColor: '#211e18', borderRightColor: '#211e18', borderBottomColor: '#211e18' }}
          >
            <div className="flex items-start gap-3">
              <span className="font-sans text-xs text-muted/40 mt-0.5 shrink-0 tabular-nums">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="space-y-1 min-w-0">
                <h2 className="font-display italic text-[1.05rem] leading-snug text-primary">
                  {d.title}
                </h2>
                <p className="text-body text-sm leading-relaxed">{d.body}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Counter-moves */}
      <div
        className="bg-card border rounded-sm p-5 space-y-4"
        style={{ borderColor: '#C4956A44' }}
      >
        <div className="space-y-0.5">
          <p className="text-[10px] font-sans text-muted uppercase tracking-widest">Counter-moves</p>
          <h2 className="font-display italic text-lg text-primary">The antidotes</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {COUNTER_MOVES.map((move) => (
            <span
              key={move}
              className="text-xs font-sans px-3 py-1.5 rounded-sm border"
              style={{ color: '#C4956A', borderColor: '#C4956A44', backgroundColor: '#C4956A0e' }}
            >
              {move}
            </span>
          ))}
        </div>
      </div>

    </div>
  );
}
