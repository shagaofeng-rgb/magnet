import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_FILE = /\.(.*)$/;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/commission") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/videos") ||
    pathname === "/robots.txt" ||
    (pathname !== "/sitemap.xml" && PUBLIC_FILE.test(pathname))
  ) {
    return NextResponse.next();
  }

  return new NextResponse(
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, nofollow, noarchive">
    <title>Website Unavailable</title>
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 24px;
        color: #1f2937;
        background: #f4f6f8;
        font-family: Arial, "Microsoft YaHei", sans-serif;
      }
      main { text-align: center; }
      h1 { margin: 0 0 12px; font-size: 28px; font-weight: 600; }
      p { margin: 0; color: #6b7280; font-size: 15px; }
    </style>
  </head>
  <body>
    <main>
      <h1>Website temporarily unavailable</h1>
      <p>Please contact the project owner if you need access.</p>
    </main>
  </body>
</html>`,
    {
      status: 503,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store, max-age=0",
        "X-Robots-Tag": "noindex, nofollow, noarchive",
        "Retry-After": "86400"
      }
    }
  );
}

export const config = {
  matcher: ["/((?!_next|api|images|favicon.ico).*)"]
};
