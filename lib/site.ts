/**
 * Single source of truth for personal details and contact links.
 * Update the values marked TODO before going live.
 */
export const site = {
  name: "Samarth Patel",
  role: "Full Stack Developer",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://samarthpatel.dev", // TODO: your domain
  title: "Samarth Patel — Full Stack Developer for Startups & Businesses",
  description:
    "I'm Samarth Patel, an independent full stack developer. I design, build and ship production-ready web apps, mobile apps and APIs for founders and growing businesses — and you work directly with me, over messages, from the first hello to launch.",
  location: "India · Working with clients worldwide", // TODO
  timezone: "IST (UTC+5:30)",
  email: "hello@samarthpatel.dev", // TODO
  whatsapp: "910000000000", // TODO: country code + number, digits only
  telegram: "samarthpatel", // TODO: Telegram username
  github: "https://github.com/SamP231004",
  linkedin: "https://www.linkedin.com/in/samp231004/",
  portfolio: "https://samp231004.github.io/Portfolio/",
  // Placeholders — replace with your real numbers. Never inflate these.
  stats: {
    yearsExperience: "X+",
    projectsCompleted: "XX+",
    responseTime: "< 24h",
  },
  availability: "Taking on new projects",
} as const;

export const links = {
  whatsapp: (text = "Hi Samarth, I'd like to talk about a project.") =>
    `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`,
  email: (subject = "New project enquiry") =>
    `mailto:${site.email}?subject=${encodeURIComponent(subject)}`,
  telegram: `https://t.me/${site.telegram}`,
};

export const nav = [
  { label: "About", href: "/#about" },
  { label: "Services", href: "/#services" },
  { label: "Work", href: "/#work" },
  { label: "Process", href: "/#process" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Estimate", href: "/#estimate" },
  { label: "FAQ", href: "/#faq" },
] as const;
