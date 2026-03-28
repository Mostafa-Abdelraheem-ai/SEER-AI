import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useAuth } from "../hooks/useAuth";
import SeerLogo from "./SeerLogo";

export default function Navbar({ isOpen = false, onClose = () => {} }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const links = [
    { to: "/dashboard", label: t("common.home") },
    { to: "/assistant", label: t("common.assistant") },
    { to: "/message-check", label: t("common.messageCheck") },
    { to: "/voice-check", label: t("common.voiceCheck") },
    { to: "/link-check", label: t("common.linkCheck") },
    { to: "/image-privacy", label: t("common.imagePrivacy") },
    { to: "/history", label: t("common.history") },
    { to: "/reports", label: t("common.reports") },
    { to: "/profile", label: t("common.settings") },
  ];

  return (
    <>
      <div
        className={`app-sidebar-backdrop ${isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"} md:hidden`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`app-sidebar ${isOpen ? "app-sidebar--open" : "app-sidebar--closed"} fixed inset-y-0 left-0 z-40 w-[280px] max-w-[80vw] overflow-y-auto px-4 py-5 text-white transition-transform duration-300 md:sticky md:top-4 md:self-start md:max-h-[calc(100vh-2rem)] md:max-w-none md:translate-x-0 md:overflow-y-auto md:rounded-[30px] md:px-4 md:py-4 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="absolute inset-x-4 top-4 h-24 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute bottom-8 right-0 h-32 w-32 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="relative space-y-5">
          <div className="animate-fade-up">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_16px_rgba(58,188,255,0.9)]" />
                {t("common.activePosture")}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="app-icon-button md:hidden"
                aria-label={t("common.closeNavigation")}
              >
                ✕
              </button>
            </div>
            <SeerLogo compact to="/dashboard" className="sidebar-brand w-fit" />
            <p className="mt-2.5 max-w-[15.5rem] text-[13px] leading-5 text-slate-300">
              {t("nav.description")}
            </p>
          </div>
          <Link
            to="/assistant"
            onClick={onClose}
            className="app-cta inline-flex min-h-[44px] w-full items-center justify-center rounded-[20px] px-4 py-3 text-[13px] font-semibold transition hover:translate-y-[-1px]"
          >
            {t("nav.launchWorkspace")}
          </Link>
          <div className="space-y-2.5 pt-0.5">
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
              {t("nav.section")}
            </div>
            <nav className="space-y-2">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={onClose}
                  className={`nav-link block rounded-[20px] px-3.5 py-3 text-[13px] transition ${
                    location.pathname === link.to || (link.to === "/history" && location.pathname.startsWith("/history/"))
                      ? "nav-link--active text-white"
                      : "text-slate-300 hover:bg-white/6"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium">{link.label}</span>
                    <span className={`h-2.5 w-2.5 rounded-full ${location.pathname === link.to || (link.to === "/history" && location.pathname.startsWith("/history/")) ? "bg-cyan-400 shadow-[0_0_18px_rgba(58,188,255,0.9)]" : "bg-white/20"}`} />
                  </div>
                </Link>
              ))}
            </nav>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 shadow-[0_16px_34px_rgba(0,0,0,0.22)] backdrop-blur">
            <div className="mb-3.5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[18px] border border-cyan-400/20 bg-cyan-400/10 text-base font-bold text-cyan-200 shadow-[0_0_24px_rgba(58,188,255,0.18)]">
                {(user?.full_name || "S").slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="truncate text-[13px] font-semibold text-slate-100">{user?.full_name}</div>
                <div className="truncate text-xs text-slate-400">{user?.email}</div>
              </div>
            </div>
            <div className="rounded-[18px] border border-cyan-400/15 bg-slate-950/40 px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-cyan-200">
              {t("nav.mode")}: {user?.role}
            </div>
            <button
              onClick={logout}
              className="mt-3.5 min-h-[44px] w-full rounded-[18px] border border-white/10 bg-white/5 px-4 py-3 text-[13px] font-medium text-white transition hover:bg-white/10"
            >
              {t("common.logout")}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
