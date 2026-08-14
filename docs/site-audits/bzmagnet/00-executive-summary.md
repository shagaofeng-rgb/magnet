# BZMAGNET 全维度自检执行摘要

| 项目 | 结果 |
|---|---|
| Site / domain | `bzmagnet` / `https://bzmagnet.com` |
| 品牌与行业 | BZMAGNET；工业磁选设备的产品采购与出口协调 |
| 支持语言 | en、es、pt、ar（RTL）、ru |
| 框架 | Next.js App Router + TypeScript，Vercel，Neon/Postgres |
| 生产部署 | 已验证 Ready：`dpl_7Y4vSPqhYjRpeeF8YzyncXyWLfKp`；别名为 `bzmagnet.com`、`www.bzmagnet.com` |
| 审计模式 | 只读。未触发询盘、News/Blog、Search Console 同步、Cron、迁移或部署。 |
| Overall health | **Needs attention** |

## 结论

生产部署、数据库/SMTP/Search Console/管理员/Cron 的环境变量名、产品数据模型、后台站点隔离、公开品牌边界与构建质量门禁均有可复核证据。88 个产品均为已发布记录，四个产品族分别为 28 / 27 / 18 / 15 个产品，五种语言的产品记录均标为 reviewed。

但当前不能交付为“已完成的五语言国际站验收”：首页、分类、News/Blog、询盘、About & Contact、隐私和条款等页面源代码仍包含英文硬编码内容；询盘表单也只有英文标签和回执。`sitemap.ts` 同时遗漏多个已存在的公开路由族。当前审计机位于被站点策略限制的中国区域，公开页面会返回 `403` 与 `X-Robots-Tag: noindex`，且本机没有可用的浏览器自动化二进制，因此国际地区的真实视觉、移动端、表单送达、实际 Search Console 数据和 Cron 历史均不能写成通过。

## 严重级别统计

| P0 | P1 | P2 | P3 |
|---:|---:|---:|---:|
| 0 | 3 | 9 | 1 |

## 已验证

- 当前生产部署为 Vercel **Ready**，同时绑定根域及 `www`。
- `robots.txt`、`sitemap.xml` 在当前网络可读取并返回 200；公开页在中国地区按既定策略返回 403/noindex。
- 生产变量名中存在数据库、SMTP、Search Console、管理员认证与 Cron 机密；审计未读取变量值。
- `pnpm run typecheck`、`pnpm test`（33/33）、`pnpm run guard:public`、`pnpm run guard:build` 全部通过。
- 公开边界/构建输出扫描没有发现被禁止的旧品牌引用或占位字段。
- News 的 review/publish 路由、分布式锁接口、48 小时门槛、重复拦截和 Blog 隔离在代码与单元测试中存在。
- 询盘链路在代码中先持久化线索，再异步记录邮件作业；邮件失败不会删除线索。
- HTTPS 响应实测包含 `Strict-Transport-Security: max-age=63072000`。

## 未验证 / 需复核

- 非中国、非印度地区的首页/分类/详情/新闻/博客/404 在 320–1440px、各浏览器与 Arabic RTL 的实际视觉和交互。
- 生产询盘的真实邮件送达、数据库写入、失败重试与后台可见性（本任务未提交测试线索）。
- Search Console OAuth、查询结果入库、站长平台 sitemap 状态、URL Inspection、索引状态与真实用户 Core Web Vitals。
- News/Blog 最近一次 Cron 执行、持久化运行日志、前台文章与 sitemap/RSS 的实时一致性。
- 产品媒体权属、下载文档、图片重复、外部链接、Cookie 同意行为和第三方脚本，因无法获得完整实时公开抓取和 CMS 资产审计权限。

## 前五项整改（不在本任务执行）

1. 修复 P1 多语言硬编码，并以人工审核后的完整 locale 内容替换；先覆盖首页、产品分类、News、Blog、询盘、About & Contact、法律页与表单反馈。
2. 补齐 sitemap 的实际可索引公开路由，并基于真实内容更新时间输出 `lastmod`。
3. 用位于非受限地区的真实浏览器完成桌面/平板/移动及 Arabic RTL 回归，保留截图与控制台/网络日志。
4. 使用独立安全测试收件箱验证询盘：前端、API、数据库、邮件、后台状态、失败重试均不丢字段；随后将限流改为跨实例的持久化方案。
5. 从受保护后台或只读数据库日志确认 Search Console 最近成功同步和 News 运行历史；不得为检查而手动发布文章。

所有问题、证据、影响与验证方式见 [10-issues.csv](./10-issues.csv) 和 [11-remediation-plan.md](./11-remediation-plan.md)。
