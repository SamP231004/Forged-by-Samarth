import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Clock, Quote } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Eyebrow } from "@/components/ui/section";
import { ProjectVisual } from "@/components/sections/project-visual";
import { testimonials } from "@/lib/content";
import { getProject } from "@/lib/projects";
import { getServicePage, servicePages } from "@/lib/service-pages";
import { site } from "@/lib/site";
import { jsonLd } from "@/lib/structured-data";

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return servicePages.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const page = getServicePage((await params).slug);
  if (!page) return {};
  return {
    title: { absolute: `${page.metaTitle} | ${site.name}` },
    description: page.metaDescription,
    keywords: page.keywords,
    alternates: { canonical: `/services/${page.slug}` },
    openGraph: { title: page.metaTitle, description: page.metaDescription, type: "website", url: `/services/${page.slug}` },
    twitter: { card: "summary_large_image", title: page.metaTitle, description: page.metaDescription },
  };
}

export default async function ServicePage({ params }: Params) {
  const page = getServicePage((await params).slug);
  if (!page) notFound();

  const project = page.project ? getProject(page.project) : undefined;
  const quote = project && testimonials.find((t) => t.approved && t.project?.startsWith(project.title));
  const others = servicePages.filter((s) => s.slug !== page.slug);
  const url = `${site.url}/services/${page.slug}`;

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name: page.h1,
        serviceType: page.eyebrow,
        description: page.metaDescription,
        url,
        provider: { "@id": `${site.url}/#person` },
        areaServed: "Worldwide",
        ...(page.priceFrom && {
          offers: {
            "@type": "Offer",
            priceCurrency: "USD",
            price: page.priceFrom,
            priceSpecification: { "@type": "PriceSpecification", minPrice: page.priceFrom, priceCurrency: "USD" },
          },
        }),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: site.url },
          { "@type": "ListItem", position: 2, name: "Services", item: `${site.url}/#services` },
          { "@type": "ListItem", position: 3, name: page.eyebrow, item: url },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: page.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <article className="pb-24 pt-32 sm:pt-40">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />

      <div className="container-page">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/#services" className="inline-flex items-center gap-1.5 hover:text-foreground">
            <ArrowLeft className="size-4" aria-hidden /> All services
          </Link>
        </nav>

        <header className="mt-10 max-w-3xl">
          <Eyebrow>{page.eyebrow}</Eyebrow>
          <h1 className="mt-5 text-balance text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">{page.h1}</h1>
          <p className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">{page.intro}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link href="/#contact">
                Start your project <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/#estimate">Get an instant estimate</Link>
            </Button>
          </div>
        </header>

        <div className="mt-20 grid gap-12 lg:grid-cols-[1fr_20rem]">
          <div className="space-y-20">
            <Reveal>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">This is for you if…</h2>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {page.forYouIf.map((item) => (
                  <li key={item} className="flex items-start gap-3 rounded-2xl border border-border bg-card/40 p-4 text-[15px]">
                    <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden /> {item}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">What you get</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {page.deliverables.map((d) => (
                  <div key={d.title} className="rounded-2xl border border-border bg-card/40 p-5">
                    <h3 className="font-medium">{d.title}</h3>
                    <p className="mt-1.5 text-[14.5px] leading-relaxed text-muted-foreground">{d.body}</p>
                  </div>
                ))}
              </div>
            </Reveal>

            {project && (
              <Reveal>
                <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Recent work</h2>
                <Link
                  href={`/projects/${project.slug}`}
                  className="group mt-6 grid overflow-hidden rounded-3xl border border-border bg-card/40 transition-colors hover:border-foreground/15 sm:grid-cols-2"
                >
                  <ProjectVisual project={project} className="aspect-[4/3] rounded-none border-0" />
                  <div className="flex flex-col p-6">
                    <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{project.category}</p>
                    <h3 className="mt-2 text-xl font-semibold tracking-tight">{project.title}</h3>
                    <p className="mt-2 flex-1 text-[14.5px] leading-relaxed text-muted-foreground">{project.tagline}</p>
                    <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium">
                      Read the case study
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
                    </span>
                  </div>
                </Link>
                {quote && (
                  <figure className="mt-4 rounded-3xl border border-border bg-card/40 p-6">
                    <Quote className="size-6 text-accent/60" aria-hidden />
                    <blockquote className="mt-3 text-pretty text-lg leading-relaxed text-foreground/90">
                      &ldquo;{quote.quote}&rdquo;
                    </blockquote>
                    <figcaption className="mt-4 text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">{quote.name}</span> · {quote.role}
                    </figcaption>
                  </figure>
                )}
              </Reveal>
            )}

            <Reveal>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Common questions</h2>
              <dl className="mt-6 divide-y divide-border rounded-3xl border border-border bg-card/40 px-6">
                {page.faqs.map((f) => (
                  <div key={f.q} className="py-5">
                    <dt className="font-medium">{f.q}</dt>
                    <dd className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{f.a}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-3xl border border-border bg-card/40 p-6">
              <span className="grid size-11 place-items-center rounded-2xl border border-border bg-background text-accent">
                <Icon name={page.icon} className="size-5" />
              </span>
              <p className="mt-6 text-xs uppercase tracking-wider text-muted-foreground">Starting from</p>
              <p className="mt-1 text-3xl font-semibold tracking-tight">
                {page.priceFrom ? `$${page.priceFrom.toLocaleString("en-US")}` : "Custom quote"}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{page.priceNote}</p>
              <p className="mt-5 inline-flex items-center gap-1.5 text-sm">
                <Clock className="size-4 text-muted-foreground" aria-hidden /> {page.timeline}
              </p>
              <div className="mt-6 border-t border-border pt-5">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Typical stack</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {page.stack.map((t) => (
                    <span key={t} className="rounded-full border border-border px-2.5 py-1 text-xs">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <Button asChild className="mt-6 w-full">
                <Link href="/chat">Message me about it</Link>
              </Button>
              <p className="mt-3 text-center text-xs text-muted-foreground">No calls needed · reply within a day</p>
            </div>
          </aside>
        </div>

        <Reveal className="mt-24 flex flex-col items-start justify-between gap-6 rounded-3xl border border-border bg-gradient-to-br from-accent/10 to-transparent p-8 sm:flex-row sm:items-center sm:p-10">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Ready to get started?</h2>
            <p className="mt-2 text-muted-foreground">Tell me what you&apos;re building — you&apos;ll get a written quote, not a sales call.</p>
          </div>
          <Button asChild size="lg">
            <Link href="/#contact">
              Start your project <ArrowRight />
            </Link>
          </Button>
        </Reveal>

        <nav aria-label="Other services" className="mt-16">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Other services</p>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/services/${s.slug}`}
                  className="group flex items-center gap-3 rounded-2xl border border-border p-4 transition-colors hover:border-foreground/15"
                >
                  <Icon name={s.icon} className="size-4 text-muted-foreground" />
                  <span className="flex-1 text-sm font-medium">{s.eyebrow}</span>
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </article>
  );
}
