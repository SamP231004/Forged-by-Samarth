import { NextResponse } from "next/server";
import { getViewer } from "@/lib/auth";
import { listConversations } from "@/lib/chat-store";

export const runtime = "nodejs";

/** The inbox list, polled by the admin view. */
export async function GET() {
  const viewer = await getViewer();
  if (!viewer?.isAdmin) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ conversations: await listConversations() }, { headers: { "Cache-Control": "no-store" } });
}
