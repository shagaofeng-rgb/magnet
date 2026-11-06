export type InquiryAttribution = {
  context?: string;
  product?: string;
  product_name?: string;
  locale?: string;
  source?: string;
  landing_page?: string;
  referrer_host?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
};

const attributionKeys = new Set([
  "context", "product", "product_name", "locale", "source", "landing_page", "referrer_host",
  "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term",
]);

export type Inquiry = {
  name: string;
  email: string;
  company: string;
  industry?: string;
  material: string;
  process: string;
  consent: "on" | true;
  website?: string;
  attribution?: InquiryAttribution;
};

export const isSubmissionId = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
const text = (value: unknown, min: number, max: number) => typeof value === "string" && value.trim().length >= min && value.length <= max;

export function isValidInquiry(value: unknown): value is Inquiry {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const input = value as Record<string, unknown>;
  return text(input.name, 2, 80) && text(input.email, 3, 160) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email as string)
    && text(input.company, 2, 120) && (input.industry === undefined || text(input.industry, 0, 100))
    && text(input.material, 10, 1500) && text(input.process, 10, 2500) && (input.consent === "on" || input.consent === true)
    && (input.website === undefined || input.website === "") && (input.attribution === undefined || isValidInquiryAttribution(input.attribution));
}

export function isValidInquiryAttribution(value: unknown): value is InquiryAttribution {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  // Localized product names and URLs need Unicode and ordinary punctuation.
  // Control characters are never useful in an attribution field.
  return Object.entries(value).every(([key, item]) =>
    attributionKeys.has(key) && typeof item === "string" && item.length <= 120 && !/[\u0000-\u001f\u007f]/u.test(item));
}
