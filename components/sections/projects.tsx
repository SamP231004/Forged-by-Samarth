import Link from "next/link";
import { ArrowRight, ArrowUpRight, Clock } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { GithubIcon } from "@/components/ui/brand-icons";
import { Button } from "@/components/ui/button";
import { Section, SectionHeading, Serif } from "@/components/ui/section";
import { ProjectVisual } from "@/components/sections/project-visual";
import { projects } from "@/lib/projects";
import { cn } from "@/lib/utils";

export function Projects() {
  const featured = projects.filter((p) => !p.comingSoon);
  const future = projects.find((p) => p.comingSoon);

  return (
    <Section id="work">
      <div className="container-page">
        <SectionHeading
          eyebrow="Selected work"
          title={
            <>
              Real problems, <Serif>shipped</Serif> solutions
            </>
          }
          description="A few projects I've designed and built end to end. Each one started with a problem worth solving — here's how I approached it."
        />

        <div className="mt-16 space-y-6">
          {featured.map((p, i) => (
            <Reveal key={p.slug}>
              <article className="group grid overflow-hidden rounded-3xl border border-border bg-card/40 transition-colors hover:border-foreground/15 lg:grid-cols-2">
                <Link
                  href={`/projects/${p.slug}`}
                  className={cn("block p-3", i % 2 === 1 && "lg:order-2")}
                  tabIndex={-1}
                  aria-hidden
                >
                  <ProjectVisual project={p} className="aspect-[4/3] w-full lg:aspect-auto lg:h-full lg:min-h-[28rem]" />
                </Link>

                <div className="flex flex-col p-6 sm:p-10">
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{p.category}</p>
                  <h3 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                    <Link href={`/projects/${p.slug}`} className="hover:underline hover:decoration-foreground/30 hover:underline-offset-4">
                      {p.title}
                    </Link>
                  </h3>
                  <p className="mt-2 text-muted-foreground">{p.tagline}</p>

                  <dl className="mt-8 grid gap-5 text-[14.5px] leading-relaxed sm:grid-cols-2">
                    <div>
                      <dt className="text-xs font-medium uppercase tracking-wider text-foreground/60">Problem</dt>
                      <dd className="mt-1.5 line-clamp-4 text-muted-foreground">{p.problem}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium uppercase tracking-wider text-foreground/60">Solution</dt>
                      <dd className="mt-1.5 line-clamp-4 text-muted-foreground">{p.solution}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-xs font-medium uppercase tracking-wider text-foreground/60">Outcome</dt>
                      <dd className="mt-1.5 text-muted-foreground">{p.outcome}</dd>
                    </div>
                  </dl>

                  <div className="mt-8 flex flex-wrap items-center gap-2">
                    {p.technologies.map((t) => (
                      <span key={t} className="rounded-full border border-border bg-background/60 px-3 py-1 text-xs text-foreground/80">
                        {t}
                      </span>
                    ))}
                    <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="size-3.5" aria-hidden /> {p.timeline}
                    </span>
                  </div>

                  <div className="mt-8 flex flex-wrap gap-2 border-t border-border pt-6">
                    <Button asChild size="sm">
                      <Link href={`/projects/${p.slug}`}>
                        Case study <ArrowRight />
                      </Link>
                    </Button>
                    {p.liveUrl && (
                      <Button asChild size="sm" variant="outline">
                        <a href={p.liveUrl} target={p.liveUrl.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
                          Live demo <ArrowUpRight />
                        </a>
                      </Button>
                    )}
                    {p.githubUrl && (
                      <Button asChild size="sm" variant="ghost">
                        <a href={p.githubUrl} target="_blank" rel="noopener noreferrer">
                          <GithubIcon /> GitHub
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </article>
            </Reveal>
          ))}

          {future && (
            <Reveal>
              <Link
                href="/#contact"
                className="group relative flex flex-col items-center gap-8 overflow-hidden rounded-3xl border border-dashed border-foreground/20 p-8 text-center transition-colors hover:border-foreground/40 sm:flex-row sm:p-10 sm:text-left"
              >
                <ProjectVisual project={future} className="size-52 shrink-0 border-none bg-transparent" />
                <div className="flex-1">
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Future projects</p>
                  <h3 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">{future.title}</h3>
                  <p className="mt-2 max-w-lg text-muted-foreground">
                    {future.tagline} If you have something in mind, I&apos;d love to hear about it.
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 text-sm font-medium">
                  Tell me about it
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
                </span>
              </Link>
            </Reveal>
          )}
        </div>
      </div>
    </Section>
  );
}
