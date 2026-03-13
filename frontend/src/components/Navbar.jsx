import { Link, useLocation } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/analysis/new", label: "New Analysis" },
  { to: "/analysis/history", label: "History" },
  { to: "/reports", label: "Reports" },
  { to: "/profile", label: "Profile" },
];

export default function Navbar() {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <aside className="min-h-screen w-72 bg-cyber-900 px-6 py-8 text-white">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">SEER-AI++</h1>
        <p className="mt-2 text-sm text-slate-300">Cybersecurity investigation platform</p>
      </div>
      <nav className="space-y-3">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`block rounded-xl px-4 py-3 ${
              location.pathname === link.to ? "bg-cyber-700" : "bg-white/5 hover:bg-white/10"
            }`}
          >
            {link.label}
          </Link>
        ))}
        {user?.role === "admin" || user?.role === "analyst" ? (
          <Link to="/dashboard" className="block rounded-xl bg-white/5 px-4 py-3 hover:bg-white/10">
            Analyst View
          </Link>
        ) : null}
      </nav>
      <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-sm text-slate-300">{user?.full_name}</div>
        <div className="text-xs text-slate-400">{user?.email}</div>
        <button
          onClick={logout}
          className="mt-4 w-full rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
