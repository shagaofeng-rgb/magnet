import { NextRequest, NextResponse } from "next/server";
import { locales } from "@/lib/i18n";
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/") return NextResponse.redirect(new URL("/en/", request.url), 308);
  const first = pathname.split("/")[1];
  if (!locales.includes(first as never) && !pathname.startsWith("/admin") && !pathname.startsWith("/api") && !pathname.includes(".")) return NextResponse.redirect(new URL(`/en${pathname}`, request.url), 308);
  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options","nosniff");
  response.headers.set("Referrer-Policy","strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy","camera=(), microphone=(), geolocation=()");
  return response;
}
export const config={matcher:["/((?!_next/static|_next/image|favicon.ico).*)"]};
