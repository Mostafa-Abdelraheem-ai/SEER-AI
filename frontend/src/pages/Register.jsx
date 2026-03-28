import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import SeerLogo from "../components/SeerLogo";
import ThemeToggle from "../components/ThemeToggle";

export default function Register() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: "", email: "", password: "" });
  const [message, setMessage] = useState("");

  const formatError = (error) => {
    const detail = error?.response?.data?.detail;
    if (detail === "Email already exists") {
      return t("auth.register.emailExists");
    }
    if (typeof detail === "string" && detail.trim()) {
      return detail;
    }
    return t("auth.register.failed");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 md:px-8">
      <div className="absolute left-[10%] top-10 h-40 w-40 rounded-full bg-cyan-300/25 blur-3xl" />
      <div className="absolute bottom-6 right-[12%] h-52 w-52 rounded-full bg-blue-900/15 blur-3xl" />
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[30px] border border-white/60 bg-white/80 shadow-[0_40px_120px_rgba(8,21,42,0.16)] backdrop-blur md:grid-cols-[0.92fr,1.08fr] md:rounded-[36px]">
        <div className="p-6 md:p-10">
          <div className="mx-auto max-w-md">
            <div className="mb-8 flex items-center justify-between md:hidden">
              <SeerLogo compact to="/login" className="w-fit" ariaLabel={t("common.goToLogin")} />
              <ThemeToggle />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-700">{t("auth.register.eyebrow")}</p>
            <h1 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">{t("auth.register.title")}</h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              {t("auth.register.subtitle")}
            </p>
            <form
              className="mt-8 space-y-5"
              onSubmit={async (event) => {
                event.preventDefault();
                try {
                  await register(form);
                  navigate("/login");
                } catch (err) {
                  setMessage(formatError(err));
                }
              }}
            >
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700" htmlFor="register-full-name">
                  {t("auth.register.fullName")}
                </label>
                <input
                  id="register-full-name"
                  className="app-input"
                  autoComplete="name"
                  placeholder={t("auth.register.fullNamePlaceholder")}
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700" htmlFor="register-email">
                  {t("auth.register.email")}
                </label>
                <input
                  id="register-email"
                  className="app-input"
                  type="email"
                  autoComplete="email"
                  placeholder={t("auth.register.emailPlaceholder")}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700" htmlFor="register-password">
                  {t("auth.register.password")}
                </label>
                <input
                  id="register-password"
                  className="app-input"
                  type="password"
                  autoComplete="new-password"
                  placeholder={t("auth.register.passwordPlaceholder")}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
              {message ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{message}</div> : null}
              <button className="app-primary-button w-full">
                {t("auth.register.submit")}
              </button>
            </form>
            <p className="mt-6 text-sm text-slate-500">
              {t("common.alreadyHaveAccount")} <Link to="/login" className="font-semibold text-cyan-700">{t("common.login")}</Link>
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
              <SeerLogo to="/login" className="w-fit" ariaLabel={t("common.goToLogin")} />
            </div>
            <div className="mt-10 space-y-6">
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
                <div className="text-xs uppercase tracking-[0.28em] text-cyan-200/80">{t("auth.register.unlockTitle")}</div>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-200">
                  {t("auth.register.unlockItems", { returnObjects: true }).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-[28px] border border-cyan-400/20 bg-cyan-400/10 p-6 text-sm text-cyan-50">
                {t("auth.register.tip")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
