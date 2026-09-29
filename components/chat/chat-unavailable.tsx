import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { links } from "@/lib/site";

/** Shown when Supabase env vars aren't set, so the site still builds and runs. */
export function ChatUnavailable() {
  return (
    <section className="grid min-h-[80dvh] place-items-center px-5 pt-24 text-center">
      <div className="max-w-md">
        <h1 className="text-3xl font-semibold tracking-tight">On-site chat is coming soon</h1>
        <p className="mt-4 text-muted-foreground">
          In the meantime, send me a message through the contact form or by email — I reply to every one personally.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <Button asChild>
            <Link href="/#contact">
              <ArrowLeft /> Contact form
            </Link>
          </Button>
          <Button asChild variant="outline">
            <a href={links.email()}>Email me</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
