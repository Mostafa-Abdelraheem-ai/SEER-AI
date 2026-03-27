import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import HighlightedText from "../components/HighlightedText";
import ImagePrivacyPreview from "../components/ImagePrivacyPreview";
import ResultTabs from "../components/ResultTabs";
import SafetyResultPanel from "../components/SafetyResultPanel";
import { fetchSafetyScan } from "../services/safety";

export default function SafetyScanDetails() {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [tab, setTab] = useState("overview");
  const { t } = useTranslation();

  useEffect(() => {
    fetchSafetyScan(id).then(setResult);
  }, [id]);

  if (!result) {
    return <div className="glass-panel interactive-surface rounded-[30px] px-6 py-8 text-sm text-slate-500">{t("detailsPage.loadingCheckDetails")}</div>;
  }

  const sourceText = result.transcript || result.parsed_email?.body || result.input_text || "";
  const boxes = result.metadata?.boxes || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-700">{t("detailsPage.checkDetails")}</p>
          <h1 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">{result.title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">{t("detailsPage.checkDetailsSubtitle")}</p>
        </div>
        <ResultTabs value={tab} onChange={setTab} />
      </div>
      <SafetyResultPanel result={result} />
      {tab === "overview" ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="glass-panel interactive-surface rounded-[30px] p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{t("detailsPage.highlightedSource")}</div>
            <div className="mt-4">
              <HighlightedText text={sourceText} highlights={result.findings || []} />
            </div>
          </div>
          <div className="glass-panel interactive-surface rounded-[30px] p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{t("detailsPage.topSignals")}</div>
            <div className="mt-4 space-y-3">
              {(result.findings || []).map((finding, index) => (
                <div key={`${finding.label}-${index}`} className="rounded-[24px] border border-slate-100 bg-slate-50 p-4">
                  <div className="text-sm font-semibold text-slate-950">{finding.label}</div>
                  <div className="mt-2 text-sm leading-6 text-slate-700">{finding.note}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
      {tab === "details" ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="glass-panel interactive-surface rounded-[30px] p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{t("detailsPage.technicalMetadata")}</div>
            <pre className="mt-4 overflow-x-auto rounded-[24px] bg-slate-950 p-4 text-xs leading-6 text-slate-200">
              {JSON.stringify(result.metadata || {}, null, 2)}
            </pre>
          </div>
          {result.scan_type === "image_privacy" && boxes.length ? (
            <div className="glass-panel interactive-surface rounded-[30px] p-6">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{t("detailsPage.sensitiveRegions")}</div>
              <div className="mt-4 text-sm leading-6 text-slate-500">{t("detailsPage.sensitiveRegionsHelp")}</div>
            </div>
          ) : (
            <div className="glass-panel interactive-surface rounded-[30px] p-6">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{t("detailsPage.references")}</div>
              <div className="mt-4 space-y-3">
                {(result.citations || []).map((citation, index) => (
                  <div key={`${citation.source}-${index}`} className="rounded-[24px] border border-slate-100 bg-slate-50 p-4">
                    <div className="text-sm font-semibold text-slate-950">{citation.source}</div>
                    <div className="mt-2 text-sm leading-6 text-slate-700">{citation.snippet}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
      {tab === "raw" ? (
        <div className="glass-panel interactive-surface rounded-[30px] p-6">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{t("detailsPage.rawPayload")}</div>
          <pre className="mt-4 overflow-x-auto rounded-[24px] bg-slate-950 p-4 text-xs leading-6 text-slate-200">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      ) : null}
    </div>
  );
}
