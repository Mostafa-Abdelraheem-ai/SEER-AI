export default function StatsCard({ title, value, subtitle, accent = "cyan" }) {
  const accentClasses =
    accent === "amber"
      ? "from-amber-300/40 to-orange-200/20 text-amber-600"
      : accent === "red"
        ? "from-red-300/40 to-rose-200/20 text-rose-600"
        : "from-cyan-300/40 to-sky-200/20 text-cyan-700";

  return (
    <div className="glass-panel animate-fade-up rounded-[28px] p-5">
      <div className={`inline-flex rounded-full bg-gradient-to-r px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] ${accentClasses}`}>
        {title}
      </div>
      <div className="mt-5 text-4xl font-black text-slate-950">{value}</div>
      <p className="mt-2 text-sm leading-6 text-slate-500">{subtitle}</p>
    </div>
  );
}
