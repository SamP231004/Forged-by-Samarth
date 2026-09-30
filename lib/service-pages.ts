/**
 * Landing pages for each service, written to match what clients search for
 * ("hire freelance web developer", "build a mobile app", …). Keep the copy
 * honest and specific — no invented numbers.
 */
export type ServicePage = {
  slug: string;
  /** Title of the matching card in `services` (lib/content.ts). */
  service: string;
  icon: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  eyebrow: string;
  h1: string;
  intro: string;
  forYouIf: string[];
  deliverables: { title: string; body: string }[];
  stack: string[];
  priceFrom?: number;
  priceNote: string;
  timeline: string;
  /** Slug of a related case study in lib/projects.ts. */
  project?: string;
  faqs: { q: string; a: string }[];
};

export const servicePages: ServicePage[] = [
  {
    slug: "web-development",
    service: "Business Websites",
    icon: "Globe",
    metaTitle: "Hire a Freelance Web Developer — Websites & Web Apps",
    metaDescription:
      "Hire Samarth Patel, a freelance web developer, to build a fast business website, landing page or web app with Next.js. Written quotes, weekly progress, from $200.",
    keywords: [
      "hire freelance web developer",
      "freelance web developer",
      "business website development",
      "landing page developer",
      "Next.js developer for hire",
      "website developer India",
    ],
    eyebrow: "Web development",
    h1: "Freelance web developer for websites and web apps",
    intro:
      "I build fast, modern websites and web applications for founders and growing businesses — from a single landing page to a full product with accounts, payments and dashboards. You work directly with me, over messages, from the first idea to launch.",
    forYouIf: [
      "Your current site is slow, dated or hard to update",
      "You need a landing page for a launch or campaign, quickly",
      "You want a web app built properly, not a template stretched too far",
      "You'd rather work with one developer than manage an agency",
    ],
    deliverables: [
      { title: "Custom design", body: "A clean, mobile-first design built around what your visitors need to do — not a recycled theme." },
      { title: "Fast by default", body: "Server-rendered pages, optimised images and fonts, so the site loads quickly and ranks well." },
      { title: "SEO foundations", body: "Titles, descriptions, structured data, sitemap and analytics set up from day one." },
      { title: "Easy to edit", body: "A CMS or simple content files so you can change text and images without calling me." },
      { title: "Contact & lead forms", body: "Enquiry forms that land in your inbox, with spam protection and confirmation emails." },
      { title: "Launch & handover", body: "Hosting, domain and deployment set up, plus a walkthrough and full access to the code." },
    ],
    stack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Vercel"],
    priceFrom: 200,
    priceNote: "Landing pages from $200, business websites from $500, web apps from $1,250.",
    timeline: "1–4 weeks for most websites",
    faqs: [
      {
        q: "How much does it cost to hire a freelance web developer?",
        a: "With me, a landing page starts at $200, a multi-page business website at $500 and a web application at $1,250. You get a fixed, written quote once we've agreed the scope over chat — no hourly surprises.",
      },
      {
        q: "Will I be able to update the website myself?",
        a: "Yes. I set up a content system or simple editable files so you can change text, images and pages without touching code, and I show you how.",
      },
      {
        q: "Do you do SEO?",
        a: "Every site I build ships with technical SEO in place: fast load times, proper titles and descriptions, structured data, a sitemap and analytics. Ongoing content marketing is something I can advise on, but it isn't my core service.",
      },
    ],
  },
  {
    slug: "mobile-app-development",
    service: "Mobile Applications",
    icon: "Smartphone",
    metaTitle: "Mobile App Development — Hire a Freelance App Developer",
    metaDescription:
      "Want to build an app? I'm a freelance app developer building iOS and Android apps with React Native — one codebase, both stores. Offline support, Bluetooth, from $1,750.",
    keywords: [
      "build an app",
      "hire app developer",
      "freelance app developer",
      "mobile app development",
      "React Native developer",
      "iOS and Android app development",
      "app developer India",
    ],
    eyebrow: "Mobile app development",
    h1: "Build your mobile app for iOS and Android",
    intro:
      "I design and build cross-platform mobile apps with React Native — one codebase that runs on both iPhone and Android, so you're not paying to build everything twice. I handle the app, the backend it talks to, and getting it into your users' hands.",
    forYouIf: [
      "You have an app idea and need someone to build the first version",
      "Your users are on their phones, not at a desk",
      "You already have a web product and want an app on the same backend",
      "Your app needs to work with poor or no internet",
    ],
    deliverables: [
      { title: "iOS & Android from one codebase", body: "React Native and Expo, so both platforms stay in step and updates ship faster." },
      { title: "Backend & API", body: "Accounts, data and business logic on a backend I build or connect to — not bolted on later." },
      { title: "Offline support", body: "Encrypted on-device storage that syncs when the connection returns, for users with patchy signal." },
      { title: "Device features", body: "Camera, notifications, Bluetooth devices and more, integrated properly." },
      { title: "Release builds", body: "Signed builds produced automatically, and help getting through app store submission." },
      { title: "Support after launch", body: "Fixes, updates and new features from the developer who already knows the code." },
    ],
    stack: ["React Native", "Expo", "TypeScript", "Node.js", "Supabase", "PostgreSQL"],
    priceFrom: 1750,
    priceNote: "Mobile apps from $1,750, depending on screens, features and integrations.",
    timeline: "Usually 2–14 weeks for a first version",
    project: "maternal-care-app",
    faqs: [
      {
        q: "How much does it cost to build an app?",
        a: "A first version of a mobile app with me starts at $1,750. The final price depends on the number of screens, whether you need a backend, and features like payments, offline mode or device integrations. You'll get a written quote before any work starts.",
      },
      {
        q: "Do I need separate apps for iPhone and Android?",
        a: "No. I build with React Native, so one codebase produces both the iOS and Android apps. That keeps cost and maintenance down without giving up a native feel.",
      },
      {
        q: "Can the app work offline?",
        a: "Yes. I've built apps that store data encrypted on the device and sync it safely once the connection returns — useful when your users work in places with weak signal.",
      },
    ],
  },
  {
    slug: "mvp-saas-development",
    service: "SaaS Platforms",
    icon: "Layers",
    metaTitle: "MVP & SaaS Development for Startups — Freelance Developer",
    metaDescription:
      "Build your MVP or SaaS product with a freelance full-product developer. Auth, subscriptions, dashboards and the core workflow — scoped small, built to last. From $1,250.",
    keywords: [
      "MVP development",
      "build an MVP",
      "SaaS development",
      "SaaS developer for hire",
      "startup developer",
      "hire developer for startup",
    ],
    eyebrow: "MVP & SaaS development",
    h1: "MVP and SaaS development for startups",
    intro:
      "I help founders turn an idea into a working product that real users can sign up for and pay for. We cut the scope down to what proves the idea, and I build it properly — so the first version becomes the foundation, not something you throw away.",
    forYouIf: [
      "You're a founder with an idea and no technical co-founder",
      "You need something in front of users or investors soon",
      "You've been quoted agency prices that don't fit an early-stage budget",
      "Your no-code prototype has hit its limits",
    ],
    deliverables: [
      { title: "Scope that fits", body: "We agree the smallest version that tests your idea, in writing, before any code." },
      { title: "Accounts & roles", body: "Sign-up, login, teams and permissions — done securely from the start." },
      { title: "Payments & subscriptions", body: "Checkout, plans and billing so you can start charging on day one." },
      { title: "Admin dashboard", body: "See your users, data and activity without asking a developer." },
      { title: "Weekly milestones", body: "A live staging link that updates every week, so you always see real progress." },
      { title: "Room to grow", body: "Clean architecture and documentation, so adding features later isn't a rewrite." },
    ],
    stack: ["Next.js", "TypeScript", "Node.js", "PostgreSQL", "Supabase", "Stripe"],
    priceFrom: 1250,
    priceNote: "Web applications and MVPs from $1,250.",
    timeline: "Usually 2–12 weeks for a first version",
    faqs: [
      {
        q: "How much does it cost to build an MVP?",
        a: "MVPs with me start at $1,250. Most of the cost is decided by scope, so the first thing we do is agree — in writing — on the smallest version that proves your idea.",
      },
      {
        q: "Will I own the code?",
        a: "Yes. You get full access to the repository from day one, and the code and intellectual property are yours. I'm also happy to sign an NDA before we discuss your idea.",
      },
      {
        q: "What happens after the MVP?",
        a: "Many clients keep working with me on the next version. Because the MVP is built on a solid foundation, new features extend it rather than replace it.",
      },
    ],
  },
  {
    slug: "admin-dashboard-development",
    service: "Admin Dashboards",
    icon: "LayoutDashboard",
    metaTitle: "Custom Admin Dashboard & Internal Tool Development",
    metaDescription:
      "Replace spreadsheets with a custom admin dashboard. I build internal tools with role-based access, alerts, analytics and PDF export. Delivered in weeks, from $650.",
    keywords: [
      "custom admin dashboard",
      "admin dashboard development",
      "internal tool development",
      "replace spreadsheets with software",
      "dashboard developer",
    ],
    eyebrow: "Dashboards & internal tools",
    h1: "Custom admin dashboards and internal tools",
    intro:
      "If your team runs on spreadsheets, paper forms or copy-paste, I can replace that with one dashboard built around how you actually work — with the right people seeing the right data, and the busywork automated.",
    forYouIf: [
      "Important data lives in spreadsheets, paper or someone's inbox",
      "Different teams or locations should only see their own records",
      "Things slip through the cracks because nobody gets alerted",
      "You spend hours every week compiling the same reports",
    ],
    deliverables: [
      { title: "Role-based access", body: "Staff, supervisors and admins each see what they need — and nothing they shouldn't." },
      { title: "Automatic alerts", body: "Rules that flag what needs attention and put it in a queue someone owns." },
      { title: "Analytics & reports", body: "Charts and summaries your managers can use directly, plus PDF and CSV export." },
      { title: "Audit trail", body: "Corrections and changes are recorded, so you always know who did what." },
      { title: "Works in any browser", body: "No installs — your team signs in from any computer." },
      { title: "API behind it", body: "A documented backend, ready for a mobile app or integrations later." },
    ],
    stack: ["React", "TypeScript", "Node.js", "PostgreSQL", "Supabase"],
    priceFrom: 650,
    priceNote: "Admin dashboards from $650, depending on data, roles and reports.",
    timeline: "Usually 2–7 weeks",
    project: "maternal-care-dashboard",
    faqs: [
      {
        q: "Can you replace our spreadsheets with a dashboard?",
        a: "Yes — that's one of the most common requests I get. I look at how your team uses the spreadsheets today, then build a tool that keeps what works and removes the manual steps.",
      },
      {
        q: "Can different users see different data?",
        a: "Yes. I build role-based access so, for example, each location or team only sees its own records while managers see everything.",
      },
      {
        q: "Can we add a mobile app later?",
        a: "Yes. I build dashboards on a proper API, so a mobile app can use the same backend later without starting again — exactly what happened with the maternal care project below.",
      },
    ],
  },
  {
    slug: "ai-integration",
    service: "AI Integrations",
    icon: "Sparkles",
    metaTitle: "AI Integration Developer — Chatbots, Search & Automation",
    metaDescription:
      "Add practical AI to your product: support chatbots that answer from your own documents, smart search and content generation. Freelance AI integration from $300.",
    keywords: [
      "AI integration developer",
      "AI chatbot development",
      "add AI to my app",
      "LLM integration",
      "custom GPT chatbot for business",
    ],
    eyebrow: "AI integration",
    h1: "Practical AI integration for your product",
    intro:
      "I add AI where it earns its place — assistants that answer from your own documents, search that understands questions, and automation that takes repetitive work off your team. Wired into the tools you already use, with sensible limits and costs.",
    forYouIf: [
      "Your team answers the same questions again and again",
      "Your knowledge is spread across documents nobody can search",
      "You want AI features in your product without the hype",
      "You're worried about AI giving confident, wrong answers",
    ],
    deliverables: [
      { title: "Answers from your data", body: "Retrieval over your own documents, with sources shown so answers can be checked." },
      { title: "Chat that feels fast", body: "Streaming responses and conversation history, inside your app or website." },
      { title: "Human handoff", body: "When the AI isn't sure, it says so and passes the question to a person." },
      { title: "Cost controls", body: "Usage limits and caching so your AI bill stays predictable." },
      { title: "Admin controls", body: "Upload sources, review conversations and improve answers over time." },
      { title: "Model-agnostic", body: "Built so you can switch AI providers without rebuilding your product." },
    ],
    stack: ["LLM APIs", "Vector search", "Next.js", "Node.js", "PostgreSQL"],
    priceFrom: 300,
    priceNote: "AI features from $300 when added to an existing product.",
    timeline: "Usually 1–3 weeks as an add-on",
    faqs: [
      {
        q: "Can you build a chatbot that answers from our own documents?",
        a: "Yes. I build assistants that search your documents, answer with citations, and hand off to a person when they aren't confident — so customers don't get made-up answers.",
      },
      {
        q: "Is our data safe?",
        a: "I keep your data in your own database and only send what's needed to the AI provider for each request. We can choose providers and settings that don't train on your data.",
      },
      {
        q: "Can you add AI to an existing app?",
        a: "Yes. AI features are often a 1–3 week add-on to a product that already exists, starting from $300.",
      },
    ],
  },
  {
    slug: "backend-api-development",
    service: "API Development",
    icon: "Workflow",
    metaTitle: "Backend & API Development — Freelance Backend Developer",
    metaDescription:
      "Hire a freelance backend developer for REST APIs, databases, authentication and integrations. Node.js, Spring Boot and PostgreSQL, documented with OpenAPI.",
    keywords: [
      "backend developer for hire",
      "API development",
      "REST API developer",
      "Node.js developer",
      "Spring Boot developer",
      "freelance backend developer",
    ],
    eyebrow: "Backend & API development",
    h1: "Backend and API development that lasts",
    intro:
      "I build the backends that web and mobile apps run on: secure APIs, well-designed databases and integrations with payment providers and third-party tools — documented so any future developer can pick them up.",
    forYouIf: [
      "You need a backend for a web or mobile app",
      "Your systems don't talk to each other",
      "Your current API is fragile, slow or undocumented",
      "You're planning more than one app on the same data",
    ],
    deliverables: [
      { title: "REST APIs", body: "Clean, versioned endpoints documented with OpenAPI / Swagger." },
      { title: "Database design", body: "PostgreSQL schemas and migrations designed around your data, not bolted together." },
      { title: "Authentication & roles", body: "Secure sign-in, permissions and data separation between users or organisations." },
      { title: "Integrations", body: "Payments, email, messaging and third-party APIs connected reliably." },
      { title: "Background jobs", body: "Retries, scheduled tasks and queues so work isn't lost when something fails." },
      { title: "Tests & CI", body: "Automated tests and deployment pipelines, so changes ship safely." },
    ],
    stack: ["Node.js", "Express", "Spring Boot", "PostgreSQL", "Supabase", "AWS"],
    priceNote: "Quoted per project — often as part of a web or mobile app build.",
    timeline: "Depends on scope",
    project: "maternal-care-dashboard",
    faqs: [
      {
        q: "Can one backend serve both a website and a mobile app?",
        a: "Yes, and it should. I design APIs so a dashboard, website and mobile app can all share the same backend and data.",
      },
      {
        q: "Which backend technologies do you use?",
        a: "Mostly Node.js with Express and Spring Boot, on PostgreSQL. I pick whichever fits your project and team best, and document it either way.",
      },
      {
        q: "Can you work on an existing backend?",
        a: "Yes. I start with a short paid code review to understand the system and flag risks, then fix, extend or gradually improve it.",
      },
    ],
  },
];

export const getServicePage = (slug: string) => servicePages.find((s) => s.slug === slug);
export const servicePageFor = (serviceTitle: string) => servicePages.find((s) => s.service === serviceTitle);
