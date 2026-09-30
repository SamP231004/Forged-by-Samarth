import Image from "next/image";
import { Bell, Heart, Plus } from "lucide-react";
import type { Project } from "@/lib/projects";
import { cn } from "@/lib/utils";

/**
 * Cover art for each case study: a real screenshot when the project has
 * one, otherwise lightweight code-drawn art.
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
      {project.screenshot ? (
        <Screenshot shot={project.screenshot} />
      ) : (
        <div className="grid h-full place-items-center p-6 transition-transform duration-700 ease-out group-hover:scale-[1.03]">
          {project.visual === "health" && <Health />}
          {project.visual === "future" && <Future />}
        </div>
      )}
    </div>
  );
}

/** Edge-to-edge screenshot that slides up to reveal more on hover. */
function Screenshot({ shot }: { shot: NonNullable<Project["screenshot"]> }) {
  return (
    <div className="absolute inset-x-0 top-0 -bottom-10 transition-transform duration-700 ease-out group-hover:-translate-y-10">
      <Image
        src={shot.src}
        alt={shot.alt}
        fill
        unoptimized
        className={cn("object-cover", shot.frame === "phone" ? "object-top" : "object-top-left")}
      />
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

function Future() {
  return (
    <div className="grid size-40 place-items-center rounded-3xl border-2 border-dashed border-foreground/20">
      <span className="grid size-14 place-items-center rounded-full bg-foreground text-background shadow-xl transition-transform duration-500 group-hover:rotate-90">
        <Plus className="size-6" />
      </span>
    </div>
  );
}
