"use client";

import { ArrowUp, FileText, Loader2, Paperclip, X } from "lucide-react";
import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { byCreatedAt, MAX_ATTACHMENT_BYTES, MAX_MESSAGE_LENGTH, type Message } from "@/lib/chat";
import { cn } from "@/lib/utils";
import { ACCEPTED_FILE_TYPES } from "@/lib/validations";

type Props = {
  conversationId: string;
  userId: string;
  viewer: "client" | "admin";
  initialMessages: Message[];
  /** Shown before the first message (client view only). */
  greeting?: React.ReactNode;
};

const dayFmt = new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" });
const timeFmt = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" });

/** How often an open, visible thread checks for new messages. */
const POLL_MS = 4000;

export function ChatThread({ conversationId, userId, viewer, initialMessages, greeting }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const scroller = useRef<HTMLDivElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const latest = useRef(initialMessages.at(-1)?.created_at);

  const addMessages = useCallback((incoming: Message[]) => {
    if (incoming.length === 0) return;
    setMessages((prev) => {
      const fresh = incoming.filter((m) => !prev.some((x) => x.id === m.id));
      return fresh.length ? [...prev, ...fresh].sort(byCreatedAt) : prev;
    });
  }, []);

  useEffect(() => {
    latest.current = messages.at(-1)?.created_at;
  }, [messages]);

  // Poll for new messages while the thread is on screen. Each fetch also marks it read.
  useEffect(() => {
    let inFlight = false;
    const poll = async () => {
      if (inFlight || document.visibilityState !== "visible") return;
      inFlight = true;
      try {
        const params = new URLSearchParams({ conversationId });
        if (latest.current) params.set("after", latest.current);
        const res = await fetch(`/api/chat/messages?${params}`, { cache: "no-store" });
        if (res.ok) addMessages(((await res.json()) as { messages: Message[] }).messages);
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
  }, [conversationId, addMessages]);

  // Keep the newest message in view.
  useLayoutEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [messages.length]);

  const pickFile = (f: File | undefined) => {
    setError("");
    if (!f) return;
    if (f.size > MAX_ATTACHMENT_BYTES) return setError("Files must be under 4 MB.");
    if (!ACCEPTED_FILE_TYPES.includes(f.type)) return setError("Please attach a PDF, image, Word document, text file or ZIP.");
    setFile(f);
  };

  const send = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const body = text.trim();
    if ((!body && !file) || sending) return;
    setSending(true);
    setError("");

    try {
      const form = new FormData();
      form.set("conversationId", conversationId);
      form.set("body", body);
      if (file) form.set("file", file);
      const res = await fetch("/api/chat/messages", { method: "POST", body: form });
      const data = (await res.json().catch(() => null)) as { message?: Message; error?: string } | null;
      if (!res.ok || !data?.message) throw new Error(data?.error ?? "Your message couldn't be sent. Please try again.");

      addMessages([data.message]);
      setText("");
      setFile(null);
      textarea.current?.focus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6" aria-live="polite">
        {messages.length === 0 && greeting}
        <ol className="space-y-2">
          {messages.map((m, i) => {
            const mine = m.sender_id === userId;
            const prev = messages[i - 1];
            const newDay = !prev || new Date(prev.created_at).toDateString() !== new Date(m.created_at).toDateString();
            const grouped = !newDay && prev?.sender_id === m.sender_id;
            return (
              <Fragment key={m.id}>
                {newDay && (
                  <li className="py-3 text-center font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                    {dayFmt.format(new Date(m.created_at))}
                  </li>
                )}
                <li className={cn("flex", mine ? "justify-end" : "justify-start", !grouped && "pt-2")}>
                  <div className={cn("flex max-w-[85%] flex-col gap-1 sm:max-w-[70%]", mine ? "items-end" : "items-start")}>
                    {m.body && (
                      <p
                        className={cn(
                          "whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed",
                          mine ? "rounded-br-md bg-foreground text-background" : "rounded-bl-md border border-border bg-card",
                        )}
                      >
                        {m.body}
                      </p>
                    )}
                    {m.attachment_id && (
                      <a
                        href={`/api/chat/attachments/${m.attachment_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex max-w-full items-center gap-3 rounded-2xl border border-border bg-card px-3.5 py-2.5 text-left transition-colors hover:border-foreground/20"
                      >
                        <FileText className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium">{m.attachment_name}</span>
                          {m.attachment_size != null && (
                            <span className="block text-xs text-muted-foreground">
                              {(m.attachment_size / 1024 / 1024).toFixed(1)} MB · Open
                            </span>
                          )}
                        </span>
                      </a>
                    )}
                    <time dateTime={m.created_at} className="px-1 text-[11px] text-muted-foreground">
                      {timeFmt.format(new Date(m.created_at))}
                    </time>
                  </div>
                </li>
              </Fragment>
            );
          })}
        </ol>
      </div>

      <form onSubmit={send} className="border-t border-border p-3 sm:p-4">
        {file && (
          <div className="mb-2 flex items-center gap-2 rounded-xl border border-border bg-background/60 px-3 py-2 text-sm">
            <Paperclip className="size-4 text-muted-foreground" aria-hidden />
            <span className="min-w-0 flex-1 truncate">{file.name}</span>
            <button type="button" onClick={() => setFile(null)} className="grid size-6 place-items-center rounded-full hover:bg-muted" aria-label="Remove attachment">
              <X className="size-3.5" />
            </button>
          </div>
        )}
        {error && (
          <p role="alert" className="mb-2 text-[13px] text-destructive">
            {error}
          </p>
        )}
        <div className="flex items-end gap-2 rounded-2xl border border-input bg-background/60 p-1.5 transition-[border-color,box-shadow] focus-within:border-accent/60 focus-within:ring-4 focus-within:ring-accent/10">
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="grid size-10 shrink-0 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Attach a file"
          >
            <Paperclip className="size-[18px]" />
          </button>
          <input
            ref={fileInput}
            type="file"
            className="sr-only"
            tabIndex={-1}
            accept={ACCEPTED_FILE_TYPES.join(",")}
            onChange={(e) => {
              pickFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          <label htmlFor="chat-input" className="sr-only">
            Message
          </label>
          <textarea
            id="chat-input"
            ref={textarea}
            rows={1}
            value={text}
            maxLength={MAX_MESSAGE_LENGTH}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                void send();
              }
            }}
            placeholder={viewer === "client" ? "Tell me about your project…" : "Write a reply…"}
            className="max-h-40 min-h-10 flex-1 resize-none bg-transparent py-2 text-[15px] leading-relaxed outline-none [field-sizing:content] placeholder:text-muted-foreground/70"
          />
          <Button type="submit" size="icon" className="size-10 shrink-0 rounded-xl" disabled={sending || (!text.trim() && !file)} aria-label="Send message">
            {sending ? <Loader2 className="animate-spin" /> : <ArrowUp />}
          </Button>
        </div>
        <p className="mt-2 hidden px-1 text-[11px] text-muted-foreground sm:block">Enter to send · Shift + Enter for a new line</p>
      </form>
    </div>
  );
}
