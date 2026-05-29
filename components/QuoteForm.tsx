"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { products } from "@/data/products";

type QuoteFormProps = {
  compact?: boolean;
  defaultProduct?: string;
};

export function QuoteForm({ compact = false, defaultProduct = "" }: QuoteFormProps) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  async function submit(formData: FormData) {
    setStatus("submitting");
    const payload = Object.fromEntries(formData.entries());
    payload.sourcePath = window.location.pathname;
    payload.utm = window.location.search;

    const response = await fetch("/api/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setStatus(response.ok ? "success" : "error");
  }

  return (
    <form action={submit} className={`quote-form ${compact ? "quote-form-compact" : ""}`}>
      <div className="field-grid">
        <label>
          Name
          <input name="name" required placeholder="Your name" />
        </label>
        <label>
          Email
          <input name="email" type="email" required placeholder="name@company.com" />
        </label>
        <label>
          Country
          <input name="country" required placeholder="Country / region" />
        </label>
        <label>
          WhatsApp
          <input name="whatsapp" placeholder="+86 ..." />
        </label>
        {!compact && (
          <>
            <label>
              Industry
              <input name="industry" placeholder="Mining, recycling, cement..." />
            </label>
            <label>
              Material
              <input name="material" placeholder="Ore, coal, aggregate, waste..." />
            </label>
            <label>
              Belt Width
              <input name="beltWidth" placeholder="e.g. 800 mm" />
            </label>
            <label>
              Installation Method
              <input name="installation" placeholder="Cross-belt, inline, chute..." />
            </label>
          </>
        )}
        <label className="field-wide">
          Required Product
          <select name="requiredProduct" defaultValue={defaultProduct}>
            <option value="">Select product</option>
            {products.map((product) => (
              <option key={product.slug} value={product.name}>
                {product.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field-wide">
          Product Requirement / Message
          <textarea name="message" required placeholder="Tell us your material, belt width, capacity, installation height, and target iron removal result." rows={compact ? 4 : 6} />
        </label>
        {!compact && (
          <label className="field-wide">
            Upload Drawing / Photo
            <input name="attachmentNote" placeholder="Paste a file link or note that drawings/photos are available" />
          </label>
        )}
      </div>
      <button className="btn btn-primary" type="submit" disabled={status === "submitting"}>
        <Send size={17} aria-hidden />
        {status === "submitting" ? "Sending..." : "Submit Inquiry"}
      </button>
      {status === "success" && (
        <p className="form-success">Thank you. Our sales team will contact you soon.</p>
      )}
      {status === "error" && (
        <p className="form-error">The form could not be sent. Please email us directly and we will help you quickly.</p>
      )}
    </form>
  );
}
