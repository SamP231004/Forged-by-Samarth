import { after, NextResponse } from "next/server";
import { getViewer, type Viewer } from "@/lib/auth";
import { displayName, MAX_ATTACHMENT_BYTES, MAX_MESSAGE_LENGTH, type Conversation, type Message } from "@/lib/chat";
import { claimNotification, getConversation, listMessages, markRead, sendMessage } from "@/lib/chat-store";
import { layout, ownerInbox, sendEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { site } from "@/lib/site";
import { escapeHtml } from "@/lib/utils";
import { ACCEPTED_FILE_TYPES } from "@/lib/validations";

export const runtime = "nodejs";

/** New messages since `after` (or the latest page). Fetching a thread marks it read. */
export async function GET(req: Request) {
  const viewer = await getViewer();
  if (!viewer) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const url = new URL(req.url);
  const conversation = await getConversation(viewer, url.searchParams.get("conversationId") ?? "");
  if (!conversation) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const afterParam = url.searchParams.get("after");
  const after = afterParam ? new Date(afterParam) : undefined;
  if (after && Number.isNaN(after.getTime())) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const [messages] = await Promise.all([listMessages(conversation.id, after), markRead(viewer, conversation.id)]);
  return NextResponse.json({ messages }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  const viewer = await getViewer();
  if (!viewer) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  if (!rateLimit(`chat-send:${viewer.id}`, 30, 60 * 1000)) {
    return NextResponse.json({ error: "You're sending messages too quickly. Please wait a moment." }, { status: 429 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const conversation = await getConversation(viewer, String(form.get("conversationId") ?? ""));
  if (!conversation) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const body = String(form.get("body") ?? "").trim();
  if (body.length > MAX_MESSAGE_LENGTH) return NextResponse.json({ error: "That message is too long." }, { status: 400 });

  const upload = form.get("file");
  let file: { name: string; type: string; data: Buffer } | null = null;
  if (upload instanceof File && upload.size > 0) {
    if (upload.size > MAX_ATTACHMENT_BYTES) return NextResponse.json({ error: "Files must be under 4 MB." }, { status: 400 });
    if (!ACCEPTED_FILE_TYPES.includes(upload.type)) {
      return NextResponse.json({ error: "Please attach a PDF, image, Word document, text file or ZIP." }, { status: 400 });
    }
    file = { name: upload.name.slice(0, 200), type: upload.type, data: Buffer.from(await upload.arrayBuffer()) };
  }
  if (!body && !file) return NextResponse.json({ error: "Write a message or attach a file." }, { status: 400 });

  const message = await sendMessage(viewer, conversation.id, body, file);

  // Let the other side know by email once the response has gone out.
  after(() => notify(viewer, conversation, message).catch((e) => console.error("[chat] notification failed", e)));

  return NextResponse.json({ message });
}

async function notify(viewer: Viewer, conversation: Conversation, message: Message) {
  const recipient = await claimNotification(viewer, message);
  if (!recipient) return;

  const preview = message.body
    ? `<p style="white-space:pre-wrap;font-size:14px;line-height:1.6;margin:16px 0;padding:14px 16px;background:#f4f4f5;border-radius:12px">${escapeHtml(message.body.slice(0, 1200))}</p>`
    : `<p style="font-size:14px;color:#71717a">Sent an attachment: ${escapeHtml(message.attachment_name ?? "file")}</p>`;
  const button = (href: string, label: string) =>
    `<p style="margin:24px 0 0"><a href="${href}" style="display:inline-block;background:#18181b;color:#fff;text-decoration:none;padding:12px 20px;border-radius:999px;font-size:14px">${label}</a></p>`;

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
}
