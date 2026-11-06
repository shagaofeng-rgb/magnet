import { NextRequest, NextResponse } from "next/server";
import { createHash, randomUUID } from "node:crypto";
import { storeInternalLead } from "@/lib/admin-store";
import { companyEmail } from "@/lib/contact";
import { deliverInquiryEmails } from "@/lib/inquiry-delivery";
import { isSubmissionId, isValidInquiry } from "@/lib/inquiry-validation";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const requestId = randomUUID();
  const fail = (error: string, status: number) => NextResponse.json({ success: false, error, requestId }, { status });
  if (process.env.VERCEL_ENV === "preview") return fail("preview_submission_disabled", 503);
  const sentOrigin = request.headers.get("origin");
  if (sentOrigin && sentOrigin !== request.nextUrl.origin) return fail("origin_not_allowed", 403);
  const input: unknown = await request.json().catch(() => null);
  const submissionId = request.headers.get("idempotency-key")?.toLowerCase();
  if (!isValidInquiry(input) || (submissionId !== undefined && !isSubmissionId(submissionId))) return fail("invalid_request", 400);

  const leadId = submissionId || randomUUID();
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  const email = input.email.toLowerCase();
  const rateHash = createHash("sha256").update(`${ip}:${email}`).digest("hex");
  const minute = Math.floor(Date.now() / 60_000);
  // The reserved company address plus an explicit marker keeps our own delivery
  // checks visible in the queue without treating them as customer enquiries.
  const testSubmission = email === companyEmail && input.attribution?.context === "internal-delivery-check";
  try {
    const attribution = { ...input.attribution, ...(testSubmission ? { test_submission: true } : {}) };
    const saved = await storeInternalLead(leadId, `inquiry-rate:${rateHash}:${minute}`, input, attribution);
    if (!saved) return fail("rate_limited", 429);
    if ("conflict" in saved) return fail("submission_conflict", 409);
    let notificationSent = saved.notificationSent;
    if (saved.created) {
      try {
        notificationSent = (await deliverInquiryEmails(leadId)).accepted === 1;
      } catch {
        console.error("Inquiry email job could not be updated", { requestId, leadId });
      }
    }
    return NextResponse.json({
      success: true, data: { id: leadId, notificationSent, ...(testSubmission ? { testSubmission: true } : {}) }, requestId,
    }, { status: saved.created ? 201 : 200 });
  } catch {
    console.error("Inquiry could not be saved", { requestId });
    return fail("submission_failed", 500);
  }
}
