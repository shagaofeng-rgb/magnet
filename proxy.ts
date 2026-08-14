import { NextRequest, NextResponse } from "next/server";
import { locales } from "@/lib/i18n";
const blockedCountries = new Set(["CN", "IN"]);
function blockedResponse() {
  return new NextResponse("<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"><meta name=\"robots\" content=\"noindex\"><title>Access unavailable</title></head><body><main><h1>Access unavailable</h1><p>This website is not available in your region.</p></main></body></html>", { status: 403, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex" } });
}
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const internalSync = pathname === "/api/admin/search-console/sync" && Boolean(process.env.CRON_SECRET) && request.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`;
  const country = request.headers.get("x-vercel-ip-country")?.toUpperCase();
  if (country && blockedCountries.has(country) && !internalSync) return blockedResponse();
  if (pathname === "/") return NextResponse.redirect(new URL("/en/", request.url), 308);
  if (pathname.startsWith("/ar/%D8%A7%D9%84%D9%85%D8%B9%D8%AF%D8%A7%D8%AA/") || pathname.startsWith("/ar/المعدات/")) {
    const rewritten = request.nextUrl.clone();
    rewritten.pathname = pathname.replace(/^\/ar\/(?:%D8%A7%D9%84%D9%85%D8%B9%D8%AF%D8%A7%D8%AA|المعدات)\//, "/ar/equipment/");
    return NextResponse.rewrite(rewritten);
  }
  const first = pathname.split("/")[1];
  if (!locales.includes(first as never) && !pathname.startsWith("/admin") && !pathname.startsWith("/api") && !pathname.includes(".")) return NextResponse.redirect(new URL(`/en${pathname}`, request.url), 308);
  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options","nosniff");
  response.headers.set("Referrer-Policy","strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy","camera=(), microphone=(), geolocation=()");
  return response;
}
export const config={matcher:["/((?!_next/static|_next/image|favicon.ico).*)"]};
