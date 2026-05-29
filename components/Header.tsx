"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Factory, Mail, MessageCircle, Sparkles } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { applications } from "@/data/applications";
import { productCategories, products } from "@/data/products";
import { site } from "@/data/site";
import { getDictionary, getDirection, getLocaleFromPath, localizeHref } from "@/lib/i18n";

const featuredProducts = products.slice(0, 6);

export function Header() {
  const pathname = usePathname();
  const locale = getLocaleFromPath(pathname);
  const t = getDictionary(locale);
  const dir = getDirection(locale);

  return (
    <header className="site-header" dir={dir}>
      <div className="topbar">
        <span>{t.topbar}</span>
        <div className="topbar-links">
          <a href={`mailto:${site.email}`}>
            <Mail size={15} aria-hidden />
            {site.email}
          </a>
          <a href={`https://wa.me/${site.whatsapp}`}>
            <MessageCircle size={15} aria-hidden />
            WhatsApp
          </a>
        </div>
      </div>
      <nav className="navbar" aria-label="Main navigation">
        <Link href={localizeHref("/", locale)} className="brand" aria-label="COWIN MAGNET home">
          <Image src="/images/logo.jpg" width={52} height={52} alt="COWIN MAGNET logo" priority />
          <span>COWIN MAGNET</span>
        </Link>
        <div className="nav-links">
          <div className="nav-item has-mega">
            <Link href={localizeHref("/products", locale)} className="nav-trigger">{t.nav.products}</Link>
            <div className="mega-menu mega-products">
              <div className="mega-panel">
                <div className="mega-intro">
                  <span><Sparkles size={15} aria-hidden /> Product Center</span>
                  <h3>{t.products.h1}</h3>
                  <p>{t.products.description}</p>
                  <Link href={localizeHref("/products", locale)} className="mega-cta">
                    {t.common.viewProducts} <ArrowRight size={15} aria-hidden />
                  </Link>
                </div>
                <div className="mega-section">
                  <h4>Categories</h4>
                  <div className="mega-chip-list">
                    {productCategories.map((category) => (
                    <Link key={category} href={localizeHref("/products", locale)}>{category}</Link>
                    ))}
                  </div>
                </div>
                <div className="mega-section mega-link-grid">
                  <h4>Popular Products</h4>
                  {featuredProducts.map((product) => (
                    <Link key={product.slug} href={localizeHref(`/products/${product.slug}`, locale)}>
                      {product.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="nav-item has-mega">
            <Link href={localizeHref("/applications", locale)} className="nav-trigger">{t.nav.applications}</Link>
            <div className="mega-menu mega-applications">
              <div className="mega-panel mega-panel-compact">
                <div className="mega-intro">
                  <span><Factory size={15} aria-hidden /> Industry Solutions</span>
                  <h3>{t.applications.h1}</h3>
                  <p>{t.applications.description}</p>
                </div>
                <div className="mega-section mega-card-grid">
                  {applications.map((application) => (
                    <Link key={application.slug} href={localizeHref(`/applications/${application.slug}`, locale)}>
                      <strong>{application.name}</strong>
                      <span>{application.painPoints[0]}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <Link href={localizeHref("/blog", locale)}>{t.nav.blog}</Link>
          <Link href={localizeHref("/about", locale)}>{t.nav.about}</Link>
          <Link href={localizeHref("/contact", locale)}>{t.nav.contact}</Link>
        </div>
        <div className="nav-actions">
          <LanguageSwitcher />
          <Link href={localizeHref("/request-quote", locale)} className="btn btn-primary">
            {t.common.getQuote}
          </Link>
        </div>
      </nav>
    </header>
  );
}
