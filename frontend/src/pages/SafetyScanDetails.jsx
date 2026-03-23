import { useEffect, useState } from "react";
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

  useEffect(() => {
    fetchSafetyScan(id).then(setResult);
  }, [id]);

  if (!result) {
    return <div className="glass-panel rounded-[30px] px-6 py-8 text-slate-500">Loading check details...</div>;
  }

  const sourceText = result.transcript || result.parsed_email?.body || result.input_text || "";
  const boxes = result.metadata?.boxes || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-700">Check details</p>
          <h1 className="mt-3 text-4xl font-black text-slate-950">{result.title}</h1>
          <p className="mt-3 text-sm leading-7 text-slate-500">A full breakdown of what we checked, what we found, and what to do next.</p>
        </div>
        <ResultTabs value={tab} onChange={setTab} />
      </div>
      <SafetyResultPanel result={result} />
      {tab === "overview" ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="glass-panel rounded-[30px] p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Highlighted source</div>
            <div className="mt-4">
              <HighlightedText text={sourceText} highlights={result.findings || []} />
            </div>
          </div>
          <div className="glass-panel rounded-[30px] p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Signals that contributed most</div>
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
          <div className="glass-panel rounded-[30px] p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Technical metadata</div>
            <pre className="mt-4 overflow-x-auto rounded-[24px] bg-slate-950 p-4 text-xs leading-6 text-slate-200">
              {JSON.stringify(result.metadata || {}, null, 2)}
            </pre>
          </div>
          {result.scan_type === "image_privacy" && boxes.length ? (
            <div className="glass-panel rounded-[30px] p-6">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Sensitive regions</div>
              <div className="mt-4 text-sm leading-6 text-slate-500">Upload previews are available in the live analysis flow. Stored history keeps box coordinates and OCR findings for audit review.</div>
            </div>
          ) : (
            <div className="glass-panel rounded-[30px] p-6">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">References</div>
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
        <div className="glass-panel rounded-[30px] p-6">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Raw result payload</div>
          <pre className="mt-4 overflow-x-auto rounded-[24px] bg-slate-950 p-4 text-xs leading-6 text-slate-200">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      ) : null}
    </div>
  );
}
