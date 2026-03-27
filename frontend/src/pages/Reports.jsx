import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import api from "../api/client";
import ReportCard from "../components/ReportCard";

export default function Reports() {
  const [reports, setReports] = useState([]);
  const { t } = useTranslation();

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
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-700">{t("reportsPage.eyebrow")}</p>
        <h1 className="text-3xl font-black tracking-[-0.04em] text-[color:var(--seer-text)] sm:text-4xl">{t("reportsPage.title")}</h1>
        <p className="max-w-3xl text-sm leading-7 text-[color:var(--seer-text-soft)]">{t("reportsPage.subtitle")}</p>
      </div>
      {reports.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      ) : (
        <div className="panel-surface rounded-[30px] px-6 py-10 text-center">
          <h2 className="text-xl font-semibold text-[color:var(--seer-text)]">{t("reportsPage.emptyTitle")}</h2>
          <p className="mt-3 text-sm leading-6 text-[color:var(--seer-text-soft)]">{t("reportsPage.emptySubtitle")}</p>
        </div>
      )}
    </div>
  );
}
