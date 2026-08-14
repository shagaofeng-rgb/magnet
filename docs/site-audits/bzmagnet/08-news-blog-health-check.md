# News / Blog 自动化健康检查（不修改）

## 已验证的静态配置

- `vercel.json` 仅有两个 News Cron：review 每 12 小时与 publish 每日一次调用。
- `lib/news-automation.ts` 在发布前检查 durable store、锁、外部来源模式、48 小时间隔、候选、事实/关联/媒体/重复/SEO 校验及发布后路由验证；失败会转 `needs_review`。
- publish 代码明确限制为 `industry_news`，测试确认 Blog 不会被自动 News publisher 写入。
- 没有发现旧的 no-op editorial cron 路由；测试通过。
- 当前默认模式的代码是内部审核安全模式；只有明确 `external_sources` 配置才会抓取/生成/发布。

## 未验证

- Production `NEWS_AUTOMATION_MODE` 实际解密值、News 数据库连接、最近运行时间、成功率、锁/重试、候选与文章历史。
- 最近已发布 News 是否同时出现在前台列表、详情、sitemap/RSS；本机地区策略阻断公开页，且审计未读取数据库运行日志。
- 来源许可、图片授权、编辑人/审核人公开字段与文章重复度的实时结果。

## 结果

**REVIEW REQUIRED—not a failure assertion.** 自动化的实现和单元测试存在，但没有安全的只读运行历史证据，不能宣称它当前可用或已发布。任务未触发 cron、生成、发布、缓存刷新或 sitemap 提交。

建议在管理员后台的 News 运营页只读查看最近运行记录和一篇已发布文章；若没有可信候选，正确状态应是 skipped/needs_review，而不是强制发布。
