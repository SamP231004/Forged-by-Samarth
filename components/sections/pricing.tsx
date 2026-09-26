import Link from "next/link";
import { ArrowRight, Check, Clock, Info } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Section, SectionHeading, Serif } from "@/components/ui/section";
import { pricing } from "@/lib/content";
import { cn } from "@/lib/utils";

export function Pricing() {
  return (
    <Section id="pricing" className="border-t border-border">
      <div className="container-page">
        <SectionHeading
          eyebrow="Pricing"
          title={
            <>
              Honest pricing, <Serif>scoped to you</Serif>
            </>
          }
          description="Every project is unique, so I don't sell fixed packages. These starting points give you a sense of scale — your final quote depends on scope, and you'll get it in writing before any work begins."
        />

        <Stagger className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          {pricing.map((p, i) => {
            const featured = "featured" in p && p.featured;
            return (
              <StaggerItem
                key={p.name}
                className={cn(
                  "relative flex flex-col rounded-3xl border p-6 transition-colors",
                  i < 3 ? "lg:col-span-2" : "lg:col-span-3",
                  featured
                    ? "border-accent/40 bg-gradient-to-b from-accent/[0.09] to-transparent shadow-[0_20px_60px_-30px_var(--accent)]"
                    : "border-border bg-card/40 hover:border-foreground/15",
                )}
              >
                {featured && (
                  <span className="absolute -top-3 left-6 rounded-full bg-foreground px-3 py-1 text-[11px] font-medium text-background">
                    Most requested
                  </span>
                )}
                <h3 className="font-semibold tracking-tight">{p.name}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{p.blurb}</p>
                <div className="mt-6">
                  <span className="block text-xs uppercase tracking-wider text-muted-foreground">
                    {p.from === "Custom quote" ? "Tailored to you" : "Starting from"}
                  </span>
                  <span className="mt-1 block text-3xl font-semibold tracking-tight">{p.from}</span>
                </div>
                <ul className="mt-6 flex-1 space-y-2.5 text-sm">
                  {p.includes.map((x) => (
                    <li key={x} className="flex items-center gap-2.5 text-foreground/85">
                      <Check className="size-4 shrink-0 text-success" aria-hidden /> {x}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="size-3.5" aria-hidden /> {p.timeline}
                  </span>
                  <Link
                    href="/#contact"
                    className="group inline-flex items-center gap-1 text-sm font-medium"
                    aria-label={`Get a quote for ${p.name}`}
                  >
                    Get a quote
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </Link>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>

        <Reveal className="mt-8 flex flex-col items-start gap-4 rounded-3xl border border-border bg-muted/40 p-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-3 text-sm text-muted-foreground">
            <Info className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
            <span>
              <span className="font-medium text-foreground">Final pricing depends on scope.</span> Want a ballpark
              in under a minute? Try the estimator — no email required.
            </span>
          </p>
          <Button asChild variant="outline" size="sm">
            <Link href="/#estimate">
              Estimate my project <ArrowRight />
            </Link>
          </Button>
        </Reveal>
      </div>
    </Section>
  );
}
