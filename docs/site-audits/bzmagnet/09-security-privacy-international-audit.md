# 安全、隐私与国际站风险审计

## 已验证

- 实测 HTTPS 响应包含 HSTS（`max-age=63072000`）。
- `proxy.ts` 设置 `X-Content-Type-Options: nosniff`、`Referrer-Policy: strict-origin-when-cross-origin`、限制 camera/microphone/geolocation 的 Permissions-Policy。
- 中国大陆和印度公开路由会被 403/noindex；`/admin/login`、受保护后台和 Search Console 同步端点不受该公共地区拦截，以便受控管理访问。
- 管理后台、数据库与 Search Console 的单测覆盖站点隔离和 fail-closed 权限路径。
- 公共品牌边界扫描及构建输出扫描通过，未发现禁止旧品牌引用。

## 风险与需复核

| ID | 级别 | 结论 |
|---|---:|---|
| BZ-PRIVACY-001 | P2 | Privacy 页面只描述询盘信息；代码还记录匿名 session、页面路径、设备类别、语言及来源渠道。需将实际匿名分析与保留/删除权利说明与实现核对。 |
| BZ-FORM-002 | P2 | 本地内存限流在多实例场景下不持久。 |
| BZ-TEST-001 | P2 | 无非受限地区安全头、cookie/banner、第三方脚本、混合内容、404、上传下载、浏览器兼容性实测。 |
| BZ-SEC-001 | P3 | `SiteHeader` Lint 有一条 ref cleanup 警告（0 errors），非直接安全漏洞，但应在后续维护中消除。 |

## 未尝试的高风险操作

未枚举密钥、未尝试认证绕过、未上传文件、未注入 payload、未扫描攻击面、未访问真实线索、未变更防火墙/地区规则。SSL 续期、WAF/DDoS、备份恢复、依赖 CVE、Cookie 偏好、法务文本与出口管制均需要额外只读资料或人工法律复核。
