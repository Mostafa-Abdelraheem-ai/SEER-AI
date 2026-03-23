export default function BarList({ title, subtitle, items, itemKey, valueKey, tone = "cyan" }) {
  const max = Math.max(...items.map((item) => item[valueKey] || 0), 1);
  const toneClass =
    tone === "amber"
      ? "from-amber-300 via-amber-400 to-orange-500"
      : tone === "emerald"
        ? "from-emerald-300 via-emerald-400 to-teal-500"
        : "from-sky-300 via-cyan-400 to-blue-500";

  return (
    <div className="rounded-[28px] border border-white/55 bg-white/88 p-6 shadow-[0_30px_80px_rgba(8,21,42,0.08)] backdrop-blur">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
        <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500">
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
                className="rounded-2xl border border-slate-100 bg-slate-50/90 p-4 animate-fade-up"
                style={{ animationDelay: `${index * 90}ms` }}
              >
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="font-medium text-slate-700">{item[itemKey]}</span>
                  <span className="font-semibold text-slate-950">{value}</span>
                </div>
                <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200">
                  <div className={`h-full rounded-full bg-gradient-to-r ${toneClass}`} style={{ width }} />
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            No data yet. Run a few analyses and this panel will populate automatically.
          </div>
        )}
      </div>
    </div>
  );
}
