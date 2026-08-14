# 内容、语言与国际化审计

## 已验证

- 支持语言常量为 `en`、`es`、`pt`、`ar`、`ru`；Arabic locale layout 使用真实 `dir="rtl"`。
- 数据文件包含 88 个产品，全部 `published`；每个产品都有五个 locale record 且均为 reviewed。
- 产品发布模型有禁止旧品牌/占位符和未验证事实的校验；公开字段会隐藏或降级为 “Available on request”。

## P1：公共页面存在英语硬编码

以下为源码直接证据，不是机器翻译推断：

- `app/[locale]/page.tsx`：benefits、分类标题/描述、选型清单、部分 News/Blog 区块文字为英文数组。
- `app/[locale]/products/[category]/page.tsx`：hero eyebrow、intro、链接 CTA 为英文。
- `app/[locale]/news/page.tsx` 与 `app/[locale]/blog/page.tsx`：hero、tabs、CTA、空状态、topic cards 为英文。
- `app/[locale]/about-contact/page.tsx`、`privacy/page.tsx`、`terms/page.tsx`：可见正文为英文。
- `components/QuoteForm.tsx`：字段、同意文案、提交、成功与错误信息都为英文；组件没有 locale 参数。

这会导致 `/es`、`/pt`、`/ar`、`/ru` 的页面出现混合语言，Arabic 也无法完成真实 RTL 文字/表单验收。严重问题记录为 `BZ-I18N-001` 和 `BZ-FORM-001`。

## 未验证

- 非英语产品详情、文章详情、图片 alt、OG、schema、Cookie/错误文案是否全部人工复核。
- 长文字、俄语、阿拉伯语技术单位与表格的真实换行/方向显示。
- 地区版本的法律主体、地址、电话、货币及出口限制说明，因为公开页面在本机地区不可抓取。

## 建议

先建立每页可见文案的 locale contract（包括状态消息、empty state、alt、CTA、metadata），将未审查的语言入口暂时标记为 REVIEW REQUIRED，而不是将英语文案作为已完成翻译发布。
