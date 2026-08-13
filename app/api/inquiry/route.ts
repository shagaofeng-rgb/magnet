import { createHash, randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { inquirySchema } from "@/lib/inquiry-schema";

const recent = new Map<string, number>();
const windowMs = 60_000;

export async function POST(request: NextRequest) {
  const requestId = randomUUID();
  try {
    const body: unknown = await request.json();
    if (body && typeof body === "object" && "website" in body && typeof body.website === "string" && body.website) return NextResponse.json({ success: true, requestId });
    const parsed = inquirySchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ success: false, error: "Please review the highlighted fields.", requestId }, { status: 400 });
    const key = createHash("sha256").update(`${request.headers.get("x-forwarded-for") || "local"}:${parsed.data.businessEmail}`).digest("hex");
    const now = Date.now();
    if ((recent.get(key) || 0) > now - windowMs) return NextResponse.json({ success: false, error: "Please wait a moment before submitting another enquiry.", requestId }, { status: 429 });
    recent.set(key, now);
    // Future integrations (Resend, HubSpot, Salesforce or CRM) belong here, using server-only environment variables.
    return NextResponse.json({ success: true, requestId, message: "Your request has been received. Our sales team will reply within 24 hours." });
  } catch {
    return NextResponse.json({ success: false, error: "We could not process your request. Please try again.", requestId }, { status: 500 });
  }
}
