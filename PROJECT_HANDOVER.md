# TTCalc.shop 项目移交文档

**最近更新**: 2026-08-21
**项目路径**: `D:\Codex\projects\deng-tts-tools`
**仓库**: https://github.com/qq136692547-cmyk/deng-tts-tools.git
**线上地址**: https://ttcalc.shop
**部署方式**: GitHub Pages（main 分支 push 即上线，无构建步骤）

---

## 1. 项目简介

Free TikTok Shop seller tools —— 费用计算器、利润计算器、TikTok Shop vs Amazon FBA 对比，以及内容博客站。

- 技术栈: 静态 HTML + CSS + vanilla JavaScript（无构建步骤，无后端）
- 页面构成:
  - `/` 首页
  - `/tools/tiktok-fee-calculator/`、`/tools/tiktok-profit-calculator/`、`/tools/tiktok-roas-calculator/`、`/tools/tiktok-vs-amazon/`
  - `/blog/` 博客索引
  - 实际博客 24 篇（2026-08-21 核对: blog/ 下 25 个目录，含 1 个 301 重定向 `tiktok-shop-vs-amazon-fba` → `tiktok-shop-vs-amazon-fba-2026`）
  - `/about/`、`/privacy/`、`/terms/`、`/rate-updates/`
- 站点地图: sitemap.xml 共 34 条 URL；llms.txt 24 条博客链接（2026-08-21 核对）

## 2. 数据分析

### Google Analytics

- 属性: **ttcalc**（ID `a401632249p546153313`），控制台 https://analytics.google.com/analytics/web/
- 90 天数据（2026-08-21 读取）: 活跃用户 78、事件数 323、关键事件 0
- 决策: 中文用户约 14% 但大陆用户零互动 → 不做中文版、不加 Google 登录

### GA ↔ Search Console 关联（2026-08-21 完成）

- 关联内容: GA 数据流 **ttcalc** ←→ Search Console 资源 **https://ttcalc.shop/**（网址前缀）
- 操作路径: 管理 → 产品关联 → Search Console 关联
- 状态: 页面提示「链接已创建」，关联表格已出现对应行
- 注意: 关联后 GA 的「Google 自然搜索查询/流量」报告约 24–48 小时回填数据

### Search Console 数据（近 3 个月，截至 2026-08-21）

| 指标 | 数值 |
|---|---|
| 总点击次数 | 4 |
| 总曝光次数 | 710 |
| 平均点击率 | 0.6% |
| 平均排名 | 36.1 |
| 查询词数量 | 38 |

热门查询（点击 / 曝光）:

| 查询词 | 点击 | 曝光 |
|---|---|---|
| ttcalc | 1 | 17 |
| tiktok shop fee calculator free | 1 | 3 |
| tiktok shop fee calculator | 0 | 45 |
| tiktok shop fees | 0 | 15 |
| tiktok shop calculator | 0 | 13 |
| tiktokfee | 0 | 7 |
| fulfilled by tiktok vs fba | 0 | 7 |

**结论**: 站点在 Google 搜索中有真实曝光（710 次），但点击极低（4 次，CTR 0.6%），平均排名 36.1 靠后。核心问题不是「没有收录」，而是排名与标题/描述吸引力。此前「无自然流量」的判断基于未关联的 GA，已修正。

## 3. 待办与止损点

- **2026-10-20（60 天后）复查**:
  - 曝光是否突破 1000+/月
  - 点击是否从 4 提升（目标 >10）
  - 月活跃用户是否过 100
  - 若曝光停滞且月 UV<100 → 冻结项目
- 优化方向（曝光高点击低）: 针对 `tiktok shop fee calculator` 等词优化 title/description，把平均排名推进 20 以内

## 4. 部署与维护

- 构建: 无构建步骤，改完直接 `git push origin main`，GitHub Pages 自动发布
- 新增博客需同步: `blog/index.html`、`sitemap.xml`、`llms.txt`、`ai/summary.json`
- robots.txt 已允许抓取；域名 `ttcalc.shop` 经 CNAME + GitHub Pages 自定义域名
- Windows PowerShell 下 git 的 stderr 可能显示为错误（退出码 1），但操作实际可能成功

## 5. 最近变更记录

- 2026-08-21 `fbcccd7` — 新增 3 篇 2026 博客（账号申诉、运费成本、首单实战）并同步索引/sitemap/llms，已推送上线
- 2026-08-21 — 完成 GA ↔ Search Console 关联，本文档记录流量基线
