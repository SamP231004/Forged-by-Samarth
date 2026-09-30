import { faqs } from "./content";
import { servicePages } from "./service-pages";
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
        sameAs: [site.github, site.linkedin, site.portfolio],
        address: { "@type": "PostalAddress", addressCountry: "IN" },
        knowsAbout: [
          "Web Development",
          "Mobile App Development",
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
        priceRange: "$200 – $5,000+",
        address: { "@type": "PostalAddress", addressCountry: "IN" },
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Development services",
          itemListElement: servicePages.map((s) => ({
            "@type": "Offer",
            ...(s.priceFrom && { price: s.priceFrom, priceCurrency: "USD" }),
            itemOffered: {
              "@type": "Service",
              name: s.eyebrow,
              description: s.metaDescription,
              url: `${site.url}/services/${s.slug}`,
            },
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
