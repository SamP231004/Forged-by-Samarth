import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  const result = await auth.api.signOut({ headers: request.headers, asResponse: true });
  const response = NextResponse.redirect(new URL("/", request.url), { status: 303 });
  for (const cookie of result.headers.getSetCookie()) response.headers.append("Set-Cookie", cookie);
  return response;
}
