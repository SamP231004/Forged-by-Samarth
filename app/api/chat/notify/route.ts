import { NextResponse } from "next/server";
import { z } from "zod";
import { displayName, type Conversation, type Message } from "@/lib/chat";
import { layout, ownerInbox, sendEmail } from "@/lib/email";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { site } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";
import { escapeHtml } from "@/lib/utils";

export const runtime = "nodejs";

const bodySchema = z.object({ conversationId: z.string().uuid() });

/**
 * Emails the other side of a conversation about a new message. The database
 * decides who (if anyone) to notify, so this can't be used to spam.
 */
export async function POST(req: Request) {
  if (!rateLimit(`chat-notify:${clientIp(req)}`, 30)) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const { conversationId } = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { data: recipient } = await supabase.rpc("claim_notification", { p_conversation: conversationId });
  if (recipient !== "owner" && recipient !== "client") return NextResponse.json({ ok: true, notified: false });

  const [{ data: conversation }, { data: latest }] = await Promise.all([
    supabase.from("conversations").select("*").eq("id", conversationId).single<Conversation>(),
    supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle<Message>(),
  ]);
  if (!conversation || !latest) return NextResponse.json({ ok: true, notified: false });

  const preview = latest.body
    ? `<p style="white-space:pre-wrap;font-size:14px;line-height:1.6;margin:16px 0;padding:14px 16px;background:#f4f4f5;border-radius:12px">${escapeHtml(latest.body.slice(0, 1200))}</p>`
    : `<p style="font-size:14px;color:#71717a">Sent an attachment: ${escapeHtml(latest.attachment_name ?? "file")}</p>`;
  const button = (href: string, label: string) =>
    `<p style="margin:24px 0 0"><a href="${href}" style="display:inline-block;background:#18181b;color:#fff;text-decoration:none;padding:12px 20px;border-radius:999px;font-size:14px">${label}</a></p>`;

  try {
    if (recipient === "owner") {
      const name = displayName(conversation);
      await sendEmail({
        to: ownerInbox,
        replyTo: conversation.client_email,
        subject: `New message from ${name}`,
        html: layout(`New message from ${name}`, preview + button(`${site.url}/inbox?c=${conversation.id}`, "Reply in inbox")),
      });
    } else {
      await sendEmail({
        to: conversation.client_email,
        subject: `${site.name} replied to your message`,
        html: layout(
          `${site.name.split(" ")[0]} replied`,
          preview +
            button(`${site.url}/chat`, "Open the conversation") +
            `<p style="font-size:12px;color:#71717a;margin-top:16px">Reply on the site so everything stays in one place.</p>`,
        ),
      });
    }
    return NextResponse.json({ ok: true, notified: true });
  } catch (e) {
    console.error("[chat/notify] send failed", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
