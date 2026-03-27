import { useEffect, useState } from "react";

import AmbientBackdrop from "../components/AmbientBackdrop";
import Navbar from "../components/Navbar";
import Topbar from "../components/Topbar";
import ToastViewport from "../components/ToastViewport";
import { trackRenderMetric } from "../services/telemetry";

export default function AppLayout({ children }) {
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    const startedAt = performance.now();
    const frame = requestAnimationFrame(() => {
      trackRenderMetric("layout.paint", { durationMs: Math.round(performance.now() - startedAt) });
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="shell-grid min-h-screen md:flex md:items-start md:gap-4 xl:gap-5">
      <AmbientBackdrop />
      <Navbar isOpen={navOpen} onClose={() => setNavOpen(false)} />
      <ToastViewport />
      <main className="min-w-0 flex-1 px-3 py-3 sm:px-4 sm:py-4 md:px-4 md:py-5 xl:px-5">
        <div className="mx-auto max-w-[1560px] animate-fade-up">
          <Topbar onToggleNav={() => setNavOpen((current) => !current)} />
          {children}
        </div>
      </main>
    </div>
  );
}
