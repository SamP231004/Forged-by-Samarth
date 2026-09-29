"use client";

import { ArrowUp, FileText, Loader2, Paperclip, X } from "lucide-react";
import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ATTACHMENT_BUCKET, MAX_MESSAGE_LENGTH, type Message } from "@/lib/chat";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { ACCEPTED_FILE_TYPES, MAX_FILE_BYTES } from "@/lib/validations";

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

export function ChatThread({ conversationId, userId, viewer, initialMessages, greeting }: Props) {
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const scroller = useRef<HTMLDivElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const addMessage = useCallback((m: Message) => {
    setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
  }, []);

  const markRead = useCallback(() => {
    if (document.visibilityState === "visible") void supabase.rpc("mark_read", { p_conversation: conversationId });
  }, [supabase, conversationId]);

  // Live updates for new messages in this conversation.
  useEffect(() => {
    markRead();
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          addMessage(payload.new as Message);
          markRead();
        },
      )
      .subscribe();
    document.addEventListener("visibilitychange", markRead);
    return () => {
      document.removeEventListener("visibilitychange", markRead);
      void supabase.removeChannel(channel);
    };
  }, [supabase, conversationId, addMessage, markRead]);

  // Keep the newest message in view.
  useLayoutEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [messages.length]);

  const pickFile = (f: File | undefined) => {
    setError("");
    if (!f) return;
    if (f.size > MAX_FILE_BYTES) return setError("Files must be under 8 MB.");
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
      let attachment: Pick<Message, "attachment_path" | "attachment_name" | "attachment_size" | "attachment_type"> = {
        attachment_path: null,
        attachment_name: null,
        attachment_size: null,
        attachment_type: null,
      };
      if (file) {
        const safeName = file.name.replace(/[^\w.\-]+/g, "_").slice(-100);
        const path = `${conversationId}/${crypto.randomUUID()}-${safeName}`;
        const { error: uploadError } = await supabase.storage
          .from(ATTACHMENT_BUCKET)
          .upload(path, file, { contentType: file.type, upsert: false });
        if (uploadError) throw new Error("The attachment couldn't be uploaded. Please try again.");
        attachment = {
          attachment_path: path,
          attachment_name: file.name.slice(0, 200),
          attachment_size: file.size,
          attachment_type: file.type,
        };
      }

      const { data, error: insertError } = await supabase
        .from("messages")
        .insert({ conversation_id: conversationId, sender_id: userId, body, ...attachment })
        .select()
        .single();
      if (insertError || !data) throw new Error("Your message couldn't be sent. Please try again.");

      addMessage(data as Message);
      setText("");
      setFile(null);
      textarea.current?.focus();

      // Let the other side know by email (throttled server-side).
      void fetch("/api/chat/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId }),
      }).catch(() => {});
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSending(false);
    }
  };

  const openAttachment = async (path: string) => {
    const { data, error } = await supabase.storage.from(ATTACHMENT_BUCKET).createSignedUrl(path, 60);
    if (error || !data) return setError("That file couldn't be opened.");
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
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
                    {m.attachment_path && (
                      <button
                        type="button"
                        onClick={() => openAttachment(m.attachment_path!)}
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
                      </button>
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
