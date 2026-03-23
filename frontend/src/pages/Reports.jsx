import { useEffect, useState } from "react";

import api from "../api/client";
import ReportCard from "../components/ReportCard";

export default function Reports() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    api.get("/api/analysis/history").then((response) => {
      const withReports = response.data.items
        .filter((item) => item.incident_report)
        .map((item) => ({
          id: item.id,
          severity: item.risk_score >= 70 ? "high" : item.risk_score >= 40 ? "medium" : "low",
          report_text: item.incident_report,
        }));
      setReports(withReports);
    });
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-700">Incident library</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] text-[color:var(--seer-text)]">Reports</h1>
        <p className="mt-3 text-sm leading-7 text-[color:var(--seer-text-soft)]">AI-generated narratives and summaries that can be reviewed, copied, and handed off when you need a stronger written record.</p>
      </div>
      {reports.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      ) : (
        <div className="panel-surface rounded-[30px] px-6 py-10 text-center">
          <h2 className="text-xl font-semibold text-[color:var(--seer-text)]">No reports available yet</h2>
          <p className="mt-3 text-sm leading-6 text-[color:var(--seer-text-soft)]">Generate a report from any analysis detail page and it will appear here.</p>
        </div>
      )}
    </div>
  );
}
