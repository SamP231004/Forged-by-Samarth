"use client";

import { ArrowLeft, Inbox as InboxIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ChatThread } from "@/components/chat/chat-thread";
import { SignOutButton } from "@/components/chat/sign-out-button";
import { displayName, type Conversation, type Message } from "@/lib/chat";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Props = {
  adminId: string;
  adminEmail: string;
  initialConversations: Conversation[];
  selectedId: string | null;
  initialMessages: Message[];
};

const relFmt = new Intl.RelativeTimeFormat(undefined, { numeric: "auto", style: "short" });

function ago(iso: string) {
  const s = (new Date(iso).getTime() - Date.now()) / 1000;
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [unit, secs] of units) if (Math.abs(s) >= secs) return relFmt.format(Math.round(s / secs), unit);
  return "now";
}

export function Inbox({ adminId, adminEmail, initialConversations, selectedId, initialMessages }: Props) {
  const [conversations, setConversations] = useState(initialConversations);

  // Keep the list fresh as clients write in and read receipts change.
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("inbox")
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, (payload) => {
        const row = payload.new as Conversation;
        if (!row?.id) return;
        setConversations((prev) =>
          [row, ...prev.filter((c) => c.id !== row.id)].sort((a, b) => b.last_message_at.localeCompare(a.last_message_at)),
        );
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  const selected = conversations.find((c) => c.id === selectedId);
  const unread = (c: Conversation) =>
    c.last_sender_id !== null && c.last_sender_id !== adminId && c.last_message_at > c.admin_last_read_at;

  return (
    <section className="container-page pb-8 pt-24 sm:pt-28">
      <div className="grid h-[calc(100dvh-8rem)] overflow-hidden rounded-3xl border border-border bg-card/60 shadow-[0_30px_80px_-40px_rgb(0_0_0/0.4)] backdrop-blur-xl sm:h-[calc(100dvh-10rem)] md:grid-cols-[20rem_1fr]">
        {/* Conversation list */}
        <aside className={cn("flex min-h-0 flex-col border-border md:border-r", selected && "hidden md:flex")}>
          <header className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
            <h1 className="flex items-center gap-2 text-sm font-medium">
              <InboxIcon className="size-4" aria-hidden /> Inbox
              <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                {conversations.filter(unread).length} unread
              </span>
            </h1>
            <SignOutButton email={adminEmail} />
          </header>
          {conversations.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">No conversations yet. They&apos;ll appear here as soon as a client writes in.</p>
          ) : (
            <ul className="min-h-0 flex-1 overflow-y-auto p-2">
              {conversations.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/inbox?c=${c.id}`}
                    aria-current={c.id === selectedId ? "page" : undefined}
                    className={cn(
                      "flex gap-3 rounded-2xl p-3 transition-colors hover:bg-muted",
                      c.id === selectedId && "bg-muted",
                    )}
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-full border border-border bg-background text-xs font-semibold uppercase">
                      {displayName(c).slice(0, 2)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className={cn("truncate text-sm", unread(c) ? "font-semibold" : "font-medium")}>{displayName(c)}</span>
                        <span className="shrink-0 text-[11px] text-muted-foreground">{ago(c.last_message_at)}</span>
                      </span>
                      <span className="flex items-center gap-2">
                        <span className={cn("truncate text-[13px]", unread(c) ? "text-foreground" : "text-muted-foreground")}>
                          {c.last_sender_id === adminId && "You: "}
                          {c.last_message_preview ?? "No messages yet"}
                        </span>
                        {unread(c) && <span className="size-2 shrink-0 rounded-full bg-accent" aria-label="Unread" />}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </aside>

        {/* Thread */}
        <div className={cn("flex min-h-0 flex-col", !selected && "hidden md:flex")}>
          {selected ? (
            <>
              <header className="flex items-center gap-3 border-b border-border px-4 py-3 sm:px-6">
                <Link href="/inbox" className="grid size-9 place-items-center rounded-full border border-border md:hidden" aria-label="Back to inbox">
                  <ArrowLeft className="size-4" />
                </Link>
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-medium">{displayName(selected)}</h2>
                  <a href={`mailto:${selected.client_email}`} className="block truncate text-xs text-muted-foreground hover:text-foreground">
                    {selected.client_email}
                  </a>
                </div>
              </header>
              <div className="min-h-0 flex-1">
                <ChatThread key={selected.id} conversationId={selected.id} userId={adminId} viewer="admin" initialMessages={initialMessages} />
              </div>
            </>
          ) : (
            <div className="grid flex-1 place-items-center p-6 text-center text-sm text-muted-foreground">
              Select a conversation to reply.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
