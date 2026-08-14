import { NextRequest, NextResponse } from "next/server";
import { reviewNewsCandidates } from "@/lib/news-automation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });
  const data = await reviewNewsCandidates();
  return NextResponse.json({ success: data.success, data, error: data.success ? undefined : data.reasons?.join(", ") }, { status: data.success ? 200 : 503 });
}
