import { useEffect, useRef } from "react";

export default function AmbientBackdrop() {
  const backdropRef = useRef(null);

  useEffect(() => {
    const node = backdropRef.current;
    if (!node) return undefined;

    let frame = null;
    const handleMove = (event) => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        node.style.setProperty("--spotlight-x", `${event.clientX}px`);
        node.style.setProperty("--spotlight-y", `${event.clientY}px`);
      });
    };

    window.addEventListener("pointermove", handleMove, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", handleMove);
    };
  }, []);

  return (
    <div ref={backdropRef} className="ambient-backdrop" aria-hidden="true">
      <div className="ambient-backdrop__spotlight" />
      <div className="ambient-backdrop__mesh" />
    </div>
  );
}
