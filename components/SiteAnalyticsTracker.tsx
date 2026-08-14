"use client";

import { useEffect } from "react";

const sessionKey = "bzmagnet_anonymous_session";

function getSessionId() {
  const existing = window.sessionStorage.getItem(sessionKey);
  if (existing) return existing;
  const id = crypto.randomUUID();
  window.sessionStorage.setItem(sessionKey, id);
  return id;
}

export function SiteAnalyticsTracker({ locale }: { locale: string }) {
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith("/admin") || path.startsWith("/api")) return;
    void fetch("/api/analytics", {
      method: "POST",
      headers: { "content-type": "application/json" },
      keepalive: true,
      body: JSON.stringify({ sessionId: getSessionId(), event: "page_view", path, locale, referrer: document.referrer || undefined }),
    });
  }, [locale]);
  return null;
}
