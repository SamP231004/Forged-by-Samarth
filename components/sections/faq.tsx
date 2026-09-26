import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Eyebrow, Section, Serif } from "@/components/ui/section";
import { faqs } from "@/lib/content";
import { links } from "@/lib/site";

export function Faq() {
  return (
    <Section id="faq" className="border-t border-border">
      <div className="container-page grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <Reveal>
          <Eyebrow>FAQ</Eyebrow>
          <h2 className="mt-5 text-balance text-3xl font-semibold tracking-[-0.035em] sm:text-5xl sm:leading-[1.05]">
            Questions, <Serif>answered</Serif>
          </h2>
          <p className="mt-5 leading-relaxed text-muted-foreground sm:text-lg">
            Can&apos;t find what you&apos;re looking for?{" "}
            <a href={links.email("A quick question")} className="text-foreground underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground">
              Email me
            </a>{" "}
            or{" "}
            <Link href="/#contact" className="text-foreground underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground">
              send a message
            </Link>{" "}
            — I answer every one personally.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <Accordion type="single" collapsible defaultValue="item-0" className="border-t border-border">
            {faqs.map((f, i) => (
              <AccordionItem key={f.q} value={`item-${i}`}>
                <AccordionTrigger>{f.q}</AccordionTrigger>
                <AccordionContent>{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </Section>
  );
}
