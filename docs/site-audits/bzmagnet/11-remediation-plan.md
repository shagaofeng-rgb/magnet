# 整改计划（仅建议，未执行）

## 立即排期：P1

1. **多语言内容合同**：将所有可见的页面文本、CTA、空状态、表单状态、alt、OG 和 schema 字段放入 reviewed locale records。对缺失翻译的路径临时隐藏语言入口或标记不可发布，而不是回退英文。
2. **五语言询盘**：让 QuoteForm 接收 locale 和翻译字典；保持现有服务器验证、同意和 attribution allow-list；在独立安全测试环境验证邮件链路。
3. **URL 与 sitemap 决策**：建立 route register，逐一决定 public routes 是 index/self-canonical、301、canonicalized 还是 noindex；sitemap 只保留最终规范 URL。

## 1–2 周：P2

- 用真实 `updatedAt` 修正/移除 sitemap `lastmod`，统一 trailing slash、canonical、hreflang 与内部链接。
- 增加 public localized `not-found.tsx`、`error.tsx`、`loading.tsx`，不泄露堆栈。
- 改用持久化/共享限流；保留 server validation、honeypot 和邮件作业审计。
- 在不触发 cron 的前提下读取 News job history；在 Search Console 后台读取同步状态和数据延迟。
- 隐私/法务复核匿名 analytics 的数据最小化、保留期、访问/删除机制和 cookie 行为。
- 建立外部区域 browser/performance matrix，优先 375/768/1440 与 Arabic RTL。

## 后续：P3

- 修复 Header effect 的 lint warning，并做键盘回归。
- 审计产品/编辑媒体的响应式格式、许可与重复使用；对超过阈值的 PNG 创建批准后的压缩版本。

## 每项完成定义

整改不得只靠代码提交。每项必须附：受影响 URL、前后证据、测试命令/截图、外部地区 HTTP/metadata 结果、无旧品牌扫描、生产监控观察窗口及回滚说明。News/Blog 的抓取、频率、来源、队列和发布规则只能在独立获得授权的任务中改动。
