"use client";

import { AnimatePresence, m, useMotionValueEvent, useScroll } from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { nav, site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export function Navbar() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 12));

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4">
      <nav
        aria-label="Main"
        className={cn(
          "mx-auto flex h-14 max-w-5xl items-center justify-between rounded-full border px-2 pl-5 transition-all duration-500",
          scrolled || open
            ? "glass border-border shadow-[0_8px_32px_-12px_rgb(0_0_0/0.25)]"
            : "border-transparent bg-transparent",
        )}
      >
        <Link href="/" className="group flex items-center gap-2.5 font-medium tracking-tight" aria-label={`${site.name} — home`}>
          <span className="relative grid size-7 place-items-center rounded-lg bg-foreground text-[11px] font-semibold text-background transition-transform duration-300 group-hover:rotate-[-6deg]">
            SP
          </span>
          <span className="hidden text-[15px] sm:inline">{site.name}</span>
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {nav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="rounded-full px-3.5 py-2 text-[13.5px] text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href="/#contact">
              Work with me <ArrowUpRight />
            </Link>
          </Button>
          <button
            type="button"
            className="grid size-9 place-items-center rounded-full border border-border lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <m.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="glass mx-auto mt-2 max-w-5xl rounded-3xl border border-border p-3 lg:hidden"
          >
            <ul>
              {nav.map((item, i) => (
                <m.li
                  key={item.href}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.03 * i }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-2xl px-4 py-3 text-lg tracking-tight hover:bg-muted"
                  >
                    {item.label}
                  </Link>
                </m.li>
              ))}
            </ul>
            <Button asChild className="mt-2 w-full" size="lg">
              <Link href="/#contact" onClick={() => setOpen(false)}>
                Start your project <ArrowUpRight />
              </Link>
            </Button>
          </m.div>
        )}
      </AnimatePresence>
    </header>
  );
}
