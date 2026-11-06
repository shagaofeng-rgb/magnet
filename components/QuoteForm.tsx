"use client";

import { useRef, useState } from "react";
import type { Locale } from "@/lib/i18n";
import type { InquiryAttribution } from "@/lib/inquiry-validation";
import { quoteCopy } from "@/lib/site-copy";
import { campaignValue, sessionAttribution } from "@/lib/site-attribution";

export function QuoteForm({ locale, productAttribution }: { locale: Locale; productAttribution?: InquiryAttribution }) {
  const [state, setState] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const attempt = useRef<{ body: string; id: string } | null>(null);
  const copy = quoteCopy[locale];

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setState(copy.sending);
    const form = event.currentTarget;
    const formData = new FormData(form);
    const body = JSON.stringify({
      ...Object.fromEntries(formData),
      attribution: { ...captureAttribution(), ...productAttribution, locale },
    });
    try {
      if (attempt.current?.body !== body) attempt.current = { body, id: crypto.randomUUID() };
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "content-type": "application/json", "idempotency-key": attempt.current.id },
        body,
        signal: AbortSignal.timeout(45_000),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || result?.success !== true) throw new Error("submission_failed");
      if (!result.data?.testSubmission) window.dispatchEvent(new Event("bzmagnet:lead-saved"));
      attempt.current = null;
      form.reset();
      delete form.dataset.analyticsStarted;
      setState(copy.received);
    } catch {
      setState(copy.error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return <form className="quote-form" method="post" data-inquiry-form onSubmit={submit} aria-busy={isSubmitting}>
    <label className="field">{copy.name}<input name="name" autoComplete="name" required minLength={2} maxLength={80} /></label>
    <label className="field">{copy.email}<input name="email" type="email" autoComplete="email" required maxLength={160} /></label>
    <label className="field">{copy.company}<input name="company" autoComplete="organization" required minLength={2} maxLength={120} /></label>
    <label className="field">{copy.industry}<input name="industry" maxLength={100} /></label>
    <label className="field full">{copy.material}<textarea name="material" required minLength={10} maxLength={1500} /></label>
    <label className="field full">{copy.process}<textarea name="process" required minLength={10} maxLength={2500} /></label>
    <label className="field full consent"><input name="consent" type="checkbox" required /> {copy.consent}</label>
    <input name="website" tabIndex={-1} autoComplete="off" className="honeypot" aria-hidden="true" />
    <div className="field full"><button className="btn btn-primary" type="submit" disabled={isSubmitting}>{isSubmitting ? copy.sending : copy.submit}</button><output className={state === copy.error ? "quote-form-error" : undefined} aria-live="polite" role="status">{state}</output></div>
  </form>;
}

function captureAttribution() {
  const params = new URLSearchParams(window.location.search);
  return {
    ...sessionAttribution(),
    source: window.location.pathname.slice(0, 120),
    context: campaignValue(params.get("context")),
  };
}
