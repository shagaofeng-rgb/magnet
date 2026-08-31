import { NextRequest, NextResponse } from "next/server";
import { locales } from "@/lib/i18n";
const blockedCountries = new Set(["CN", "IN"]);
function secure(response: NextResponse) {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  return response;
}
function blockedResponse() {
  return secure(new NextResponse("<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"><meta name=\"robots\" content=\"noindex\"><title>Access unavailable</title></head><body><main><h1>Access unavailable</h1><p>This website is not available in your region.</p></main></body></html>", { status: 403, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex" } }));
}
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // These routes authenticate in their own server handlers. All public routes remain geo-blocked.
  const protectedAdminAccess = pathname === "/admin/login" || pathname === "/admin/bzmagnet" || pathname.startsWith("/admin/bzmagnet/");
  const protectedSync = pathname === "/api/admin/search-console/sync";
  const country = request.headers.get("x-vercel-ip-country")?.toUpperCase();
  if (country && blockedCountries.has(country) && !protectedAdminAccess && !protectedSync) return blockedResponse();
  if (pathname === "/") return secure(NextResponse.redirect(new URL("/en", request.url), 308));
  // Public pages have one slashless canonical URL. Preserve query strings while
  // normalising accidental trailing slashes in a single redirect.
  if (pathname.length > 1 && pathname.endsWith("/") && !pathname.startsWith("/api/")) {
    const canonical = request.nextUrl.clone();
    canonical.pathname = pathname.slice(0, -1);
    return secure(NextResponse.redirect(canonical, 308));
  }
  if (pathname.startsWith("/ar/%D8%A7%D9%84%D9%85%D8%B9%D8%AF%D8%A7%D8%AA/") || pathname.startsWith("/ar/المعدات/")) {
    const rewritten = request.nextUrl.clone();
    rewritten.pathname = pathname.replace(/^\/ar\/(?:%D8%A7%D9%84%D9%85%D8%B9%D8%AF%D8%A7%D8%AA|المعدات)\//, "/ar/equipment/");
    return secure(NextResponse.rewrite(rewritten));
  }
  const first = pathname.split("/")[1];
  if (!locales.includes(first as never) && !pathname.startsWith("/admin") && !pathname.startsWith("/api") && !pathname.includes(".")) return secure(NextResponse.redirect(new URL(`/en${pathname}`, request.url), 308));
  const requestHeaders = new Headers(request.headers);
  if (locales.includes(first as never)) requestHeaders.set("x-bzmagnet-locale", first);
  else requestHeaders.delete("x-bzmagnet-locale");
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  return secure(response);
}
export const config={matcher:["/((?!_next/static|_next/image|favicon.ico).*)"]};
