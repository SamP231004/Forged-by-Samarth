import { LogOut } from "lucide-react";

export function SignOutButton({ email }: { email?: string | null }) {
  return (
    <form action="/auth/signout" method="post" className="shrink-0">
      <button
        type="submit"
        title={email ? `Signed in as ${email}` : undefined}
        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border px-3 text-[13px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <LogOut className="size-3.5" aria-hidden /> <span className="hidden sm:inline">Sign out</span>
      </button>
    </form>
  );
}
