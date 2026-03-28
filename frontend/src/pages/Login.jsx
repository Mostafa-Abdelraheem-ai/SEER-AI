import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import SeerLogo from "../components/SeerLogo";
import ThemeToggle from "../components/ThemeToggle";

export default function Login() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 md:px-8">
      <div className="absolute left-[8%] top-16 h-44 w-44 rounded-full bg-cyan-300/25 blur-3xl" />
      <div className="absolute bottom-10 right-[10%] h-56 w-56 rounded-full bg-blue-900/15 blur-3xl" />
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[30px] border border-white/60 bg-white/80 shadow-[0_40px_120px_rgba(8,21,42,0.16)] backdrop-blur md:grid-cols-[1.1fr,0.9fr] md:rounded-[36px]">
        <div className="relative hidden overflow-hidden bg-[linear-gradient(180deg,#07172c,#0b2440)] p-10 text-white md:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(103,211,255,0.18),transparent_32%)]" />
          <div className="relative">
            <div className="mb-6 flex justify-end">
              <ThemeToggle />
            </div>
            <SeerLogo to="/login" className="animate-fade-up w-fit" ariaLabel={t("common.goToLogin")} />
            <div className="mt-10 space-y-6">
              <div className="animate-fade-up">
                <p className="text-xs font-semibold uppercase tracking-[0.34em] text-cyan-200/80">{t("auth.login.heroEyebrow")}</p>
                <h2 className="mt-3 text-4xl font-black leading-tight">
                  {t("auth.login.heroTitle")}
                </h2>
              </div>
              <div className="grid gap-4">
                {t("auth.login.heroItems", { returnObjects: true }).map((item, index) => (
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
              <SeerLogo compact to="/login" className="w-fit" ariaLabel={t("common.goToLogin")} />
              <ThemeToggle />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-700">{t("auth.login.eyebrow")}</p>
            <h1 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">{t("auth.login.title")}</h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">{t("auth.login.subtitle")}</p>
            <form
              className="mt-8 space-y-5"
              onSubmit={async (event) => {
                event.preventDefault();
                try {
                  await login(form);
                  navigate("/dashboard");
                } catch (err) {
                  setError(err.response?.data?.detail || t("auth.login.failed"));
                }
              }}
            >
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700" htmlFor="login-email">
                  {t("auth.login.email")}
                </label>
                <input
                  id="login-email"
                  className="app-input"
                  type="email"
                  autoComplete="email"
                  placeholder={t("auth.login.emailPlaceholder")}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700" htmlFor="login-password">
                  {t("auth.login.password")}
                </label>
                <input
                  id="login-password"
                  className="app-input"
                  type="password"
                  autoComplete="current-password"
                  placeholder={t("auth.login.passwordPlaceholder")}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
              {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
              <button className="animate-pulse-soft app-primary-button w-full">
                {t("auth.login.submit")}
              </button>
            </form>
            <p className="mt-6 text-sm text-slate-500">
              {t("common.noAccount")} <Link to="/register" className="font-semibold text-cyan-700">{t("common.register")}</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
