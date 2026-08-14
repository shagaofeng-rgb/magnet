# 表单、邮件与数据同步审计

## 询盘链路代码验证

| 环节 | 状态 | 证据 |
|---|---|---|
| frontend_visible | Partially verified | QuoteForm 有必填字段、email type、最小/最大长度、同意 checkbox、honeypot 与 aria-live。 |
| endpoint_reachable | Not verified | 存在 `/api/inquiries`，但任务规则禁止生产提交测试。 |
| backend_saved | Verified in code / Not verified live | API 先调用 `storeInternalLead`，再创建邮件作业；真实数据库写入未触发。 |
| email_delivered | Not verified | SMTP 配置变量名存在；未向真实邮箱或安全测试邮箱发送。 |
| CRM_synced | Not applicable / Not verified | 当前代码审计未发现独立 CRM 同步配置；不得假设存在。 |
| alert_logged | Verified in code / Not verified live | 邮件作业会 `succeeded` 或 `failed`；没有执行真实请求。 |

## 已验证的防护

- 服务器端再次验证姓名、邮件、公司、材料、工艺、同意状态与 attribution allow-list。
- honeypot 非空会拒绝；每个 IP+email key 有 60 秒重复限制。
- 邮件发送失败被捕获并写失败作业，已持久化线索不会被删除。
- 邮件变量采用 Sensitive 类型；本审计未读取密码或个人数据。

## 问题

- **BZ-FORM-001（P1）：**五语言页面共用英文 QuoteForm，标签、同意、提交及回执未本地化。
- **BZ-FORM-002（P2）：**限流为函数内 `Map`，在多实例/serverless 扩展或重启下不是分布式/持久化限流。需改为经批准的共享限流存储或边缘 WAF 规则。
- **BZ-FORM-003（P2）：**无独立安全测试收件箱与生产匿名化作业审计证据，因此送达、失败重试、后台可见性均未验证。

## 不应在本次执行的操作

不向销售邮箱提交测试线索；不把邮箱、密码、邮件正文或客户数据写入报告；不改 SMTP、表单、数据库或速率限制。
