import type { Metadata } from "next";
import { ProductCard } from "@/components/ProductCard";
import { PageHero } from "@/components/PageHero";
import { productCategories, products } from "@/data/products";

export const metadata: Metadata = {
  title: "Products | Magnetic Separators, Light Towers and Air Compressors",
  description:
    "Explore COWIN MAGNET magnetic separation equipment, electromagnetic products, magnetic bars, mobile solar light towers, and portable air compressors.",
  alternates: { canonical: "/products" }
};

export default function ProductsPage() {
  return (
    <>
      <PageHero
        eyebrow="Products"
        title="Industrial product range for magnetic separation and site support"
        description="Browse product options by category, then send your material, conveyor, lighting, air supply, or jobsite requirements for selection support."
        image="/images/catalog/page-3-image-9-1871x840.jpg"
        secondaryHref="/request-quote"
        secondaryLabel="Request Selection Support"
      />
      <section className="section">
        {productCategories.map((category) => (
          <div className="product-category-block" key={category}>
            <div className="section-heading align-left">
              <span className="eyebrow">{category}</span>
              <h2>{category}</h2>
            </div>
            <div className="product-grid">
              {products
                .filter((product) => product.category === category)
                .map((product) => (
                  <ProductCard key={product.slug} product={product} />
                ))}
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
