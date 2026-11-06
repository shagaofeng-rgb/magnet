import test from "node:test";
import assert from "node:assert/strict";
import { isSubmissionId, isValidInquiry, isValidInquiryAttribution } from "../lib/inquiry-validation.ts";
import { campaignValue, externalReferrerHost, isProductDetailPath } from "../lib/site-attribution.ts";

test("accepts localized product names and URL attribution", () => {
  assert.equal(isValidInquiryAttribution({ product_name: "فاصل مغناطيسي & صيانة", source: "/ar/request-quote?utm_source=google&x=1" }), true);
  assert.equal(isValidInquiryAttribution({ product_name: "Магнитный сепаратор (RCYD)", locale: "ru" }), true);
});

test("rejects unknown, oversized, and control-character attribution", () => {
  assert.equal(isValidInquiryAttribution({ unauthorized: "value" }), false);
  assert.equal(isValidInquiryAttribution({ source: "x".repeat(121) }), false);
  assert.equal(isValidInquiryAttribution({ source: "/en\nspoofed" }), false);
  assert.equal(isValidInquiryAttribution([]), false);
});

test("inquiries require real text, consent and valid retry IDs", () => {
  const valid = { name: "QA User", company: "QA Company", email: "test@example.com", material: "Dry crushed ore", process: "Conveyor separation", consent: true };
  assert.equal(isValidInquiry(valid), true);
  assert.equal(isValidInquiry({ ...valid, material: " ".repeat(20) }), false);
  assert.equal(isValidInquiry({ ...valid, consent: false }), false);
  assert.equal(isSubmissionId("a789eeb1-0e01-4419-92b7-852b07c822a1"), true);
  assert.equal(isSubmissionId("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"), false);
});

test("analytics keeps referrer hosts and distinguishes products from catalog pages", () => {
  assert.equal(externalReferrerHost("https://www.google.com/search?q=private", "bzmagnet.com"), "www.google.com");
  assert.equal(externalReferrerHost("https://www.bzmagnet.com/en", "bzmagnet.com"), undefined);
  assert.equal(campaignValue(" crusher-guide "), "crusher-guide");
  assert.equal(campaignValue("user@example.com"), undefined);
  assert.equal(isProductDetailPath("/en/products/mineral-bulk-separation"), false);
  assert.equal(isProductDetailPath("/en/products/category/old-family"), false);
  assert.equal(isProductDetailPath("/ar/products/mineral-bulk-separation/model-123"), true);
});
