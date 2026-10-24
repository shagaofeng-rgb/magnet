export type InquiryAttribution = {
  context?: string;
  product?: string;
  product_name?: string;
  locale?: string;
  source?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
};

const attributionKeys = new Set([
  "context", "product", "product_name", "locale", "source",
  "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term",
]);

export function isValidInquiryAttribution(value: unknown): value is InquiryAttribution {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  // Localized product names and URLs need Unicode and ordinary punctuation.
  // Control characters are never useful in an attribution field.
  return Object.entries(value).every(([key, item]) =>
    attributionKeys.has(key) && typeof item === "string" && item.length <= 120 && !/[\u0000-\u001f\u007f]/u.test(item));
}
