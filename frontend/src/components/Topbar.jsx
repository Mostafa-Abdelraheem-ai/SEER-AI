import { useLocation } from "react-router-dom";

import ThemeToggle from "./ThemeToggle";

const TITLES = {
  "/dashboard": {
    title: "Security Overview",
    subtitle: "AI-guided safety monitoring across messages, uploads, and digital interactions.",
  },
  "/message-check": {
    title: "Unified Analysis Workspace",
    subtitle: "Analyze text, email, links, audio, images, and files from one premium command surface.",
  },
  "/voice-check": {
    title: "Voice Risk Review",
    subtitle: "Combine transcript understanding with tone and pressure analysis.",
  },
  "/link-check": {
    title: "Link And Hash Review",
    subtitle: "Inspect URLs and file hashes with evidence-rich explanations.",
  },
  "/image-privacy": {
    title: "Image Privacy Detection",
    subtitle: "Spot sensitive information before images are shared or posted.",
  },
  "/history": {
    title: "Analysis Archive",
    subtitle: "Reopen previous checks, compare risk levels, and follow investigation history.",
  },
  "/profile": {
    title: "Settings And Integrations",
    subtitle: "Control providers, webhook posture, and system visibility from one place.",
  },
  "/reports": {
    title: "AI Reports",
    subtitle: "Review generated narratives, summaries, and analyst-ready outputs.",
  },
};

function getCopy(pathname) {
  if (pathname.startsWith("/history/")) {
    return {
      title: "Result Deep Dive",
      subtitle: "Trace the explanation, evidence, and raw signals behind a previous decision.",
    };
  }
  return TITLES[pathname] || TITLES["/dashboard"];
}

export default function Topbar() {
  const location = useLocation();
  const copy = getCopy(location.pathname);

  return (
    <header className="topbar-panel sticky top-4 z-30 mb-6 flex flex-col gap-4 rounded-[28px] px-5 py-4 md:flex-row md:items-center md:justify-between">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--seer-text-soft)]">
          <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_18px_rgba(58,188,255,0.9)]" />
          AI Security Console
        </div>
        <h1 className="mt-3 text-2xl font-black tracking-[-0.03em] text-[color:var(--seer-text)] md:text-3xl">
          {copy.title}
        </h1>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-[color:var(--seer-text-soft)]">
          {copy.subtitle}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="metric-chip">
          <span className="metric-chip__dot metric-chip__dot--safe" />
          <span>System online</span>
        </div>
        <div className="metric-chip">
          <span className="metric-chip__dot metric-chip__dot--warn" />
          <span>Live AI reasoning</span>
        </div>
        <ThemeToggle compact />
      </div>
    </header>
  );
}
