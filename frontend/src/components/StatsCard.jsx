export default function StatsCard({ title, value, subtitle, accent = "cyan" }) {
  const accentClasses =
    accent === "amber"
      ? "from-amber-400/30 to-orange-500/10 text-amber-300"
      : accent === "red"
        ? "from-red-500/28 to-rose-600/12 text-rose-300"
        : "from-cyan-400/28 to-blue-500/10 text-cyan-300";

  return (
    <div className="metric-tile animate-fade-up rounded-[30px] p-5">
      <div className={`inline-flex rounded-full bg-gradient-to-r px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] ${accentClasses}`}>
        {title}
      </div>
      <div className="mt-5 text-4xl font-black tracking-[-0.04em] text-[color:var(--seer-text)]">{value}</div>
      <p className="mt-2 text-sm leading-6 text-[color:var(--seer-text-soft)]">{subtitle}</p>
    </div>
  );
}
