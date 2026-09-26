import { ArrowUpRight } from "lucide-react";
import { SpotlightCard } from "@/components/motion/spotlight-card";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { Icon } from "@/components/ui/icon";
import { Section, SectionHeading, Serif } from "@/components/ui/section";
import { services } from "@/lib/content";
import { cn } from "@/lib/utils";

export function Services() {
  return (
    <Section id="services" className="border-t border-border bg-muted/20">
      <div className="container-page">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="Services"
            title={
              <>
                What I can <Serif>build for you</Serif>
              </>
            }
            description="Every project is different, but most fit into one of these. Each one is about a business outcome first — the technology is how we get there."
          />
        </div>

        <Stagger className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s, i) => (
            <StaggerItem key={s.title} className={cn([0, 4, 6, 7].includes(i) && "lg:col-span-2")}>
              <SpotlightCard className="group flex h-full flex-col p-6 hover:-translate-y-1">
                <div className="flex items-start justify-between">
                  <span className="grid size-11 place-items-center rounded-2xl border border-border bg-background shadow-sm transition-colors group-hover:border-accent/40 group-hover:text-accent">
                    <Icon name={s.icon} className="size-5" />
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground/70">0{i + 1}</span>
                </div>
                <h3 className="mt-8 text-lg font-semibold tracking-tight">{s.title}</h3>
                <p className="mt-2 flex-1 text-[14.5px] leading-relaxed text-muted-foreground">{s.body}</p>
                <p className="mt-6 inline-flex items-center gap-1.5 border-t border-border pt-4 text-[13px] font-medium text-foreground/85">
                  <ArrowUpRight className="size-3.5 text-accent transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                  {s.outcome}
                </p>
              </SpotlightCard>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </Section>
  );
}
