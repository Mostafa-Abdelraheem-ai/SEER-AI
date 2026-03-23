export default function ReportCard({ report }) {
  return (
    <div className="glass-panel rounded-[28px] p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-slate-950">Report {report.id.slice(0, 8)}</h3>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
          {report.severity}
        </span>
      </div>
      <p className="whitespace-pre-line text-sm leading-6 text-slate-600">{report.report_text}</p>
    </div>
  );
}
