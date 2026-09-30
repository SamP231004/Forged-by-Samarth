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
  visual: "health" | "future";
  // real screenshot shown on the cover instead of the drawn visual
  screenshot?: {
    src: string;
    width: number;
    height: number;
    frame: "browser" | "phone";
    alt: string;
  };
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
    slug: "maternal-care-dashboard",
    title: "Maternal Care Dashboard",
    tagline:
      "A backend and web dashboard that lets maternal and newborn care teams record patient data and act on automatic risk alerts.",
    category: "Healthcare · Backend & Dashboard",
    visual: "health",
    screenshot: {
      src: "/projects/maternal-dashboard.png",
      width: 1917,
      height: 932,
      frame: "browser",
      alt: "Patient list in the care dashboard with risk levels and an at-a-glance panel. Patient details are blurred.",
    },
    accent: "from-rose-500/30 via-fuchsia-500/20 to-transparent",
    // TODO: confirm this matches how the client described the problem.
    problem:
      "Mothers' and newborns' health information was spread across paper records, devices and different facilities, so no one had a complete picture of a patient. Without a clear way to rank risk and escalate, early warning signs could be missed or acted on too late.",
    solution:
      "I built the backend and a web dashboard. Clinic staff use it to register mothers and newborns, record vitals, symptoms and notes, and work through a queue of risk alerts that a rules engine raises automatically. Supervisors and administrators get analytics, facility and staff management, and PDF export of a patient's timeline, and each facility can only see its own patients.",
    technologies: [
      "TypeScript",
      "Node.js & Express",
      "Supabase (PostgreSQL, Auth, Storage)",
      "React & Vite",
      "Tailwind CSS",
      "Vercel",
      "GitHub Actions",
    ],
    timeline: "Jan 2026 · 2 weeks",
    role: "Backend architecture, database design, dashboard, CI and deployment",
    // TODO: add real results — clinics or staff using it, patients enrolled, alerts handled, or a client quote.
    outcome:
      "I built the backend to last beyond the first contract, and it did. When the client came back in September for a mobile app, the app ran on this same backend. I extended it with new modules and database migrations without deleting or rewriting any of the original code.",
    highlights: [
      "Rules engine flags high-risk mothers and newborns automatically",
      "Role-based access with each facility's data kept separate",
      "Analytics, alert queue and PDF export of patient timelines",
      "Public clinical rules page generated from the engine's own rule files",
      "Records still save if risk scoring fails; a background job retries it",
      "REST API documented with OpenAPI",
    ],
  },
  {
    slug: "maternal-care-app",
    title: "Maternal Care Mobile App",
    tagline:
      "A mobile app for clinic staff and patients. The same client hired me to build it on the backend I'd made for them earlier in the year.",
    category: "Healthcare · Mobile",
    visual: "health",
    screenshot: {
      src: "/projects/maternal-app.png",
      width: 720,
      height: 1600,
      frame: "phone",
      alt: "Patients screen in the mobile app showing an at-a-glance summary and risk filters. Patient details are blurred.",
    },
    accent: "from-pink-500/30 via-rose-400/20 to-transparent",
    // TODO: confirm this matches how the client described the problem.
    problem:
      "The dashboard kept care teams at a desk, but much of their work happens elsewhere, and many of the clinics they serve have unreliable internet. Once mothers went home, the care team also had no readings from them until the next visit.",
    solution:
      "I built a React Native app on the same backend. Staff can do their clinical work on a phone and keep recording when there's no signal; entries are stored encrypted on the device and sync when the connection returns. Patients get their own login to send home blood pressure readings from a Bluetooth monitor and record voice diaries. I also extended the backend with medication safety checks, urine, scan and growth tracking, and patient self-service, which the dashboard and the app both use.",
    technologies: [
      "React Native & Expo",
      "TypeScript",
      "SQLCipher (encrypted SQLite)",
      "Bluetooth Low Energy",
      "Node.js & Express",
      "Supabase",
      "GitHub Actions",
    ],
    timeline: "Sept 2026 · 2 weeks",
    role: "Mobile app, backend extensions, database migrations, release builds",
    // Delivered, but not yet on the app stores — don't describe it as launched.
    outcome:
      "The client came back for this project after the dashboard. The app runs on the backend I built in January: I added new modules and migrations without deleting or rewriting any original code. I delivered it in two weeks, the same pace as the dashboard, with signed Android builds produced automatically on every release.",
    highlights: [
      "Encrypted offline recording that syncs when back online",
      "Home blood pressure readings from Bluetooth Omron monitors",
      "Patient login with home readings and voice diaries",
      "Medication safety checks against clinical data",
      "Works on locked-down kiosk devices",
      "Dashboard and app available in 10 languages, including Arabic",
    ],
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
