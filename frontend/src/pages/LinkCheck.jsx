import { useState } from "react";

import api from "../api/client";
import SafetyResultPanel from "../components/SafetyResultPanel";

export default function LinkCheck() {
  const [mode, setMode] = useState("link");
  const [value, setValue] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const endpoint = mode === "link" ? "/api/safety/link" : "/api/safety/hash";
  const payloadKey = mode === "link" ? "url" : "hash_value";

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-700">Link and file hash check</p>
        <h1 className="mt-3 text-4xl font-black text-slate-950">Check a link or a file hash</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
          Paste a website link or a file hash and we’ll explain what looks normal, what looks suspicious, and where the limits of the check are.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[0.9fr,1.1fr]">
        <form
          className="glass-panel rounded-[30px] p-6"
          onSubmit={async (event) => {
            event.preventDefault();
            try {
              setLoading(true);
              setError("");
              const response = await api.post(endpoint, { [payloadKey]: value });
              setResult(response.data);
            } catch (err) {
              setError(err.response?.data?.detail || "Check failed");
            } finally {
              setLoading(false);
            }
          }}
        >
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              {[
                { id: "link", label: "Check a link" },
                { id: "hash", label: "Check a file hash" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${mode === item.id ? "bg-[linear-gradient(135deg,#08152a,#0d4f82)] text-white" : "border border-slate-200 bg-white text-slate-700"}`}
                  onClick={() => setMode(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">{mode === "link" ? "Link" : "Hash"}</label>
              <textarea
                className="min-h-40 w-full rounded-2xl border border-slate-200 bg-white p-4 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                placeholder={mode === "link" ? "https://example.com/login" : "Paste an MD5, SHA1, or SHA256 hash"}
                value={value}
                onChange={(event) => setValue(event.target.value)}
              />
            </div>
            {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
            <button className="rounded-2xl bg-[linear-gradient(135deg,#08152a,#0d4f82)] px-5 py-3 font-semibold text-white" disabled={loading}>
              {loading ? "Checking..." : mode === "link" ? "Check link" : "Check hash"}
            </button>
          </div>
        </form>
        <SafetyResultPanel result={result} />
      </div>
    </div>
  );
}
