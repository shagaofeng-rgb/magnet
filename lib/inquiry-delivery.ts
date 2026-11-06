import "server-only";

import { claimInquiryEmails, decryptInquiry, finishInquiryEmail } from "@/lib/admin-store";
import { sendInquiryNotification } from "@/lib/inquiry-email";

export async function deliverInquiryEmails(leadId?: string) {
  const jobs = await claimInquiryEmails(leadId);
  const results = await Promise.all(jobs.map(async (job) => {
    let outcome: { sent: true; messageId: string } | { sent: false; code: string };
    try {
      const inquiry = decryptInquiry(job.encrypted_payload);
      const result = await sendInquiryNotification(job.lead_id, inquiry, inquiry.attribution || {});
      outcome = result.sent ? result : { sent: false, code: result.code };
    } catch {
      outcome = { sent: false, code: "email_delivery_failed" };
    }
    await finishInquiryEmail(job, outcome);
    return outcome.sent;
  }));
  return { attempted: results.length, accepted: results.filter(Boolean).length };
}
