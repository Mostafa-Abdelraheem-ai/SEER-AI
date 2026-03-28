import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

import LanguageSwitcher from "./LanguageSwitcher";
import SeerLogo from "./SeerLogo";
import ThemeToggle from "./ThemeToggle";

export default function Topbar({ onToggleNav }) {
  const location = useLocation();
  const { t } = useTranslation();
  const copy = (() => {
    if (location.pathname.startsWith("/history/")) {
      return {
        title: t("topbar.historyDetail.title"),
        subtitle: t("topbar.historyDetail.subtitle"),
      };
    }
    const keyMap = {
      "/dashboard": "dashboard",
      "/assistant": "assistant",
      "/message-check": "messageCheck",
      "/voice-check": "voiceCheck",
      "/link-check": "linkCheck",
      "/image-privacy": "imagePrivacy",
      "/history": "history",
      "/profile": "profile",
      "/reports": "reports",
    };
    const key = keyMap[location.pathname] || "dashboard";
    return {
      title: t(`topbar.${key}.title`),
      subtitle: t(`topbar.${key}.subtitle`),
    };
  })();

  return (
    <header className="topbar-panel sticky top-3 z-30 mb-5 flex flex-col gap-4 rounded-[28px] px-4 py-4 sm:px-5 md:top-4 md:mb-6 md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onToggleNav}
          className="app-icon-button mt-1 md:hidden"
          aria-label={t("common.openNavigation")}
        >
          ☰
        </button>
        <div className="min-w-0">
          <div className="mb-3 md:hidden">
            <SeerLogo compact to="/dashboard" className="w-fit" />
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--seer-text-soft)]">
          <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_18px_rgba(58,188,255,0.9)]" />
          {t("common.aiSecurityConsole")}
          </div>
          <h1 className="mt-3 text-2xl font-black tracking-[-0.03em] text-[color:var(--seer-text)] md:text-3xl">
            {copy.title}
          </h1>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-[color:var(--seer-text-soft)]">
            {copy.subtitle}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <div className="metric-chip">
          <span className="metric-chip__dot metric-chip__dot--safe" />
          <span>{t("common.systemOnline")}</span>
        </div>
        <div className="metric-chip">
          <span className="metric-chip__dot metric-chip__dot--warn" />
          <span>{t("common.liveAiReasoning")}</span>
        </div>
        <LanguageSwitcher compact />
        <ThemeToggle compact />
      </div>
    </header>
  );
}
