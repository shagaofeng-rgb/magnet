# 收录与 Search Console 审计

## 配置与代码层状态

生产环境变量名存在 `GOOGLE_SEARCH_CONSOLE_SERVICE_ACCOUNT_JSON`、`SEARCH_CONSOLE_SITE_URL`、`SEARCH_CONSOLE_SYNC_SECRET`；值未读取。`lib/search-console.ts` 为 server-only，使用只读 `webmasters.readonly` scope，将 Search Analytics 的 date/page 指标写入站点隔离的 `seo_metrics`，并记录同步状态。受保护同步端点要求 Cron 或同步机密。

这证明集成代码和配置入口存在，**不证明**服务账号授权、OAuth、Google API、数据写入或后台展示已经实时成功。

## 外部索引状态

| 项目 | 状态 | 原因 |
|---|---|---|
| 主域属性覆盖 | Not verified | 未读取 Search Console 属性/权限。 |
| sitemap 已提交与最近读取 | Not verified | 未调用 API 或后台同步。 |
| 可索引/排除/404/重定向报告 | Not verified | 未读取 GSC Pages report。 |
| URL Inspection | Not verified | 未调用 URL Inspection；不应假设普通网页可用 Indexing API。 |
| 查询、页面、国家、设备、CTR/排名 | Not verified | 未确认最近同步结果。 |
| Google 收录 | Not verified | sitemap 可访问不代表已收录。 |

## 公开技术观察

- 当前中国地区公开页面返回 403/noindex，是既定 CN/IN 地区策略的预期结果；因此不能以本机响应判断国际索引页最终状态。
- `robots.txt` 与 `sitemap.xml` 当前可访问 200。
- sitemap 覆盖和 `lastmod` 问题见 [05-seo-geo-audit.md](./05-seo-geo-audit.md)。

## 安全验证方式

在不新增密钥、不中断同步、不提交页面的前提下，从受保护管理员后台读取最后成功时间、行数与错误摘要；再用已授权 Search Console UI 对首页、分类、产品、News/Blog、语言页各抽样一次。任何“提交请求”只能报告为 submitted/requested，不能报告为 indexed。
