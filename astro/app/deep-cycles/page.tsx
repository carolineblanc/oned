import { DeepCyclesClient } from './DeepCyclesClient';

export default function DeepCyclesPage() {
  return (
    <div className="space-y-6 pb-16">

      <div className="space-y-1 pt-1">
        <p className="text-muted text-xs font-sans uppercase tracking-widest">
          La Grande Histoire
        </p>
        <h1 className="font-display italic text-[2rem] leading-tight text-primary">
          Deep Cycles
        </h1>
        <p className="text-body text-sm max-w-lg">
          The long arcs shaping this chapter — what's being dissolved, built, and tested at the level of years, not weeks.
        </p>
      </div>

      <DeepCyclesClient />

    </div>
  );
}
