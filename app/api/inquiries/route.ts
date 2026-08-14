import { NextRequest, NextResponse } from "next/server";
import { createHash, randomUUID } from "node:crypto";
import { completeAdminJob, storeInternalLead, writeAdminJob } from "@/lib/admin-store";
import { sendInquiryNotification } from "@/lib/inquiry-email";

type Attribution = { context?: string; product?: string; product_name?: string; locale?: string; source?: string; utm_source?: string; utm_medium?: string; utm_campaign?: string; utm_content?: string; utm_term?: string };
type Inquiry = { name: string; email: string; company: string; industry?: string; material: string; process: string; consent: "on" | true; website?: string; attribution?: Attribution };

const text = (value: unknown, min: number, max: number) => typeof value === "string" && value.length >= min && value.length <= max;
const attributionKeys = new Set(["context", "product", "product_name", "locale", "source", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]);
function validAttribution(value: unknown): value is Attribution {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return Object.entries(value).every(([key, item]) => attributionKeys.has(key) && typeof item === "string" && item.length <= 120 && /^[\w .,:/+\-]*$/u.test(item));
}
function valid(value: unknown): value is Inquiry {
  if (!value || typeof value !== "object") return false;
  const input = value as Record<string, unknown>;
  return text(input.name, 2, 80) && text(input.email, 3, 160) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email as string) && text(input.company, 2, 120) && (!input.industry || text(input.industry, 0, 100)) && text(input.material, 10, 1500) && text(input.process, 10, 2500) && (input.consent === "on" || input.consent === true) && (!input.website || input.website === "") && (!input.attribution || validAttribution(input.attribution));
}

const recent = new Map<string, number>();

export async function POST(request: NextRequest) {
  const requestId = randomUUID();
  try {
    const input: unknown = await request.json();
    if (!valid(input)) return NextResponse.json({ success: false, error: "invalid_request", requestId }, { status: 400 });
    const key = createHash("sha256").update(`${request.headers.get("x-forwarded-for") || "local"}:${input.email}`).digest("hex");
    const now = Date.now();
    if ((recent.get(key) || 0) > now - 60_000) return NextResponse.json({ success: false, error: "rate_limited", requestId }, { status: 429 });
    recent.set(key, now);

    const leadId = await storeInternalLead(input as Record<string, unknown>, (input.attribution || {}) as Record<string, unknown>);
    const jobKey = `inquiry-email:${leadId}`;
    await writeAdminJob("bzmagnet", "inquiry_email_notification", jobKey, { leadId, requestId });
    try {
      const notification = await sendInquiryNotification(leadId, input, input.attribution || {});
      await completeAdminJob("bzmagnet", jobKey, notification.sent ? "succeeded" : "failed", notification.sent ? { messageId: notification.messageId } : { code: notification.code });
    } catch {
      await completeAdminJob("bzmagnet", jobKey, "failed", { code: "email_delivery_failed" });
    }
    return NextResponse.json({ success: true, data: { id: leadId }, requestId }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: "submission_failed", requestId }, { status: 400 });
  }
}
