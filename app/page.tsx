import { About } from "@/components/sections/about";
import { Contact } from "@/components/sections/contact";
import { Estimator } from "@/components/sections/estimator";
import { Faq } from "@/components/sections/faq";
import { Hero } from "@/components/sections/hero";
import { Pricing } from "@/components/sections/pricing";
import { Process } from "@/components/sections/process";
import { Projects } from "@/components/sections/projects";
import { Services } from "@/components/sections/services";
import { TechStack } from "@/components/sections/tech-stack";
import { Testimonials } from "@/components/sections/testimonials";
import { WhyMe } from "@/components/sections/why-me";

export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Services />
      <Projects />
      <Process />
      <WhyMe />
      <TechStack />
      <Testimonials />
      <Pricing />
      <Estimator />
      <Faq />
      <Contact />
    </>
  );
}
