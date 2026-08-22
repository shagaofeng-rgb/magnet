import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { robots: { index: false, follow: true } };

export default function NotFound() {
  return <main className="section"><div className="shell prose"><span className="eyebrow">404</span><h1>Page not found</h1><p>The page may have moved or is not available.</p><Link className="btn btn-primary" href="/en">Return to BZMAGNET</Link></div></main>;
}
