import { NextRequest, NextResponse } from "next/server";
import { deliverInquiryEmails } from "@/lib/inquiry-delivery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, code: "unauthorized" }, { status: 401 });
  }
  try {
    const result = await deliverInquiryEmails();
    return NextResponse.json({ ok: true, ...result, failed: result.attempted - result.accepted });
  } catch {
    console.error("Inquiry email retry could not finish");
    return NextResponse.json({ ok: false, code: "inquiry_email_retry_failed" }, { status: 502 });
  }
}
