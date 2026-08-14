# 证据索引与审计限制

## 采集时间

2026-08-14，Asia/Shanghai；生产部署 ID `dpl_7Y4vSPqhYjRpeeF8YzyncXyWLfKp`。

## 只读证据

- Vercel inspect：Production Ready，aliases 包含 `https://bzmagnet.com` 与 `https://www.bzmagnet.com`。
- Vercel logs：获取到近期 public/admin GET 请求；本审计未看到并不等于全量无错误。
- Vercel environment list：仅检查变量名和 Sensitive 标志，未查看值。
- HTTP：`/robots.txt`、`/sitemap.xml` 返回 200；来自当前中国地区的 `/`、`/en`、产品、News、Blog、RFQ 等返回 403 与 `X-Robots-Tag: noindex`，符合源码 CN/IN 公开访问阻断。
- 安全头：HTTPS 响应中观察到 HSTS。
- 代码/数据：路由、sitemap、robots、proxy、表单、analytics、Search Console、News、产品数据、测试及媒体目录。
- 命令：typecheck、33 项 node tests、public boundary guard、build-output scan 全部通过；eslint 为 0 error / 1 warning。

## 限制

没有使用用户浏览器、不伪造 `x-vercel-ip-country`、不触发表单、不同步 Search Console、不调用 Cron、不发布文章、不读取密钥、不读取或导出客户个人数据。由于当前地区策略和本机没有浏览器自动化二进制，无法附真实外部地区桌面/手机/Arabic 截图；这不是通过证据。
