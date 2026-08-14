# BZMAGNET 后台运维手册

## 路由

后台入口为 `/admin/login`。完成会话验证后进入 `/admin/bzmagnet/overview`，12 个一级模块均在 `/admin/bzmagnet/[module]`。站点 ID 仅用于路由选择；服务端会话同时校验该用户是否拥有该站点权限。

## 启用前提

生产环境默认不提供 Demo 数据。必须设置 `ADMIN_SESSION_SECRET`、`ADMIN_EMAIL` 和 SHA-256 格式的 `ADMIN_PASSWORD_HASH`，并配置私有数据存储后才允许写入操作。`ADMIN_DEMO_MODE` 只可用于本地演示，禁止在生产打开。

## 角色矩阵

| 角色 | 主要权限 |
| --- | --- |
| super_admin | 跨站点、危险操作、角色与设置 |
| site_admin | 本站设置、发布、导入、回滚 |
| editor | 产品/内容草稿创建与编辑 |
| content_reviewer | 内容审核与发布 |
| seo_analyst | SEO、链接、性能读取与导出 |
| sales | 询盘处理与合规导出 |
| viewer | 只读 |

每次发布、删除、回滚、导出、重发、批量导入及手动任务必须写入 `audit_logs`，同时保存影响范围、理由与操作者。

## 数据与隐私

数据库基线位于 `database/admin-schema.sql`。事件表仅保存允许属性和匿名会话 ID；不得存储完整 IP 或完整 User-Agent。线索负载应加密后写入 `form_leads`。所有连接信息只置于服务端环境变量，绝不发送到前端。

## 上线检查

1. 执行私有数据库迁移与备份验证。
2. 配置最小权限角色和强会话密钥。
3. 配置 Analytics、Search Console、CRM、邮件和媒体存储的站点级凭据。
4. 运行 typecheck、lint、test、build，并以非管理员账号验证拒绝访问。
5. 仅在数据同步、审计和回滚演练通过后启用写入与 Cron。
