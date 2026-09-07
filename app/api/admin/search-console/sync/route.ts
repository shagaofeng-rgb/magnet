import { NextRequest, NextResponse } from "next/server";
import { submitSearchConsoleSitemap, syncSearchConsoleMetrics } from "@/lib/search-console";

export const runtime = "nodejs";

function authorized(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  return [process.env.CRON_SECRET, process.env.SEARCH_CONSOLE_SYNC_SECRET].some((secret) => Boolean(secret && authorization === `Bearer ${secret}`));
}

export async function POST(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ ok: false, code: "unauthorized" }, { status: 401 });
  try {
    const metrics = await syncSearchConsoleMetrics("bzmagnet");
    if (!metrics.configured) return NextResponse.json({ ok: false, configured: false, rows: 0 }, { status: 409 });
    const submission = await submitSearchConsoleSitemap("bzmagnet");
    return NextResponse.json({
      ok: true,
      configured: true,
      rows: metrics.rows,
      property: metrics.property,
      startDate: metrics.startDate,
      endDate: metrics.endDate,
      sitemapSubmitted: submission.submitted,
      sitemapUrl: submission.sitemapUrl,
      submissionCode: "code" in submission ? submission.code : undefined,
    });
  } catch (error) {
    const code = error instanceof Error ? error.message.replace(/[^a-z0-9_-]/gi, "_").slice(0, 120) : "search_console_sync_failed";
    return NextResponse.json({ ok: false, code }, { status: 502 });
  }
}
