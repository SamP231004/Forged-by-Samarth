import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Serif } from "@/components/ui/section";

export default function NotFound() {
  return (
    <section className="grid min-h-[80dvh] place-items-center px-5 pt-24 text-center">
      <div>
        <p className="font-mono text-sm text-muted-foreground">404</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">
          This page <Serif>wandered off</Serif>.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-muted-foreground">
          The link might be old or mistyped. Let&apos;s get you back somewhere useful.
        </p>
        <Button asChild className="mt-8">
          <Link href="/">
            <ArrowLeft /> Back home
          </Link>
        </Button>
      </div>
    </section>
  );
}
