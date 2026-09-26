"use client";

import { useEffect, useRef } from "react";

/**
 * Layered hero background:
 * 1. slow-drifting aurora glows (transform-only, GPU cheap)
 * 2. a dot field that lights up around the pointer
 * 3. a soft light beam from the top and fine film grain
 */
export function HeroBackdrop() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia("(pointer: fine)").matches) return;
    let frame = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - r.left}px`);
        el.style.setProperty("--my", `${e.clientY - r.top}px`);
        el.style.setProperty("--spot", r.bottom > 0 ? "1" : "0");
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* Aurora */}
      <div className="absolute inset-0 opacity-90 dark:opacity-45">
        <div className="animate-aurora-1 absolute left-[4%] top-[-24%] h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--accent)_45%,transparent),transparent)]" />
        <div className="animate-aurora-2 absolute right-[-2%] top-[-14%] h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--accent-2)_38%,transparent),transparent)]" />
        <div className="animate-aurora-3 absolute left-[35%] top-[22%] dark:hidden h-[28rem] w-[40rem] rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklch,oklch(0.7_0.17_340)_22%,transparent),transparent)]" />
      </div>

      {/* Light beam */}
      <div className="absolute left-1/2 top-0 h-[40rem] w-[56rem] -translate-x-1/2 bg-[conic-gradient(from_180deg_at_50%_0%,transparent_155deg,color-mix(in_oklch,var(--foreground)_9%,transparent)_180deg,transparent_205deg)] mask-fade-b dark:opacity-40" />

      {/* Dot field, faint everywhere… */}
      <div className="bg-dots absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_30%,black,transparent)]" />
      {/* …and brighter under the pointer */}
      <div
        className="bg-dots-strong absolute inset-0 transition-opacity duration-500"
        style={{
          opacity: "var(--spot, 0)",
          maskImage: "radial-gradient(260px circle at var(--mx, 50%) var(--my, 30%), black, transparent)",
          WebkitMaskImage: "radial-gradient(260px circle at var(--mx, 50%) var(--my, 30%), black, transparent)",
        }}
      />

      {/* Grain + fade into the page */}
      <div className="bg-grain absolute inset-0 opacity-[0.35] mix-blend-overlay dark:hidden" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
    </div>
  );
}
