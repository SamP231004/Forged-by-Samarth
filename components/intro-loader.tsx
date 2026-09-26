"use client";

import { AnimatePresence, m } from "framer-motion";
import { useEffect, useState } from "react";
import { site } from "@/lib/site";

/**
 * Short branded intro shown once per browser session.
 * An inline script in the layout adds `.intro-seen` to <html> on repeat
 * visits so the overlay never flashes.
 */
export function IntroLoader() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (document.documentElement.classList.contains("intro-seen")) {
      setShow(false);
      return;
    }
    try {
      sessionStorage.setItem("intro-seen", "1");
    } catch {}
    const t = setTimeout(() => setShow(false), 1100);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <m.div
          aria-hidden
          className="intro-loader fixed inset-0 z-[100] grid place-items-center bg-background"
          exit={{ opacity: 0, transition: { duration: 0.5, ease: [0.65, 0, 0.35, 1] } }}
        >
          <div className="flex flex-col items-center gap-5">
            <m.span
              initial={{ scale: 0.6, opacity: 0, rotate: -12 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 18 }}
              className="grid size-12 place-items-center rounded-2xl bg-foreground text-sm font-semibold text-background"
            >
              SP
            </m.span>
            <div className="h-px w-40 overflow-hidden rounded-full bg-border">
              <m.div
                className="h-full bg-gradient-to-r from-accent to-accent-2"
                initial={{ x: "-100%" }}
                animate={{ x: "0%" }}
                transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
              />
            </div>
            <m.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground"
            >
              {site.name}
            </m.p>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
