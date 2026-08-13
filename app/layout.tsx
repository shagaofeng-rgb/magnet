import "./globals.css";import "./hero.css";import "./navigation.css";import "./homepage.css";import "./brand-overrides.css";import "./product-detail.css";import "./editorial.css";
import type {Metadata, Viewport} from "next";
import {Inter} from "next/font/google";
import {siteConfig} from "@/lib/site";

const inter=Inter({subsets:["latin"],display:"swap",variable:"--font-inter"});
export const metadata:Metadata={metadataBase:new URL(siteConfig.url),title:{default:siteConfig.defaultTitle,template:`%s | ${siteConfig.name}`},description:siteConfig.defaultDescription,applicationName:siteConfig.name,robots:{index:true,follow:true},openGraph:{siteName:siteConfig.name,type:"website",images:[{url:siteConfig.defaultOgImage,alt:siteConfig.name}]},twitter:{card:"summary_large_image"}};
export const viewport:Viewport={width:"device-width",initialScale:1,themeColor:"#073453"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" className={inter.variable}><body>{children}</body></html>}
