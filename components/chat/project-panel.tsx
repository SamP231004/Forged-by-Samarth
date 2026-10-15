"use client";

import {
  ArrowUpRight,
  CalendarClock,
  Check,
  FileText,
  FolderOpen,
  ImageIcon,
  Loader2,
  Pencil,
  Plus,
  ScrollText,
  Sparkles,
  Trash2,
  Wallet,
} from "lucide-react";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { fieldClass } from "@/components/ui/input";
import {
  CONTRACT_STATUSES,
  contractStatusLabel,
  CURRENCIES,
  fileSize,
  PROJECT_STATUSES,
  projectStatusLabel,
  type Message,
  type Milestone,
  type Project,
  type ProjectStatus,
} from "@/lib/chat";
import { cn } from "@/lib/utils";

type Props = {
  conversationId: string;
  viewer: "client" | "admin";
  project: Project | null;
  /** Messages with attachments, oldest first. */
  files: Message[];
  onSaved: (project: Project) => void;
};

// A fixed locale and UTC keep server and browser output identical (dates here are calendar days, not instants).
const dateFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
const shortDateFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
const DAY = 86_400_000;

const utcDay = (ymd: string) => {
  const [y, m, d] = ymd.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
};
const todayUtc = () => {
  const n = new Date();
  return Date.UTC(n.getFullYear(), n.getMonth(), n.getDate());
};
const fmtDate = (ymd: string | null, short = false) => (ymd ? (short ? shortDateFmt : dateFmt).format(utcDay(ymd)) : "");

function money(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: amount % 1 ? 2 : 0,
  }).format(amount);
}

const statusTone: Record<ProjectStatus, string> = {
  discovery: "border-accent-2/30 bg-accent-2/10 text-accent-2",
  proposal: "border-accent-2/30 bg-accent-2/10 text-accent-2",
  in_progress: "border-accent/30 bg-accent/10 text-accent",
  review: "border-accent/30 bg-accent/10 text-accent",
  completed: "border-success/30 bg-success/10 text-success",
  on_hold: "border-border bg-muted text-muted-foreground",
};

const eyebrow = "font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground";
const card = "rounded-3xl border border-border bg-card/80 p-5";

