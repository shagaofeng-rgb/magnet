import { NextRequest, NextResponse } from "next/server";
import { runSearchConsoleCycle } from "@/lib/search-console";

export const runtime = "nodejs";
export const maxDuration = 120;

function authorized(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  return [process.env.CRON_SECRET, process.env.SEARCH_CONSOLE_SYNC_SECRET].some((secret) => Boolean(secret && authorization === `Bearer ${secret}`));
}

export async function POST(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ ok: false, code: "unauthorized" }, { status: 401 });
  const result = await runSearchConsoleCycle("bzmagnet");
  return NextResponse.json(result.body, { status: result.status });
}
