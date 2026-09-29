"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, m } from "framer-motion";
import { ArrowRight, CheckCircle2, Loader2, Mail, MessagesSquare, Paperclip, Upload, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Magnetic } from "@/components/motion/magnetic";
import { Reveal } from "@/components/motion/reveal";
import { WhatsappIcon } from "@/components/ui/brand-icons";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label, Textarea } from "@/components/ui/input";
import { Eyebrow, Section, Serif } from "@/components/ui/section";
import { PREFILL_EVENT } from "@/lib/events";
import { links, site } from "@/lib/site";
import { cn } from "@/lib/utils";
import {
  ACCEPTED_FILE_TYPES,
  MAX_FILE_BYTES,
  contactBudgets,
  contactSchema,
  contactTimelines,
  type ContactValues,
} from "@/lib/validations";

const nextSteps = [
  "I read your message personally and reply within 24 hours.",
  "We talk through your goals in chat — at your pace, no calls needed.",
  "You get a written proposal and a simple contract to approve online.",
];

export function Contact() {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
  const [serverError, setServerError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", company: "", email: "", message: "", website: "" },
  });

  // Prefill from the estimator's "Discuss this project" button.
  useEffect(() => {
    const onPrefill = (e: Event) => {
      const { message } = (e as CustomEvent<{ message: string }>).detail;
      setValue("message", message);
      setTimeout(() => document.getElementById("message")?.focus({ preventScroll: true }), 600);
    };
    window.addEventListener(PREFILL_EVENT, onPrefill);
    return () => window.removeEventListener(PREFILL_EVENT, onPrefill);
  }, [setValue]);

  const pickFile = (f: File | undefined) => {
    setFileError("");
    if (!f) return;
    if (f.size > MAX_FILE_BYTES) return setFileError("Files must be under 8 MB.");
    if (f.type && !ACCEPTED_FILE_TYPES.includes(f.type))
      return setFileError("Please upload a PDF, image, Word document, text file or ZIP.");
    setFile(f);
  };

  const onSubmit = async (values: ContactValues) => {
    setServerError("");
    const fd = new FormData();
    Object.entries(values).forEach(([k, v]) => fd.append(k, v ?? ""));
    if (file) fd.append("file", file);
    try {
      const res = await fetch("/api/contact", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Something went wrong. Please try again.");
      setStatus("sent");
      reset();
      setFile(null);
    } catch (err) {
      setStatus("error");
      setServerError(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  const budget = watch("budget");
  const timeline = watch("timeline");

  return (
    <Section id="contact" className="overflow-hidden border-t border-border">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-dots absolute inset-0 opacity-50 mask-radial" />
        <div className="absolute bottom-0 left-1/2 h-96 w-[50rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,var(--glow),transparent)] blur-2xl" />
      </div>

      <div className="container-page grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        {/* Left: pitch + direct channels */}
        <Reveal>
          <Eyebrow>Contact</Eyebrow>
          <h2 className="mt-5 text-balance text-4xl font-semibold tracking-[-0.04em] sm:text-6xl sm:leading-[1]">
            Let&apos;s build <Serif>your idea</Serif>.
          </h2>
          <p className="mt-6 text-pretty leading-relaxed text-muted-foreground sm:text-lg">
            Tell me what you&apos;re working on. Whether it&apos;s a rough idea or a detailed spec, I&apos;ll reply
            personally with honest thoughts on how I can help — or who can, if I&apos;m not the right fit. Everything
            happens in writing: sign in to chat here, use the form, or DM me.
          </p>

          <div className="mt-8 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
            <Magnetic>
              <Button asChild>
                <Link href="/chat">
                  <MessagesSquare /> Chat with me
                </Link>
              </Button>
            </Magnetic>
            <Button asChild variant="outline">
              <a href={links.email()}>
                <Mail /> Email me
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href={links.whatsapp()} target="_blank" rel="noopener noreferrer">
                <WhatsappIcon /> WhatsApp
              </a>
            </Button>
          </div>

          <div className="mt-12 rounded-3xl border border-border bg-card/40 p-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">What happens next</p>
            <ol className="mt-5 space-y-4">
              {nextSteps.map((s, i) => (
                <li key={s} className="flex gap-4 text-[15px]">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full border border-border font-mono text-[11px]">
                    {i + 1}
                  </span>
                  <span className="text-foreground/85">{s}</span>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>

        {/* Right: form */}
        <Reveal delay={0.1}>
          <div className="relative rounded-3xl border border-border bg-card/70 p-5 shadow-[0_30px_80px_-40px_rgb(0_0_0/0.35)] backdrop-blur-xl sm:p-8">
            <AnimatePresence mode="wait">
              {status === "sent" ? (
                <m.div
                  key="sent"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex min-h-[32rem] flex-col items-center justify-center text-center"
                  role="status"
                >
                  <m.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.1 }}
                    className="grid size-16 place-items-center rounded-full bg-success/15 text-success"
                  >
                    <CheckCircle2 className="size-8" aria-hidden />
                  </m.span>
                  <h3 className="mt-6 text-2xl font-semibold tracking-tight">Thanks — message received!</h3>
                  <p className="mt-2 max-w-sm text-muted-foreground">
                    I&apos;ll read it personally and get back to you within one working day. A copy is on its way to
                    your inbox.
                  </p>
                  <Button variant="outline" className="mt-8" onClick={() => setStatus("idle")}>
                    Send another message
                  </Button>
                </m.div>
              ) : (
                <m.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit(onSubmit)}
                  noValidate
                  className="space-y-5"
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        autoComplete="name"
                        placeholder="Jane Cooper"
                        aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? "name-error" : undefined}
                        {...register("name")}
                      />
                      <FieldError id="name-error" message={errors.name?.message} />
                    </div>
                    <div>
                      <Label htmlFor="company">
                        Company <span className="font-normal text-muted-foreground">(optional)</span>
                      </Label>
                      <Input id="company" autoComplete="organization" placeholder="Acme Inc." {...register("company")} />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="jane@acme.com"
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? "email-error" : undefined}
                      {...register("email")}
                    />
                    <FieldError id="email-error" message={errors.email?.message} />
                  </div>

                  <PillGroup
                    label="Budget"
                    name="budget"
                    options={contactBudgets}
                    value={budget}
                    onChange={(v) => setValue("budget", v as ContactValues["budget"], { shouldValidate: true })}
                    error={errors.budget?.message}
                  />

                  <PillGroup
                    label="Timeline"
                    name="timeline"
                    options={contactTimelines}
                    value={timeline}
                    onChange={(v) => setValue("timeline", v as ContactValues["timeline"], { shouldValidate: true })}
                    error={errors.timeline?.message}
                  />

                  <div>
                    <Label htmlFor="message">Project description</Label>
                    <Textarea
                      id="message"
                      placeholder="What are you building, who is it for, and what does success look like?"
                      aria-invalid={!!errors.message}
                      aria-describedby={errors.message ? "message-error" : undefined}
                      {...register("message")}
                    />
                    <FieldError id="message-error" message={errors.message?.message} />
                  </div>

                  {/* File upload */}
                  <div>
                    <span className="mb-2 block text-[13px] font-medium text-foreground/85">
                      Attachment <span className="font-normal text-muted-foreground">(optional — brief, wireframes, spec)</span>
                    </span>
                    {file ? (
                      <div className="flex items-center gap-3 rounded-xl border border-border bg-background/60 px-4 py-3">
                        <Paperclip className="size-4 text-muted-foreground" aria-hidden />
                        <span className="min-w-0 flex-1 truncate text-sm">{file.name}</span>
                        <span className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                        <button
                          type="button"
                          onClick={() => setFile(null)}
                          className="grid size-7 place-items-center rounded-full hover:bg-muted"
                          aria-label="Remove attachment"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    ) : (
                      <label
                        htmlFor="file"
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragging(true);
                        }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setDragging(false);
                          pickFile(e.dataTransfer.files?.[0]);
                        }}
                        className={cn(
                          "flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed px-4 py-6 text-center transition-colors",
                          dragging ? "border-accent bg-accent/5" : "border-input hover:border-foreground/25 hover:bg-background/60",
                        )}
                      >
                        <Upload className="size-5 text-muted-foreground" aria-hidden />
                        <span className="text-sm">
                          <span className="font-medium">Click to upload</span>{" "}
                          <span className="text-muted-foreground">or drag and drop</span>
                        </span>
                        <span className="text-xs text-muted-foreground">PDF, images, DOC, TXT or ZIP · up to 8 MB</span>
                        <input
                          ref={fileInput}
                          id="file"
                          type="file"
                          className="sr-only"
                          accept={ACCEPTED_FILE_TYPES.join(",")}
                          onChange={(e) => pickFile(e.target.files?.[0])}
                        />
                      </label>
                    )}
                    <FieldError message={fileError} />
                  </div>

                  {/* Honeypot */}
                  <div aria-hidden className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
                    <label htmlFor="website">Leave this field empty</label>
                    <input id="website" tabIndex={-1} autoComplete="off" {...register("website")} />
                  </div>

                  {status === "error" && (
                    <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm">
                      {serverError} You can also email me directly at{" "}
                      <a href={links.email()} className="underline">
                        {site.email}
                      </a>
                      .
                    </p>
                  )}

                  <div className="flex flex-col-reverse items-center justify-between gap-4 pt-2 sm:flex-row">
                    <p className="text-xs text-muted-foreground">Your details stay private. No newsletters, ever.</p>
                    <Button type="submit" size="lg" disabled={isSubmitting} className="group w-full sm:w-auto">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="animate-spin" /> Sending…
                        </>
                      ) : (
                        <>
                          Send message <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
                        </>
                      )}
                    </Button>
                  </div>
                </m.form>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

function PillGroup({
  label,
  name,
  options,
  value,
  onChange,
  error,
}: {
  label: string;
  name: string;
  options: readonly string[];
  value?: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <fieldset aria-describedby={error ? `${name}-error` : undefined}>
      <legend className="mb-2 block text-[13px] font-medium text-foreground/85">{label}</legend>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={label}>
        {options.map((o) => {
          const selected = value === o;
          return (
            <button
              key={o}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(o)}
              className={cn(
                "rounded-full border px-3.5 py-2 text-[13px] transition-all",
                selected
                  ? "border-foreground bg-foreground text-background"
                  : "border-input bg-background/60 text-foreground/80 hover:border-foreground/30",
              )}
            >
              {o}
            </button>
          );
        })}
      </div>
      <FieldError id={`${name}-error`} message={error} />
    </fieldset>
  );
}
