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

  return NextResponse.next();
}

// noinspection JSUnusedGlobalSymbols
export const config = {
  matcher: [
    "/artists",
    "/employees",
    "/api/internal/:path*"
  ]
};
