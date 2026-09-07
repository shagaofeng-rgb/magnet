import { NextRequest, NextResponse } from "next/server";
import { submitSearchConsoleSitemap, syncSearchConsoleMetrics } from "@/lib/search-console";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, code: "unauthorized" }, { status: 401 });
  }
  try {
    const metrics = await syncSearchConsoleMetrics("bzmagnet");
    if (!metrics.configured) return NextResponse.json({ ok: false, configured: false, rows: 0 }, { status: 409 });

    // A failed sitemap submission is recorded but never discards successful
    // performance data synchronization.
    const submission = await submitSearchConsoleSitemap("bzmagnet");
    return NextResponse.json({
      ok: true,
      configured: true,
      rows: metrics.rows,
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
