import { NextRequest, NextResponse } from "next/server";
import { inspectSearchConsoleUrls } from "@/lib/search-console";

export const runtime = "nodejs";

function authorized(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  return [process.env.CRON_SECRET, process.env.SEARCH_CONSOLE_SYNC_SECRET].some((secret) => Boolean(secret && authorization === `Bearer ${secret}`));
}

export async function POST(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ ok: false, code: "unauthorized" }, { status: 401 });
  try {
    const result = await inspectSearchConsoleUrls("bzmagnet");
    return NextResponse.json({ ok: result.configured, configured: result.configured, inspected: result.inspected, results: result.results, code: "code" in result ? result.code : undefined }, { status: result.configured ? 200 : 409 });
  } catch (error) {
    const code = error instanceof Error ? error.message.replace(/[^a-z0-9_-]/gi, "_").slice(0, 120) : "search_console_inspection_failed";
    return NextResponse.json({ ok: false, code }, { status: 502 });
  }
}
