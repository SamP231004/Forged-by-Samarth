"use client";

import { ArrowRight, CheckCircle2, Loader2, Mail } from "lucide-react";
import type { Provider } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { GithubIcon, GoogleIcon } from "@/components/ui/brand-icons";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export function LoginForm({ next, linkError }: { next: string; linkError?: boolean }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [oauthBusy, setOauthBusy] = useState<Provider | null>(null);
  const [error, setError] = useState(linkError ? "That sign-in didn't complete. Please try again." : "");

  const signInWith = async (provider: Provider) => {
    setOauthBusy(provider);
    setError("");
    const { error } = await createClient().auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    // On success the browser is already navigating to the provider.
    if (error) {
      setOauthBusy(null);
      setError(error.message);
    }
  };

  const sendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        data: name.trim() ? { name: name.trim() } : undefined,
      },
    });
    setBusy(false);
    if (error) return setError(error.message);
    setSentTo(email.trim());
  };

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sentTo) return;
    setBusy(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({ email: sentTo, token: code.trim(), type: "email" });
    if (error) {
      setBusy(false);
      return setError("That code didn't work. Check the latest email or request a new one.");
    }
    router.replace(next);
    router.refresh();
  };

  if (sentTo) {
    return (
      <div className="mt-8 rounded-3xl border border-border bg-card/70 p-6 backdrop-blur-xl" role="status">
        <p className="flex items-center gap-2 font-medium">
          <CheckCircle2 className="size-5 text-success" aria-hidden /> Check your inbox
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          I&apos;ve sent a sign-in link to <span className="text-foreground">{sentTo}</span>. Open it on this device, or
          enter the code from the email below.
        </p>
        <form onSubmit={verifyCode} className="mt-5 flex flex-col gap-2 sm:flex-row">
          <label htmlFor="otp" className="sr-only">
            Sign-in code
          </label>
          <Input
            id="otp"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="123456"
            pattern="[0-9]{6,10}"
            required
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            className="h-11 flex-1 rounded-full font-mono tracking-[0.3em]"
          />
          <Button type="submit" disabled={busy || code.length < 6}>
            {busy ? <Loader2 className="animate-spin" /> : null} Verify
          </Button>
        </form>
        <FieldError message={error} />
        <button
          type="button"
          onClick={() => {
            setSentTo(null);
            setCode("");
            setError("");
          }}
          className="mt-4 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={sendLink} className="mt-8 space-y-4 rounded-3xl border border-border bg-card/70 p-6 backdrop-blur-xl">
      <div className="grid gap-2 sm:grid-cols-2">
        {(
          [
            ["google", "Google", GoogleIcon],
            ["github", "GitHub", GithubIcon],
          ] as const
        ).map(([provider, label, Icon]) => (
          <Button key={provider} type="button" variant="outline" disabled={!!oauthBusy} onClick={() => signInWith(provider)}>
            {oauthBusy === provider ? <Loader2 className="animate-spin" /> : <Icon />} Continue with {label}
          </Button>
        ))}
      </div>
      <div className="flex items-center gap-3 text-xs text-muted-foreground" aria-hidden>
        <span className="h-px flex-1 bg-border" /> or use your email <span className="h-px flex-1 bg-border" />
      </div>
      <div>
        <Label htmlFor="login-name">
          Name <span className="font-normal text-muted-foreground">(first time only)</span>
        </Label>
        <Input id="login-name" autoComplete="name" placeholder="Jane Cooper" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} />
      </div>
      <div>
        <Label htmlFor="login-email">Email</Label>
        <Input
          id="login-email"
          type="email"
          autoComplete="email"
          required
          placeholder="jane@acme.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <FieldError message={error} />
      <Button type="submit" size="lg" className="w-full" disabled={busy}>
        {busy ? <Loader2 className="animate-spin" /> : <Mail />} Email me a sign-in link <ArrowRight />
      </Button>
      <p className="text-center text-xs text-muted-foreground">No password needed. No newsletters, ever.</p>
    </form>
  );
}
