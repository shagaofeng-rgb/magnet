import "server-only";

import nodemailer from "nodemailer";

type InquiryPayload = {
  name: string;
  email: string;
  company: string;
  industry?: string;
  material: string;
  process: string;
};

type Attribution = Record<string, string | undefined>;

const escapeHtml = (value: string | undefined) => (value || "—")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#039;");

function configuration() {
  const host = process.env.BZMAGNET_SMTP_HOST;
  const user = process.env.BZMAGNET_SMTP_USER;
  const pass = process.env.BZMAGNET_SMTP_PASSWORD;
  const to = process.env.BZMAGNET_EMAIL_TO;
  const from = process.env.BZMAGNET_EMAIL_FROM || user;
  if (!host || !user || !pass || !to || !from) return null;
  return { host, user, pass, to, from, port: Number(process.env.BZMAGNET_SMTP_PORT || 465) };
}

export async function sendInquiryNotification(leadId: string, inquiry: InquiryPayload, attribution: Attribution) {
  const config = configuration();
  if (!config) return { sent: false, code: "smtp_not_configured" as const };

  const transport = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: { user: config.user, pass: config.pass },
  });
  const subject = `[BZMAGNET] New enquiry ${leadId.slice(0, 8)}`;
  const details = [
    ["Name", inquiry.name],
    ["Email", inquiry.email],
    ["Company", inquiry.company],
    ["Industry", inquiry.industry],
    ["Material", inquiry.material],
    ["Process details", inquiry.process],
    ["Product", attribution.product_name || attribution.product],
    ["Source page", attribution.source],
    ["Language", attribution.locale],
  ];
  const text = details.map(([label, value]) => `${label}: ${value || "—"}`).join("\n");
  const html = `<main style="font-family:Arial,sans-serif;color:#14263D;line-height:1.55"><h1 style="font-size:20px">New BZMAGNET enquiry</h1><p>Lead ID: ${escapeHtml(leadId)}</p><table style="border-collapse:collapse;width:100%;max-width:680px">${details.map(([label, value]) => `<tr><th style="text-align:left;padding:8px;border-bottom:1px solid #d8e0e6;vertical-align:top;width:150px">${escapeHtml(label)}</th><td style="padding:8px;border-bottom:1px solid #d8e0e6;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`).join("")}</table></main>`;
  const result = await transport.sendMail({
    from: `BZMAGNET Enquiries <${config.from}>`,
    to: config.to,
    replyTo: inquiry.email,
    subject,
    text,
    html,
    headers: { "X-BZMAGNET-Lead-ID": leadId },
  });
  return { sent: true, messageId: result.messageId };
}
