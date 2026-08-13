"use client";

import Image from "next/image";
import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import type { ProductMedia } from "@/lib/product-model";

export function ProductGallery({ images, locale }: { images: ProductMedia[]; locale: Locale }) {
  const [active, setActive] = useState(0);
  const selected = images[active];
  return <div className="product-gallery" aria-label="Product image gallery">
    <div className="product-main-image"><Image src={selected.src} alt={selected.alt[locale]} fill priority sizes="(max-width:900px) 100vw,55vw" /></div>
    {images.length > 1 && <div className="product-thumbs" aria-label="Choose product image">{images.map((item, index) => <button type="button" key={item.assetId} onClick={() => setActive(index)} aria-pressed={active === index} aria-label={`Show product image ${index + 1}: ${item.alt[locale]}`}><Image src={item.src} alt="" width={96} height={72} sizes="96px" /></button>)}</div>}
    <p>Product image for reference; final configuration is confirmed according to project requirements.</p>
  </div>;
}
