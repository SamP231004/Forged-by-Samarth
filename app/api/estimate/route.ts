import { NextResponse } from "next/server";
import { layout, ownerInbox, row, sendEmail } from "@/lib/email";
import { budgetOptions, estimate, featureOptions, formatUSD, projectTypes, timelineOptions } from "@/lib/estimator";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { site } from "@/lib/site";
import { estimateEmailSchema } from "@/lib/validations";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!rateLimit(`estimate:${clientIp(req)}`)) {
    return NextResponse.json({ error: "Too many requests — please try again later." }, { status: 429 });
  }

  const parsed = estimateEmailSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request." }, { status: 400 });
  }
  const { email, input } = parsed.data;

  // Recompute on the server so the email can't be tampered with.
  const result = estimate(input);
  const label = <T extends { id: string; label: string }>(arr: readonly T[], id: string) =>
    arr.find((o) => o.id === id)?.label ?? id;

  const details =
    row("Project type", label(projectTypes, input.projectType)) +
    row("Features", input.features.map((f) => label(featureOptions, f)).join(", ") || "None") +
    row("Timeline", label(timelineOptions, input.timeline)) +
    row("Budget", label(budgetOptions, input.budget)) +
    row("Estimated price", `${formatUSD(result.price[0])} – ${formatUSD(result.price[1])}`) +
    row("Estimated time", `${result.weeks[0]}–${result.weeks[1]} weeks`) +
    result.stack.map((s) => row(s.layer, s.tools.join(", "))).join("");

  try {
    await sendEmail({
      to: email,
      replyTo: ownerInbox,
      subject: "Your project estimate",
      html: layout(
        "Your project estimate",
        `<p style="font-size:15px;line-height:1.6">Here's the ballpark you generated on my site. It's a rough range to help you plan — reply to this email or <a href="${site.url}/chat">message me on my site</a> and I'll give you a precise, written quote — no call needed.</p>
        <table role="presentation" width="100%" style="margin-top:16px">${details}</table>
        ${result.budgetNote ? `<p style="font-size:14px;line-height:1.6;background:#fef3c7;border-radius:10px;padding:12px">${result.budgetNote}</p>` : ""}
        <p style="font-size:15px;line-height:1.6;margin-top:24px">— Samarth</p>`,
      ),
    });

    // Let me know someone generated an estimate (useful lead signal).
    await sendEmail({
      to: ownerInbox,
      replyTo: email,
      subject: `Estimate requested by ${email}`,
      html: layout("New estimate request", `<table role="presentation" width="100%">${row("Email", email)}${details}</table>`),
    }).catch((e) => console.error("[estimate] owner notification failed", e));

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[estimate] send failed", e);
    return NextResponse.json({ error: "I couldn't send the email right now. Please try again." }, { status: 500 });
  }
}
