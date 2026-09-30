import type { MetadataRoute } from "next";
import { projects } from "@/lib/projects";
import { servicePages } from "@/lib/service-pages";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: site.url, lastModified: now, changeFrequency: "monthly", priority: 1 },
    ...servicePages.map((s) => ({
      url: `${site.url}/services/${s.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    ...projects
      .filter((p) => !p.comingSoon)
      .map((p) => ({
        url: `${site.url}/projects/${p.slug}`,
        lastModified: now,
        changeFrequency: "yearly" as const,
        priority: 0.7,
      })),
  ];
}
