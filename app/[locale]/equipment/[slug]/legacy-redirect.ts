import { NextRequest, NextResponse } from "next/server";
import { isLocale } from "@/lib/i18n";
import { findProduct, productPathFor } from "@/lib/product-model";

/** Returns an explicit 301, preserving existing BZMAGNET inbound product URLs. */
export async function legacyProductRedirect(request: NextRequest, context: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await context.params;
  if (!isLocale(locale)) return new NextResponse("Not found", { status: 404, headers: { "X-Robots-Tag": "noindex" } });
  const product = findProduct(locale, slug);
  if (!product) return new NextResponse("Not found", { status: 404, headers: { "X-Robots-Tag": "noindex" } });
  return NextResponse.redirect(new URL(productPathFor(locale, product), request.url), 301);
}
