import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/motion/magnetic";
import { TextReveal } from "@/components/motion/text-reveal";
import { DashboardMockup } from "@/components/sections/dashboard-mockup";
import { HeroBackdrop } from "@/components/sections/hero-backdrop";
import { site } from "@/lib/site";

const badges = ["Full Stack Developer", "React", "Spring Boot", "AWS", "React Native"];

export function Hero() {
  return (
    <section className="relative overflow-hidden pb-16 pt-36 sm:pt-44">
      <HeroBackdrop />

      <div className="container-page flex flex-col items-center text-center">
        <Link
          href="/#contact"
          className="animate-fade-up group inline-flex items-center gap-2 rounded-full border border-border bg-card/50 py-1.5 pl-2 pr-3.5 text-[13px] text-muted-foreground backdrop-blur transition-colors hover:border-foreground/15 hover:text-foreground"
        >
          <span className="relative flex size-2">
            <span className="absolute inset-0 rounded-full bg-success animate-pulse-soft" />
            <span className="relative size-2 rounded-full bg-success" />
          </span>
          {site.availability} — {new Date().getFullYear()}
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </Link>

        <h1 className="mt-8 max-w-4xl text-balance text-[2.6rem] font-semibold leading-[1.02] tracking-[-0.045em] sm:text-6xl md:text-7xl lg:text-[5.25rem]">
          <TextReveal
            delay={0.1}
            segments={[
              "Turning your ideas into",
              { text: "production-ready", className: "font-serif font-normal italic tracking-[-0.01em] text-gradient pr-[0.08em]" },
              "software.",
            ]}
          />
        </h1>

        <p
          className="animate-fade-up mt-7 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg"
          style={{ animationDelay: "0.45s" }}
        >
          I&apos;m Samarth, an independent full stack developer. I help startups, founders and growing businesses
          design, build and launch web apps, mobile apps and APIs — and you work directly with me, from the first call
          to launch day and beyond.
        </p>

        <div
          className="animate-fade-up mt-10 flex flex-col items-center gap-3 sm:flex-row"
          style={{ animationDelay: "0.55s" }}
        >
          <Magnetic>
            <Button asChild size="lg" className="group">
              <Link href="/#contact">
                Start your project
                <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </Magnetic>
          <Magnetic>
            <Button asChild size="lg" variant="outline">
              <Link href="/#work">View my work</Link>
            </Button>
          </Magnetic>
        </div>

        <ul
          className="animate-fade-up mt-12 flex max-w-2xl flex-wrap items-center justify-center gap-x-5 gap-y-3"
          style={{ animationDelay: "0.65s" }}
          aria-label="Core skills"
        >
          {badges.map((b) => (
            <li key={b} className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground">
              <span className="grid size-4 place-items-center rounded-full bg-success/15 text-success">
                <Check className="size-2.5" strokeWidth={3} aria-hidden />
              </span>
              {b}
            </li>
          ))}
        </ul>
      </div>

      <DashboardMockup />
    </section>
  );
}
