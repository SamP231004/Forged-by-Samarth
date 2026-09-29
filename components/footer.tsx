import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { links, site } from "@/lib/site";
import { GithubIcon, LinkedinIcon } from "@/components/ui/brand-icons";

const columns = [
  {
    title: "Explore",
    links: [
      { label: "Services", href: "/#services" },
      { label: "Projects", href: "/#work" },
      { label: "About", href: "/#about" },
      { label: "Pricing", href: "/#pricing" },
      { label: "Blog (soon)", href: null },
    ],
  },
  {
    title: "Get in touch",
    links: [
      { label: "Contact", href: "/#contact" },
      { label: "Estimate a project", href: "/#estimate" },
      { label: "Chat with me", href: "/chat" },
      { label: "Email", href: links.email() },
    ],
  },
  {
    title: "Elsewhere",
    links: [
      { label: "GitHub", href: site.github },
      { label: "LinkedIn", href: site.linkedin },
      { label: "Portfolio", href: site.portfolio },
    ],
  },
];

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative overflow-hidden border-t border-border">
      <div className="container-page grid gap-12 py-16 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="max-w-xs">
          <Link href="/" className="flex items-center gap-2.5 font-medium">
            <span className="grid size-7 place-items-center rounded-lg bg-foreground text-[11px] font-semibold text-background">
              SP
            </span>
            {site.name}
          </Link>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Independent full stack developer. I design, build and look after software for founders and growing
            businesses.
          </p>
          <div className="mt-6 flex gap-2">
            <a
              href={site.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="grid size-9 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
            >
              <GithubIcon className="size-4" />
            </a>
            <a
              href={site.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="grid size-9 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
            >
              <LinkedinIcon className="size-4" />
            </a>
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{col.title}</p>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.label}>
                  {l.href ? (
                    <a
                      href={l.href}
                      {...(l.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="group inline-flex items-center gap-1 text-sm text-foreground/80 transition-colors hover:text-foreground"
                    >
                      {l.label}
                      {l.href.startsWith("http") && (
                        <ArrowUpRight className="size-3 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                      )}
                    </a>
                  ) : (
                    <span className="text-sm text-muted-foreground/70">{l.label}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="container-page flex flex-col gap-2 border-t border-border py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {year} {site.name}. All rights reserved.
        </p>
        <p>Designed and built by me, one commit at a time.</p>
      </div>

      <p
        aria-hidden
        className="pointer-events-none select-none bg-gradient-to-b from-foreground/[0.07] to-transparent bg-clip-text text-center text-[18vw] font-semibold leading-[0.8] tracking-[-0.06em] text-transparent"
      >
        Samarth
      </p>
    </footer>
  );
}
