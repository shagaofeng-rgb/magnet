import type { InquiryAttribution } from "./inquiry-validation";

export const campaignKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;
const key = "bzmagnet_attribution_v1";
let fallback: InquiryAttribution | undefined;

export function campaignValue(value: unknown) {
  if (typeof value !== "string") return undefined;
  const clean = value.trim().slice(0, 120);
  return /^[\p{L}\p{N}_.~ /-]+$/u.test(clean) ? clean : undefined;
}

export function externalReferrerHost(referrer: string, hostname: string) {
  try {
    const url = new URL(referrer);
    const bare = (host: string) => host.toLowerCase().replace(/^www\./, "");
    return /^https?:$/.test(url.protocol) && bare(url.hostname) !== bare(hostname) ? url.hostname : undefined;
  } catch {
    return undefined;
  }
}

export function analyticsOptOut() {
  return navigator.doNotTrack === "1" || (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true;
}

export function sessionAttribution(): InquiryAttribution {
  if (analyticsOptOut()) return {};
  try {
    const saved = window.sessionStorage.getItem(key);
    if (saved) return JSON.parse(saved) as InquiryAttribution;
  } catch {
    // Continue in memory when browser storage is restricted.
  }
  if (fallback) return fallback;
  const params = new URLSearchParams(window.location.search);
  const initial: InquiryAttribution = {
    landing_page: window.location.pathname.slice(0, 120),
    referrer_host: externalReferrerHost(document.referrer, window.location.hostname),
  };
  for (const param of campaignKeys) {
    const value = campaignValue(params.get(param));
    if (value) initial[param] = value;
  }
  fallback = initial;
  try {
    window.sessionStorage.setItem(key, JSON.stringify(initial));
  } catch {
    // The landing attribution is still available during client navigation.
  }
  return initial;
}

export function isProductDetailPath(path: string) {
  return /^\/(en|es|pt|ar|ru)\/products\/(?!category\/)[^/]+\/[^/]+\/?$/.test(path);
}
