import { faqs, services } from "./content";
import { site } from "./site";

export function personSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${site.url}/#person`,
        name: site.name,
        jobTitle: site.role,
        url: site.url,
        email: `mailto:${site.email}`,
        sameAs: [site.github, site.linkedin],
        knowsAbout: [
          "Full Stack Development",
          "React",
          "Next.js",
          "TypeScript",
          "Spring Boot",
          "Node.js",
          "React Native",
          "AWS",
          "PostgreSQL",
          "AI Integrations",
        ],
      },
      {
        "@type": "ProfessionalService",
        "@id": `${site.url}/#service`,
        name: `${site.name} — ${site.role}`,
        url: site.url,
        description: site.description,
        founder: { "@id": `${site.url}/#person` },
        areaServed: "Worldwide",
        priceRange: "$$",
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Development services",
          itemListElement: services.map((s) => ({
            "@type": "Offer",
            itemOffered: { "@type": "Service", name: s.title, description: s.body },
          })),
        },
      },
      {
        "@type": "WebSite",
        "@id": `${site.url}/#website`,
        url: site.url,
        name: site.name,
        publisher: { "@id": `${site.url}/#person` },
        inLanguage: "en",
      },
      {
        "@type": "FAQPage",
        "@id": `${site.url}/#faq`,
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };
}

/** Serialises JSON-LD safely for inline <script> tags. */
export const jsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");
