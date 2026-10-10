"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  IconChartBar, IconChecklist, IconFileAnalytics, IconForms, IconLayoutDashboard,
  IconLink, IconLogout, IconMenu2, IconNews, IconPackage, IconRoute,
  IconSearch, IconSettings, IconUsers, IconX,
} from "@tabler/icons-react";

const icons = {
  overview: IconLayoutDashboard, traffic: IconChartBar, seo: IconSearch,
  products: IconPackage, news: IconNews, "news-operations": IconChecklist,
  forms: IconForms, links: IconLink, visitors: IconUsers,
  "page-performance": IconFileAnalytics, paths: IconRoute, settings: IconSettings,
};

const groups = [
  { title: "运营概览", slugs: ["overview"] },
  { title: "流量与转化", slugs: ["traffic", "visitors", "page-performance", "paths", "forms"] },
  { title: "内容与产品", slugs: ["products", "news", "news-operations"] },
  { title: "搜索与站点", slugs: ["seo", "links", "settings"] },
];

export function AdminSidebar({ siteId, area, email, modules, logoutAction }: {
  siteId: string; area: string; email: string; modules: ReadonlyArray<readonly [string, string]>; logoutAction: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);
  return <aside className={`admin-sidebar${open ? " is-open" : ""}`}>
    <div className="admin-sidebar-top">
      <Link className="admin-brand" href={`/admin/${siteId}/overview`} onClick={() => setOpen(false)} aria-label="BZMAGNET 后台首页">
        <Image src="/brand/bzmagnet-logo.png" alt="BZMAGNET" width={158} height={113} priority />
        <span>运营后台</span>
      </Link>
      <button className="admin-menu-toggle" type="button" aria-label={open ? "关闭导航" : "打开导航"} aria-controls="admin-navigation" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <IconX size={24} /> : <IconMenu2 size={24} />}</button>
    </div>
    <div className="admin-sidebar-content" id="admin-navigation">
      <nav aria-label="后台模块">
        {groups.map((group) => <div className="admin-nav-group" key={group.title}>
          <p>{group.title}</p>
          {group.slugs.map((slug) => {
            const navItem = modules.find(([id]) => id === slug);
            if (!navItem) return null;
            const Icon = icons[slug as keyof typeof icons];
            return <Link key={slug} aria-current={slug === area ? "page" : undefined} className={slug === area ? "active" : ""} href={`/admin/${siteId}/${slug}`} onClick={() => setOpen(false)}><Icon size={19} stroke={1.8} aria-hidden="true" /><span>{navItem[1]}</span></Link>;
          })}
        </div>)}
      </nav>
      <div className="admin-account"><small>当前账号</small><strong>{email}</strong><form action={logoutAction}><button type="submit"><IconLogout size={18} aria-hidden="true" />退出登录</button></form></div>
    </div>
  </aside>;
}
