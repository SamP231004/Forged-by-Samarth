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
  { id: "lt500", label: "Under $500", max: 500 },
  { id: "500to1k", label: "$500 – $1,000", max: 1000 },
  { id: "1to2.5k", label: "$1,000 – $2,500", max: 2500 },
  { id: "2.5to5k", label: "$2,500 – $5,000", max: 5000 },
  { id: "gt5k", label: "$5,000+", max: Infinity },
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
  website: { price: [200, 625], weeks: [2, 4] },
  webapp: { price: [1250, 2500], weeks: [6, 10] },
  mobile: { price: [1750, 3000], weeks: [8, 12] },
  dashboard: { price: [625, 1500], weeks: [4, 7] },
};

const addOns: Record<FeatureId, { price: Range; weeks: Range }> = {
  auth: { price: [125, 300], weeks: [0.5, 1] },
  payments: { price: [200, 450], weeks: [1, 2] },
  ai: { price: [300, 875], weeks: [1, 3] },
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

const roundPrice = (n: number) => Math.round(n / 50) * 50;

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
      "Your budget is below this estimate. That's okay — over a few messages we can trim the first version to what matters most and plan the rest for later.";
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
