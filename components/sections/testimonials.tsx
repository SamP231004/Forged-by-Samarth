import { Quote } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { Section, SectionHeading, Serif } from "@/components/ui/section";
import { testimonials } from "@/lib/content";
import { cn } from "@/lib/utils";

export function Testimonials() {
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

        <Stagger className="mt-16 grid gap-4 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <StaggerItem
              key={i}
              className={cn(
                "relative flex flex-col rounded-3xl border border-border bg-card p-7 shadow-[0_1px_0_0_var(--border)] transition-transform duration-300 hover:-translate-y-1",
                i === 1 && "md:-translate-y-6 md:hover:-translate-y-7",
              )}
            >
              <Quote className="size-7 text-accent/60" aria-hidden />
              <blockquote className="mt-5 flex-1 font-serif text-xl leading-snug text-foreground/90">
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
                {t.placeholder && (
                  <span className="rounded-full border border-dashed border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Placeholder
                  </span>
                )}
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </Section>
  );
}
