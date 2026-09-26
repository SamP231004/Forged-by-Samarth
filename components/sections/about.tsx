import { existsSync } from "node:fs";
import path from "node:path";
import Image from "next/image";
import { Bot, Cloud, Globe, MapPin, Server, Smartphone, Code2 } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Eyebrow, Section, Serif } from "@/components/ui/section";
import { site } from "@/lib/site";

const focus = [
  { icon: Code2, label: "Full Stack Development" },
  { icon: Globe, label: "Web Apps" },
  { icon: Smartphone, label: "Mobile Apps" },
  { icon: Server, label: "Backend APIs" },
  { icon: Bot, label: "AI Integrations" },
  { icon: Cloud, label: "Cloud Deployment" },
];

// Drop your portrait at public/samarth.jpg (or .png/.webp) and it's picked up at build time.
const photo = ["samarth.jpg", "samarth.png", "samarth.webp"]
  .map((f) => `/${f}`)
  .find((f) => existsSync(path.join(process.cwd(), "public", f)));

export function About() {
  return (
    <Section id="about" aria-labelledby="about-title">
      <div className="container-page grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        {/* Portrait / identity card */}
        <Reveal className="relative">
          <div className="sticky top-28">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-border bg-card">
              {photo ? (
                <>
                  <Image
                    src={photo}
                    alt={`Portrait of ${site.name}`}
                    fill
                    sizes="(min-width: 1024px) 420px, 100vw"
                    className="object-cover object-top grayscale-[15%] transition-all duration-700 hover:grayscale-0"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />
                </>
              ) : (
                <>
                  <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_20%_0%,color-mix(in_oklch,var(--accent)_35%,transparent),transparent_60%),radial-gradient(90%_70%_at_100%_100%,color-mix(in_oklch,var(--accent-2)_28%,transparent),transparent_60%)]" />
                  <div className="bg-dots absolute inset-0 opacity-60 mask-fade-b" />
                  <div className="absolute inset-0 grid place-items-center">
                    <span className="font-serif text-[9rem] italic leading-none text-foreground/90 sm:text-[11rem]">SP</span>
                  </div>
                </>
              )}
              <div className="glass absolute inset-x-4 bottom-4 flex items-center justify-between rounded-2xl border border-border px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{site.name}</p>
                  <p className="text-xs text-muted-foreground">{site.role}</p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="size-3.5" aria-hidden /> {site.timezone}
                </span>
              </div>
            </div>

            <dl className="mt-4 grid grid-cols-3 gap-3">
              {[
                { k: "Years experience", v: site.stats.yearsExperience },
                { k: "Projects shipped", v: site.stats.projectsCompleted },
                { k: "Reply time", v: site.stats.responseTime },
              ].map((s) => (
                <div key={s.k} className="rounded-2xl border border-border bg-card/50 p-4">
                  <dt className="text-[11px] leading-snug text-muted-foreground">{s.k}</dt>
                  <dd className="mt-2 text-2xl font-semibold tracking-tight">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>

        {/* Story */}
        <div>
          <Reveal>
            <Eyebrow>About me</Eyebrow>
            <h2 id="about-title" className="mt-5 text-balance text-3xl font-semibold tracking-[-0.035em] sm:text-5xl sm:leading-[1.05]">
              One developer. <Serif>Full ownership</Serif> of your product.
            </h2>
          </Reveal>

          <Reveal delay={0.1} className="mt-8 space-y-5 text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            <p>
              Hi, I&apos;m <span className="text-foreground">Samarth Patel</span> — a full stack developer who works
              independently with startups, founders and small businesses. I take ideas from a rough sketch to a
              reliable product in the hands of real users.
            </p>
            <p>
              I&apos;m not an agency, and there&apos;s no team behind a curtain. When you work with me, you talk
              directly to the person designing your screens, writing your code and deploying your servers.
              Decisions happen faster, nothing gets lost in translation, and you always know exactly where your
              project stands.
            </p>
            <p>
              I care about the details that make software feel trustworthy: fast load times, clear interfaces,
              sensible architecture and code that another developer could happily pick up years from now.
            </p>
          </Reveal>

          <Stagger className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {focus.map(({ icon: I, label }) => (
              <StaggerItem
                key={label}
                className="group flex flex-col gap-4 rounded-2xl border border-border bg-card/40 p-4 transition-colors hover:border-foreground/15 hover:bg-card"
              >
                <span className="grid size-9 place-items-center rounded-xl border border-border bg-background text-muted-foreground transition-colors group-hover:text-accent">
                  <I className="size-4" aria-hidden />
                </span>
                <span className="text-sm font-medium leading-snug">{label}</span>
              </StaggerItem>
            ))}
          </Stagger>

          <Reveal delay={0.15}>
            <blockquote className="mt-10 border-l-2 border-accent/60 pl-5 font-serif text-xl italic leading-snug text-foreground/90 sm:text-2xl">
              &ldquo;I treat every project as if my name is on it — because it is.&rdquo;
            </blockquote>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
