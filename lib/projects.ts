/**
 * Case studies. Replace the placeholder links, timelines and outcomes with
 * real details. Keep outcomes honest — describe what shipped and what it
 * enabled rather than inventing metrics.
 */
export type Project = {
  slug: string;
  title: string;
  tagline: string;
  category: string;
  visual: "health" | "chat" | "portfolio" | "future";
  accent: string; // tailwind gradient stops used on the cover
  problem: string;
  solution: string;
  technologies: string[];
  timeline: string;
  role: string;
  outcome: string;
  highlights: string[];
  liveUrl?: string;
  githubUrl?: string;
  comingSoon?: boolean;
};

export const projects: Project[] = [
  {
    slug: "maternal-health-platform",
    title: "Maternal Health Platform",
    tagline: "Helping expecting mothers and care teams stay connected between visits.",
    category: "Healthcare · Web & Mobile",
    visual: "health",
    accent: "from-rose-500/30 via-fuchsia-500/20 to-transparent",
    problem:
      "Expecting mothers often go weeks between appointments with no easy way to track symptoms, remember check-ups or reach their care team. Important warning signs can be missed, and clinicians lack a clear picture of how patients are doing at home.",
    solution:
      "I designed and built a platform where mothers log symptoms, vitals and questions from their phone, receive reminders for appointments and tests, and get week-by-week guidance. Care teams see a prioritised dashboard that highlights patients who may need attention.",
    technologies: ["React", "React Native", "Spring Boot", "PostgreSQL", "AWS"],
    timeline: "X weeks", // TODO
    role: "Design, frontend, backend, deployment",
    outcome:
      "Replace this with the real outcome — for example how many users onboarded, what clinicians said, or which manual process it replaced.",
    highlights: [
      "Role-based access for patients and clinicians",
      "Symptom tracking with risk flags",
      "Automated appointment and medication reminders",
      "Privacy-first data handling",
    ],
    liveUrl: "#", // TODO
    githubUrl: "https://github.com/SamP231004", // TODO: link the specific repo
  },
  {
    slug: "ai-chat-platform",
    title: "AI Chat Platform",
    tagline: "A conversational assistant that answers from a company's own knowledge.",
    category: "AI · SaaS",
    visual: "chat",
    accent: "from-violet-500/30 via-indigo-500/20 to-transparent",
    problem:
      "Support and internal teams were answering the same questions repeatedly, with answers scattered across documents, wikis and old tickets. Generic chatbots gave confident but wrong answers.",
    solution:
      "I built a chat platform that searches a team's own documents and answers with citations, streams responses in real time, and hands off to a human when it isn't sure. Admins can upload sources and review conversations to improve answers.",
    technologies: ["Next.js", "TypeScript", "Node.js", "PostgreSQL", "Vercel"],
    timeline: "X weeks", // TODO
    role: "Product design, full stack, AI integration",
    outcome:
      "Replace this with the real outcome — for example share of questions answered without escalation, or response time before vs. after.",
    highlights: [
      "Retrieval over uploaded documents with source citations",
      "Streaming responses and conversation history",
      "Admin console for sources and analytics",
      "Usage limits and team workspaces",
    ],
    liveUrl: "#", // TODO
    githubUrl: "https://github.com/SamP231004", // TODO: link the specific repo
  },
  {
    slug: "developer-portfolio",
    title: "Developer Portfolio",
    tagline: "This site — built to be fast, accessible and easy to keep up to date.",
    category: "Web · Personal",
    visual: "portfolio",
    accent: "from-sky-500/30 via-cyan-500/20 to-transparent",
    problem:
      "Freelance clients decide quickly whether they trust a developer. I needed a site that shows how I work, answers common questions up front and makes it effortless to start a conversation.",
    solution:
      "A performance-focused Next.js site with server components, subtle motion, a built-in project estimator and a contact flow that delivers enquiries straight to my inbox.",
    technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion", "Resend"],
    timeline: "X weeks", // TODO
    role: "Everything",
    outcome:
      "Replace this with real numbers once live — Lighthouse scores, enquiry volume or conversion rate.",
    highlights: [
      "Interactive project estimator",
      "Dark and light themes",
      "Structured data and full SEO setup",
      "Accessible, keyboard-friendly UI",
    ],
    liveUrl: "/",
    githubUrl: "https://github.com/SamP231004", // TODO: link the specific repo
  },
  {
    slug: "your-project",
    title: "Your Project Could Be Next",
    tagline: "I have space for a small number of new projects each quarter.",
    category: "Coming soon",
    visual: "future",
    accent: "from-emerald-500/30 via-teal-500/20 to-transparent",
    problem: "You have an idea, a process that needs fixing, or a product that needs to grow.",
    solution: "We scope it together, I build it, and you get a product you're proud to put your name on.",
    technologies: ["Chosen for your needs"],
    timeline: "Let's find out",
    role: "Your technical partner",
    outcome: "Tell me what you're building.",
    highlights: [],
    comingSoon: true,
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
