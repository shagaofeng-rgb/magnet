# BZMAGNET 后台运营层

## 已交付范围

后台入口为 `/admin/login`，通过服务器端签名会话验证后进入 `/admin/bzmagnet/overview`。服务端会同时验证站点授权和角色授权，URL 中的站点 ID 不能单独取得访问权。

一级导航固定为：数据总览、流量分析、SEO 数据、产品管理、新闻管理、News 运营、客户表单、内外链审计、访客记录、页面表现、访问路径、系统设置。每个模块具有对应的二级标签、空数据状态、权限检查、刷新时间和可追溯任务入口。

## 数据模型

所有运营记录都带有 `site_id`，用于多站点隔离。基础表位于 `database/admin-schema.sql`，运营层迁移为 `database/migrations/20260814_admin_operating_layer.sql`。

| 领域 | 表 |
| --- | --- |
| 站点与配置 | `sites`, `site_settings`, `site_roles` |
| 产品目录 | `catalog_records`, `media_assets` |
| 内容与版本 | `content_records`, `content_versions`, `news_articles`, `news_candidates` |
| 询盘 | `form_leads` |
| 分析与表现 | `analytics_events`, `visitor_sessions`, `page_metrics`, `seo_metrics` |
| 质量与运维 | `link_audits`, `admin_jobs`, `audit_logs`, `privacy_requests` |

现有公开目录可通过 `pnpm admin:seed-catalog` 幂等写入 `catalog_records`。该命令只写入已发布的 BZMAGNET 产品，保留源产品数据，不调用第三方服务。

## 角色矩阵

`super_admin` 可以管理跨站点和危险操作；`site_admin` 管理本网站配置与发布；`editor` 创建和编辑草稿；`content_reviewer` 审核和发布内容；`seo_analyst` 读取和导出 SEO/质量数据；`sales` 处理询盘；`viewer` 只读。发布、回滚、导入、导出、删除和人工任务都必须经服务端权限检查并写入 `audit_logs`。

## 询盘与隐私

`/api/inquiries` 具有服务端字段校验、蜜罐与速率限制，并将完整询盘使用 AES-256-GCM 加密后存入受站点范围约束的 `form_leads`。生产环境需要 `INQUIRY_ENCRYPTION_KEY`（或安全的 `ADMIN_SESSION_SECRET` 作为回退）；不会使用外部询盘存储。

匿名访问只保存允许的事件属性、粗粒度地区和匿名会话 ID。完整 IP、完整 User-Agent 和浏览器可见的数据库/集成密钥均不保存或不暴露。

## 运行与发布

```text
pnpm admin:migrate
pnpm admin:seed-catalog
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```

生产环境必须在 Vercel 中配置：`ADMIN_EMAIL`、`ADMIN_PASSWORD_HASH`、`ADMIN_SESSION_SECRET`、`ADMIN_DATABASE_URL`（或 `POSTGRES_URL`）和 `INQUIRY_ENCRYPTION_KEY`。数据库 URL 与密钥只在服务器端使用。

未连接 Analytics、Search Console、CRM、邮件或媒体供应商时，后台显示“尚未连接”或空状态，而不会编造指标。外部连接应在系统设置中按站点配置并在接入前完成最小权限审查。
