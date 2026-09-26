import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion/reveal";

export function Section({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <section className={cn("relative py-24 sm:py-32", className)} {...props}>
      {children}
    </section>
  );
}

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        "inline-flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground",
        className,
      )}
    >
      <span className="h-px w-6 bg-gradient-to-r from-transparent to-accent" aria-hidden />
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <Reveal className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-5 text-balance text-3xl font-semibold tracking-[-0.035em] sm:text-5xl sm:leading-[1.05]">
        {title}
      </h2>
      {description && (
        <p className="mt-5 text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">{description}</p>
      )}
    </Reveal>
  );
}

/** Italic serif accent used inside headings. */
export function Serif({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("font-serif text-[1.08em] font-normal italic tracking-normal", className)}>{children}</span>
  );
}
