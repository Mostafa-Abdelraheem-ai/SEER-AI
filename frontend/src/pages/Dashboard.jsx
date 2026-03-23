import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../api/client";
import SafetyHistoryCard from "../components/SafetyHistoryCard";

export default function Dashboard() {
  const navigate = useNavigate();
  const [recentItems, setRecentItems] = useState([]);

  useEffect(() => {
    api.get("/api/safety/history?limit=4").then((response) => setRecentItems(response.data.items));
  }, []);

  return (
    <div className="space-y-8">
      <div className="glass-panel relative overflow-hidden rounded-[34px] px-6 py-8 md:px-8">
        <div className="absolute right-[-40px] top-[-40px] h-48 w-48 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1.15fr,0.85fr]">
          <div className="animate-fade-up">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-cyan-700">Seer-AI command deck</p>
            <h1 className="mt-3 text-4xl font-black text-slate-950">Simple checks for everyday digital safety.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
              Ask plain questions like “Is this message a scam?”, “Is this link safe?”, or “Could this image expose private information?” and get a clear answer with practical advice.
            </p>
          </div>
          <div className="grid gap-4 self-start md:grid-cols-2 lg:grid-cols-1">
            <Link to="/message-check" className="rounded-[28px] bg-[linear-gradient(135deg,#08152a,#0d4f82)] px-5 py-5 text-white shadow-[0_26px_46px_rgba(8,21,42,0.18)] transition hover:translate-y-[-2px]">
              <div className="text-xs uppercase tracking-[0.24em] text-cyan-200/80">Quick action</div>
              <div className="mt-2 text-xl font-bold">Check a message</div>
              <p className="mt-2 text-sm text-slate-200">Paste a message, raw email, or upload an attachment to check it safely.</p>
            </Link>
            <div className="rounded-[28px] border border-cyan-100 bg-cyan-50/80 px-5 py-5">
              <div className="text-xs uppercase tracking-[0.24em] text-cyan-700">Friendly reminder</div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Even a “safe” result is not a guarantee. If money, passwords, or urgent pressure are involved, verify the request another way.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { to: "/message-check", title: "Message Check", text: "Paste suspicious texts or emails and get a plain-language warning." },
          { to: "/voice-check", title: "Voice Check", text: "Upload a voice note and look for scam pressure or manipulation." },
          { to: "/link-check", title: "Link Check", text: "Check a link or file hash before you click or trust it." },
          { to: "/image-privacy", title: "Image Privacy", text: "See if a photo may reveal phone numbers, cards, or other private details." },
        ].map((item) => (
          <Link key={item.to} to={item.to} className="glass-panel rounded-[28px] p-5 transition hover:translate-y-[-2px]">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700">{item.title}</div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{item.text}</p>
          </Link>
        ))}
      </div>
      <div className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700">Recent checks</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">Your latest safety results</h2>
          </div>
          <Link to="/history" className="text-sm font-semibold text-cyan-700">Open full history</Link>
        </div>
        {recentItems.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {recentItems.map((item) => (
              <SafetyHistoryCard key={item.id} item={item} onOpen={(id) => navigate(`/history/${id}`)} />
            ))}
          </div>
        ) : (
          <div className="glass-panel rounded-[30px] px-6 py-10 text-center text-sm text-slate-500">
            No checks yet. Try Message Check, Voice Check, Link Check, or Image Privacy Check to get started.
          </div>
        )}
      </div>
    </div>
  );
}
