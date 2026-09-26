import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { GithubIcon } from "@/components/ui/brand-icons";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/section";
import { ProjectVisual } from "@/components/sections/project-visual";
import { getProject, projects } from "@/lib/projects";
import { site } from "@/lib/site";
import { jsonLd } from "@/lib/structured-data";

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.filter((p) => !p.comingSoon).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const project = getProject((await params).slug);
  if (!project) return {};
  return {
    title: `${project.title} — Case Study`,
    description: project.tagline,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: { title: `${project.title} — Case Study`, description: project.tagline, type: "article" },
  };
}

export default async function ProjectPage({ params }: Params) {
  const project = getProject((await params).slug);
  if (!project || project.comingSoon) notFound();

  const others = projects.filter((p) => p.slug !== project.slug && !p.comingSoon);

  const schema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.tagline,
    author: { "@type": "Person", name: site.name, url: site.url },
    keywords: project.technologies.join(", "),
    url: `${site.url}/projects/${project.slug}`,
  };

  return (
    <article className="pb-24 pt-32 sm:pt-40">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />

      <div className="container-page">
        <Link href="/#work" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden /> All projects
        </Link>

        <header className="mt-10 max-w-3xl">
          <Eyebrow>{project.category}</Eyebrow>
          <h1 className="mt-5 text-balance text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">{project.title}</h1>
          <p className="mt-5 text-lg text-muted-foreground sm:text-xl">{project.tagline}</p>
          <div className="mt-8 flex flex-wrap gap-2">
            {project.liveUrl && (
              <Button asChild>
                <a href={project.liveUrl} target={project.liveUrl.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
                  Live demo <ArrowUpRight />
                </a>
              </Button>
            )}
            {project.githubUrl && (
              <Button asChild variant="outline">
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                  <GithubIcon /> View on GitHub
                </a>
              </Button>
            )}
          </div>
        </header>

        <Reveal className="mt-14">
          <ProjectVisual project={project} className="aspect-[16/9] sm:aspect-[21/9]" />
        </Reveal>

        <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_18rem]">
          <div className="space-y-14">
            {[
              ["The problem", project.problem],
              ["The solution", project.solution],
              ["The outcome", project.outcome],
            ].map(([title, body]) => (
              <Reveal key={title}>
                <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
                <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">{body}</p>
              </Reveal>
            ))}

            {project.highlights.length > 0 && (
              <Reveal>
                <h2 className="text-2xl font-semibold tracking-tight">Key features</h2>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {project.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-3 rounded-2xl border border-border bg-card/40 p-4 text-[15px]">
                      <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden /> {h}
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <dl className="divide-y divide-border rounded-3xl border border-border bg-card/40 px-6">
              <div className="py-5">
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">My role</dt>
                <dd className="mt-1.5 text-sm font-medium">{project.role}</dd>
              </div>
              <div className="py-5">
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">Timeline</dt>
                <dd className="mt-1.5 text-sm font-medium">{project.timeline}</dd>
              </div>
              <div className="py-5">
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">Technologies</dt>
                <dd className="mt-3 flex flex-wrap gap-1.5">
                  {project.technologies.map((t) => (
                    <span key={t} className="rounded-full border border-border px-2.5 py-1 text-xs">
                      {t}
                    </span>
                  ))}
                </dd>
              </div>
            </dl>
          </aside>
        </div>

        <Reveal className="mt-24 flex flex-col items-start justify-between gap-6 rounded-3xl border border-border bg-gradient-to-br from-accent/10 to-transparent p-8 sm:flex-row sm:items-center sm:p-10">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Have a similar project in mind?</h2>
            <p className="mt-2 text-muted-foreground">Let&apos;s talk about what you&apos;re building.</p>
          </div>
          <Button asChild size="lg">
            <Link href="/#contact">
              Start your project <ArrowRight />
            </Link>
          </Button>
        </Reveal>

        {others.length > 0 && (
          <nav aria-label="More projects" className="mt-16">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">More work</p>
            <ul className="mt-5 grid gap-4 sm:grid-cols-2">
              {others.map((p) => (
                <li key={p.slug}>
                  <Link href={`/projects/${p.slug}`} className="group block rounded-3xl border border-border p-3 transition-colors hover:border-foreground/15">
                    <ProjectVisual project={p} className="aspect-[16/9]" />
                    <div className="flex items-center justify-between px-2 pb-1 pt-4">
                      <span className="font-medium">{p.title}</span>
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </article>
  );
}
