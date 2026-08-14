# SEO 与 GEO 审计

## 已验证

- `robots.txt` 和 `sitemap.xml` 在本机可得到 HTTP 200。
- `app/robots.ts` 将 sitemap 与 news-sitemap 声明为 BZMAGNET origin。
- 产品模型、编辑模型和 `guard:public`/`guard:build` 均有旧品牌、占位符、内部字段与不安全事实扫描；本次 guard 均通过。
- 首页 metadata 使用 locale alternates；产品详情单测检查 Product、BreadcrumbList、FAQPage 仅在模板支持时渲染。
- 根路径源代码 308 重定向到 `/en/`；Next 对 `/en/` 的规范化会 308 至 `/en`。`lib/seo.ts` 的 homepage canonical/hreflang 使用带尾斜杠形式，因此 URL 规范必须统一验证。

## 问题

### BZ-SEO-001（P1）sitemap 覆盖不足

`app/sitemap.ts` 的固定路由只包含 home、products、industry-solutions、news、blog、about-contact、request-quote、editorial-policy、privacy、terms。源代码还存在 `/[locale]/equipment`、`industries`、`solutions`、`resources`、`about`、`contact` 和相关子路由。当前无法从来源判断它们是应索引页面、301 兼容页面还是应 noindex/下线；无论哪种情况，都需要把 sitemap、canonical 和路由策略明确且一致地处理。

### BZ-SEO-002（P2）固定 sitemap 的 lastmod 不真实

固定页与产品的 `lastModified: new Date()` 会在每次 sitemap 生成时显示当前时间，而不是内容真实更新时刻。应改为真实更新时间或省略 `lastmod`，但本审计未改动。

### BZ-SEO-003（P2）尾斜杠 canonical/重定向需统一

实测 `/en/` 会 308 至 `/en`，而 `alternates()` 生成 `/en/`。这不是索引故障的充分证据，但应在目标地区验证最终 HTML canonical、hreflang 和 sitemap URL 是否都选同一个可访问规范地址。

## GEO / 实体清晰度

About & Contact 的源码正确描述 BZMAGNET 为贸易/采购协调品牌，并明确不声明未证实的工厂、库存、认证或性能保证。产品模板也有事实边界。由于公开页不能在当前地区渲染，未验证 Footer、schema、contact、email、legal pages 的最终一致性，亦未宣称 Google 或 AI 系统已经收录/引用。

## 需在获得只读站长权限后验证

Search Console property 覆盖、sitemap 最近读取、Pages report、URL Inspection、Performance、CWV、HTTPS/Manual Actions/Security Issues、Bing/IndexNow（若配置）。
