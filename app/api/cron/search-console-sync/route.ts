import { NextRequest, NextResponse } from "next/server";
import { runSearchConsoleCycle } from "@/lib/search-console";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, code: "unauthorized" }, { status: 401 });
  }
  const result = await runSearchConsoleCycle("bzmagnet");
  return NextResponse.json(result.body, { status: result.status });
}
