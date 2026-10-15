import { NextResponse } from "next/server";
import { getViewer } from "@/lib/auth";
import { getConversation, saveProject } from "@/lib/chat-store";
import { projectSchema } from "@/lib/validations";

export const runtime = "nodejs";

/** Saves the project summary beside a conversation. Admin only; clients see it read-only. */
export async function PUT(req: Request) {
  const viewer = await getViewer();
  if (!viewer?.isAdmin) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const json = (await req.json().catch(() => null)) as { conversationId?: unknown; project?: unknown } | null;
  const conversation = await getConversation(viewer, String(json?.conversationId ?? ""));
  if (!conversation) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const parsed = projectSchema.safeParse(json?.project);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Check the project details." }, { status: 400 });
  }

  return NextResponse.json({ project: await saveProject(conversation.id, parsed.data) });
}
