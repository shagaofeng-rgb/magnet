# 布局与响应式审计

## 方法与限制

代码层检查覆盖 Header、移动抽屉、首页、产品分类、询盘、About & Contact、News、Blog 与 locale layout。真实浏览器 320、375、390、414、768、1024、1280、1440px 检查**未完成**：审计环境缺少可用浏览器自动化，且该机位的公开请求被 CN 地区策略返回 403/noindex。没有伪造截图或将源代码检查写成视觉通过。

## 模板结果

| 模板 | 代码级结果 | 真实桌面/移动 | 证据与结论 |
|---|---|---|---|
| Header / desktop nav | 有问题 | 未验证 | Header 有焦点陷阱、Escape、焦点返回与可跳过内容链接；非英语导航使用 locale 字符串。需外部浏览器验收。 |
| Mobile drawer | 部分通过 | 未验证 | Request a Quote 在移动菜单项目之前，Products/Industry/News 为手风琴。需检查触控、遮罩、RTL 与横向溢出。 |
| 首页 | 有问题 | 未验证 | 一个 H1、hero 仅一个 priority image 的测试通过；但 benefits、分类、选型清单等文字硬编码英文。 |
| 分类/产品详情 | 有问题 | 未验证 | 产品数据具五语言；分类页 eyebrow/intro/链接文本硬编码英文。详情实际视觉未验。 |
| News / Blog | 有问题 | 未验证 | 路由存在，hub 标题、CTA、空状态和主题卡存在英文硬编码。 |
| About & Contact / RFQ | 有问题 | 未验证 | 页面和表单存在，但标签、说明、成功/失败回执均英语。 |
| 404 / error | 有问题 | 未验证 | 未找到 public `not-found.tsx`、`error.tsx` 或 `global-error.tsx`；不能确认错误时保留导航和恢复入口。 |

## 已验证的可访问性实现

- `SiteHeader` 有 Skip link，桌面菜单有 `aria-expanded`/`aria-controls`。
- 移动抽屉有 `role=dialog`、`aria-modal`、Tab 焦点循环、Escape 和焦点归还逻辑。
- locale layout 对 Arabic 输出 `dir="rtl"`。
- 询盘状态使用 `aria-live="polite"`，字段有 `<label>`。

## P1/P2

- **P1 BZ-I18N-001 / BZ-FORM-001：**可见硬编码英文使非英语与 RTL 主流程不能通过本地化验收。
- **P2 BZ-UX-001：**缺少明确 public error/not-found 边界的证据。
- **P2 BZ-TEST-001：**真实响应式、浏览器和无横向滚动未验证。

建议的验证：从允许访问的 US/EU 网络，使用 Chrome/Firefox/Edge/Safari 对 375、768、1440px 与 Arabic 逐页截图、检查 console/network、键盘 Tab/Enter/Escape、200% 字体缩放与软键盘表单。
