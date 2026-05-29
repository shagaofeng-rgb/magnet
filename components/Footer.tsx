"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Mail, MapPin, MessageCircle, Music2, Phone } from "lucide-react";
import { site } from "@/data/site";
import { getDictionary, getDirection, getLocaleFromPath, localizeHref } from "@/lib/i18n";

const whatsappChatUrl = "https://wa.me/message/FROFUJEVUZDOC1";
const whatsappQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=168x168&margin=8&data=${encodeURIComponent(whatsappChatUrl)}`;
const wechatPlaceholderQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=168x168&margin=8&data=${encodeURIComponent("WeChat QR pending - contact davidsha@cowinmagnet.com")}`;

export function Footer() {
  const pathname = usePathname();
  const locale = getLocaleFromPath(pathname);
  const t = getDictionary(locale);
  const dir = getDirection(locale);
  const infoLinks = [
    { label: "Home", href: "/" },
    { label: t.nav.products, href: "/products" },
    { label: t.nav.applications, href: "/applications" },
    { label: t.nav.blog, href: "/blog" },
    { label: t.nav.about, href: "/about" },
    { label: t.nav.contact, href: "/contact" }
  ];
  const productLinks = [
    "Permanent Magnet Series",
    "Electromagnetic Series",
    "Magnetic Rollers & Magnetic Bars",
    "Mobile Solar Light Towers",
    "Portable Air Compressors"
  ];

  return (
    <footer className="footer" dir={dir}>
      <div className="footer-cta">
        <div>
          <span className="eyebrow">{t.footer.quoteSupport}</span>
          <h2>Need help selecting industrial equipment?</h2>
          <p>{t.footer.quoteText}</p>
        </div>
        <Link href={localizeHref("/request-quote", locale)} className="btn btn-primary">
          {t.common.getQuote} <ArrowRight size={17} aria-hidden />
        </Link>
      </div>

      <div className="footer-grid">
        <div className="footer-brand">
          <Link href={localizeHref("/", locale)} className="footer-brand-mark" aria-label="COWIN MAGNET home">
            <img src="/images/logo.jpg" width={82} height={82} alt="COWIN MAGNET logo" />
            <span>COWIN MAGNET</span>
          </Link>
          <p>{site.tagline}</p>
          <div className="footer-badges">
            <span>OEM/ODM</span>
            <span>Global B2B</span>
            <span>Service First</span>
          </div>
        </div>

        <div className="footer-links">
          <h3>Navigation</h3>
          <ul>
            {infoLinks.map((item) => (
              <li key={item.href}>
                <Link href={localizeHref(item.href, locale)}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-links">
          <h3>Products</h3>
          <ul>
            {productLinks.map((item) => (
              <li key={item}>
                <Link href={localizeHref("/products", locale)}>{item}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-contact-card">
          <h3>Contacts</h3>
          <div className="footer-contact-line">
            <MapPin size={19} aria-hidden />
            <span>{site.address}</span>
          </div>
          <a href={`tel:${site.phone.replaceAll(" ", "")}`} className="footer-contact-line">
            <Phone size={19} aria-hidden />
            <span>{site.whatsapp}</span>
          </a>
          <a href={`mailto:${site.email}`} className="footer-contact-line">
            <Mail size={19} aria-hidden />
            <span>{site.email}</span>
          </a>
          <div className="footer-chat">
            <span>Chat now</span>
            <a href={whatsappChatUrl} target="_blank" rel="noreferrer">WhatsApp</a>
          </div>
        </div>

        <div className="footer-connect">
          <h3>Connect</h3>
          <div className="footer-qr-grid">
            <figure>
              <img src={whatsappQrUrl} alt="WhatsApp QR code for COWIN MAGNET" />
              <figcaption>Whatsapp</figcaption>
            </figure>
            <figure>
              <img src={wechatPlaceholderQrUrl} alt="WeChat QR code placeholder for COWIN MAGNET" />
              <figcaption>Wechat</figcaption>
            </figure>
          </div>
          <div className="footer-social-buttons" aria-label="Social links">
            <a href={whatsappChatUrl} target="_blank" rel="noreferrer" aria-label="WhatsApp">
              <MessageCircle size={27} aria-hidden />
            </a>
            <a href={site.social.tiktok} target="_blank" rel="noreferrer" aria-label="TikTok">
              <Music2 size={28} aria-hidden />
            </a>
            <a href={site.social.facebook} target="_blank" rel="noreferrer" aria-label="Facebook">
              <span>f</span>
            </a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} {site.legalName}</span>
        <span>{site.address}</span>
      </div>
    </footer>
  );
}
