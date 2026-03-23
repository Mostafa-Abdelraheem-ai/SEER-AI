import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AnalysisWorkspace from "../components/AnalysisWorkspace";
import BarList from "../components/BarList";
import SafetyHistoryCard from "../components/SafetyHistoryCard";
import StatsCard from "../components/StatsCard";
import { useSafetyAssistant } from "../hooks/useSafetyAssistant";
import { fetchSafetyHistory } from "../services/safety";

export default function Dashboard() {
  const navigate = useNavigate();
  const assistant = useSafetyAssistant("message");
  const [recentItems, setRecentItems] = useState([]);

  useEffect(() => {
    fetchSafetyHistory(4).then(setRecentItems);
  }, []);

  const riskyCount = recentItems.filter((item) => ["risky", "likely_scam", "private_info_detected"].includes(item.verdict)).length;
  const averageRisk = recentItems.length ? Math.round(recentItems.reduce((sum, item) => sum + (item.risk_score || 0), 0) / recentItems.length) : 0;
  const tacticDistribution = recentItems
    .flatMap((item) => item.tactics || item.metadata?.tactics || [])
    .reduce((accumulator, tactic) => {
      const existing = accumulator.find((entry) => entry.label === tactic.label);
      if (existing) existing.count += 1;
      else accumulator.push({ label: tactic.label, count: 1 });
      return accumulator;
    }, [])
    .slice(0, 4);
  const riskMix = [
    { label: "Safe", count: recentItems.filter((item) => item.verdict === "safe").length },
    { label: "Warning", count: recentItems.filter((item) => item.verdict === "caution").length },
    { label: "High risk", count: recentItems.filter((item) => ["risky", "likely_scam", "private_info_detected"].includes(item.verdict)).length },
  ];
  const liveStatus = averageRisk >= 75 ? "Elevated" : averageRisk >= 45 ? "Watch" : "Stable";

  return (
    <div className="space-y-8">
      <div className="panel-surface relative overflow-hidden rounded-[38px] px-6 py-8 md:px-8">
        <div className="absolute right-[-40px] top-[-40px] h-48 w-48 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="absolute bottom-[-70px] left-[15%] h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1.15fr,0.85fr]">
          <div className="animate-fade-up">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-cyan-700">Personal AI safety assistant</p>
            <h1 className="mt-3 max-w-4xl text-4xl font-black tracking-[-0.05em] text-[color:var(--seer-text)] md:text-5xl">
              Multimodal AI protection for suspicious messages, links, files, images, and voice notes.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[color:var(--seer-text-soft)]">
              Drop into one workspace, let the app detect the input type, and get a clear risk answer with highlighted evidence, confidence, and practical next steps.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/message-check" className="app-cta rounded-[22px] px-5 py-3 text-sm font-semibold">
                Open assistant
              </Link>
              <Link to="/history" className="rounded-[22px] border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-[color:var(--seer-text-soft)] transition hover:bg-white/8">
                Review recent scans
              </Link>
            </div>
          </div>
          <div className="grid gap-4 self-start md:grid-cols-2 lg:grid-cols-1">
            <div className="metric-tile rounded-[30px] px-5 py-5">
              <div className="text-xs uppercase tracking-[0.24em] text-cyan-300/80">Live risk posture</div>
              <div className="mt-5 flex items-end justify-between gap-3">
                <div className="text-5xl font-black tracking-[-0.05em] text-[color:var(--seer-text)]">{averageRisk}</div>
                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--seer-text-soft)]">
                  Avg risk
                </div>
              </div>
              <div className="mt-4 h-2.5 rounded-full bg-white/8">
                <div className="h-2.5 rounded-full bg-[linear-gradient(90deg,#38bdf8,#8b5cf6)]" style={{ width: `${averageRisk}%` }} />
              </div>
              <p className="mt-3 text-sm leading-6 text-[color:var(--seer-text-soft)]">
                Higher scores mean stronger scam, manipulation, or privacy warning signals across recent checks.
              </p>
            </div>
            <div className="panel-surface rounded-[30px] px-5 py-5">
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs uppercase tracking-[0.24em] text-cyan-300/80">System posture</div>
                <div className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                  liveStatus === "Elevated"
                    ? "bg-red-500/15 text-red-200"
                    : liveStatus === "Watch"
                      ? "bg-amber-400/15 text-amber-200"
                      : "bg-emerald-400/15 text-emerald-200"
                }`}>
                  {liveStatus}
                </div>
              </div>
              <div className="mt-4 grid gap-3">
                {[
                  ["Analyze", "Text, links, email, images, files, and voice in one workspace."],
                  ["Explain", "Get plain-language summaries plus technical evidence when you need it."],
                  ["Act", "Follow next-step guidance before clicking, sharing, replying, or paying."],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-[22px] border border-white/8 bg-black/20 p-3">
                    <div className="text-sm font-semibold text-[color:var(--seer-text)]">{label}</div>
                    <div className="mt-1 text-sm leading-6 text-[color:var(--seer-text-soft)]">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="Recent scans" value={recentItems.length} subtitle="Latest activity visible on this dashboard." />
        <StatsCard title="High risk" value={riskyCount} subtitle="Results that need stronger user caution." accent="red" />
        <StatsCard title="Protected modes" value="7" subtitle="Text, email, link, hash, image, file, and voice." />
        <StatsCard title="Avg confidence" value={`${recentItems.length ? Math.round((recentItems.reduce((sum, item) => sum + ((item.confidence || item.metadata?.confidence || 0) * 100), 0) / recentItems.length)) : 0}%`} subtitle="Average AI confidence on recent checks." accent="amber" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { to: "/message-check", title: "Unified assistant", text: "One analysis space for messages, emails, links, files, images, audio, and hashes." },
          { to: "/voice-check", title: "Voice risk", text: "Upload a voice note and inspect both the transcript and the speaker’s pressure level." },
          { to: "/link-check", title: "Link and hash", text: "Break down suspicious links or file hashes with a clearer explanation of why." },
          { to: "/image-privacy", title: "Image privacy", text: "Preview your image and highlight sensitive text before you share it." },
        ].map((item) => (
          <Link key={item.to} to={item.to} className="metric-tile rounded-[28px] p-5 transition hover:translate-y-[-2px]">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700">{item.title}</div>
            <p className="mt-3 text-sm leading-6 text-[color:var(--seer-text-soft)]">{item.text}</p>
          </Link>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <BarList
          title="Recent risk mix"
          subtitle="A quick view of how recent checks are distributed by severity."
          items={riskMix}
          itemKey="label"
          valueKey="count"
          tone="amber"
        />
        <BarList
          title="Top persuasion tactics"
          subtitle="Signals the AI has been seeing most often across recent checks."
          items={tacticDistribution.length ? tacticDistribution : [{ label: "No tactic data yet", count: 0 }]}
          itemKey="label"
          valueKey="count"
          tone="emerald"
        />
      </div>
      <AnalysisWorkspace
        assistant={assistant}
        title="Start a safety check"
        subtitle="Paste text, drop a file, or switch the mode. SEER-AI will guide you from input to explanation."
      />
      <div className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700">Recent checks</p>
            <h2 className="mt-2 text-2xl font-black text-[color:var(--seer-text)]">Your latest safety results</h2>
          </div>
          <Link to="/history" className="text-sm font-semibold text-cyan-300">Open full history</Link>
        </div>
        {recentItems.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {recentItems.map((item) => (
              <SafetyHistoryCard key={item.id} item={item} onOpen={(id) => navigate(`/history/${id}`)} />
            ))}
          </div>
        ) : (
          <div className="panel-surface rounded-[30px] px-6 py-10 text-center text-sm text-[color:var(--seer-text-soft)]">
            No checks yet. Use the assistant above to analyze your first message, link, image, file, or voice note.
          </div>
        )}
      </div>
    </div>
  );
}
