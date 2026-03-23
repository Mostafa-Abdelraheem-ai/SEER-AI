import { Link, useLocation } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import SeerLogo from "./SeerLogo";
import ThemeToggle from "./ThemeToggle";

const links = [
  { to: "/dashboard", label: "Home" },
  { to: "/message-check", label: "Message Check" },
  { to: "/voice-check", label: "Voice Check" },
  { to: "/link-check", label: "Link Check" },
  { to: "/image-privacy", label: "Image Privacy" },
  { to: "/history", label: "History" },
  { to: "/profile", label: "Profile" },
];

export default function Navbar() {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <aside className="app-sidebar glass-panel relative overflow-hidden border-b border-white/50 px-5 py-6 text-white md:sticky md:top-0 md:min-h-screen md:w-80 md:border-b-0 md:border-r">
      <div className="absolute inset-x-5 top-3 h-24 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="relative">
        <div className="mb-8 animate-fade-up">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">System theme</div>
            <ThemeToggle />
          </div>
          <SeerLogo compact />
          <p className="mt-3 max-w-xs text-sm leading-6 text-slate-300">
            A simple digital safety assistant for messages, links, voice notes, attachments, and private image checks.
          </p>
        </div>
        <Link
          to="/message-check"
          className="app-cta mb-6 inline-flex w-full items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition hover:translate-y-[-1px]"
        >
          Start a Safety Check
        </Link>
      </div>
      <div className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
        Safety Tools
      </div>
      <nav className="space-y-3">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`nav-link block rounded-2xl px-4 py-3 text-sm transition ${
              location.pathname === link.to
                ? "nav-link--active bg-white text-slate-950 shadow-[0_18px_40px_rgba(0,0,0,0.22)]"
                : "bg-white/5 text-white hover:bg-white/10"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="font-medium">{link.label}</span>
              <span className={`h-2.5 w-2.5 rounded-full ${location.pathname === link.to ? "bg-cyan-400" : "bg-white/20"}`} />
            </div>
          </Link>
        ))}
      </nav>
      <div className="mt-8 rounded-[28px] border border-white/10 bg-white/5 p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/15 text-lg font-bold text-cyan-200">
            {(user?.full_name || "S").slice(0, 1).toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-100">{user?.full_name}</div>
            <div className="text-xs text-slate-400">{user?.email}</div>
          </div>
        </div>
        <div className="rounded-2xl border border-cyan-400/15 bg-slate-950/40 px-3 py-2 text-xs uppercase tracking-[0.2em] text-cyan-200">
          Role: {user?.role}
        </div>
        <button
          onClick={logout}
          className="mt-4 w-full rounded-2xl bg-white/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/15"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
