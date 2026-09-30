import { Quote } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { Section, SectionHeading, Serif } from "@/components/ui/section";
import { testimonials } from "@/lib/content";
import { cn } from "@/lib/utils";

export function Testimonials() {
  const quotes = testimonials.filter((t) => t.approved);
  if (quotes.length === 0) return null;

  return (
    <Section id="testimonials" className="border-t border-border bg-muted/20">
      <div className="container-page">
        <SectionHeading
          align="center"
          eyebrow="Kind words"
          title={
            <>
              What clients <Serif>say</Serif>
            </>
          }
          description="Feedback from people I've worked with. Every quote here is shared with permission."
        />

        <Stagger className={cn("mt-16 grid gap-4", quotes.length === 1 && "mx-auto max-w-2xl", quotes.length === 2 && "mx-auto max-w-5xl md:grid-cols-2", quotes.length > 2 && "md:grid-cols-3")}>
          {quotes.map((t, i) => (
            <StaggerItem
              key={i}
              className={cn(
                "relative flex flex-col rounded-3xl border border-border bg-card p-7 shadow-[0_1px_0_0_var(--border)] transition-transform duration-300 hover:-translate-y-1",
                quotes.length > 2 && i === 1 && "md:-translate-y-6 md:hover:-translate-y-7",
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <Quote className="size-7 text-accent/60" aria-hidden />
                {t.project && (
                  <span className="rounded-full border border-border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    {t.project}
                  </span>
                )}
              </div>
              <blockquote className="mt-5 flex-1 text-pretty text-lg leading-relaxed tracking-[-0.01em] text-foreground/90 sm:text-xl">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <div className="mt-8 flex items-center gap-3 border-t border-border pt-5">
                <span className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-accent/40 to-accent-2/30 text-sm font-medium">
                  {t.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-medium">{t.name}</span>
                  <span className="block text-xs text-muted-foreground">{t.role}</span>
                </span>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </Section>
  );
}
