import { NextRequest, NextResponse } from "next/server";
import { collectAnalyticsEvent, type AnalyticsInput } from "@/lib/analytics-quality";

export async function POST(request: NextRequest) {
  if (process.env.VERCEL_ENV === "preview") return NextResponse.json({ accepted: false, configured: false }, { status: 202 });
  if (request.headers.get("sec-gpc") === "1" || request.headers.get("dnt") === "1") return NextResponse.json({ accepted: false }, { status: 202 });
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) return NextResponse.json({ accepted: false }, { status: 403 });
  try {
    const body = await request.json() as AnalyticsInput;
    const result = await collectAnalyticsEvent(request, body);
    if (result.unavailable) return NextResponse.json({ accepted: false, configured: false }, { status: 202 });
    if (result.invalid) return NextResponse.json({ accepted: false }, { status: 400 });
    return NextResponse.json({ accepted: Boolean(result.accepted), trafficClass: result.trafficClass }, { status: 202 });
  } catch {
    return NextResponse.json({ accepted: false }, { status: 400 });
  }
}
