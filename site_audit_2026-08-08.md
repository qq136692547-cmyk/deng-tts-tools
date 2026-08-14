# TTCalc.shop 全站状态复查报告

**日期**: 2026-08-08 14:44 GMT+8  
**项目路径**: D:\Codex\projects\deng-tts-tools  
**仓库**: https://github.com/qq136692547-cmyk/deng-tts-tools.git  
**线上地址**: https://ttcalc.shop  

---

## 1. Git 状态 ✅ PASS

- **分支**: main
- **工作区**: 干净，无未提交文件
- **最近 5 条 commit**:
  1. `66317cc` feat: new blog - TikTok Shop CRM tool guide 2026 + update index/sitemap/llms/ai
  2. `5140db9` feat: new blog - TikTok Shop Plus membership 2026 + update index/sitemap/llms/ai
  3. `ac3af60` update: AI endpoint data (blog_count 14→18, last_verified Aug 5) + data lastUpdated
  4. `e4ec791` Add multi-store-operations-2026 blog + update index/sitemap/llms.txt
  5. `8597c29` Add payment-terms-2026 blog + update index/sitemap/llms.txt

---

## 2. 博客完整性 ✅ PASS

- **总目录数**: 21
- **301 重定向目录**: 1 (`tiktok-shop-vs-amazon-fba/` → `tiktok-shop-vs-amazon-fba-2026/`)
- **实际博客数**: 20
- **所有 index.html 存在**: 21/21 PASS（含 301 重定向页）

---

## 3. 索引页 (blog/index.html) ⚠️ FAIL

- **包含的博客链接**: 19 个（缺少 1 个）
- ⚠️ **缺失**: `tiktok-shop-return-rates-cost-2026/` — 该博客存在于 blog/ 目录、sitemap.xml、llms.txt、ai/summary.json 中，但 blog/index.html 中没有对应的链接卡片
- **尾部斜杠**: 所有 19 个链接均正确带有尾部斜杠 ✅

---

## 4. sitemap.xml ✅ PASS

- **博客 URL 数量**: 20（正确，排除 301 重定向的旧 `tiktok-shop-vs-amazon-fba/`）
- **非博客 URL**: 首页、about、privacy、terms、3 个工具页、blog 索引页
- **总 URL 数**: 27
- 无遗漏

---

## 5. llms.txt ✅ PASS

- **博客行数**: 20（正确）
- 包含所有 20 篇实际博客
- 工具区 (3 tools) + About 区 (1 link) 均完整

---

## 6. ai/summary.json ✅ PASS

- **blog_count**: 20 ✅（与实际博客数一致）
- **blog_topics 数组**: 20 条 ✅（完整）
- **last_updated**: 2026-08-08 ✅

---

## 7. 线上验证 ✅ PASS（14/14）

| URL | 状态 |
|-----|------|
| https://ttcalc.shop/ | ✅ 200 |
| https://ttcalc.shop/blog/ | ✅ 200 |
| https://ttcalc.shop/blog/tiktok-shop-crm-tool-2026/ | ✅ 200 |
| https://ttcalc.shop/blog/tiktok-shop-plus-membership-2026/ | ✅ 200 |
| https://ttcalc.shop/tools/tiktok-fee-calculator/ | ✅ 200 |
| https://ttcalc.shop/tools/tiktok-profit-calculator/ | ✅ 200 |
| https://ttcalc.shop/tools/tiktok-vs-amazon/ | ✅ 200 |
| https://ttcalc.shop/ai/summary.json | ✅ 200 |
| https://ttcalc.shop/sitemap.xml | ✅ 200 |
| https://ttcalc.shop/llms.txt | ✅ 200 |
| https://ttcalc.shop/robots.txt | ✅ 200 |
| https://ttcalc.shop/terms/ | ✅ 200 |
| https://ttcalc.shop/privacy/ | ✅ 200 |
| https://ttcalc.shop/about/ | ✅ 200 |

---

## 8. JSON-LD 验证 ✅ PASS

### tiktok-shop-crm-tool-2026 (最新博客)
- ✅ Article (+ Person + Organization)
- ✅ FAQPage (3 Q&A)
- ✅ BreadcrumbList (3 ListItem)

### tiktok-shop-plus-membership-2026 (上一篇)
- ✅ Article (+ Person + Organization)
- ✅ FAQPage (3 Q&A)
- ✅ BreadcrumbList (3 ListItem)

---

## 9. 内链检查 ✅ PASS

- blog/index.html 中所有博客链接均指向正确 URL（带尾部斜杠）
- 19 个链接全部格式正确
- ⚠️ 但由于缺少 return-rates-cost-2026 链接（见第 3 项），内链覆盖不完整

---

## 10. 数据一致性 ⚠️ PARTIAL FAIL

| 数据源 | 博客数 | 状态 |
|--------|--------|------|
| blog/ 目录（排除 301） | 20 | ✅ |
| sitemap.xml 博客 URL | 20 | ✅ |
| llms.txt 博客行 | 20 | ✅ |
| ai/summary.json blog_count | 20 | ✅ |
| ai/summary.json blog_topics | 20 | ✅ |
| **blog/index.html 链接卡片** | **19** | ⚠️ 缺少 1 |

---

## 总结

### ✅ 通过的检查项 (9/10)
1. Git 状态干净
2. 博客目录完整，所有 index.html 存在
3. sitemap.xml 完整（20 篇博客）
4. llms.txt 完整（20 篇博客）
5. ai/summary.json 数据正确（blog_count=20, blog_topics=20）
6. 线上 14 个 URL 全部返回 200
7. JSON-LD schema 完整（Article + FAQPage + BreadcrumbList）
8. 内链格式正确（尾部斜杠）
9. 301 重定向正确配置

### ⚠️ 需要修复的问题 (1)

**blog/index.html 缺少 `tiktok-shop-return-rates-cost-2026` 的链接卡片**

- 该博客存在于 blog/ 目录
- 已在 sitemap.xml 中列出
- 已在 llms.txt 中列出
- 已在 ai/summary.json 的 blog_topics 中列出
- 但 blog/index.html 中没有对应的链接卡片

**修复方案**: 在 blog/index.html 中添加 `tiktok-shop-return-rates-cost-2026` 的博客卡片，位置建议放在 `tiktok-shop-taxes-2026` 附近（按主题相关性）。
