# 性能、速度与稳定性审计

## 已验证

- 当前 Vercel Production deployment 为 Ready；Vercel inspect 显示 `[locale]` 函数部署在 `iad1`，单个显示条目约 1.11MB。
- 公共静态媒体目录有 102 个文件、约 43.1MB；本地最大单文件为 `category-mineral-bulk-context.png`（约 3.13MB）。这不是网络传输实测，需作为图片优化复核候选。
- 首页源代码使用 `next/image`；仅 hero 设为 priority，测试已验证该约束。
- 生产 HTTPS 响应实测有 HSTS，robots/sitemap 可读。

## 未验证

- 无 CrUX/Search Console field data 导出；不得报告 LCP/INP/CLS 为通过。
- 未获得独立地区的实验室瀑布、TTFB/FCP/LCP/INP/CLS/TBT/Speed Index、CDN 命中、HTTP/2/3、字体与第三方脚本负载数据。
- 无真实浏览器 console/network trace，不能确认图片坏链、CLS、字体闪烁或移动端超大传输。

## 问题与建议

| 优先级 | 发现 | 建议验证/整改 |
|---|---|---|
| P2 | 最大源 PNG 约 3.13MB，可能不适合所有移动网络；尚未测得实际 transfer size。 | 用 WebPageTest/Lighthouse（US/EU）获取图片传输瀑布；必要时在批准后的修复任务中增加 AVIF/WebP 响应式变体。 |
| P2 | 真实 Web Vitals 与慢资源无证据。 | 接入已有 Vercel Speed Insights/CrUX 或 Search Console 后，只读导出 P75 mobile/desktop。 |
| P2 | 区域屏蔽使本机无法完成生产页面性能测试。 | 以目标市场边缘节点分别测首页、最大分类、最多图产品、News、Blog、RFQ、404。 |

本审计不修改缓存、图片、CDN、字体、第三方脚本或部署策略。
