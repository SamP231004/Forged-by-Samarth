import { Readable } from "node:stream";
import { NextResponse } from "next/server";
import { getViewer } from "@/lib/auth";
import { openAttachment } from "@/lib/chat-store";

export const runtime = "nodejs";

/** Types the browser may show inline; everything else downloads. */
const INLINE_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/webp", "text/plain"];

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const viewer = await getViewer();
  if (!viewer) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const file = await openAttachment(viewer, (await params).id);
  if (!file) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const disposition = INLINE_TYPES.includes(file.contentType) ? "inline" : "attachment";
  return new Response(Readable.toWeb(file.stream) as ReadableStream, {
    headers: {
      "Content-Type": file.contentType,
      "Content-Length": String(file.size),
      "Content-Disposition": `${disposition}; filename*=UTF-8''${encodeURIComponent(file.filename)}`,
      "Cache-Control": "private, max-age=3600",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "sandbox",
    },
  });
}
