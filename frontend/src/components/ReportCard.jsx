export default function ReportCard({ report }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">Report {report.id.slice(0, 8)}</h3>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{report.severity}</span>
      </div>
      <p className="text-sm text-slate-600 whitespace-pre-line">{report.report_text}</p>
    </div>
  );
}
