"use client";

import { m, useScroll, useSpring } from "framer-motion";
import { useRef } from "react";
import { Reveal } from "@/components/motion/reveal";
import { Eyebrow, Section, Serif } from "@/components/ui/section";
import { process } from "@/lib/content";

export function Process() {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <Section id="process" className="border-t border-border">
      <div className="container-page grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div>
          <Reveal className="lg:sticky lg:top-32">
            <Eyebrow>How I work</Eyebrow>
            <h2 className="mt-5 text-balance text-3xl font-semibold tracking-[-0.035em] sm:text-5xl sm:leading-[1.05]">
              A calm, clear <Serif>process</Serif> from idea to launch
            </h2>
            <p className="mt-5 text-pretty leading-relaxed text-muted-foreground sm:text-lg">
              No black boxes. You&apos;ll know what I&apos;m working on, what&apos;s next, and what I need from you
              at every stage.
            </p>
            <div className="mt-8 hidden gap-2 lg:flex lg:flex-wrap">
              {process.map((s, i) => (
                <span key={s.title} className="rounded-full border border-border px-3 py-1 font-mono text-[11px] text-muted-foreground">
                  {String(i + 1).padStart(2, "0")} {s.title}
                </span>
              ))}
            </div>
          </Reveal>
        </div>

        <ol ref={ref} className="relative">
          {/* track + progress */}
          <div aria-hidden className="absolute bottom-6 left-[19px] top-6 w-px bg-border" />
          <m.div
            aria-hidden
            style={{ scaleY }}
            className="absolute bottom-6 left-[19px] top-6 w-px origin-top bg-gradient-to-b from-accent via-accent-2 to-accent"
          />
          {process.map((s, i) => (
            <li key={s.title} className="relative pb-12 pl-16 last:pb-0">
              <Reveal y={16}>
                <span className="absolute left-0 top-0 grid size-10 place-items-center rounded-full border border-border bg-background font-mono text-xs text-foreground shadow-[0_0_0_6px_var(--background)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 pt-1.5">
                  <h3 className="text-xl font-semibold tracking-tight">{s.title}</h3>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{s.duration}</span>
                </div>
                <p className="mt-2 max-w-lg text-[15px] leading-relaxed text-muted-foreground">{s.body}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
