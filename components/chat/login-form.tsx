"use client";

import { ArrowRight, CheckCircle2, Loader2, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { GithubIcon, GoogleIcon } from "@/components/ui/brand-icons";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { PENDING_NAME_COOKIE } from "@/lib/chat";

type Provider = "google" | "github";

type Props = {
  next: string;
  /** OAuth providers that are configured on the server. */
  providers: Provider[];
  linkError?: boolean;
  /** Filled in from the link in the sign-in email. */
  initialEmail?: string;
  initialCode?: string;
};

export function LoginForm({ next, providers, linkError, initialEmail, initialCode }: Props) {
  const router = useRouter();
  const fromLink = Boolean(initialEmail && initialCode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(fromLink ? initialCode!.replace(/\D/g, "") : "");
  const [sentTo, setSentTo] = useState<string | null>(fromLink ? initialEmail! : null);
  const [busy, setBusy] = useState(false);
  const [oauthBusy, setOauthBusy] = useState<Provider | null>(null);
  const [error, setError] = useState(linkError ? "That sign-in didn't complete. Please try again." : "");

  const signInWith = async (provider: Provider) => {
    setOauthBusy(provider);
    setError("");
    const { error } = await authClient.signIn.social({
      provider,
      callbackURL: next,
      errorCallbackURL: `/login?next=${encodeURIComponent(next)}`,
    });
    // On success the browser is already navigating to the provider.
    if (error) {
      setOauthBusy(null);
      setError(error.message ?? "That sign-in didn't complete. Please try again.");
    }
  };

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    // Remembered for when the conversation is created after sign-in.
    if (name.trim()) {
      document.cookie = `${PENDING_NAME_COOKIE}=${encodeURIComponent(name.trim())}; path=/; max-age=86400; samesite=lax`;
    }
    const { error } = await authClient.emailOtp.sendVerificationOtp({ email: email.trim(), type: "sign-in" });
    setBusy(false);
    if (error) return setError(error.message ?? "That email couldn't be sent. Please try again.");
    setSentTo(email.trim());
  };

  const verify = useCallback(
    async (otp: string) => {
      if (!sentTo) return;
      setBusy(true);
      setError("");
      const { error } = await authClient.signIn.emailOtp({ email: sentTo, otp });
      if (error) {
        setBusy(false);
        return setError("That code didn't work. Check the latest email or request a new one.");
      }
      router.replace(next);
      router.refresh();
    },
    [sentTo, next, router],
  );

  const verifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    void verify(code.trim());
  };

  // Opening the link in the email signs in straight away.
  const autoVerified = useRef(false);
  useEffect(() => {
    if (!fromLink || autoVerified.current) return;
    autoVerified.current = true;
    void verify(code);
  }, [fromLink, verify, code]);

  if (sentTo) {
    return (
      <div className="mt-8 rounded-3xl border border-border bg-card/70 p-6 backdrop-blur-xl" role="status">
        <p className="flex items-center gap-2 font-medium">
          <CheckCircle2 className="size-5 text-success" aria-hidden /> Check your inbox
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          I&apos;ve sent a sign-in link and code to <span className="text-foreground">{sentTo}</span>. Open the link on
          this device, or enter the code from the email below.
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
            pattern="[0-9]{6}"
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
    <form onSubmit={sendCode} className="mt-8 space-y-4 rounded-3xl border border-border bg-card/70 p-6 backdrop-blur-xl">
      {providers.length > 0 && (
        <>
          <div className={providers.length > 1 ? "grid gap-2 sm:grid-cols-2" : "grid gap-2"}>
            {(
              [
                ["google", "Google", GoogleIcon],
                ["github", "GitHub", GithubIcon],
              ] as const
            )
              .filter(([provider]) => providers.includes(provider))
              .map(([provider, label, Icon]) => (
                <Button key={provider} type="button" variant="outline" disabled={!!oauthBusy} onClick={() => signInWith(provider)}>
                  {oauthBusy === provider ? <Loader2 className="animate-spin" /> : <Icon />} Continue with {label}
                </Button>
              ))}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground" aria-hidden>
            <span className="h-px flex-1 bg-border" /> or use your email <span className="h-px flex-1 bg-border" />
          </div>
        </>
      )}
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
