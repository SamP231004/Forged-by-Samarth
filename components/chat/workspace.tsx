"use client";

import { AnimatePresence, motion } from "framer-motion";
import { PanelRight, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChatThread } from "@/components/chat/chat-thread";
import { ProjectPanel } from "@/components/chat/project-panel";
import { byCreatedAt, type Message, type Project, type ThreadSync } from "@/lib/chat";

type Props = {
  conversationId: string;
  userId: string;
  viewer: "client" | "admin";
  peerName: string;
  initial: ThreadSync;
  /** Thread header slots. A project button is added before `trailing` on narrow screens. */
  header: { avatar?: React.ReactNode; leading?: React.ReactNode; title: React.ReactNode; subtitle?: React.ReactNode; trailing?: React.ReactNode };
  greeting?: React.ReactNode;
};

/** How often an open, visible thread checks for new and changed messages. */
const POLL_MS = 4000;
/** Re-asks for a few seconds before the cursor so writes that land out of order aren't missed. */
const POLL_OVERLAP_MS = 5000;

const latestUpdate = (messages: Message[]) => messages.reduce((max, m) => (m.updated_at > max ? m.updated_at : max), "");

/** Messages, read receipts and the project summary for one conversation, kept fresh by polling. */
function useThreadSync(conversationId: string, initial: ThreadSync) {
  const [messages, setMessages] = useState(initial.messages);
  const [peerLastReadAt, setPeerLastReadAt] = useState(initial.peerLastReadAt);
  const [project, setProject] = useState(initial.project);
  // Only advanced by polls, so a reply we just sent can't skip past messages we haven't fetched yet.
  const cursor = useRef(latestUpdate(initial.messages));

  const merge = useCallback((incoming: Message[]) => {
    if (incoming.length === 0) return;
    setMessages((prev) => {
      const byId = new Map(prev.map((m) => [m.id, m]));
      let changed = false;
      for (const m of incoming) {
        const old = byId.get(m.id);
        if (old && (m.updated_at < old.updated_at || JSON.stringify(old) === JSON.stringify(m))) continue;
        byId.set(m.id, m);
        changed = true;
      }
      return changed ? [...byId.values()].sort(byCreatedAt) : prev;
    });
  }, []);

  useEffect(() => {
    let inFlight = false;
    const poll = async () => {
      if (inFlight || document.visibilityState !== "visible") return;
      inFlight = true;
      try {
        const params = new URLSearchParams({ conversationId });
        if (cursor.current) params.set("after", new Date(new Date(cursor.current).getTime() - POLL_OVERLAP_MS).toISOString());
        const res = await fetch(`/api/chat/messages?${params}`, { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as ThreadSync;
        const newest = latestUpdate(data.messages);
        if (newest > cursor.current) cursor.current = newest;
        merge(data.messages);
        setPeerLastReadAt(data.peerLastReadAt);
        setProject((p) => (p?.updated_at === data.project?.updated_at ? p : data.project));
      } catch {
        // Offline or a blip; the next tick retries.
      } finally {
        inFlight = false;
      }
    };
    const timer = setInterval(poll, POLL_MS);
    document.addEventListener("visibilitychange", poll);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", poll);
    };
  }, [conversationId, merge]);

  return { messages, merge, peerLastReadAt, project, setProject };
}

/** The chat thread with the project panel docked beside it, or in a drawer when there isn't room. */
export function ChatWorkspace({ conversationId, userId, viewer, peerName, initial, header, greeting }: Props) {
  const { messages, merge, peerLastReadAt, project, setProject } = useThreadSync(conversationId, initial);
  const [drawer, setDrawer] = useState(false);
  const files = useMemo(() => messages.filter((m) => m.attachment_id), [messages]);

  useEffect(() => {
    if (!drawer) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawer(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawer]);

  const panel = (
    <ProjectPanel conversationId={conversationId} viewer={viewer} project={project} files={files} onSaved={(p: Project) => setProject(p)} />
  );

  const panelButton = (
    <button
      type="button"
      onClick={() => setDrawer(true)}
      className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-border px-3 text-[13px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground @4xl:hidden"
      aria-label="Show project details"
    >
      <PanelRight className="size-3.5" aria-hidden />
      <span className="hidden sm:inline">Project</span>
      {project && <span className="size-1.5 rounded-full bg-accent" aria-hidden />}
    </button>
  );

  return (
    <div className="@container relative h-full min-h-0 overflow-hidden">
      <div className="grid h-full min-h-0 grid-cols-[minmax(0,1fr)] @4xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex min-h-0 flex-col">
          <header className="flex items-center gap-3 border-b border-border px-4 py-3 sm:px-6">
            {header.leading}
            {header.avatar}
            <div className="min-w-0 flex-1">
              {header.title}
              {header.subtitle && <div className="truncate text-xs text-muted-foreground">{header.subtitle}</div>}
            </div>
            {panelButton}
            {header.trailing}
          </header>
          <div className="min-h-0 flex-1">
            <ChatThread
              conversationId={conversationId}
              userId={userId}
              viewer={viewer}
              peerName={peerName}
              messages={messages}
              peerLastReadAt={peerLastReadAt}
              onMessages={merge}
              greeting={greeting}
            />
          </div>
        </div>
        <aside className="hidden min-h-0 overflow-y-auto border-l border-border bg-background/30 @4xl:block" aria-label="Project details">
          {panel}
        </aside>
      </div>

      <AnimatePresence>
        {drawer && (
          <>
            <motion.button
              key="backdrop"
              type="button"
              aria-label="Close project details"
              className="absolute inset-0 z-30 bg-background/60 backdrop-blur-sm @4xl:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawer(false)}
            />
            <motion.aside
              key="drawer"
              aria-label="Project details"
              className="absolute inset-y-0 right-0 z-40 w-full max-w-sm overflow-y-auto border-l border-border bg-card shadow-2xl @4xl:hidden"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
            >
              <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <p className="text-sm font-medium">Project</p>
                <button
                  type="button"
                  onClick={() => setDrawer(false)}
                  className="grid size-8 place-items-center rounded-full border border-border hover:bg-muted"
                  aria-label="Close"
                >
                  <X className="size-4" />
                </button>
              </div>
              {panel}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
