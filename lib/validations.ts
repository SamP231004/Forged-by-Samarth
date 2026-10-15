import { z } from "zod";
import { budgetOptions, featureOptions, projectTypes, timelineOptions } from "./estimator";
import { CONTRACT_STATUSES, CURRENCIES, PROJECT_STATUSES } from "./chat";

export const MAX_FILE_BYTES = 8 * 1024 * 1024;
export const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/zip",
];

export const contactBudgets = [
  "Under $500",
  "$500 – $1,000",
  "$1,000 – $2,500",
  "$2,500 – $5,000",
  "$5,000+",
  "Not sure yet",
] as const;

export const contactTimelines = [
  "As soon as possible",
  "Within 1 month",
  "1–3 months",
  "3+ months",
  "Flexible",
] as const;

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please tell me your name").max(100),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  email: z.string().trim().email("That email doesn't look quite right"),
  budget: z.enum(contactBudgets, { errorMap: () => ({ message: "Pick a rough budget" }) }),
  timeline: z.enum(contactTimelines, { errorMap: () => ({ message: "Pick a timeline" }) }),
  message: z
    .string()
    .trim()
    .min(20, "A couple of sentences helps me prepare — at least 20 characters")
    .max(5000),
  // Honeypot — real people leave this empty. Checked in the route so bots
  // get a normal-looking success response instead of a validation error.
  website: z.string().max(500).optional(),
});

export type ContactValues = z.infer<typeof contactSchema>;

const ids = <T extends readonly { id: string }[]>(arr: T) =>
  arr.map((o) => o.id) as unknown as [T[number]["id"], ...T[number]["id"][]];

export const estimateInputSchema = z.object({
  projectType: z.enum(ids(projectTypes)),
  features: z.array(z.enum(ids(featureOptions))).max(3),
  timeline: z.enum(ids(timelineOptions)),
  budget: z.enum(ids(budgetOptions)),
});

export const estimateEmailSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  input: estimateInputSchema,
});

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .nullable()
  .or(z.literal("").transform(() => null));
const money = z.number().finite().min(0).max(1_000_000_000);

/** The project summary the admin saves beside a conversation. */
export const projectSchema = z
  .object({
    title: z.string().trim().min(1, "Give the project a name.").max(120),
    status: z.enum(PROJECT_STATUSES),
    start_date: isoDate,
    due_date: isoDate,
    currency: z.enum(CURRENCIES),
    total_amount: money,
    amount_paid: money,
    contract_status: z.enum(CONTRACT_STATUSES),
    contract_url: z
      .string()
      .trim()
      .max(500)
      .refine((v) => v === "" || /^https:\/\/\S+$/.test(v) || /^\/api\/chat\/attachments\/[0-9a-f]{24}$/.test(v), "Use an https:// link.")
      .transform((v) => v || null)
      .nullable(),
    contract_signed_on: isoDate,
    next_step: z.string().trim().max(300),
    milestones: z
      .array(
        z.object({
          id: z.string().min(1).max(40),
          title: z.string().trim().min(1, "Name every milestone.").max(120),
          due_date: isoDate,
          amount: money.nullable(),
          done: z.boolean(),
        }),
      )
      .max(20),
  })
  .refine((p) => p.amount_paid <= p.total_amount || p.total_amount === 0, {
    message: "Amount paid can't be more than the total.",
    path: ["amount_paid"],
  });

export type ProjectInput = z.infer<typeof projectSchema>;
