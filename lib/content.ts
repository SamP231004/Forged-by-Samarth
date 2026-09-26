/**
 * Editable copy for the homepage. Everything here is written in first person —
 * this is a one-person practice, not an agency.
 */

export const services = [
  {
    icon: "Globe",
    title: "Business Websites",
    body: "A fast, polished site that explains what you do in seconds and turns visitors into enquiries — easy for you to update without calling me.",
    outcome: "More qualified leads",
  },
  {
    icon: "Layers",
    title: "SaaS Platforms",
    body: "From the first version to paying customers: accounts, subscriptions, dashboards and the core workflow your users actually pay for.",
    outcome: "Launch and start charging",
  },
  {
    icon: "Smartphone",
    title: "Mobile Applications",
    body: "One codebase for iOS and Android, so your customers get a native-feeling app without you paying to build everything twice.",
    outcome: "Reach customers on their phones",
  },
  {
    icon: "LayoutDashboard",
    title: "Admin Dashboards",
    body: "Replace spreadsheets and copy-paste with one internal tool that shows your team what matters and automates the busywork.",
    outcome: "Hours saved every week",
  },
  {
    icon: "Sparkles",
    title: "AI Integrations",
    body: "Practical AI where it earns its place — support assistants, document search, content generation — wired into the tools you already use.",
    outcome: "Do more with the same team",
  },
  {
    icon: "Workflow",
    title: "API Development",
    body: "Reliable backends that connect your apps, payment providers and third-party tools, documented so any future developer can pick them up.",
    outcome: "Systems that talk to each other",
  },
  {
    icon: "Cloud",
    title: "Cloud Deployment",
    body: "Hosting that stays up when traffic spikes, with automated deploys, backups and monitoring — and bills that don't surprise you.",
    outcome: "Peace of mind at scale",
  },
  {
    icon: "LifeBuoy",
    title: "Maintenance & Support",
    body: "Updates, fixes and small improvements after launch, handled by the person who already knows your codebase inside out.",
    outcome: "A product that keeps improving",
  },
] as const;

export const process = [
  {
    title: "Discovery",
    body: "A relaxed call about your goals, users and constraints. I ask a lot of questions so we agree on what success looks like before any code is written.",
    duration: "1–3 days",
  },
  {
    title: "Planning",
    body: "You get a written scope, milestones, a fixed quote or estimate, and a recommended stack — in plain language, with no surprises hidden in the fine print.",
    duration: "2–5 days",
  },
  {
    title: "Design",
    body: "Wireframes, then high-fidelity screens you can click through. We iterate together until it feels right on desktop and mobile.",
    duration: "1–2 weeks",
  },
  {
    title: "Development",
    body: "I build in weekly milestones with a live staging link, so you see real progress every week instead of waiting for a big reveal.",
    duration: "2–10 weeks",
  },
  {
    title: "Testing",
    body: "Automated tests, cross-device checks, performance and accessibility passes. You review everything on staging before it goes public.",
    duration: "Ongoing",
  },
  {
    title: "Deployment",
    body: "I handle domains, hosting, analytics and the launch itself — then walk you through how everything works so you're never locked out.",
    duration: "1–2 days",
  },
  {
    title: "Support",
    body: "Launch is the beginning. I stay available for fixes, improvements and new features, on a retainer or as needed.",
    duration: "As long as you need",
  },
] as const;

export const reasons = [
  {
    icon: "MessageCircle",
    title: "You talk to the developer",
    body: "No account managers or handoffs. The person on the call is the person writing your code.",
  },
  {
    icon: "UserCheck",
    title: "No middlemen",
    body: "No agency overhead baked into your quote — your budget goes into building your product.",
  },
  {
    icon: "Zap",
    title: "Fast iterations",
    body: "Feedback on Monday can be live on staging by Tuesday. Small team of one, short loops.",
  },
  {
    icon: "Eye",
    title: "Transparent by default",
    body: "Weekly updates, a shared task board and full access to the repository from day one.",
  },
  {
    icon: "Cpu",
    title: "Modern, proven technology",
    body: "Tools chosen for your product's needs and future hiring — not for novelty.",
  },
  {
    icon: "HeartHandshake",
    title: "Long-term support",
    body: "I'm around after launch. Many clients keep working with me as their product grows.",
  },
  {
    icon: "Code2",
    title: "Clean, scalable code",
    body: "Typed, tested and documented, so another developer could take over tomorrow if needed.",
  },
] as const;

export type TechItem = { name: string; slug?: string };

