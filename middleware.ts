import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export function middleware(request: NextRequest) {
  return updateSession(request);
}

// Only the signed-in parts of the site need a session; marketing pages stay static.
export const config = {
  matcher: ["/chat/:path*", "/inbox/:path*", "/login", "/api/chat/:path*"],
};