export function ProjectPanel({ conversationId, viewer, project, files, onSaved }: Props) {
  const [editing, setEditing] = useState(false);

  if (editing && viewer === "admin") {
    return (
      <ProjectEditor
        conversationId={conversationId}
        project={project}
        files={files}
        onCancel={() => setEditing(false)}
        onSaved={(p) => {
          onSaved(p);
          setEditing(false);
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between px-1 pt-1">
        <p className={eyebrow}>Project overview</p>
        {viewer === "admin" && project && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex h-7 items-center gap-1.5 rounded-full border border-border px-2.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Pencil className="size-3" aria-hidden /> Edit
          </button>
        )}
      </div>

      {project ? (
        <>
          <Overview project={project} />
          {project.next_step && (
            <section className="relative overflow-hidden rounded-3xl border border-accent/25 bg-accent/[0.06] p-4">
              <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-accent">
                <Sparkles className="size-3" aria-hidden /> Up next
              </p>
              <p className="mt-1.5 text-sm leading-relaxed">{project.next_step}</p>
            </section>
          )}
          <Payments project={project} />
          {project.milestones.length > 0 && <Milestones project={project} />}
          <Contract project={project} />
        </>
      ) : (
        <EmptyState viewer={viewer} onSetup={() => setEditing(true)} />
      )}

      <SharedFiles files={files} />
    </div>
  );
}

/* ---------- Overview: status, countdown and timeline ---------- */

function Overview({ project }: { project: Project }) {
  const today = todayUtc();
  const due = project.due_date ? utcDay(project.due_date) : null;
  const start = project.start_date ? utcDay(project.start_date) : null;
  const daysLeft = due != null ? Math.round((due - today) / DAY) : null;
  const done = project.status === "completed";
  const elapsed = done ? 1 : start != null && due != null && due > start ? Math.min(1, Math.max(0, (today - start) / (due - start))) : null;

  return (
    <section className="relative isolate overflow-hidden rounded-3xl border border-border bg-card p-5">
      <div aria-hidden className="pointer-events-none absolute -right-20 -top-24 -z-10 size-60 rounded-full bg-accent/25 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-28 -left-12 -z-10 size-52 rounded-full bg-accent-2/20 blur-3xl" />
      <div aria-hidden className="bg-grain pointer-events-none absolute inset-0 -z-10 opacity-[0.05] mix-blend-overlay" />

      <div className="flex items-center justify-between gap-2">
        <StatusPill status={project.status} />
        <span className={eyebrow} suppressHydrationWarning>
          Updated {shortDateFmt.format(new Date(project.updated_at))}
        </span>
      </div>
      <h3 className="mt-3 text-lg font-semibold leading-snug tracking-tight">{project.title}</h3>

      <div className="mt-5 flex items-end gap-3" suppressHydrationWarning>
        {done ? (
          <>
            <span className="grid size-14 place-items-center rounded-2xl bg-success/15 text-success">
              <Check className="size-7" aria-hidden />
            </span>
            <span className="pb-1 text-sm leading-tight text-muted-foreground">
              <span className="block font-medium text-foreground">Delivered</span>
              Thanks for building with me
            </span>
          </>
        ) : daysLeft == null ? (
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarClock className="size-4" aria-hidden /> Timeline to be confirmed
          </span>
        ) : (
          <>
            <span className={cn("font-serif text-6xl leading-[0.85] tracking-tight", daysLeft < 0 && "text-destructive")}>
              {daysLeft === 0 ? "Today" : Math.abs(daysLeft)}
            </span>
            <span className="pb-0.5 text-sm leading-tight text-muted-foreground">
              {daysLeft !== 0 && (
                <span className="block font-medium text-foreground">
                  {Math.abs(daysLeft) === 1 ? "day" : "days"} {daysLeft > 0 ? "to go" : "past target"}
                </span>
              )}
              {daysLeft === 0 ? "is the target date" : `Target ${fmtDate(project.due_date, true)}`}
            </span>
          </>
        )}
      </div>

      {elapsed != null && (
        <div className="mt-5" suppressHydrationWarning>
          <div className="relative h-1.5 rounded-full bg-muted">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-accent to-accent-2 transition-[width] duration-700"
              style={{ width: `${elapsed * 100}%` }}
            />
            {!done && (
              <span
                className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card bg-foreground shadow"
                style={{ left: `${elapsed * 100}%` }}
                aria-hidden
              />
            )}
          </div>
          <div className={cn("mt-2 flex justify-between gap-2", eyebrow)}>
            <span>{fmtDate(project.start_date, true)}</span>
            <span>{Math.round(elapsed * 100)}% of timeline</span>
            <span>{fmtDate(project.due_date, true)}</span>
          </div>
        </div>
      )}
    </section>
  );
}

function StatusPill({ status }: { status: ProjectStatus }) {
  const live = status === "in_progress" || status === "review";
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium", statusTone[status])}>
      <span className="relative flex size-1.5">
        {live && <span className="absolute inset-0 animate-pulse-soft rounded-full bg-current" />}
        <span className="relative size-1.5 rounded-full bg-current" />
      </span>
      {projectStatusLabel[status]}
    </span>
  );
}

/* ---------- Payments ---------- */

function Payments({ project }: { project: Project }) {
  const { total_amount: total, amount_paid: paid, currency } = project;
  const pct = total > 0 ? Math.min(1, paid / total) : 0;
  const gradient = `pay-${useId().replace(/[^a-zA-Z0-9-]/g, "")}`;
  const r = 42;
  const circumference = 2 * Math.PI * r;

  return (
    <section className={card}>
      <div className="flex items-center justify-between">
        <p className={cn(eyebrow, "flex items-center gap-1.5")}>
          <Wallet className="size-3" aria-hidden /> Payments
        </p>
        <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">{currency}</span>
      </div>

      {total > 0 ? (
        <div className="mt-4 flex items-center gap-5">
          <div className="relative size-24 shrink-0">
            <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden>
              <defs>
                <linearGradient id={gradient} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="var(--accent)" />
                  <stop offset="100%" stopColor="var(--accent-2)" />
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r={r} fill="none" stroke="var(--muted)" strokeWidth="9" />
              {pct > 0 && (
                <circle
                  cx="50"
                  cy="50"
                  r={r}
                  fill="none"
                  stroke={`url(#${gradient})`}
                  strokeWidth="9"
                  strokeLinecap="round"
                  strokeDasharray={`${circumference * pct} ${circumference}`}
                  className="transition-[stroke-dasharray] duration-700"
                />
              )}
            </svg>
            <div className="absolute inset-0 grid place-content-center text-center">
              <span className="font-serif text-3xl leading-none">{Math.round(pct * 100)}%</span>
              <span className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">paid</span>
            </div>
          </div>

          <dl className="grid min-w-0 flex-1 gap-2 text-sm">
            <div className="flex items-center justify-between gap-2">
              <dt className="flex items-center gap-2 text-muted-foreground">
                <span className="size-2 rounded-full bg-gradient-to-br from-accent to-accent-2" /> Paid
              </dt>
              <dd className="font-medium tabular-nums">{money(paid, currency)}</dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="flex items-center gap-2 text-muted-foreground">
                <span className="size-2 rounded-full bg-muted-foreground/30" /> Remaining
              </dt>
              <dd className="font-medium tabular-nums">{money(Math.max(0, total - paid), currency)}</dd>
            </div>
            <div className="mt-1 flex items-center justify-between gap-2 border-t border-border pt-2.5">
              <dt className="text-muted-foreground">Total</dt>
              <dd className="font-serif text-xl leading-none tabular-nums">{money(total, currency)}</dd>
            </div>
          </dl>
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">The quote will show here once it&apos;s agreed.</p>
      )}
    </section>
  );
}

/* ---------- Milestones ---------- */

function Milestones({ project }: { project: Project }) {
  const { milestones, currency } = project;
  const done = milestones.filter((m) => m.done).length;
  const current = milestones.findIndex((m) => !m.done);

  return (
    <section className={card}>
      <div className="flex items-center justify-between">
        <p className={eyebrow}>Milestones</p>
        <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
          {done}/{milestones.length}
        </span>
      </div>
      <div className="mt-3 flex gap-1" aria-hidden>
        {milestones.map((m, i) => (
          <span
            key={m.id}
            className={cn(
              "h-1 flex-1 rounded-full",
              m.done ? "bg-gradient-to-r from-accent to-accent-2" : i === current ? "bg-accent/30" : "bg-muted",
            )}
          />
        ))}
      </div>

      <ol className="mt-4">
        {milestones.map((m, i) => {
          const isCurrent = i === current;
          return (
            <li key={m.id} className="relative flex gap-3 pb-4 last:pb-0">
              {i < milestones.length - 1 && (
                <span className={cn("absolute bottom-0 left-[11px] top-6 w-px", m.done ? "bg-accent/40" : "bg-border")} aria-hidden />
              )}
              <span
                className={cn(
                  "relative grid size-6 shrink-0 place-items-center rounded-full border",
                  m.done
                    ? "border-transparent bg-gradient-to-br from-accent to-accent-2 text-white"
                    : isCurrent
                      ? "border-accent bg-card"
                      : "border-border bg-card",
                )}
              >
                {m.done ? (
                  <Check className="size-3.5" strokeWidth={3} aria-hidden />
                ) : isCurrent ? (
                  <span className="size-2 animate-pulse-soft rounded-full bg-accent" />
                ) : (
                  <span className="size-1.5 rounded-full bg-muted-foreground/40" />
                )}
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex items-baseline justify-between gap-2">
                  <p className={cn("text-sm font-medium leading-snug", m.done && "text-muted-foreground")}>{m.title}</p>
                  {m.amount != null && m.amount > 0 && (
                    <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">{money(m.amount, currency)}</span>
                  )}
                </div>
                <p className={cn("mt-0.5 text-xs", isCurrent ? "text-accent" : "text-muted-foreground")}>
                  {m.done ? "Done" : isCurrent ? "In progress" : "Upcoming"}
                  {m.due_date && ` · ${fmtDate(m.due_date, true)}`}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/* ---------- Contract ---------- */

function Contract({ project }: { project: Project }) {
  const signed = project.contract_status === "signed";
  return (
    <section className={cn(card, "flex items-center gap-3 p-4")}>
      <span className={cn("relative grid size-11 shrink-0 place-items-center rounded-2xl", signed ? "bg-success/12 text-success" : "bg-muted text-muted-foreground")}>
        <ScrollText className="size-5" aria-hidden />
        {signed && (
          <span className="absolute -bottom-0.5 -right-0.5 grid size-4 place-items-center rounded-full border-2 border-card bg-success text-white">
            <Check className="size-2.5" strokeWidth={4} aria-hidden />
          </span>
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">Contract</p>
        <p className="truncate text-xs text-muted-foreground">
          {contractStatusLabel[project.contract_status]}
          {signed && project.contract_signed_on && ` · ${fmtDate(project.contract_signed_on)}`}
        </p>
      </div>
      {project.contract_url && (
        <a
          href={project.contract_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-8 shrink-0 items-center gap-1 rounded-full border border-border px-3 text-xs font-medium transition-colors hover:bg-muted"
        >
          View <ArrowUpRight className="size-3" aria-hidden />
        </a>
      )}
    </section>
  );
}

/* ---------- Shared files ---------- */

function SharedFiles({ files }: { files: Message[] }) {
  const recent = files.slice(-5).reverse();
  return (
    <section className={card}>
      <div className="flex items-center justify-between">
        <p className={cn(eyebrow, "flex items-center gap-1.5")}>
          <FolderOpen className="size-3" aria-hidden /> Shared files
        </p>
        {files.length > 0 && <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{files.length}</span>}
      </div>
      {recent.length === 0 ? (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Briefs, designs and documents you share in the chat collect here.</p>
      ) : (
        <ul className="-mx-2 mt-2">
          {recent.map((m) => {
            const Icon = m.attachment_type?.startsWith("image/") ? ImageIcon : FileText;
            return (
              <li key={m.id}>
                <a
                  href={`/api/chat/attachments/${m.attachment_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-2xl p-2 transition-colors hover:bg-muted"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm">{m.attachment_name}</span>
                    <span className="block text-[11px] text-muted-foreground" suppressHydrationWarning>
                      {m.attachment_size != null && `${fileSize(m.attachment_size)} · `}
                      {new Date(m.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </span>
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      )}
      {files.length > recent.length && (
        <p className="mt-2 text-xs text-muted-foreground">+{files.length - recent.length} more earlier in the conversation</p>
      )}
    </section>
  );
}

/* ---------- Empty state ---------- */

function EmptyState({ viewer, onSetup }: { viewer: "client" | "admin"; onSetup: () => void }) {
  return (
    <section className="relative isolate overflow-hidden rounded-3xl border border-border bg-card p-5">
      <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 -z-10 size-56 rounded-full bg-accent/20 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-10 -z-10 size-48 rounded-full bg-accent-2/15 blur-3xl" />

      {/* A ghosted preview of what's coming */}
      <div aria-hidden className="mask-fade-b select-none opacity-60">
        <div className="flex items-center gap-4">
          <div className="relative size-16 shrink-0 rounded-full border-[6px] border-muted">
            <div className="absolute -inset-[6px] rounded-full border-[6px] border-transparent border-r-accent/60 border-t-accent/60" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="h-2 w-3/4 rounded-full bg-muted" />
            <div className="h-2 w-1/2 rounded-full bg-muted" />
            <div className="h-2 w-2/3 rounded-full bg-muted" />
          </div>
        </div>
        <div className="mt-4 h-1.5 rounded-full bg-muted">
          <div className="h-full w-2/5 rounded-full bg-gradient-to-r from-accent/60 to-accent-2/60" />
        </div>
      </div>

      <h3 className="mt-2 font-serif text-2xl leading-tight">Your project space</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {viewer === "client"
          ? "Once we agree on scope, your timeline, milestones, payments and contract live here, always up to date."
          : "Add the timeline, quote, milestones and contract. The client sees this panel next to the chat."}
      </p>
      {viewer === "admin" && (
        <Button size="sm" className="mt-4" onClick={onSetup}>
          <Plus /> Set up project
        </Button>
      )}
    </section>
  );
}

/* ---------- Admin editor ---------- */

type Draft = Omit<Project, "updated_at" | "total_amount" | "amount_paid" | "milestones" | "contract_url"> & {
  total_amount: string;
  amount_paid: string;
  contract_url: string;
  milestones: (Omit<Milestone, "amount"> & { amount: string })[];
};

const newId = () => Math.random().toString(36).slice(2, 10);

function toDraft(p: Project | null): Draft {
  return {
    title: p?.title ?? "",
    status: p?.status ?? "discovery",
    start_date: p?.start_date ?? null,
    due_date: p?.due_date ?? null,
    currency: p?.currency ?? "USD",
    total_amount: p ? String(p.total_amount) : "",
    amount_paid: p ? String(p.amount_paid) : "",
    contract_status: p?.contract_status ?? "none",
    contract_url: p?.contract_url ?? "",
    contract_signed_on: p?.contract_signed_on ?? null,
    next_step: p?.next_step ?? "",
    milestones: (p?.milestones ?? []).map((m) => ({ ...m, amount: m.amount == null ? "" : String(m.amount) })),
  };
}

const field = cn(fieldClass, "h-10 px-3 text-sm");
const label = "mb-1.5 block text-xs font-medium text-muted-foreground";

function ProjectEditor({
  conversationId,
  project,
  files,
  onCancel,
  onSaved,
}: {
  conversationId: string;
  project: Project | null;
  files: Message[];
  onCancel: () => void;
  onSaved: (project: Project) => void;
}) {
  const [draft, setDraft] = useState(() => toDraft(project));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }));
  const setMilestone = (id: string, patch: Partial<Draft["milestones"][number]>) =>
    setDraft((d) => ({ ...d, milestones: d.milestones.map((m) => (m.id === id ? { ...m, ...patch } : m)) }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/chat/project", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          project: {
            ...draft,
            total_amount: Number(draft.total_amount) || 0,
            amount_paid: Number(draft.amount_paid) || 0,
            milestones: draft.milestones.map((m) => ({ ...m, amount: m.amount.trim() === "" ? null : Number(m.amount) || 0 })),
          },
        }),
      });
      const data = (await res.json().catch(() => null)) as { project?: Project; error?: string } | null;
      if (!res.ok || !data?.project) throw new Error(data?.error ?? "Couldn't save. Please try again.");
      onSaved(data.project);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const attachmentOptions = files.slice().reverse();

  return (
    <form onSubmit={save} className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between px-1 pt-1">
        <p className={eyebrow}>{project ? "Edit project" : "Set up project"}</p>
        <span className="text-[11px] text-muted-foreground">Visible to the client</span>
      </div>

      <fieldset className={cn(card, "grid gap-3")}>
        <div>
          <label className={label} htmlFor="p-title">Project name</label>
          <input id="p-title" className={field} value={draft.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Clinic booking web app" required maxLength={120} />
        </div>
        <div>
          <label className={label} htmlFor="p-status">Status</label>
          <select id="p-status" className={field} value={draft.status} onChange={(e) => set("status", e.target.value as ProjectStatus)}>
            {PROJECT_STATUSES.map((s) => (
              <option key={s} value={s}>{projectStatusLabel[s]}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={label} htmlFor="p-start">Start</label>
            <input id="p-start" type="date" className={field} value={draft.start_date ?? ""} onChange={(e) => set("start_date", e.target.value || null)} />
          </div>
          <div>
            <label className={label} htmlFor="p-due">Target date</label>
            <input id="p-due" type="date" className={field} value={draft.due_date ?? ""} onChange={(e) => set("due_date", e.target.value || null)} />
          </div>
        </div>
        <div>
          <label className={label} htmlFor="p-next">Up next</label>
          <textarea
            id="p-next"
            className={cn(fieldClass, "min-h-16 resize-y px-3 py-2 text-sm leading-relaxed")}
            value={draft.next_step}
            onChange={(e) => set("next_step", e.target.value)}
            placeholder="e.g. Share the homepage design for feedback by Friday"
            maxLength={300}
          />
        </div>
      </fieldset>

      <fieldset className={cn(card, "grid gap-3")}>
        <legend className={cn(eyebrow, "float-left mb-1")}>Payments</legend>
        <div className="grid grid-cols-[5.5rem_1fr_1fr] gap-2">
          <div>
            <label className={label} htmlFor="p-cur">Currency</label>
            <select id="p-cur" className={field} value={draft.currency} onChange={(e) => set("currency", e.target.value as Draft["currency"])}>
              {CURRENCIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={label} htmlFor="p-total">Total</label>
            <input id="p-total" type="number" min="0" step="any" inputMode="decimal" className={field} value={draft.total_amount} onChange={(e) => set("total_amount", e.target.value)} placeholder="0" />
          </div>
          <div>
            <label className={label} htmlFor="p-paid">Paid</label>
            <input id="p-paid" type="number" min="0" step="any" inputMode="decimal" className={field} value={draft.amount_paid} onChange={(e) => set("amount_paid", e.target.value)} placeholder="0" />
          </div>
        </div>
      </fieldset>

      <fieldset className={cn(card, "grid gap-3")}>
        <legend className={cn(eyebrow, "float-left mb-1")}>Contract</legend>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={label} htmlFor="p-cstatus">Status</label>
            <select id="p-cstatus" className={field} value={draft.contract_status} onChange={(e) => set("contract_status", e.target.value as Draft["contract_status"])}>
              {CONTRACT_STATUSES.map((s) => (
                <option key={s} value={s}>{contractStatusLabel[s]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={label} htmlFor="p-signed">Signed on</label>
            <input id="p-signed" type="date" className={field} value={draft.contract_signed_on ?? ""} onChange={(e) => set("contract_signed_on", e.target.value || null)} />
          </div>
        </div>
        <div>
          <label className={label} htmlFor="p-curl">Contract link</label>
          <input id="p-curl" className={field} value={draft.contract_url} onChange={(e) => set("contract_url", e.target.value)} placeholder="https://… or pick a shared file" />
          {attachmentOptions.length > 0 && (
            <select
              aria-label="Use a file shared in the chat"
              className={cn(field, "mt-2 text-muted-foreground")}
              value=""
              onChange={(e) => e.target.value && set("contract_url", e.target.value)}
            >
              <option value="">Use a file shared in the chat…</option>
              {attachmentOptions.map((m) => (
                <option key={m.id} value={`/api/chat/attachments/${m.attachment_id}`}>{m.attachment_name}</option>
              ))}
            </select>
          )}
        </div>
      </fieldset>

      <fieldset className={cn(card, "grid gap-2")}>
        <legend className={cn(eyebrow, "float-left mb-1")}>Milestones</legend>
        {draft.milestones.map((m, i) => (
          <div key={m.id} className="grid gap-2 rounded-2xl border border-border bg-background/40 p-2.5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMilestone(m.id, { done: !m.done })}
                aria-pressed={m.done}
                aria-label={m.done ? "Mark as not done" : "Mark as done"}
                className={cn(
                  "grid size-6 shrink-0 place-items-center rounded-full border transition-colors",
                  m.done ? "border-transparent bg-gradient-to-br from-accent to-accent-2 text-white" : "border-border hover:border-accent",
                )}
              >
                {m.done && <Check className="size-3.5" strokeWidth={3} />}
              </button>
              <input
                aria-label={`Milestone ${i + 1}`}
                className={cn(field, "h-9")}
                value={m.title}
                onChange={(e) => setMilestone(m.id, { title: e.target.value })}
                placeholder="e.g. Design approved"
                required
                maxLength={120}
              />
              <button
                type="button"
                onClick={() => setDraft((d) => ({ ...d, milestones: d.milestones.filter((x) => x.id !== m.id) }))}
                className="grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-destructive"
                aria-label="Remove milestone"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 pl-8">
              <input aria-label="Due date" type="date" className={cn(field, "h-9")} value={m.due_date ?? ""} onChange={(e) => setMilestone(m.id, { due_date: e.target.value || null })} />
              <input aria-label="Amount" type="number" min="0" step="any" inputMode="decimal" className={cn(field, "h-9")} value={m.amount} onChange={(e) => setMilestone(m.id, { amount: e.target.value })} placeholder="Amount" />
            </div>
          </div>
        ))}
        {draft.milestones.length < 20 && (
          <button
            type="button"
            onClick={() => setDraft((d) => ({ ...d, milestones: [...d.milestones, { id: newId(), title: "", due_date: null, amount: "", done: false }] }))}
            className="flex h-10 items-center justify-center gap-1.5 rounded-2xl border border-dashed border-border text-sm text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground"
          >
            <Plus className="size-4" aria-hidden /> Add milestone
          </button>
        )}
      </fieldset>

      {error && (
        <p role="alert" className="px-1 text-[13px] text-destructive">
          {error}
        </p>
      )}
      <div className="sticky bottom-0 -mx-4 flex gap-2 border-t border-border bg-card/95 px-4 py-3 backdrop-blur">
        <Button type="button" variant="outline" size="sm" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="sm" className="flex-1" disabled={saving}>
          {saving ? <Loader2 className="animate-spin" /> : <Check />} Save
        </Button>
      </div>
    </form>
  );
}
