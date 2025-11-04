import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@lib/auth";

// noinspection JSUnusedGlobalSymbols
export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-chinook-user-id", session.user.id);

  return NextResponse.next({
    request: {
      headers: requestHeaders
    }
  });
}

// noinspection JSUnusedGlobalSymbols
export const config = {
  matcher: [
    "/search",
    "/artists",
    "/employees",
    "/api/internal/:path*"
  ]
};
