import { NextResponse } from "next/server";
import { z } from "zod";
import { getViewer } from "@/lib/auth";
import { ALLOWED_REACTIONS, MAX_MESSAGE_LENGTH } from "@/lib/chat";
import { editMessage, getConversation, reactToMessage } from "@/lib/chat-store";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("edit"), conversationId: z.string(), body: z.string().trim().min(1).max(MAX_MESSAGE_LENGTH) }),
  z.object({
    action: z.literal("react"),
    conversationId: z.string(),
    emoji: z.string().refine((e) => ALLOWED_REACTIONS.has(e)).nullable(),
  }),
]);

/** Edits one of your own messages, or sets/clears your reaction on any message. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const viewer = await getViewer();
  if (!viewer) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  if (!rateLimit(`chat-update:${viewer.id}`, 60, 60 * 1000)) {
    return NextResponse.json({ error: "Slow down a little and try again." }, { status: 429 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const input = parsed.data;

  const conversation = await getConversation(viewer, input.conversationId);
  if (!conversation) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const { id } = await params;
  if (input.action === "edit") {
    const message = await editMessage(viewer, conversation.id, id, input.body);
    if (!message) return NextResponse.json({ error: "Messages can only be edited for 2 minutes after sending." }, { status: 409 });
    return NextResponse.json({ message });
  }

  const message = await reactToMessage(viewer, conversation.id, id, input.emoji);
  if (!message) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ message });
}
