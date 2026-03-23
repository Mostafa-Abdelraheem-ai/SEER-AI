import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import SeerLogo from "../components/SeerLogo";
import ThemeToggle from "../components/ThemeToggle";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: "", email: "", password: "" });
  const [message, setMessage] = useState("");

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 md:px-8">
      <div className="absolute left-[10%] top-10 h-40 w-40 rounded-full bg-cyan-300/25 blur-3xl" />
      <div className="absolute bottom-6 right-[12%] h-52 w-52 rounded-full bg-blue-900/15 blur-3xl" />
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[36px] border border-white/60 bg-white/80 shadow-[0_40px_120px_rgba(8,21,42,0.16)] backdrop-blur md:grid-cols-[0.92fr,1.08fr]">
        <div className="p-6 md:p-10">
          <div className="mx-auto max-w-md">
            <div className="mb-8 flex items-center justify-between md:hidden">
              <SeerLogo compact />
              <ThemeToggle />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-700">Create account</p>
            <h1 className="mt-3 text-4xl font-black text-slate-950">Join the SEER-AI workspace</h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Register once, then move directly into phishing analysis, evidence review, and reporting.
            </p>
            <form
              className="mt-8 space-y-5"
              onSubmit={async (event) => {
                event.preventDefault();
                try {
                  await register(form);
                  navigate("/login");
                } catch (err) {
                  setMessage(err.response?.data?.detail || "Registration failed");
                }
              }}
            >
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700" htmlFor="register-full-name">
                  Full name
                </label>
                <input
                  id="register-full-name"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                  autoComplete="name"
                  placeholder="Mostafa Abdelraheem"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700" htmlFor="register-email">
                  Email address
                </label>
                <input
                  id="register-email"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700" htmlFor="register-password">
                  Password
                </label>
                <input
                  id="register-password"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Create a password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
              {message ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{message}</div> : null}
              <button className="w-full rounded-2xl bg-[linear-gradient(135deg,#08152a,#0d4f82)] px-4 py-3 font-semibold text-white shadow-[0_24px_44px_rgba(8,21,42,0.18)]">
                Create Analyst Account
              </button>
            </form>
            <p className="mt-6 text-sm text-slate-500">
              Already have an account? <Link to="/login" className="font-semibold text-cyan-700">Login</Link>
            </p>
          </div>
        </div>
        <div className="relative hidden overflow-hidden bg-[linear-gradient(180deg,#07172c,#0b2440)] p-10 text-white md:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(103,211,255,0.18),transparent_32%)]" />
          <div className="relative">
            <div className="mb-6 flex justify-end">
              <ThemeToggle />
            </div>
            <div className="animate-float">
              <SeerLogo />
            </div>
            <div className="mt-10 space-y-6">
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
                <div className="text-xs uppercase tracking-[0.28em] text-cyan-200/80">What you unlock</div>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-200">
                  <li>Evidence-backed phishing analysis with model, rule, and retrieval signals.</li>
                  <li>Searchable investigation history and persistent incident reports.</li>
                  <li>Role-based access to a focused analyst dashboard.</li>
                </ul>
              </div>
              <div className="rounded-[28px] border border-cyan-400/20 bg-cyan-400/10 p-6 text-sm text-cyan-50">
                Tip: sign in with your email address on the next screen. The backend auth flow is email-based.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
