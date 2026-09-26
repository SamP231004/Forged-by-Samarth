import { X, Check } from "lucide-react";
import { Stagger, StaggerItem, Reveal } from "@/components/motion/reveal";
import { Icon } from "@/components/ui/icon";
import { Section, SectionHeading, Serif } from "@/components/ui/section";
import { reasons } from "@/lib/content";

const comparison = [
  ["Who you talk to", "Account manager", "The developer building it"],
  ["Feedback loop", "Days, through layers", "Hours, directly"],
  ["Your budget pays for", "Overhead & sales", "Building your product"],
  ["After launch", "New team, new ticket", "Same person who built it"],
];

export function WhyMe() {
  return (
    <Section id="why" className="overflow-hidden border-t border-border bg-muted/20">
      <div className="container-page">
        <SectionHeading
          align="center"
          eyebrow="Why work with me"
          title={
            <>
              The benefits of hiring <Serif>one dedicated</Serif> developer
            </>
          }
          description="Working with an independent developer is a different experience from working with an agency. Here's what that means for you."
        />

        <Stagger className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((r, i) => (
            <StaggerItem
              key={r.title}
              className={`group bg-background p-7 transition-colors hover:bg-card ${i === 0 ? "lg:col-span-2 lg:row-span-1" : ""}`}
            >
              <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-accent/20 to-accent-2/10 text-accent transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110">
                <Icon name={r.icon} className="size-[18px]" />
              </span>
              <h3 className="mt-6 font-semibold tracking-tight">{r.title}</h3>
              <p className="mt-2 text-[14.5px] leading-relaxed text-muted-foreground">{r.body}</p>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal className="mx-auto mt-10 max-w-3xl overflow-hidden rounded-3xl border border-border bg-card/50">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Typical agency compared with working with me</caption>
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th scope="col" className="p-4 font-medium sm:px-6" />
                <th scope="col" className="p-4 font-medium sm:px-6">Typical agency</th>
                <th scope="col" className="p-4 font-medium text-foreground sm:px-6">Working with me</th>
              </tr>
            </thead>
            <tbody>
              {comparison.map(([label, them, me]) => (
                <tr key={label} className="border-b border-border last:border-0">
                  <th scope="row" className="p-4 font-medium sm:px-6">{label}</th>
                  <td className="p-4 text-muted-foreground sm:px-6">
                    <span className="inline-flex items-start gap-2">
                      <X className="mt-0.5 size-3.5 shrink-0 text-muted-foreground/60" aria-hidden /> {them}
                    </span>
                  </td>
                  <td className="p-4 sm:px-6">
                    <span className="inline-flex items-start gap-2">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-success" aria-hidden /> {me}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
      </div>
    </Section>
  );
}
