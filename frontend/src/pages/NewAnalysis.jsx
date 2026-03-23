import { useState } from "react";

import api from "../api/client";
import SafetyResultPanel from "../components/SafetyResultPanel";

const messagePresets = [
  {
    label: "Urgent payment",
    channel: "message",
    text: "This is your manager. Send the payment now and keep it confidential.",
  },
  {
    label: "Password reset",
    channel: "email",
    text: "Your mailbox will be suspended today. Verify your password now to avoid deactivation.",
  },
  {
    label: "Prize scam",
    channel: "sms",
    text: "Congratulations, you won a prize. Click this link now to claim it before it expires.",
  },
];

export default function NewAnalysis() {
  const [mode, setMode] = useState("message");
  const [form, setForm] = useState({ input_text: "", channel: "message", raw_email_text: "" });
  const [emailFile, setEmailFile] = useState(null);
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-700">Message check</p>
        <h1 className="mt-3 text-4xl font-black text-slate-950">Check a message, email, or attachment</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
          Start with whichever format you have. We’ll explain in simple language whether it looks safe, deserves caution, or feels scam-like.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.3fr,1fr]">
        <form
          className="glass-panel rounded-[30px] p-6"
          onSubmit={async (event) => {
            event.preventDefault();
            try {
              setIsSubmitting(true);
              let response;
              if (mode === "message") {
                response = await api.post("/api/safety/message", { message: form.input_text, channel: form.channel });
              } else if (mode === "email-text") {
                response = await api.post("/api/safety/email", { raw_email_text: form.raw_email_text });
              } else if (mode === "email-upload") {
                const formData = new FormData();
                formData.append("email_file", emailFile);
                response = await api.post("/api/safety/email-upload", formData);
              } else {
                const formData = new FormData();
                formData.append("attachment", attachmentFile);
                response = await api.post("/api/safety/attachment", formData);
              }
              setResult(response.data);
              setError("");
            } catch (err) {
              setError(err.response?.data?.detail || "Analysis failed");
            } finally {
              setIsSubmitting(false);
            }
          }}
        >
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              {[
                { id: "message", label: "Message text" },
                { id: "email-text", label: "Paste email" },
                { id: "email-upload", label: "Upload .eml" },
                { id: "attachment", label: "Attachment file" },
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
            {mode === "message" ? (
              <>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Where did you receive it?</label>
                  <select
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                    value={form.channel}
                    onChange={(e) => setForm({ ...form, channel: e.target.value })}
                  >
                    <option value="message">Message</option>
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                    <option value="chat">Chat</option>
                  </select>
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label className="block text-sm font-medium text-slate-700">Message content</label>
                    <span className="text-xs uppercase tracking-[0.2em] text-slate-400">{form.input_text.length} chars</span>
                  </div>
                  <textarea
                    className="min-h-72 w-full rounded-2xl border border-slate-200 bg-white p-4 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                    placeholder="Paste the message here"
                    value={form.input_text}
                    onChange={(e) => setForm({ ...form, input_text: e.target.value })}
                  />
                </div>
                <div>
                  <div className="mb-2 text-sm font-medium text-slate-700">Quick start samples</div>
                  <div className="flex flex-wrap gap-2">
                    {messagePresets.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        className="rounded-full border border-cyan-100 bg-cyan-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700 transition hover:bg-cyan-100"
                        onClick={() => setForm({ ...form, channel: preset.channel, input_text: preset.text })}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : null}
            {mode === "email-text" ? (
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Paste the raw email</label>
                <textarea
                  className="min-h-72 w-full rounded-2xl border border-slate-200 bg-white p-4 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                  placeholder={"From: alerts@example.com\nReply-To: payment-help@other-site.com\nSubject: Verify now\n\nPaste the email here."}
                  value={form.raw_email_text}
                  onChange={(e) => setForm({ ...form, raw_email_text: e.target.value })}
                />
              </div>
            ) : null}
            {mode === "email-upload" ? (
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Upload an .eml file</label>
                <input type="file" accept=".eml,message/rfc822" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" onChange={(e) => setEmailFile(e.target.files?.[0] || null)} />
              </div>
            ) : null}
            {mode === "attachment" ? (
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Upload an attachment</label>
                <input type="file" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)} />
              </div>
            ) : null}
            {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
            <button
              className="rounded-2xl bg-[linear-gradient(135deg,#08152a,#0d4f82)] px-5 py-3 font-semibold text-white shadow-[0_24px_44px_rgba(8,21,42,0.18)]"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Checking..." : "Run check"}
            </button>
          </div>
        </form>
        <div className="space-y-6">
          <SafetyResultPanel result={result} />
          <div className="glass-panel rounded-[30px] p-6">
            <h2 className="text-lg font-semibold text-slate-950">What you’ll get back</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <li>A simple result like Safe, Caution, Risky, or Likely scam</li>
              <li>Plain-English reasons for the result</li>
              <li>Practical advice about what to do next</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
