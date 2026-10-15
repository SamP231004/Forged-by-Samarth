"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, Check, CheckCheck, Copy, CornerUpLeft, FileText, Loader2, Paperclip, Pencil, Plus, SmilePlus, X } from "lucide-react";
import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  canEdit,
  EDIT_WINDOW_MS,
  excerpt,
  fileSize,
  MAX_ATTACHMENT_BYTES,
  MAX_MESSAGE_LENGTH,
  MORE_REACTIONS,
  QUICK_REACTIONS,
  type Message,
} from "@/lib/chat";
import { cn } from "@/lib/utils";
import { ACCEPTED_FILE_TYPES } from "@/lib/validations";

type Props = {
  conversationId: string;
  userId: string;
  viewer: "client" | "admin";
  /** What to call the other side in reply quotes and reactions. */
  peerName: string;
  messages: Message[];
  /** When the other side last had the thread open, for read receipts. */
  peerLastReadAt: string;
  /** Adds or replaces messages by id. */
  onMessages: (messages: Message[]) => void;
  /** Shown before the first message (client view only). */
  greeting?: React.ReactNode;
};

const dayFmt = new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" });
const timeFmt = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" });

const URL_RE = /(https?:\/\/[^\s<]+[^\s<.,:;"')\]!?])/g;

/** Message text with any links made clickable. */
function Linkified({ text }: { text: string }) {
  return text.split(URL_RE).map((part, i) =>
    i % 2 ? (
      <a key={i} href={part} target="_blank" rel="noopener noreferrer nofollow" className="underline decoration-current/40 [overflow-wrap:anywhere] underline-offset-2 hover:decoration-current">
        {part}
      </a>
    ) : (
      part
    ),
  );
}

async function patchMessage(id: string, payload: Record<string, unknown>) {
  const res = await fetch(`/api/chat/messages/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = (await res.json().catch(() => null)) as { message?: Message; error?: string } | null;
  if (!res.ok || !data?.message) throw new Error(data?.error ?? "That didn't go through. Please try again.");
  return data.message;
}

export function ChatThread({ conversationId, userId, viewer, peerName, messages, peerLastReadAt, onMessages, greeting }: Props) {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [editing, setEditing] = useState<Message | null>(null);
  /** The message whose actions are pinned open (tap on touch screens). */
  const [active, setActive] = useState<string | null>(null);
  const [picker, setPicker] = useState<{ id: string; below: boolean; more: boolean } | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const scroller = useRef<HTMLDivElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const nameOf = (senderId: string) => (senderId === userId ? "You" : peerName);

  // Keeps "Edit" offers honest as the 2-minute window runs out (every second while editing, for the countdown).
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), editing ? 1000 : 15_000);
    return () => clearInterval(timer);
  }, [editing]);

  // Keep the newest message in view.
  useLayoutEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [messages.length]);

  // Tapping anywhere else closes pinned actions and the emoji picker.
  useEffect(() => {
    if (!active && !picker) return;
    const close = (e: PointerEvent) => {
      if (!(e.target as HTMLElement).closest("[data-msg-ui]")) {
        setActive(null);
        setPicker(null);
      }
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [active, picker]);

  const focusComposer = () => requestAnimationFrame(() => textarea.current?.focus());

  const pickFile = (f: File | undefined) => {
    setError("");
    if (!f) return;
    if (f.size > MAX_ATTACHMENT_BYTES) return setError("Files must be under 4 MB.");
    if (!ACCEPTED_FILE_TYPES.includes(f.type)) return setError("Please attach a PDF, image, Word document, text file or ZIP.");
    setFile(f);
  };

  const startReply = (m: Message) => {
    setEditing(null);
    if (editing) setText("");
    setReplyTo(m);
    setActive(null);
    setPicker(null);
    focusComposer();
  };

  const startEdit = (m: Message) => {
    setReplyTo(null);
    setFile(null);
    setEditing(m);
    setText(m.body);
    setActive(null);
    setPicker(null);
    requestAnimationFrame(() => {
      const el = textarea.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    });
  };

  const cancelCompose = () => {
    if (editing) setText("");
    setEditing(null);
    setReplyTo(null);
  };

  const jumpTo = (id: string) => {
    const el = document.getElementById(`m-${id}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    setFlash(id);
    setTimeout(() => setFlash((f) => (f === id ? null : f)), 1400);
  };

  const copy = async (m: Message) => {
    try {
      await navigator.clipboard.writeText(m.body);
      setCopied(m.id);
      setTimeout(() => setCopied((c) => (c === m.id ? null : c)), 1200);
    } catch {
      // Clipboard blocked; nothing useful to say.
    }
  };

  const react = async (m: Message, emoji: string) => {
    setPicker(null);
    setActive(null);
    const next = m.reactions.find((r) => r.user_id === userId)?.emoji === emoji ? null : emoji;
    const others = m.reactions.filter((r) => r.user_id !== userId);
    onMessages([{ ...m, reactions: next ? [...others, { user_id: userId, emoji: next }] : others }]);
    try {
      onMessages([await patchMessage(m.id, { action: "react", conversationId, emoji: next })]);
    } catch (err) {
      onMessages([m]);
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  const openPicker = (m: Message, target: HTMLElement) => {
    if (picker?.id === m.id) return setPicker(null);
    // Open below the bubble when there isn't room above it.
    const top = target.getBoundingClientRect().top - (scroller.current?.getBoundingClientRect().top ?? 0);
    setPicker({ id: m.id, below: top < 200, more: false });
  };

  const send = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const body = text.trim();
    if (sending) return;

    if (editing) {
      if (!body) return;
      if (body === editing.body) return cancelCompose();
      setSending(true);
      setError("");
      try {
        onMessages([await patchMessage(editing.id, { action: "edit", conversationId, body })]);
        setEditing(null);
        setText("");
        focusComposer();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setSending(false);
      }
      return;
    }

    if (!body && !file) return;
    setSending(true);
    setError("");
    try {
      const form = new FormData();
      form.set("conversationId", conversationId);
      form.set("body", body);
      if (file) form.set("file", file);
      if (replyTo) form.set("replyToId", replyTo.id);
      const res = await fetch("/api/chat/messages", { method: "POST", body: form });
      const data = (await res.json().catch(() => null)) as { message?: Message; error?: string } | null;
      if (!res.ok || !data?.message) throw new Error(data?.error ?? "Your message couldn't be sent. Please try again.");

      onMessages([data.message]);
      setText("");
      setFile(null);
      setReplyTo(null);
      textarea.current?.focus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSending(false);
    }
  };

  const editSecondsLeft = editing ? Math.max(0, Math.ceil((new Date(editing.created_at).getTime() + EDIT_WINDOW_MS - now) / 1000)) : 0;
  const lastMineEditable = [...messages].reverse().find((m) => canEdit(m, userId, now));

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
            const isImage = !!m.attachment_id && !!m.attachment_type?.startsWith("image/");
            const showTools = active === m.id || picker?.id === m.id;
            const editable = canEdit(m, userId, now);
            const reactions = Object.entries(
              m.reactions.reduce<Record<string, string[]>>((acc, r) => ((acc[r.emoji] ??= []).push(nameOf(r.user_id)), acc), {}),
            );
            const myReaction = m.reactions.find((r) => r.user_id === userId)?.emoji;

            return (
              <Fragment key={m.id}>
                {newDay && (
                  <li className="py-3 text-center font-mono text-[11px] uppercase tracking-wider text-muted-foreground" suppressHydrationWarning>
                    {dayFmt.format(new Date(m.created_at))}
                  </li>
                )}
                <li id={`m-${m.id}`} className={cn("group/msg flex scroll-my-24", mine ? "justify-end" : "justify-start", !grouped && "pt-2")}>
                  <div className={cn("flex max-w-[88%] flex-col gap-1 sm:max-w-[72%]", mine ? "items-end" : "items-start")}>
                    <div data-msg-ui className="relative max-w-full">
                      {/* Bubble */}
                      <div
                        onClick={(e) => {
                          if ((e.target as HTMLElement).closest("a,button") || window.getSelection()?.toString()) return;
                          setActive((a) => (a === m.id ? null : m.id));
                        }}
                        className={cn(
                          "relative min-w-0 rounded-2xl p-1.5 text-[15px] leading-relaxed transition-shadow duration-500",
                          mine ? "rounded-br-md bg-foreground text-background" : "rounded-bl-md border border-border bg-card",
                          flash === m.id && "ring-4 ring-accent/50",
                          reactions.length > 0 && "mb-3",
                        )}
                      >
                        {m.reply_to && (
                          <button
                            type="button"
                            onClick={() => jumpTo(m.reply_to!.id)}
                            className={cn(
                              "mb-1 flex w-full min-w-0 gap-2 rounded-xl px-3 py-2 text-left transition-colors",
                              mine ? "bg-background/10 hover:bg-background/15" : "bg-muted hover:bg-muted/70",
                            )}
                          >
                            <span className="w-0.5 shrink-0 self-stretch rounded-full bg-accent" aria-hidden />
                            <span className="min-w-0">
                              <span className={cn("block text-xs font-semibold", mine ? "text-background/80" : "text-accent")}>
                                {nameOf(m.reply_to.sender_id)}
                              </span>
                              <span className={cn("line-clamp-2 text-[13px] leading-snug", mine ? "text-background/65" : "text-muted-foreground")}>
                                {excerpt(messages.find((x) => x.id === m.reply_to!.id) ?? m.reply_to)}
                              </span>
                            </span>
                          </button>
                        )}

                        {m.attachment_id &&
                          (isImage ? (
                            <a href={`/api/chat/attachments/${m.attachment_id}`} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-xl">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={`/api/chat/attachments/${m.attachment_id}`}
                                alt={m.attachment_name ?? "Shared image"}
                                loading="lazy"
                                className="max-h-72 w-full min-w-40 object-cover transition-transform duration-300 hover:scale-[1.02]"
                              />
                            </a>
                          ) : (
                            <a
                              href={`/api/chat/attachments/${m.attachment_id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={cn(
                                "flex max-w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                                mine ? "bg-background/10 hover:bg-background/15" : "bg-muted/60 hover:bg-muted",
                              )}
                            >
                              <span className={cn("grid size-9 shrink-0 place-items-center rounded-lg", mine ? "bg-background/15" : "bg-background")}>
                                <FileText className="size-4" aria-hidden />
                              </span>
                              <span className="min-w-0">
                                <span className="block truncate text-sm font-medium">{m.attachment_name}</span>
                                {m.attachment_size != null && (
                                  <span className={cn("block text-xs", mine ? "text-background/60" : "text-muted-foreground")}>
                                    {fileSize(m.attachment_size)} · Open
                                  </span>
                                )}
                              </span>
                            </a>
                          ))}

                        {m.body && (
                          <p className={cn("whitespace-pre-wrap break-words px-2.5 py-1", m.attachment_id && "pt-2")}>
                            <Linkified text={m.body} />
                          </p>
                        )}

                        {reactions.length > 0 && (
                          <div className={cn("absolute -bottom-4 flex gap-0.5", mine ? "right-2" : "left-2")}>
                            {reactions.map(([emoji, who]) => (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => react(m, emoji)}
                                title={`${who.join(", ")}${myReaction === emoji ? " · tap to remove" : ""}`}
                                className={cn(
                                  "flex h-6 items-center gap-0.5 rounded-full border bg-card px-1.5 text-[13px] text-foreground shadow-sm transition-transform hover:scale-110",
                                  myReaction === emoji ? "border-accent/50" : "border-border",
                                )}
                              >
                                <span>{emoji}</span>
                                {who.length > 1 && <span className="text-[11px] text-muted-foreground">{who.length}</span>}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Hover / tap actions */}
                      <div
                        className={cn(
                          "absolute bottom-full z-10 mb-1 flex items-center gap-0.5 rounded-full border border-border bg-card p-0.5 shadow-sm transition-opacity sm:bottom-auto sm:top-1/2 sm:mb-0 sm:-translate-y-1/2",
                          mine ? "right-0 sm:right-full sm:mr-1.5" : "left-0 sm:left-full sm:ml-1.5",
                          reactions.length > 0 && "sm:-mt-1.5",
                          showTools ? "opacity-100" : "pointer-events-none opacity-0 group-hover/msg:pointer-events-auto group-hover/msg:opacity-100 focus-within:pointer-events-auto focus-within:opacity-100",
                        )}
                      >
                        <ToolButton label="React" onClick={(e) => openPicker(m, e.currentTarget)}>
                          <SmilePlus />
                        </ToolButton>
                        <ToolButton label="Reply" onClick={() => startReply(m)}>
                          <CornerUpLeft />
                        </ToolButton>
                        {editable && (
                          <ToolButton label="Edit" onClick={() => startEdit(m)}>
                            <Pencil />
                          </ToolButton>
                        )}
                        {m.body && (
                          <ToolButton label="Copy text" onClick={() => copy(m)}>
                            {copied === m.id ? <Check className="text-success" /> : <Copy />}
                          </ToolButton>
                        )}
                      </div>

                      {/* Emoji picker */}
                      <AnimatePresence>
                        {picker?.id === m.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.92, y: picker.below ? -6 : 6 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 500, damping: 32 }}
                            className={cn(
                              "absolute z-20 w-max max-w-[min(20rem,80vw)] rounded-2xl border border-border bg-card p-1.5 shadow-[0_20px_50px_-20px_rgb(0_0_0/0.45)]",
                              picker.below ? "top-full mt-2" : "bottom-full mb-2",
                              mine ? "right-0 origin-bottom-right" : "left-0 origin-bottom-left",
                            )}
                          >
                            <div className="flex items-center gap-0.5">
                              {QUICK_REACTIONS.map((emoji) => (
                                <EmojiButton key={emoji} emoji={emoji} selected={myReaction === emoji} onClick={() => react(m, emoji)} />
                              ))}
                              <button
                                type="button"
                                onClick={() => setPicker({ ...picker, more: !picker.more })}
                                className={cn(
                                  "grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                                  picker.more && "rotate-45 bg-muted text-foreground",
                                )}
                                aria-label={picker.more ? "Fewer reactions" : "More reactions"}
                              >
                                <Plus className="size-4" />
                              </button>
                            </div>
                            {picker.more && (
                              <div className="mt-1 grid grid-cols-6 gap-0.5 border-t border-border pt-1">
                                {MORE_REACTIONS.map((emoji) => (
                                  <EmojiButton key={emoji} emoji={emoji} selected={myReaction === emoji} onClick={() => react(m, emoji)} />
                                ))}
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <span className="flex items-center gap-1 px-1 text-[11px] text-muted-foreground">
                      {m.edited_at && <span>Edited ·</span>}
                      <time dateTime={m.created_at} suppressHydrationWarning>
                        {timeFmt.format(new Date(m.created_at))}
                      </time>
                      {mine &&
                        (peerLastReadAt >= m.created_at ? (
                          <CheckCheck className="size-3.5 text-accent" aria-label="Seen" />
                        ) : (
                          <Check className="size-3.5" aria-label="Sent" />
                        ))}
                    </span>
                  </div>
                </li>
              </Fragment>
            );
          })}
        </ol>
      </div>

      <form onSubmit={send} className="border-t border-border p-3 sm:p-4">
        <AnimatePresence initial={false}>
          {(replyTo || editing) && (
            <motion.div
              key={editing ? `e-${editing.id}` : `r-${replyTo!.id}`}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden"
            >
              <div className="mb-2 flex items-center gap-3 rounded-xl border border-border bg-background/60 py-2 pl-3 pr-2">
                <span className="w-1 self-stretch rounded-full bg-gradient-to-b from-accent to-accent-2" aria-hidden />
                {editing ? <Pencil className="size-4 shrink-0 text-accent" aria-hidden /> : <CornerUpLeft className="size-4 shrink-0 text-accent" aria-hidden />}
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-xs font-semibold text-accent">
                    {editing ? "Editing message" : `Replying to ${replyTo!.sender_id === userId ? "yourself" : peerName}`}
                    {editing && (
                      <span className={cn("font-mono font-normal tabular-nums", editSecondsLeft <= 20 ? "text-destructive" : "text-muted-foreground")}>
                        {Math.floor(editSecondsLeft / 60)}:{String(editSecondsLeft % 60).padStart(2, "0")} left
                      </span>
                    )}
                  </p>
                  <p className="truncate text-[13px] text-muted-foreground">{excerpt((editing ?? replyTo)!)}</p>
                </div>
                <button type="button" onClick={cancelCompose} className="grid size-7 shrink-0 place-items-center rounded-full hover:bg-muted" aria-label="Cancel">
                  <X className="size-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
            disabled={!!editing}
            className="grid size-10 shrink-0 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
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
              if (e.nativeEvent.isComposing) return;
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              } else if (e.key === "Escape" && (replyTo || editing)) {
                e.preventDefault();
                cancelCompose();
              } else if (e.key === "ArrowUp" && !text && !editing && lastMineEditable) {
                e.preventDefault();
                startEdit(lastMineEditable);
              }
            }}
            placeholder={editing ? "Edit your message…" : viewer === "client" ? "Tell me about your project…" : "Write a reply…"}
            className="max-h-40 min-h-10 flex-1 resize-none bg-transparent py-2 text-[15px] leading-relaxed outline-none [field-sizing:content] placeholder:text-muted-foreground/70"
          />
          <Button
            type="submit"
            size="icon"
            className="size-10 shrink-0 rounded-xl"
            disabled={sending || (editing ? !text.trim() : !text.trim() && !file)}
            aria-label={editing ? "Save edit" : "Send message"}
          >
            {sending ? <Loader2 className="animate-spin" /> : editing ? <Check /> : <ArrowUp />}
          </Button>
        </div>
        <p className="mt-2 hidden px-1 text-[11px] text-muted-foreground sm:block">
          Enter to send · Shift + Enter for a new line · Hover a message to react, reply{lastMineEditable ? " or edit (↑)" : ""}
        </p>
      </form>
    </div>
  );
}

function ToolButton({ label, onClick, children }: { label: string; onClick: (e: React.MouseEvent<HTMLButtonElement>) => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="grid size-7 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground [&_svg]:size-3.5"
    >
      {children}
    </button>
  );
}

function EmojiButton({ emoji, selected, onClick }: { emoji: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`React with ${emoji}`}
      aria-pressed={selected}
      className={cn(
        "grid size-9 place-items-center rounded-full text-xl transition-transform duration-150 hover:scale-125 active:scale-95",
        selected && "bg-accent/15",
      )}
    >
      {emoji}
    </button>
  );
}
