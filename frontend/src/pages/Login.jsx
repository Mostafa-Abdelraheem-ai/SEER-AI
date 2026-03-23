import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import SeerLogo from "../components/SeerLogo";
import ThemeToggle from "../components/ThemeToggle";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 md:px-8">
      <div className="absolute left-[8%] top-16 h-44 w-44 rounded-full bg-cyan-300/25 blur-3xl" />
      <div className="absolute bottom-10 right-[10%] h-56 w-56 rounded-full bg-blue-900/15 blur-3xl" />
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[36px] border border-white/60 bg-white/80 shadow-[0_40px_120px_rgba(8,21,42,0.16)] backdrop-blur md:grid-cols-[1.1fr,0.9fr]">
        <div className="relative hidden overflow-hidden bg-[linear-gradient(180deg,#07172c,#0b2440)] p-10 text-white md:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(103,211,255,0.18),transparent_32%)]" />
          <div className="relative">
            <div className="mb-6 flex justify-end">
              <ThemeToggle />
            </div>
            <SeerLogo className="animate-fade-up" />
            <div className="mt-10 space-y-6">
              <div className="animate-fade-up">
                <p className="text-xs font-semibold uppercase tracking-[0.34em] text-cyan-200/80">Live analyst cockpit</p>
                <h2 className="mt-3 text-4xl font-black leading-tight">
                  Investigate suspicious messages with faster context and cleaner evidence trails.
                </h2>
              </div>
              <div className="grid gap-4">
                {[
                  "Run phishing and social-engineering analysis across email, SMS, and chat.",
                  "Pull supporting knowledge chunks from pgvector-backed retrieval.",
                  "Move from signal review to incident reporting in one workspace.",
                ].map((item, index) => (
                  <div
                    key={item}
                    className="animate-fade-up rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-200"
                    style={{ animationDelay: `${index * 120}ms` }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="p-6 md:p-10">
          <div className="mx-auto max-w-md">
            <div className="mb-8 flex items-center justify-between md:hidden">
              <SeerLogo compact />
              <ThemeToggle />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-700">Welcome back</p>
            <h1 className="mt-3 text-4xl font-black text-slate-950">Sign in to SEER-AI</h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">Use your email account to enter the analyst dashboard.</p>
            <form
              className="mt-8 space-y-5"
              onSubmit={async (event) => {
                event.preventDefault();
                try {
                  await login(form);
                  navigate("/dashboard");
                } catch (err) {
                  setError(err.response?.data?.detail || "Login failed");
                }
              }}
            >
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700" htmlFor="login-email">
                  Email address
                </label>
                <input
                  id="login-email"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700" htmlFor="login-password">
                  Password
                </label>
                <input
                  id="login-password"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
              {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
              <button className="animate-pulse-soft w-full rounded-2xl bg-[linear-gradient(135deg,#08152a,#0d4f82)] px-4 py-3 font-semibold text-white shadow-[0_24px_44px_rgba(8,21,42,0.18)]">
                Enter Dashboard
              </button>
            </form>
            <p className="mt-6 text-sm text-slate-500">
              No account? <Link to="/register" className="font-semibold text-cyan-700">Register</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
