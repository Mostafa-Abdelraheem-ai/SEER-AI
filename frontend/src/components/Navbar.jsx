import { Link, useLocation } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import SeerLogo from "./SeerLogo";

const links = [
  { to: "/dashboard", label: "Home" },
  { to: "/message-check", label: "Assistant" },
  { to: "/voice-check", label: "Voice Check" },
  { to: "/link-check", label: "Link Check" },
  { to: "/image-privacy", label: "Image Privacy" },
  { to: "/history", label: "History" },
  { to: "/reports", label: "Reports" },
  { to: "/profile", label: "Settings" },
];

export default function Navbar() {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <aside className="app-sidebar relative overflow-hidden border-b border-white/6 px-5 py-6 text-white md:sticky md:top-0 md:min-h-screen md:w-[292px] md:border-b-0 md:border-r md:border-r-white/6">
      <div className="absolute inset-x-5 top-5 h-28 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="absolute bottom-10 right-0 h-36 w-36 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="relative">
        <div className="mb-8 animate-fade-up">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
            <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_16px_rgba(58,188,255,0.9)]" />
            Active posture
          </div>
          <SeerLogo compact />
          <p className="mt-3 max-w-xs text-sm leading-6 text-slate-300">
            A premium AI security companion for scam detection, privacy review, and multimodal risk analysis.
          </p>
        </div>
        <Link
          to="/message-check"
          className="app-cta mb-6 inline-flex w-full items-center justify-center rounded-[22px] px-4 py-3.5 text-sm font-semibold transition hover:translate-y-[-1px]"
        >
          Launch Analysis Workspace
        </Link>
      </div>
      <div className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
        Safety Tools
      </div>
      <nav className="space-y-3">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`nav-link block rounded-[22px] px-4 py-3.5 text-sm transition ${
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
      <div className="mt-8 rounded-[28px] border border-white/8 bg-white/5 p-5 backdrop-blur">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-lg font-bold text-cyan-200 shadow-[0_0_24px_rgba(58,188,255,0.18)]">
            {(user?.full_name || "S").slice(0, 1).toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-100">{user?.full_name}</div>
            <div className="text-xs text-slate-400">{user?.email}</div>
          </div>
        </div>
        <div className="rounded-2xl border border-cyan-400/15 bg-slate-950/40 px-3 py-2 text-xs uppercase tracking-[0.2em] text-cyan-200">
          Mode: {user?.role}
        </div>
        <button
          onClick={logout}
          className="mt-4 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
