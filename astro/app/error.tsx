'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="space-y-4 pt-8">
      <div className="space-y-1">
        <p className="text-muted text-xs font-sans uppercase tracking-widest">Error</p>
        <h1 className="font-display italic text-[2rem] leading-tight text-primary">
          Something went wrong
        </h1>
      </div>
      <p className="text-body text-sm max-w-md leading-relaxed">{error.message}</p>
      <button
        onClick={reset}
        className="text-xs font-sans px-4 py-2 rounded-sm border border-border text-body hover:text-primary hover:border-primary/40 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
