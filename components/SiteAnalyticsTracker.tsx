"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const sessionKey = "bzmagnet_anonymous_session";
const visitorKey = "bzmagnet_anonymous_visitor";

function getId(storage: Storage, key: string) {
  try {
    const existing = storage.getItem(key);
    if (existing) return existing;
    const id = crypto.randomUUID();
    storage.setItem(key, id);
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

function utmValues() {
  const params = new URLSearchParams(window.location.search);
  return {
    source: params.get("utm_source") || undefined,
    medium: params.get("utm_medium") || undefined,
    campaign: params.get("utm_campaign") || undefined,
    content: params.get("utm_content") || undefined,
    term: params.get("utm_term") || undefined,
  };
}

function send(event: string, locale: string, label?: string, target?: string) {
  const path = window.location.pathname;
  if (path.startsWith("/admin") || path.startsWith("/api")) return;
  void fetch("/api/analytics", {
    method: "POST",
    headers: { "content-type": "application/json" },
    keepalive: true,
    body: JSON.stringify({
      event,
      eventId: crypto.randomUUID(),
      sessionId: getId(window.sessionStorage, sessionKey),
      visitorId: getId(window.localStorage, visitorKey),
      path,
      locale,
      referrer: document.referrer || undefined,
      utm: utmValues(),
      label,
      target,
    }),
  });
}

export function SiteAnalyticsTracker({ locale }: { locale: string }) {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin") || pathname.startsWith("/api")) return;
    send("page_view", locale);
    if (/\/(equipment|products)\//.test(pathname)) send("product_view", locale);
  }, [locale, pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const element = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-analytics-event], a[href]");
      if (!element) return;
      const href = element instanceof HTMLAnchorElement ? element.getAttribute("href") || "" : "";
      const configured = element.dataset.analyticsEvent;
      if (configured) send(configured, locale, element.dataset.analyticsLabel || element.textContent?.trim().slice(0, 80), href);
      else if (/request-quote|contact|quote/i.test(href)) send("cta_click", locale, element.textContent?.trim().slice(0, 80), href);
    };
    const onSubmit = (event: SubmitEvent) => {
      const form = event.target as HTMLFormElement | null;
      if (form?.closest("main")) send("form_submit", locale, form.getAttribute("action") || window.location.pathname);
    };
    const onFocus = (event: FocusEvent) => {
      const form = (event.target as HTMLElement | null)?.closest("form");
      if (form && !form.dataset.analyticsStarted) {
        form.dataset.analyticsStarted = "true";
        send("form_start", locale, form.getAttribute("action") || window.location.pathname);
      }
    };
    document.addEventListener("click", onClick);
    document.addEventListener("submit", onSubmit, true);
    document.addEventListener("focusin", onFocus);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("submit", onSubmit, true);
      document.removeEventListener("focusin", onFocus);
    };
  }, [locale]);

  return null;
}
