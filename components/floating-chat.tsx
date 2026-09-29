"use client";

import { AnimatePresence, m } from "framer-motion";
import { Mail, MessageCircle, MessagesSquare, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { links, site } from "@/lib/site";
import { TelegramIcon, WhatsappIcon } from "@/components/ui/brand-icons";

const channels = [
  {
    label: "Chat on this site",
    hint: "Sign in with email · history saved",
    href: "/chat",
    Icon: MessagesSquare,
    tint: "bg-foreground/10 text-foreground",
  },
  {
    label: "WhatsApp",
    hint: "Quick questions",
    href: links.whatsapp(),
    Icon: WhatsappIcon,
    tint: "bg-[#25D366]/15 text-[#25D366]",
  },
  {
    label: "Email",
    hint: site.email,
    href: links.email(),
    Icon: Mail,
    tint: "bg-accent/15 text-accent",
  },
  {
    label: "Telegram",
    hint: `@${site.telegram}`,
    href: links.telegram,
    Icon: TelegramIcon,
    tint: "bg-[#26A5E4]/15 text-[#26A5E4]",
  },
];

export function FloatingChat() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // The chat pages are the conversation already.
  if (["/chat", "/inbox", "/login"].some((p) => pathname.startsWith(p))) return null;

  return (
    <div ref={ref} className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {open && (
          <m.div
            id="chat-panel"
            role="dialog"
            aria-label="Contact options"
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            style={{ transformOrigin: "bottom right" }}
            className="glass w-[min(20rem,calc(100vw-2.5rem))] rounded-3xl border border-border p-2 shadow-2xl shadow-black/20"
          >
            <div className="flex items-center gap-3 px-3 pb-3 pt-2">
              <span className="relative grid size-10 place-items-center rounded-full bg-foreground text-xs font-semibold text-background">
                SP
                <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-background bg-success" />
              </span>
              <div>
                <p className="text-sm font-medium">Message Samarth</p>
                <p className="text-xs text-muted-foreground">No calls — I reply personally, usually within a day.</p>
              </div>
            </div>
            <ul className="space-y-1">
              {channels.map(({ label, hint, href, Icon, tint }) => (
                <li key={label}>
                  <a
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 rounded-2xl p-3 transition-colors hover:bg-muted"
                  >
                    <span className={`grid size-10 place-items-center rounded-xl ${tint}`}>
                      <Icon className="size-[18px]" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium">{label}</span>
                      <span className="block truncate text-xs text-muted-foreground">{hint}</span>
                    </span>
                    <span className="text-muted-foreground transition-transform group-hover:translate-x-0.5">→</span>
                  </a>
                </li>
              ))}
            </ul>
          </m.div>
        )}
      </AnimatePresence>

      <m.button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="chat-panel"
        aria-label={open ? "Close contact options" : "Open contact options"}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        className="relative grid size-14 place-items-center rounded-full bg-foreground text-background shadow-[0_12px_40px_-8px_var(--accent)]"
      >
        {!open && <span className="absolute inset-0 rounded-full ring-1 ring-foreground/30 animate-ping [animation-duration:3s]" aria-hidden />}
        <AnimatePresence mode="wait" initial={false}>
          <m.span
            key={open ? "x" : "chat"}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {open ? <X className="size-5" /> : <MessageCircle className="size-5" />}
          </m.span>
        </AnimatePresence>
      </m.button>
    </div>
  );
}
