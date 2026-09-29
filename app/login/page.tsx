import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/chat/login-form";
import { ChatUnavailable } from "@/components/chat/chat-unavailable";
import { Eyebrow, Serif } from "@/components/ui/section";
import { safeNext } from "@/lib/chat";
import { chatEnabled } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in to chat",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ next?: string; error?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { next: rawNext, error } = await searchParams;
  const next = safeNext(rawNext);

  if (!chatEnabled) return <ChatUnavailable />;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect(next);

  return (
    <section className="relative grid min-h-[85dvh] place-items-center px-5 pb-16 pt-32">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-dots absolute inset-0 opacity-50 mask-radial" />
      </div>
      <div className="w-full max-w-md">
        <Eyebrow>Messages</Eyebrow>
        <h1 className="mt-5 text-balance text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
          Chat with me, <Serif>no calls</Serif>.
        </h1>
        <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
          Sign in with Google, GitHub or your email to start a private conversation. Your messages and files are saved, so you can pick
          up where we left off on any device.
        </p>
        <LoginForm next={next} linkError={error === "link"} />
      </div>
    </section>
  );
}
