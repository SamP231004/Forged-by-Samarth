import {
  siDocker,
  siExpo,
  siExpress,
  siMongodb,
  siNextdotjs,
  siNodedotjs,
  siPostgresql,
  siReact,
  siSpringboot,
  siSupabase,
  siTypescript,
  siVercel,
  type SimpleIcon,
} from "simple-icons";
import { Cloud } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Section, SectionHeading, Serif } from "@/components/ui/section";
import { techStack, type TechItem } from "@/lib/content";

const icons: Record<string, SimpleIcon> = {
  docker: siDocker,
  expo: siExpo,
  express: siExpress,
  mongodb: siMongodb,
  nextdotjs: siNextdotjs,
  nodedotjs: siNodedotjs,
  postgresql: siPostgresql,
  react: siReact,
  springboot: siSpringboot,
  supabase: siSupabase,
  typescript: siTypescript,
  vercel: siVercel,
};

// AWS isn't distributed in simple-icons, so it falls back to a cloud glyph.
const getIcon = (slug?: string) => (slug ? icons[slug] : undefined);

function Logo({ item, className }: { item: TechItem; className?: string }) {
  const icon = getIcon(item.slug);
  if (!icon) return <Cloud className={className} aria-hidden />;
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d={icon.path} />
    </svg>
  );
}

/** Brand colours that are too dark to read on a dark background fall back to the text colour. */
const monochrome = new Set(["nextdotjs", "express", "vercel", "expo"]);

export function TechStack() {
  const all = techStack.flatMap((g) => g.items);

  return (
    <Section id="stack" className="overflow-hidden border-t border-border">
      <div className="container-page">
        <SectionHeading
          eyebrow="Tech stack"
          title={
            <>
              Proven tools, <Serif>chosen for you</Serif>
            </>
          }
          description="I pick technology for your product's needs, budget and future — favouring mature, well-supported tools that any good developer can work with."
        />
      </div>

      {/* Marquee */}
      <Reveal className="mask-fade-x relative mt-14 overflow-hidden py-2" aria-hidden>
        <div className="flex w-max animate-marquee gap-3 hover:[animation-play-state:paused]">
          {[...all, ...all].map((item, i) => (
            <span
              key={`${item.name}-${i}`}
              className="flex items-center gap-2.5 rounded-full border border-border bg-card/50 px-5 py-2.5 text-sm text-muted-foreground"
            >
              <Logo item={item} className="size-4" />
              {item.name}
            </span>
          ))}
        </div>
      </Reveal>

      <div className="container-page">
        <Stagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {techStack.map((group) => (
            <StaggerItem key={group.group} className="rounded-3xl border border-border bg-card/40 p-5">
              <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{group.group}</h3>
              <ul className="mt-5 space-y-2">
                {group.items.map((item) => {
                  const icon = getIcon(item.slug);
                  const color = icon && !monochrome.has(item.slug!) ? `#${icon.hex}` : undefined;
                  return (
                    <li key={item.name}>
                      <div
                        className="group flex items-center gap-3 rounded-2xl border border-transparent p-2 transition-all duration-300 hover:border-border hover:bg-background"
                        style={{ ["--brand" as string]: color ?? "var(--foreground)" }}
                      >
                        <span className="grid size-10 place-items-center rounded-xl border border-border bg-background text-muted-foreground transition-all duration-300 group-hover:scale-110 group-hover:text-[var(--brand)] group-hover:shadow-[0_0_24px_-6px_var(--brand)]">
                          <Logo item={item} className="size-5" />
                        </span>
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </Section>
  );
}