export const techStack: { group: string; items: TechItem[] }[] = [
  {
    group: "Frontend",
    items: [
      { name: "React", slug: "react" },
      { name: "Next.js", slug: "nextdotjs" },
      { name: "TypeScript", slug: "typescript" },
    ],
  },
  {
    group: "Backend",
    items: [
      { name: "Spring Boot", slug: "springboot" },
      { name: "Node.js", slug: "nodedotjs" },
      { name: "Express", slug: "express" },
    ],
  },
  {
    group: "Database",
    items: [
      { name: "PostgreSQL", slug: "postgresql" },
      { name: "MongoDB", slug: "mongodb" },
      { name: "Supabase", slug: "supabase" },
    ],
  },
  {
    group: "Cloud",
    items: [
      { name: "AWS" },
      { name: "Docker", slug: "docker" },
      { name: "Vercel", slug: "vercel" },
    ],
  },
  {
    group: "Mobile",
    items: [
      { name: "React Native", slug: "react" },
      { name: "Expo", slug: "expo" },
    ],
  },
];

/**
 * Placeholder testimonials. Replace with real, attributed quotes from clients
 * (with their permission) before publishing — never invent reviews.
 */
export const testimonials = [
  {
    quote:
      "Add a short quote from a client here — ideally about what changed for their business after the project, not just that it went well.",
    name: "Client Name",
    role: "Founder, Company",
    placeholder: true,
  },
  {
    quote:
      "A second testimonial slot. Quotes that mention communication, speed or reliability work especially well for a solo developer.",
    name: "Client Name",
    role: "Product Lead, Company",
    placeholder: true,
  },
  {
    quote:
      "A third testimonial slot. If you have a measurable result — time saved, revenue, sign-ups — this is the place for it.",
    name: "Client Name",
    role: "Operations Manager, Company",
    placeholder: true,
  },
] as const;

/** Update "from" amounts to your own rates. */
export const pricing = [
  {
    name: "Landing Page",
    from: "$X00",
    blurb: "A single, high-converting page for a launch, product or campaign.",
    includes: ["Custom design", "Mobile-first build", "SEO & analytics setup", "Contact form"],
    timeline: "1–2 weeks",
  },
  {
    name: "Business Website",
    from: "$X,X00",
    blurb: "A complete multi-page site you can edit yourself.",
    includes: ["Up to ~8 pages", "CMS for easy edits", "Performance & SEO", "Launch support"],
    timeline: "2–4 weeks",
  },
  {
    name: "Web Application",
    from: "$X,X00",
    blurb: "SaaS products, portals and internal tools with real logic behind them.",
    includes: ["Auth & user roles", "Database & API", "Admin dashboard", "Cloud deployment"],
    timeline: "6–12 weeks",
    featured: true,
  },
  {
    name: "Mobile App",
    from: "$X,X00",
    blurb: "Cross-platform iOS and Android apps built with React Native.",
    includes: ["iOS & Android", "Push notifications", "Backend & API", "Store submission"],
    timeline: "8–14 weeks",
  },
  {
    name: "Enterprise Solution",
    from: "Custom quote",
    blurb: "Complex integrations, migrations or long-term product partnerships.",
    includes: ["Architecture review", "Integrations & SSO", "Dedicated availability", "SLA options"],
    timeline: "Scoped together",
  },
] as const;

export const faqs = [
  {
    q: "How long does development take?",
    a: "It depends on scope. A landing page usually takes 1–2 weeks, a business website 2–4 weeks, and a web or mobile app anywhere from 6 to 14 weeks for a first version. After our discovery call I'll give you a written timeline with weekly milestones, so you always know where things stand.",
  },
  {
    q: "Do you work internationally?",
    a: "Yes. I work with clients across time zones and keep a few hours of overlap for calls. Most communication happens asynchronously through written updates, a shared task board and a staging link, so the time difference rarely slows anything down.",
  },
  {
    q: "Can you maintain existing projects?",
    a: "Absolutely. I start with a short paid code review to understand the codebase, flag risks and suggest priorities. From there I can fix bugs, add features, upgrade dependencies or gradually improve the architecture.",
  },
  {
    q: "Do you build MVPs?",
    a: "Yes — it's some of my favourite work. I'll help you cut the scope down to the smallest version that proves your idea with real users, build it properly so it doesn't have to be thrown away, and plan what comes next.",
  },
  {
    q: "Can you sign an NDA?",
    a: "Of course. I'm happy to sign your NDA before we discuss details, or I can provide a simple mutual one. Your idea and your code belong to you.",
  },
  {
    q: "How does payment work?",
    a: "For fixed-scope projects I usually split payment into milestones — for example a deposit to start, then payments tied to agreed deliverables. Ongoing work can be billed monthly. I accept bank transfer and common international payment methods, and you'll always receive clear invoices.",
  },
] as const;
