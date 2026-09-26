"use client";

import { cn } from "@/lib/utils";

/** Card with a soft radial highlight that follows the pointer. */
export function SpotlightCard({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--x", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--y", `${e.clientY - r.top}px`);
  };
  return (
    <div
      onPointerMove={onMove}
      className={cn(
        "spotlight rounded-3xl border border-border bg-card/60 transition-[border-color,transform] duration-300 hover:border-foreground/15",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
