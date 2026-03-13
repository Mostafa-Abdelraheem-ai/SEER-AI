export default function StatsCard({ title, value, subtitle }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>
      <div className="mt-3 text-4xl font-bold text-slate-900">{value}</div>
      <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
    </div>
  );
}
