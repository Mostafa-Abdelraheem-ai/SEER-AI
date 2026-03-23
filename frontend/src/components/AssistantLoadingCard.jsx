export default function AssistantLoadingCard({ message }) {
  return (
    <div className="panel-surface rounded-[30px] p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-cyan-300/10 shadow-[0_12px_36px_rgba(31,185,255,0.15)]">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-300 border-t-transparent" />
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">Working</div>
          <div className="mt-1 text-lg font-semibold text-[color:var(--seer-text)]">{message}</div>
        </div>
      </div>
      <div className="mt-6 space-y-3">
        <div className="h-4 animate-pulse rounded-full bg-white/8" />
        <div className="h-4 w-4/5 animate-pulse rounded-full bg-white/8" />
        <div className="h-4 w-3/5 animate-pulse rounded-full bg-white/8" />
      </div>
    </div>
  );
}
