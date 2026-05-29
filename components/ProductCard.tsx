import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/data/products";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="product-card">
      <Link href={`/products/${product.slug}`} className="product-image-link">
        <Image src={product.image} width={560} height={360} alt={product.name} />
      </Link>
      <div className="product-card-body">
        <span>{product.category}</span>
        <h3><Link href={`/products/${product.slug}`}>{product.name}</Link></h3>
        <p>{product.summary}</p>
        <Link href={`/products/${product.slug}`} className="text-link">
          View product <ArrowRight size={16} aria-hidden />
        </Link>
      </div>
    </article>
  );
}
