"use client";

import { AnimatePresence, m } from "framer-motion";
import {
  AppWindow,
  ArrowLeft,
  ArrowRight,
  Check,
  CreditCard,
  Globe,
  KeyRound,
  LayoutDashboard,
  Loader2,
  Mail,
  MessageSquare,
  RotateCcw,
  Smartphone,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eyebrow, Section, Serif } from "@/components/ui/section";
import {
  budgetOptions,
  estimate,
  featureOptions,
  formatUSD,
  projectTypes,
  timelineOptions,
  type BudgetId,
  type FeatureId,
  type ProjectTypeId,
  type TimelineId,
} from "@/lib/estimator";
import { PREFILL_EVENT } from "@/lib/events";
import { cn } from "@/lib/utils";

const iconMap: Record<string, LucideIcon> = {
  Globe,
  AppWindow,
  Smartphone,
  LayoutDashboard,
  KeyRound,
  CreditCard,
  Sparkles,
};

const steps = ["Project type", "Features", "Timeline", "Budget", "Your estimate"] as const;


export function Estimator() {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [projectType, setProjectType] = useState<ProjectTypeId | null>(null);
  const [features, setFeatures] = useState<FeatureId[]>([]);
  const [timeline, setTimeline] = useState<TimelineId | null>(null);
  const [budget, setBudget] = useState<BudgetId | null>(null);

  const canNext = [!!projectType, true, !!timeline, !!budget][step] ?? false;

  const result = useMemo(
    () =>
      projectType && timeline && budget ? estimate({ projectType, features, timeline, budget }) : null,
    [projectType, features, timeline, budget],
  );

  const go = (to: number) => {
    setDir(to > step ? 1 : -1);
    setStep(to);
  };

  const reset = () => {
    setProjectType(null);
    setFeatures([]);
    setTimeline(null);
    setBudget(null);
    go(0);
  };

  const toggleFeature = (id: FeatureId) =>
    setFeatures((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));

  return (
    <Section id="estimate" className="border-t border-border bg-muted/20">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-96 w-[48rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,var(--glow),transparent)] blur-2xl" />
      </div>

      <div className="container-page relative">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Eyebrow>Project estimator</Eyebrow>
          <h2 className="mt-5 text-balance text-3xl font-semibold tracking-[-0.035em] sm:text-5xl sm:leading-[1.05]">
            Get a <Serif>ballpark</Serif> in under a minute
          </h2>
          <p className="mt-5 text-pretty leading-relaxed text-muted-foreground sm:text-lg">
            Answer four quick questions and get an instant estimate for timeline, budget and the stack I&apos;d
            recommend. No sign-up, no sales call required.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mx-auto mt-14 max-w-4xl">
          <div className="glass grid overflow-hidden rounded-3xl border border-border shadow-[0_30px_80px_-40px_rgb(0_0_0/0.4)] md:grid-cols-[14rem_1fr]">
            {/* Steps rail */}
            <nav aria-label="Estimator steps" className="border-b border-border p-5 md:border-b-0 md:border-r md:p-6">
              <div className="mb-4 h-1 overflow-hidden rounded-full bg-border md:hidden">
                <m.div
                  className="h-full bg-gradient-to-r from-accent to-accent-2"
                  animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
                />
              </div>
              <ol className="flex justify-between gap-2 md:flex-col md:gap-1">
                {steps.map((s, i) => {
                  const done = i < step;
                  const active = i === step;
                  return (
                    <li key={s}>
                      <button
                        type="button"
                        disabled={i > step}
                        onClick={() => go(i)}
                        aria-current={active ? "step" : undefined}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl py-1 text-left text-sm transition-colors md:px-2 md:py-2",
                          active ? "text-foreground" : done ? "text-foreground/70 hover:text-foreground" : "text-muted-foreground/60",
                        )}
                      >
                        <span
                          className={cn(
                            "grid size-6 shrink-0 place-items-center rounded-full border font-mono text-[10px] transition-colors",
                            active && "border-foreground bg-foreground text-background",
                            done && "border-success/40 bg-success/15 text-success",
                            !active && !done && "border-border",
                          )}
                        >
                          {done ? <Check className="size-3" strokeWidth={3} aria-hidden /> : i + 1}
                        </span>
                        <span className="hidden md:inline">{s}</span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </nav>

            {/* Step content */}
            <div className="relative flex min-h-[27rem] flex-col p-5 sm:p-8">
              <AnimatePresence mode="wait" custom={dir} initial={false}>
                <m.div
                  key={step}
                  custom={dir}
                  initial={{ opacity: 0, x: dir * 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: dir * -24 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="flex-1"
                >
                  {step === 0 && (
                    <StepShell title="What are you building?" hint="Pick the closest match — we can refine it later.">
                      <div className="grid gap-3 sm:grid-cols-2">
                        {projectTypes.map((t) => (
                          <OptionCard
                            key={t.id}
                            icon={iconMap[t.icon]}
                            label={t.label}
                            hint={t.hint}
                            selected={projectType === t.id}
                            onClick={() => {
                              setProjectType(t.id);
                              setTimeout(() => go(1), 180);
                            }}
                          />
                        ))}
                      </div>
                    </StepShell>
                  )}

                  {step === 1 && (
                    <StepShell title="Which features do you need?" hint="Select any that apply, or skip if none do.">
                      <div className="grid gap-3">
                        {featureOptions.map((f) => (
                          <OptionCard
                            key={f.id}
                            icon={iconMap[f.icon]}
                            label={f.label}
                            hint={f.hint}
                            selected={features.includes(f.id)}
                            onClick={() => toggleFeature(f.id)}
                            multi
                          />
                        ))}
                      </div>
                    </StepShell>
                  )}

                  {step === 2 && (
                    <StepShell title="When do you need it?" hint="Rush timelines are possible with priority scheduling.">
                      <div className="grid gap-3">
                        {timelineOptions.map((t) => (
                          <OptionCard
                            key={t.id}
                            label={t.label}
                            hint={t.hint}
                            selected={timeline === t.id}
                            onClick={() => {
                              setTimeline(t.id);
                              setTimeout(() => go(3), 180);
                            }}
                          />
                        ))}
                      </div>
                    </StepShell>
                  )}

                  {step === 3 && (
                    <StepShell title="What budget do you have in mind?" hint="This helps me suggest the right scope — it's never used against you.">
                      <div className="grid gap-3 sm:grid-cols-2">
                        {budgetOptions.map((b) => (
                          <OptionCard
                            key={b.id}
                            label={b.label}
                            selected={budget === b.id}
                            onClick={() => {
                              setBudget(b.id);
                              setTimeout(() => go(4), 180);
                            }}
                          />
                        ))}
                      </div>
                    </StepShell>
                  )}

                  {step === 4 && result && projectType && timeline && budget && (
                    <Result
                      result={result}
                      input={{ projectType, features, timeline, budget }}
                      onReset={reset}
                    />
                  )}
                </m.div>
              </AnimatePresence>

              {step < 4 && (
                <div className="mt-8 flex items-center justify-between border-t border-border pt-5">
                  <Button variant="ghost" size="sm" onClick={() => go(step - 1)} disabled={step === 0}>
                    <ArrowLeft /> Back
                  </Button>
                  <Button size="sm" onClick={() => go(step + 1)} disabled={!canNext}>
                    {step === 1 && features.length === 0 ? "Skip" : "Continue"} <ArrowRight />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

function StepShell({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</legend>
      <p className="mt-1.5 text-sm text-muted-foreground">{hint}</p>
      <div className="mt-6">{children}</div>
    </fieldset>
  );
}

function OptionCard({
  icon: I,
  label,
  hint,
  selected,
  onClick,
  multi,
}: {
  icon?: LucideIcon;
  label: string;
  hint?: string;
  selected: boolean;
  onClick: () => void;
  multi?: boolean;
}) {
  return (
    <button
      type="button"
      role={multi ? "checkbox" : "radio"}
      aria-checked={selected}
      onClick={onClick}
      className={cn(
        "group flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-200",
        selected
          ? "border-accent/60 bg-accent/[0.08] shadow-[0_0_0_4px_color-mix(in_oklch,var(--accent)_12%,transparent)]"
          : "border-border bg-background/50 hover:border-foreground/20 hover:bg-background",
      )}
    >
      {I && (
        <span
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-xl border transition-colors",
            selected ? "border-accent/40 bg-accent/15 text-accent" : "border-border text-muted-foreground group-hover:text-foreground",
          )}
        >
          <I className="size-[18px]" aria-hidden />
        </span>
      )}
      <span className="flex-1">
        <span className="block font-medium">{label}</span>
        {hint && <span className="mt-0.5 block text-[13px] text-muted-foreground">{hint}</span>}
      </span>
      <span
        className={cn(
          "grid size-5 shrink-0 place-items-center border transition-all",
          multi ? "rounded-md" : "rounded-full",
          selected ? "border-accent bg-accent text-background" : "border-border",
        )}
        aria-hidden
      >
        {selected && <Check className="size-3" strokeWidth={3} />}
      </span>
    </button>
  );
}

function Result({
  result,
  input,
  onReset,
}: {
  result: ReturnType<typeof estimate>;
  input: { projectType: ProjectTypeId; features: FeatureId[]; timeline: TimelineId; budget: BudgetId };
  onReset: () => void;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  const sendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, input }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const discuss = () => {
    const type = projectTypes.find((t) => t.id === input.projectType)!.label;
    const feats = input.features.map((f) => featureOptions.find((o) => o.id === f)!.label).join(", ") || "none";
    const message = `Hi Samarth — I used your estimator.\n\nProject: ${type}\nFeatures: ${feats}\nEstimate: ${formatUSD(result.price[0])}–${formatUSD(result.price[1])}, ${result.weeks[0]}–${result.weeks[1]} weeks\n\nA bit more about the project: `;
    window.dispatchEvent(new CustomEvent(PREFILL_EVENT, { detail: { message } }));
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div aria-live="polite">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Your estimate</p>
      <p className="mt-2 text-sm text-muted-foreground">{result.summary}</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-background/60 p-5">
          <p className="text-xs text-muted-foreground">Estimated investment</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            <span className="text-gradient">
              {formatUSD(result.price[0])} – {formatUSD(result.price[1])}
            </span>
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-background/60 p-5">
          <p className="text-xs text-muted-foreground">Estimated timeline</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            {result.weeks[0]}–{result.weeks[1]} weeks
          </p>
        </div>
      </div>

      <div className="mt-3 rounded-2xl border border-border bg-background/60 p-5">
        <p className="text-xs text-muted-foreground">Recommended stack</p>
        <dl className="mt-3 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
          {result.stack.map((s) => (
            <div key={s.layer} className="flex items-baseline gap-3 text-sm">
              <dt className="w-24 shrink-0 text-muted-foreground">{s.layer}</dt>
              <dd className="font-medium">{s.tools.join(" · ")}</dd>
            </div>
          ))}
        </dl>
      </div>

      {result.budgetNote && (
        <p className="mt-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-foreground/85">
          {result.budgetNote}
        </p>
      )}

      <p className="mt-3 text-xs text-muted-foreground">
        This is a rough, automated range to help you plan — not a quote. I&apos;ll give you a precise, written quote
        after a short call.
      </p>

      <div className="mt-6 flex flex-col gap-3 border-t border-border pt-6">
        {status === "sent" ? (
          <p className="flex items-center gap-2 text-sm text-success">
            <Check className="size-4" aria-hidden /> Sent! Check your inbox (and spam folder, just in case).
          </p>
        ) : (
          <form onSubmit={sendEmail} className="flex flex-col gap-2 sm:flex-row">
            <label htmlFor="estimate-email" className="sr-only">
              Email address
            </label>
            <Input
              id="estimate-email"
              type="email"
              required
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 flex-1 rounded-full"
              autoComplete="email"
            />
            <Button type="submit" variant="outline" disabled={status === "sending"}>
              {status === "sending" ? <Loader2 className="animate-spin" /> : <Mail />}
              Email me this estimate
            </Button>
          </form>
        )}
        {status === "error" && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button onClick={discuss}>
            <MessageSquare /> Discuss this project
          </Button>
          <Button variant="ghost" size="sm" onClick={onReset}>
            <RotateCcw /> Start over
          </Button>
        </div>
      </div>
    </div>
  );
}
