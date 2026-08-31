import { NextRequest, NextResponse } from "next/server";
import { syncSearchConsoleMetrics } from "@/lib/search-console";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, code: "unauthorized" }, { status: 401 });
  }
  try {
    const result = await syncSearchConsoleMetrics("bzmagnet");
    return NextResponse.json(
      { ok: result.configured, configured: result.configured, rows: result.rows, startDate: "startDate" in result ? result.startDate : undefined, endDate: "endDate" in result ? result.endDate : undefined },
      { status: result.configured ? 200 : 409 },
    );
  } catch (error) {
    const code = error instanceof Error ? error.message.replace(/[^a-z0-9_-]/gi, "_").slice(0, 120) : "search_console_sync_failed";
    return NextResponse.json({ ok: false, code }, { status: 502 });
  }
}
