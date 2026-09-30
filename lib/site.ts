/**
 * Single source of truth for personal details and contact links.
 * Update the values marked TODO before going live.
 */
export const site = {
  name: "Samarth Patel",
  role: "Software Developer",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://forged-by-samarth.vercel.app").replace(/\/+$/, ""),
  title: "Hire a Freelance Web & App Developer | Samarth Patel",
  description:
    "Hire Samarth Patel, a freelance software developer, to build your website, web app, mobile app or MVP. Written quotes from $200, weekly progress, and you work directly with me.",
  location: "India · Working with clients worldwide", // TODO
  timezone: "IST (UTC+5:30)",
  email: "samp231004@gmail.com",
  phone: "+91 83201 81139",
  whatsapp: "918320181139", // country code + number, digits only
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
