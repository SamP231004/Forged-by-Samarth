import { Bell, Bot, FileText, Heart, Plus, Sparkles } from "lucide-react";
import type { Project } from "@/lib/projects";
import { cn } from "@/lib/utils";

/**
 * Lightweight, code-drawn cover art for each case study. Swap for real
 * screenshots with next/image once you have them.
 */
export function ProjectVisual({ project, className }: { project: Project; className?: string }) {
  return (
    <div
      className={cn(
        "relative isolate overflow-hidden rounded-2xl border border-border bg-card",
        className,
      )}
      aria-hidden
    >
      <div className={cn("absolute inset-0 -z-10 bg-gradient-to-br", project.accent)} />
      <div className="bg-dots absolute inset-0 -z-10 opacity-50 mask-radial" />
      <div className="grid h-full place-items-center p-6 transition-transform duration-700 ease-out group-hover:scale-[1.03]">
        {project.visual === "health" && <Health />}
        {project.visual === "chat" && <Chat />}
        {project.visual === "portfolio" && <Portfolio />}
        {project.visual === "future" && <Future />}
      </div>
    </div>
  );
}

function Health() {
  return (
    <div className="flex items-end gap-4">
      <div className="w-44 rounded-[1.75rem] border border-border bg-background/90 p-3 shadow-2xl sm:w-52">
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-foreground/15" />
        <p className="text-[10px] text-muted-foreground">Good morning, Priya</p>
        <p className="mt-0.5 text-sm font-semibold">Week 24</p>
        <div className="mt-3 rounded-xl bg-rose-500/10 p-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">Baby is the size of</span>
            <Heart className="size-3 text-rose-400" />
          </div>
          <p className="mt-1 text-xs font-medium">an ear of corn 🌽</p>
        </div>
        {["Blood pressure", "Weight", "Symptoms"].map((l, i) => (
          <div key={l} className="mt-2 flex items-center justify-between rounded-lg border border-border px-2.5 py-2">
            <span className="text-[10px]">{l}</span>
            <span className={cn("size-1.5 rounded-full", i === 2 ? "bg-amber-400" : "bg-emerald-400")} />
          </div>
        ))}
      </div>
      <div className="mb-6 hidden w-40 rounded-2xl border border-border bg-background/90 p-3 shadow-xl sm:block">
        <div className="flex items-center gap-2 text-[10px] font-medium">
          <Bell className="size-3 text-rose-400" /> Reminder
        </div>
        <p className="mt-1.5 text-[10px] leading-snug text-muted-foreground">Glucose test tomorrow at 10:30 with Dr. Mehta</p>
      </div>
    </div>
  );
}

function Chat() {
  return (
    <div className="w-full max-w-xs space-y-2.5">
      <div className="ml-auto w-fit max-w-[80%] rounded-2xl rounded-br-md bg-foreground px-3.5 py-2 text-[11px] text-background shadow-lg">
        What&apos;s our refund policy for annual plans?
      </div>
      <div className="flex gap-2">
        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-violet-500/20 text-violet-400">
          <Bot className="size-3.5" />
        </span>
        <div className="rounded-2xl rounded-tl-md border border-border bg-background/90 px-3.5 py-2.5 text-[11px] leading-relaxed shadow-lg">
          Annual plans can be refunded in full within 30 days, then pro-rated for unused months.
          <div className="mt-2 flex flex-wrap gap-1.5">
            {["billing-policy.pdf", "FAQ §4"].map((c) => (
              <span key={c} className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground">
                <FileText className="size-2.5" /> {c}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-2 text-[10px] text-muted-foreground">
        <Sparkles className="size-3 text-violet-400" /> Ask anything about your docs…
      </div>
    </div>
  );
}

function Portfolio() {
  return (
    <div className="w-full max-w-sm overflow-hidden rounded-xl border border-border bg-background/90 shadow-2xl">
      <div className="flex gap-1.5 border-b border-border px-3 py-2">
        {[0, 1, 2].map((i) => (
          <span key={i} className="size-1.5 rounded-full bg-foreground/20" />
        ))}
      </div>
      <div className="flex flex-col items-center gap-2 px-6 py-7">
        <span className="h-2 w-16 rounded-full bg-emerald-400/40" />
        <span className="h-3.5 w-48 rounded bg-foreground/80" />
        <span className="h-3.5 w-36 rounded bg-gradient-to-r from-sky-400 to-cyan-300" />
        <span className="mt-1 h-1.5 w-40 rounded bg-foreground/15" />
        <div className="mt-3 flex gap-2">
          <span className="h-5 w-16 rounded-full bg-foreground" />
          <span className="h-5 w-16 rounded-full border border-border" />
        </div>
        <div className="mt-4 grid w-full grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-10 rounded-lg border border-border bg-muted/60" />
          ))}
        </div>
      </div>
    </div>
  );
}

function Future() {
  return (
    <div className="grid size-40 place-items-center rounded-3xl border-2 border-dashed border-foreground/20">
      <span className="grid size-14 place-items-center rounded-full bg-foreground text-background shadow-xl transition-transform duration-500 group-hover:rotate-90">
        <Plus className="size-6" />
      </span>
    </div>
  );
}
