import { NextResponse } from "next/server";
import { layout, ownerInbox, row, sendEmail } from "@/lib/email";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { site } from "@/lib/site";
import { escapeHtml } from "@/lib/utils";
import { ACCEPTED_FILE_TYPES, MAX_FILE_BYTES, contactSchema } from "@/lib/validations";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!rateLimit(`contact:${clientIp(req)}`)) {
    return NextResponse.json({ error: "Too many messages — please try again in a few minutes." }, { status: 429 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form submission." }, { status: 400 });
  }

  const fields = Object.fromEntries(
    ["name", "company", "email", "budget", "timeline", "message", "website"].map((k) => [k, form.get(k) ?? ""]),
  );
  const parsed = contactSchema.safeParse(fields);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Please check the form." }, { status: 400 });
  }
  const data = parsed.data;

  // Honeypot filled in → quietly accept and drop.
  if (data.website) return NextResponse.json({ ok: true });

  const attachments: { filename: string; content: Buffer }[] = [];
  const file = form.get("file");
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: "Attachments must be under 8 MB." }, { status: 400 });
    }
    if (file.type && !ACCEPTED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "That file type isn't supported." }, { status: 400 });
    }
    attachments.push({ filename: file.name.slice(0, 120), content: Buffer.from(await file.arrayBuffer()) });
  }

  try {
    await sendEmail({
      to: ownerInbox,
      replyTo: data.email,
      subject: `New enquiry from ${data.name}${data.company ? ` (${data.company})` : ""}`,
      attachments,
      html: layout(
        "New project enquiry",
        `<table role="presentation" width="100%">${row("Name", data.name)}${row("Company", data.company || "—")}${row("Email", data.email)}${row("Budget", data.budget)}${row("Timeline", data.timeline)}${row("Attachment", attachments[0]?.filename ?? "—")}</table>
        <p style="margin:20px 0 6px;color:#71717a;font-size:13px">Project description</p>
        <p style="white-space:pre-wrap;font-size:14px;line-height:1.6;margin:0">${escapeHtml(data.message)}</p>`,
      ),
    });

    // Confirmation to the sender. Failure here shouldn't fail the request.
    await sendEmail({
      to: data.email,
      replyTo: ownerInbox,
      subject: `Thanks for reaching out, ${data.name.split(" ")[0]}`,
      html: layout(
        `Thanks, ${data.name.split(" ")[0]} — I've got your message`,
        `<p style="font-size:15px;line-height:1.6">I'll read it personally and reply within one working day, usually sooner. If you'd like to keep the conversation going in real time, <a href="${site.url}/chat">sign in to chat on my site</a> with this email address.</p>
        <p style="font-size:15px;line-height:1.6">Talk soon,<br/>${escapeHtml(site.name)}</p>`,
      ),
    }).catch((e) => console.error("[contact] confirmation failed", e));

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[contact] send failed", e);
    return NextResponse.json({ error: "I couldn't send your message right now." }, { status: 500 });
  }
}
