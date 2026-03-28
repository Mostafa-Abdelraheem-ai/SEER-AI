export default function BarList({ title, subtitle, items, itemKey, valueKey, tone = "cyan" }) {
  const max = Math.max(...items.map((item) => item[valueKey] || 0), 1);
  const toneClass =
    tone === "amber"
      ? "from-amber-300 via-amber-400 to-red-500"
      : tone === "emerald"
        ? "from-emerald-300 via-emerald-400 to-teal-500"
        : "from-cyan-300 via-cyan-400 to-indigo-500";

  return (
    <div className="panel-surface interactive-surface rounded-[30px] p-5 sm:p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-[color:var(--seer-text)] sm:text-lg">{title}</h2>
          <p className="mt-1 text-sm text-[color:var(--seer-text-soft)]">{subtitle}</p>
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-[color:var(--seer-text-soft)]">
          {items.length} signals
        </div>
      </div>
      <div className="mt-6 space-y-4">
        {items.length ? (
          items.map((item, index) => {
            const value = item[valueKey] || 0;
            const width = `${Math.max((value / max) * 100, 12)}%`;
            return (
              <div
                key={item[itemKey]}
                className="rounded-[24px] border border-white/8 bg-black/20 p-4 animate-fade-up"
                style={{ animationDelay: `${index * 90}ms` }}
              >
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="font-medium text-[color:var(--seer-text-soft)]">{item[itemKey]}</span>
                  <span className="font-semibold text-[color:var(--seer-text)]">{value}</span>
                </div>
                <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/10">
                  <div className={`h-full rounded-full bg-gradient-to-r ${toneClass}`} style={{ width }} />
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-[24px] border border-dashed border-white/12 bg-black/20 px-4 py-8 text-center text-sm text-[color:var(--seer-text-soft)]">
            No data yet. Run a few analyses and this panel will populate automatically.
          </div>
        )}
      </div>
    </div>
  );
}
