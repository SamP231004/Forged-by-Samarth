"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { flushSync } from "react-dom";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = !mounted || resolvedTheme === "dark";

  const toggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const next = isDark ? "light" : "dark";
    // Pause element colour transitions so the new theme is captured fully applied.
    const freeze = document.createElement("style");
    freeze.textContent = "*,*::before,*::after{transition:none!important}";
    const unfreeze = () => requestAnimationFrame(() => freeze.remove());

    const apply = () => {
      // Update the DOM synchronously so the view transition captures the new theme.
      const root = document.documentElement;
      document.head.appendChild(freeze);
      root.classList.toggle("dark", next === "dark");
      root.style.colorScheme = next;
      flushSync(() => setTheme(next));
    };

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!document.startViewTransition || reduce) {
      apply();
      unfreeze();
      return;
    }

    // Grow a circle from the click point (or the button centre for keyboard use).
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX || rect.left + rect.width / 2;
    const y = e.clientY || rect.top + rect.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

    const transition = document.startViewTransition(apply);
    transition.ready
      .then(() => {
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: 700, easing: "cubic-bezier(0.65, 0, 0.35, 1)", pseudoElement: "::view-transition-new(root)" },
        );
      })
      .catch(() => {});
    transition.finished.finally(unfreeze);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      className="relative grid size-9 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      <Sun className="size-4 rotate-90 scale-0 transition-transform duration-300 dark:rotate-0 dark:scale-100" aria-hidden />
      <Moon className="absolute size-4 rotate-0 scale-100 transition-transform duration-300 dark:-rotate-90 dark:scale-0" aria-hidden />
    </button>
  );
}
