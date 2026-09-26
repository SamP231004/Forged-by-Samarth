"use client";

import { m, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { Activity, CheckCircle2, GitBranch, Rocket, Users } from "lucide-react";
import { useRef } from "react";

/**
 * Illustrative product dashboard shown under the hero. It tilts back in 3D
 * and flattens as you scroll — a nod to "from idea to shipped product".
 */
export function DashboardMockup() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const rotateX = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [22, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [0.92, 1]);
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [40, 0]);

  return (
    <div ref={ref} className="container-page relative mt-20 [perspective:1600px]" aria-hidden>
      <m.div
        style={{ rotateX, scale, y, transformOrigin: "center top" }}
        className="animate-fade-up relative mx-auto max-w-5xl [animation-delay:0.75s]"
      >
        {/* glow */}
        <div className="absolute -inset-x-10 -top-10 bottom-0 -z-10 rounded-[3rem] bg-[radial-gradient(closest-side,var(--glow),transparent)] blur-2xl" />

        <div className="overflow-hidden rounded-2xl border border-border bg-card/80 shadow-[0_40px_120px_-40px_rgb(0_0_0/0.5)] backdrop-blur-xl sm:rounded-3xl">
          {/* window chrome */}
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <span className="size-2.5 rounded-full bg-[#ff5f57]" />
            <span className="size-2.5 rounded-full bg-[#febc2e]" />
            <span className="size-2.5 rounded-full bg-[#28c840]" />
            <div className="mx-auto hidden rounded-md border border-border bg-background/60 px-24 py-1 font-mono text-[10px] text-muted-foreground sm:block">
              app.yourproduct.com/dashboard
            </div>
          </div>

          <div className="grid grid-cols-12">
            {/* sidebar */}
            <div className="col-span-3 hidden space-y-1 border-r border-border p-4 md:block">
              <div className="mb-5 flex items-center gap-2">
                <span className="size-6 rounded-md bg-gradient-to-br from-accent to-accent-2" />
                <span className="h-2.5 w-20 rounded bg-foreground/20" />
              </div>
              {["Overview", "Customers", "Revenue", "Deployments", "Settings"].map((l, i) => (
                <div
                  key={l}
                  className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-[12px] ${
                    i === 0 ? "bg-muted text-foreground" : "text-muted-foreground"
                  }`}
                >
                  <span className={`size-3 rounded ${i === 0 ? "bg-accent/70" : "bg-foreground/15"}`} />
                  {l}
                </div>
              ))}
            </div>

            {/* main */}
            <div className="col-span-12 space-y-4 p-4 sm:p-6 md:col-span-9">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Users, label: "Active users", value: "12,480", delta: "+18%" },
                  { icon: Activity, label: "Uptime", value: "99.98%", delta: "30d" },
                  { icon: Rocket, label: "Deploys", value: "214", delta: "+32" },
                ].map(({ icon: I, label, value, delta }) => (
                  <div key={label} className="rounded-xl border border-border bg-background/50 p-3 sm:p-4">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="text-[10px] sm:text-[11px]">{label}</span>
                      <I className="size-3.5" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-base font-semibold tracking-tight sm:text-xl">{value}</span>
                      <span className="hidden text-[10px] text-success sm:inline">{delta}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 lg:grid-cols-5">
                {/* chart */}
                <div className="rounded-xl border border-border bg-background/50 p-4 lg:col-span-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-medium">Monthly growth</span>
                    <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] text-accent">Live</span>
                  </div>
                  <svg viewBox="0 0 300 110" className="mt-3 h-28 w-full overflow-visible">
                    <defs>
                      <linearGradient id="area" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                      </linearGradient>
                      <linearGradient id="line" x1="0" x2="1">
                        <stop offset="0%" stopColor="var(--accent)" />
                        <stop offset="100%" stopColor="var(--accent-2)" />
                      </linearGradient>
                    </defs>
                    {[20, 50, 80].map((y) => (
                      <line key={y} x1="0" x2="300" y1={y} y2={y} stroke="var(--border)" strokeDasharray="3 4" />
                    ))}
                    <m.path
                      d="M0 92 C 30 88, 45 70, 70 72 S 110 58, 130 60 S 170 34, 195 40 S 240 18, 260 22 S 290 8, 300 6 L 300 110 L 0 110 Z"
                      fill="url(#area)"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.4, duration: 0.8 }}
                    />
                    <m.path
                      d="M0 92 C 30 88, 45 70, 70 72 S 110 58, 130 60 S 170 34, 195 40 S 240 18, 260 22 S 290 8, 300 6"
                      fill="none"
                      stroke="url(#line)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ delay: 0.9, duration: 1.6, ease: "easeInOut" }}
                    />
                  </svg>
                </div>

                {/* deploy log */}
                <div className="rounded-xl border border-border bg-background/50 p-4 lg:col-span-2">
                  <div className="flex items-center gap-2 text-[12px] font-medium">
                    <GitBranch className="size-3.5 text-muted-foreground" /> Recent activity
                  </div>
                  <ul className="mt-3 space-y-2.5 font-mono text-[10.5px]">
                    {[
                      ["feat: stripe subscriptions", "2m"],
                      ["fix: mobile nav focus trap", "1h"],
                      ["perf: cache dashboard queries", "3h"],
                      ["feat: AI support assistant", "1d"],
                    ].map(([msg, t], i) => (
                      <m.li
                        key={msg}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.2 + i * 0.15 }}
                        className="flex items-center gap-2"
                      >
                        <CheckCircle2 className="size-3 shrink-0 text-success" />
                        <span className="truncate text-foreground/80">{msg}</span>
                        <span className="ml-auto text-muted-foreground">{t}</span>
                      </m.li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* floating chips */}
        <div className="animate-float glass absolute -left-8 bottom-8 hidden items-center gap-2.5 rounded-2xl border border-border px-4 py-3 shadow-xl lg:flex">
          <span className="grid size-8 place-items-center rounded-full bg-success/15 text-success">
            <CheckCircle2 className="size-4" />
          </span>
          <div className="text-left">
            <p className="text-[12px] font-medium">Deployed to production</p>
            <p className="text-[11px] text-muted-foreground">All checks passed</p>
          </div>
        </div>
        <div className="animate-float glass absolute -right-8 -top-7 hidden items-center gap-2.5 rounded-2xl border border-border px-4 py-3 shadow-xl [animation-delay:-3s] lg:flex">
          <span className="font-mono text-[11px] text-muted-foreground">Lighthouse</span>
          <span className="grid size-8 place-items-center rounded-full border-2 border-success font-mono text-[11px] text-success">
            99
          </span>
        </div>
      </m.div>
    </div>
  );
}
