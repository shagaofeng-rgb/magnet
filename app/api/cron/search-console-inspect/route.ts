import { NextRequest, NextResponse } from "next/server";
import { inspectSearchConsoleUrls } from "@/lib/search-console";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, code: "unauthorized" }, { status: 401 });
  }
  try {
    const result = await inspectSearchConsoleUrls("bzmagnet");
    return NextResponse.json({ ok: result.configured, configured: result.configured, inspected: result.inspected, code: "code" in result ? result.code : undefined }, { status: result.configured ? 200 : 409 });
  } catch (error) {
    const code = error instanceof Error ? error.message.replace(/[^a-z0-9_-]/gi, "_").slice(0, 120) : "search_console_inspection_failed";
    return NextResponse.json({ ok: false, code }, { status: 502 });
  }
}
