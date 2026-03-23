import { useEffect, useState } from "react";

import { subscribeTelemetry } from "../services/telemetry";

export default function ToastViewport() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    return subscribeTelemetry((event) => {
      if (event.type !== "api.error") return;
      const item = { id: `${Date.now()}-${Math.random()}`, message: event.payload.message || "Something went wrong." };
      setItems((current) => [...current.slice(-2), item]);
      window.setTimeout(() => {
        setItems((current) => current.filter((entry) => entry.id !== item.id));
      }, 4200);
    });
  }, []);

  if (!items.length) return null;

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 space-y-3">
      {items.map((item) => (
        <div key={item.id} className="pointer-events-auto w-80 rounded-2xl border border-red-200 bg-white/95 px-4 py-3 shadow-[0_24px_48px_rgba(8,21,42,0.16)] backdrop-blur">
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-red-500">Request issue</div>
          <div className="mt-2 text-sm leading-6 text-slate-700">{item.message}</div>
        </div>
      ))}
    </div>
  );
}
