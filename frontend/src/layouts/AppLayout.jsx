import { useEffect } from "react";

import Navbar from "../components/Navbar";
import Topbar from "../components/Topbar";
import ToastViewport from "../components/ToastViewport";
import { trackRenderMetric } from "../services/telemetry";

export default function AppLayout({ children }) {
  useEffect(() => {
    const startedAt = performance.now();
    const frame = requestAnimationFrame(() => {
      trackRenderMetric("layout.paint", { durationMs: Math.round(performance.now() - startedAt) });
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="shell-grid min-h-screen md:flex">
      <Navbar />
      <ToastViewport />
      <main className="flex-1 px-4 py-4 md:px-7 md:py-6 xl:px-8">
        <div className="mx-auto max-w-[1560px] animate-fade-up">
          <Topbar />
          {children}
        </div>
      </main>
    </div>
  );
}
