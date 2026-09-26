/**
 * Rule-based project estimator. The numbers below are starting points —
 * tune them to your own rates. All prices are in USD.
 */

export const projectTypes = [
  { id: "website", label: "Website", hint: "Marketing or business site", icon: "Globe" },
  { id: "webapp", label: "Web App", hint: "SaaS, portal or platform", icon: "AppWindow" },
  { id: "mobile", label: "Mobile App", hint: "iOS & Android", icon: "Smartphone" },
  { id: "dashboard", label: "Admin Dashboard", hint: "Internal tool or back office", icon: "LayoutDashboard" },
] as const;

export const featureOptions = [
  { id: "auth", label: "Authentication", hint: "Sign-up, login, user roles", icon: "KeyRound" },
  { id: "payments", label: "Payments", hint: "Checkout or subscriptions", icon: "CreditCard" },
  { id: "ai", label: "AI Features", hint: "Chat, search, generation", icon: "Sparkles" },
] as const;

export const timelineOptions = [
  { id: "rush", label: "As soon as possible", hint: "Priority scheduling" },
  { id: "standard", label: "Within 1–3 months", hint: "The usual pace" },
  { id: "flexible", label: "Flexible", hint: "Quality over speed" },
] as const;

export const budgetOptions = [
  { id: "lt2k", label: "Under $2,000", max: 2000 },
  { id: "2to5k", label: "$2,000 – $5,000", max: 5000 },
  { id: "5to10k", label: "$5,000 – $10,000", max: 10000 },
  { id: "10to25k", label: "$10,000 – $25,000", max: 25000 },
  { id: "gt25k", label: "$25,000+", max: Infinity },
  { id: "unsure", label: "Not sure yet", max: Infinity },
] as const;

export type ProjectTypeId = (typeof projectTypes)[number]["id"];
export type FeatureId = (typeof featureOptions)[number]["id"];
export type TimelineId = (typeof timelineOptions)[number]["id"];
export type BudgetId = (typeof budgetOptions)[number]["id"];

export type EstimateInput = {
  projectType: ProjectTypeId;
  features: FeatureId[];
  timeline: TimelineId;
  budget: BudgetId;
};

type Range = [number, number];

const base: Record<ProjectTypeId, { price: Range; weeks: Range }> = {
  website: { price: [800, 2500], weeks: [2, 4] },
  webapp: { price: [4000, 9000], weeks: [6, 10] },
  mobile: { price: [5000, 11000], weeks: [8, 12] },
  dashboard: { price: [2500, 6000], weeks: [4, 7] },
};

const addOns: Record<FeatureId, { price: Range; weeks: Range }> = {
  auth: { price: [500, 1200], weeks: [0.5, 1] },
  payments: { price: [800, 1800], weeks: [1, 2] },
  ai: { price: [1200, 3500], weeks: [1, 3] },
};

const pace: Record<TimelineId, { price: number; weeks: number }> = {
  rush: { price: 1.25, weeks: 0.8 },
  standard: { price: 1, weeks: 1 },
  flexible: { price: 0.95, weeks: 1.1 },
};

export type Estimate = {
  price: Range;
  weeks: Range;
  stack: { layer: string; tools: string[] }[];
  summary: string;
  budgetNote?: string;
};

const roundPrice = (n: number) => Math.round(n / 100) * 100;

export function estimate(input: EstimateInput): Estimate {
  const b = base[input.projectType];
  let price: Range = [...b.price];
  let weeks: Range = [...b.weeks];

  for (const f of input.features) {
    price = [price[0] + addOns[f].price[0], price[1] + addOns[f].price[1]];
    weeks = [weeks[0] + addOns[f].weeks[0], weeks[1] + addOns[f].weeks[1]];
  }

  const p = pace[input.timeline];
  price = [roundPrice(price[0] * p.price), roundPrice(price[1] * p.price)];
  weeks = [Math.max(1, Math.round(weeks[0] * p.weeks)), Math.max(2, Math.round(weeks[1] * p.weeks))];

  const stack = recommendStack(input);
  const typeLabel = projectTypes.find((t) => t.id === input.projectType)!.label.toLowerCase();
  const featureLabels = input.features.map((f) =>
    featureOptions.find((o) => o.id === f)!.label.toLowerCase().replace(/\bai\b/, "AI"),
  );

  const summary =
    `A ${typeLabel}` +
    (featureLabels.length ? ` with ${joinList(featureLabels)}` : "") +
    `, delivered in weekly milestones with a live staging link.`;

  const budget = budgetOptions.find((o) => o.id === input.budget)!;
  let budgetNote: string | undefined;
  if (Number.isFinite(budget.max) && budget.max < price[0]) {
    budgetNote =
      "Your budget is below this estimate. That's okay — on a call we can trim the first version to what matters most and plan the rest for later.";
  }

  return { price, weeks, stack, summary, budgetNote };
}

function recommendStack({ projectType, features }: EstimateInput) {
  const stack: { layer: string; tools: string[] }[] = [];
  const has = (f: FeatureId) => features.includes(f);

  if (projectType === "mobile") {
    stack.push({ layer: "App", tools: ["React Native", "Expo", "TypeScript"] });
  } else {
    stack.push({ layer: "Frontend", tools: ["Next.js", "TypeScript", "Tailwind CSS"] });
  }

  if (projectType === "website" && !has("auth") && !has("payments") && !has("ai")) {
    stack.push({ layer: "Content", tools: ["Headless CMS", "Resend"] });
    stack.push({ layer: "Hosting", tools: ["Vercel"] });
    return stack;
  }

  const heavyBackend = projectType === "webapp" || projectType === "dashboard";
  stack.push({
    layer: "Backend",
    tools: heavyBackend ? ["Spring Boot", "REST API"] : ["Node.js", "Express"],
  });
  stack.push({ layer: "Database", tools: has("auth") ? ["PostgreSQL", "Supabase Auth"] : ["PostgreSQL"] });

  const extras: string[] = [];
  if (has("payments")) extras.push("Stripe");
  if (has("ai")) extras.push("LLM API", "Vector search");
  if (extras.length) stack.push({ layer: "Integrations", tools: extras });

  stack.push({ layer: "Cloud", tools: heavyBackend ? ["AWS", "Docker"] : ["Vercel", "AWS"] });
  return stack;
}

function joinList(items: string[]) {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

export const formatUSD = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
