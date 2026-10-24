import test from "node:test";
import assert from "node:assert/strict";
import { isValidInquiryAttribution } from "../lib/inquiry-validation.ts";

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
