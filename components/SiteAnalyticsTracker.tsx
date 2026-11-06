"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { analyticsOptOut, isProductDetailPath, sessionAttribution } from "@/lib/site-attribution";

const ids = new Map<string, string>();

function getId(key: string, persistent: boolean) {
  const id = ids.get(key) || crypto.randomUUID();
  try {
    const storage = persistent ? window.localStorage : window.sessionStorage;
    const existing = storage.getItem(key);
    if (existing) return existing;
    storage.setItem(key, id);
  } catch {
    ids.set(key, id);
  }
  return id;
}

function send(event: string, locale: string, path: string, target?: string) {
  if (analyticsOptOut()) return Promise.resolve();
  const source = sessionAttribution();
  return fetch("/api/analytics", {
    method: "POST",
    headers: { "content-type": "application/json" },
    keepalive: true,
    body: JSON.stringify({
      event,
      eventId: crypto.randomUUID(),
      sessionId: getId("bzmagnet_anonymous_session", false),
      visitorId: getId("bzmagnet_anonymous_visitor", true),
      path,
      locale,
      referrerHost: source.referrer_host,
      utm: { source: source.utm_source, medium: source.utm_medium, campaign: source.utm_campaign, content: source.utm_content, term: source.utm_term },
      target,
    }),
  }).then(() => undefined, () => undefined);
}

function conversionTarget(anchor: HTMLAnchorElement) {
  const url = new URL(anchor.href);
  if (url.origin === window.location.origin && /\/(request-quote|about-contact)$/.test(url.pathname)) return url.pathname;
  if (url.protocol === "mailto:") return "email";
  if (url.hostname === "wa.me") return "whatsapp";
  if (url.hostname === "maps.app.goo.gl") return "google-maps";
}

export function SiteAnalyticsTracker({ locale }: { locale: string }) {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || lastPath.current === pathname) return;
    lastPath.current = pathname;
    const detail = isProductDetailPath(pathname) && !!document.querySelector("[data-analytics-product-detail]");
    void send("page_view", locale, pathname).then(() => {
      if (detail) void send("product_view", locale, pathname);
    });
  }, [locale, pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const anchor = event.target instanceof Element && event.target.closest<HTMLAnchorElement>("a[href]");
      const target = anchor && conversionTarget(anchor);
      if (target) void send("cta_click", locale, window.location.pathname, target);
    };
    const onLeadSaved = () => void send("form_submit", locale, window.location.pathname);
    const onFocus = (event: FocusEvent) => {
      const field = event.target;
      if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement)) return;
      const form = field.form;
      if (form?.hasAttribute("data-inquiry-form") && !form.dataset.analyticsStarted) {
        form.dataset.analyticsStarted = "true";
        void send("form_start", locale, window.location.pathname);
      }
    };
    document.addEventListener("click", onClick);
    window.addEventListener("bzmagnet:lead-saved", onLeadSaved);
    document.addEventListener("focusin", onFocus);
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("bzmagnet:lead-saved", onLeadSaved);
      document.removeEventListener("focusin", onFocus);
    };
  }, [locale]);

  return null;
}
