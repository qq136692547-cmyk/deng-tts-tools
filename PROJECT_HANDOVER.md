# TTCalc.shop 项目移交文档

**最近更新**: 2026-08-29
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
- 2026-08-21 — Reddit 推广启动（账号 Accomplished-Wind-29）：已在 r/TikTokShop「New brand cold start」发布单元经济评论（50% 佣金下 $15 单价的实际贡献利润核算，含 ttcalc.shop 提及，已核验可见）；另有 2 条草稿待发（r/TikTokShop「Is TikTok Shop worth it」费用表时效性评论 + r/ecommerce「Teardown 3-in-1 charger」毛利纠偏评论，草稿已存 Reddit 编辑器），因账号触发 Reddit 发布频率限制被静默拦截，建议 24h 后重试

## 6. 引流工作标准（2026-08-21 实测定版）

完整标准见 `D:\Codex\projects\geo-score\PROJECT_HANDOVER.md` 第十二节；本节为 ttcalc 侧要点。

- **账户**：X @Denney_UG（资料含 ttcalc.shop 与 geoscore.help）；FB AN（L.D. Studio，profile id 100095204201718）；Reddit Accomplished-Wind-29。
- **每日节奏**：X 原创 ≤2-3 帖 + 回复 ≤3-5 条；FB 群评论 5-6 条（TikTok Shop 卖家群）；Reddit ≤3 条/天（24h 冷却期 ≤2）；Quora ≤1-2 答/天、Medium/DEV/LinkedIn 各 ≤1 帖/天（2026-08-22 调整）。
- **平台红线**：X 280 字符（URL 按 23 计）、草稿纯 ASCII；Reddit 单账号 24h 约 3-4 条上限，超限静默拦截，AutoMod 低 CQS 删评论、**评论一律禁链接**（2026-08-22 实测）；FB 新号群评论带外链会被自动隐藏（实测），FB 群评论一律无链接、工具只提名字；Quora 禁 affiliate/广告式签名，答真实问题才可带链接；DEV 帖子必须有实质内容、不得只贴外链；Medium 全文转载、禁纯广告；LinkedIn 专业原创、禁重复刷屏。
- **内容标准**：选垂直赛道真实问题帖；先无链接纯帮忙回复验证通道，再自然嵌入工具链接；外链带 UTM；发布后核验可见并记录。
- **ttcalc 卖点话术**：免费 TikTok Shop 费用/利润计算器、FBT 履约费明细、TikTok Shop vs Amazon FBA 对比；适合回「运费扣费」「利润核算」「费用结构」类问题。
- **交叉引流**：ttcalc 面向卖家人群；GEO 工具面向 SEO/AI 搜索人群；两站资料互挂。

## 7. 每日例行工作流（SOP，2026-08-21 固化）

每天开始新发帖/评论前按序执行：① 复查上一天及最近 48h 的发帖/评论（X 个人主页+回复帖、FB 两条评论帖、Reddit 7 条评论）→ ② 有回复先回复（FB 不带链接）→ ③ 处理完才发新内容（X ≤1 帖+≤3 回复、FB 2-4 评论、Reddit ≤3 条）→ ④ 收尾记录追加到本文档 → ⑤ 每周复盘互动数据调整策略。完整版见 geo-score 文档第十二节。

## 8. 最近变更记录（续）

- 2026-08-30 — 引流 + 生图 QC：① X 发布 2 条带图帖（首帖 https://x.com/Denney_UG/status/2093767038967878061 + 新空白商品图帖）；② Quora 回答「How do I improve my Shopify product photos?」带图发布并通过 https://www.quora.com/How-do-I-improve-my-Shopify-product-photos/answer/D-L-7-2 可见；③ Reddit 无链接交互 3 条全部可见（r/TikTokshop 回复、r/Entrepreneurs p6ncx29、r/ecommerce p6nekfk）；④ 新增 5 张电商图，其中 `2026-08-30-ttcalc-photo-blank-01.jpg` 与 `2026-08-30-ttcalc-photo-blank-02.jpg` 通过视觉 QC 且无 AI 文字乱码，已用于 X/Quora；另 3 张 `scene-01/02/03.jpg` 视觉高级但标签文字乱码，仅保留测试不用作外发。Facebook 当日群评暂缓，因当前 feed 无强匹配照片帖，优先用了更贴合的 Quora 图文回答。
- 2026-08-21 — SOP 固化并首次执行：复查 X/FB 全部近期内容，无新回复（仅点赞增长：X 首帖 3、Light Silver 评论 3、Jason Barnard 评论 1）；FB 利润帖评论计数 6 无回复通知；无需回复，无阻塞。

- 2026-08-21 — X/FB 引流实测完成：X 首帖 + Jason Barnard 帖评论 + Light Silver「What are you building?」回复（带 geoscore.help UTM）已发布并复查可见；FB「Tiktok Seller Support」群运费帖 Tagalog 评论可见，35 PHP 成本定价帖首条带链接评论被 FB 隐藏，已补发无链接版本即时可见；FB 简介已同步两站文案；Reddit 2 条草稿待 24h 冷却后补发。

- 2026-08-22 — Reddit 被删评论核查：r/SEO 两条评论被 AutoMod 以低 CQS Score 移除、r/TikTokShop「New brand cold start」评论因含 ttcalc.shop 链接被 AutoMod 移除（提示 links are not allowed，编辑无效需重发）；r/SideProject 原帖被版主删除。教训固化：**Reddit 评论一律禁链接**，只提工具名。
- 2026-08-22 — 发布记录：X 首帖（Most SEO audits...）+ Light Silver 帖回复（带 UTM）可见；FB「Tiktok Seller Support」群 2 条无链接 Tagalog 评论即时可见；Reddit r/TikTokshop「affiliate 设置」帖无链接评论（提 TTCalc）可见。
- 2026-08-22 — AlternativeTo 提交 GeoScore GEO Audit 成功进审核队列（软件目录页，slug geoscore-geo-audit）；ttcalc.shop 后续可按同法建目录条目（搜索 tiktok shop fee calculator 分类）。
- 2026-08-29 `ee3c820` — 首页 v5 复查修复上线：① i18n.js captureOriginals 扩展捕获 data-i18n-placeholder/title（修复图片页占位符 zh→en 不还原）；② 页脚 7 个功能链接补挂 data-i18n，新增 footer.profit/footer.roas/footer.vsAmazon 中文键（修复中文模式页脚混排）；③ .v5-tool:hover 链接改用 --accent-text #C2410C（对比度 2.66→4.9:1）；④ 首页中英文案与 JSON-LD 统一补充 $0.30 交易费口径。验证：多脑复查（deepseek-v4-flash + glm-5.3 双主脑独立审查）+ Playwright 17/17 通过（桌面 1440x900/移动 390x844 无横向溢出、en→zh→en 语言往返、图片页占位符往返、无页面错误、图片全载）+ 线上三项资源 200 且新内容核验通过。后续完善 `abe234d`（同日）— 全站 i18n 框架统一：① 36 个页面补挂共享页脚/导航链接 data-i18n 共 540 处；② about/privacy/terms/rate-updates/tools 索引 5 页补上缺失的 translations.js+i18n.js 引用（此前语言切换按钮无效）；③ i18n.js 补充 en 字典设计注释。验证：全站 37 页 712 处 data-i18n、120 个唯一键零缺失零重复；中文浏览器（locale zh-CN）实测 9 类页面页脚全部中文无混排、无页面错误；线上 about/blog-fees/home 200 且新内容核验通过。
- 图片页页脚英文混排问题已随 abe234d 全站修复解决（tools/tiktok-product-photo +12 处 data-i18n）。
- 2026-08-29 `07dcf1e` — 图片生成页新增 Google 账户登录：① Worker（ttcalc-photo-proxy，版本 3788efb8）新增 POST /auth/google（Google tokeninfo 验证 + aud 校验，HS256 会话 7 天）；② /generate 支持 Bearer 会话，额度按天限流（`347238c` 调整）：登录用户 20 张/24 小时，匿名 5 张/24 小时/IP；③ 前端图片页新增 Google 登录区（GIS 按钮、会话显示、退出），中英双语。Secrets 已设置：GOOGLE_CLIENT_ID（复用 GeoScore 的 client 154080569698-…）、JWT_SECRET（随机生成）。验证：/auth/google 空 body 400/假 token 401、CORS preflight 含 Authorization 204、匿名真实生成 9.7s 成功、本地 Playwright 登录区渲染/中英切换/无页面错误通过。**待用户操作**：Google Cloud Console → APIs & Services → Credentials → OAuth client（GeoScore 用的那个）→ Authorized JavaScript origins 添加 https://ttcalc.shop，否则登录弹窗报 origin 错误。注意：wrangler 部署用 cfut_ token（cfk_ 账户 token 已失效）。

- 2026-08-22 — 新平台首日发布（规则已先调研）：LinkedIn 专业短帖（审计数据+链接）已发布 https://www.linkedin.com/feed/update/urn:li:activity:7496794327352897537/；Medium 全文转载《Why Doesnt ChatGPT Cite My Website?》 https://medium.com/@qq136692547/why-doesnt-chatgpt-cite-my-website-7-reasons-and-how-to-fix-them-d7d2a6526f44；Quora 回答「How can brands get cited in AI answers」 https://www.quora.com/How-can-brands-get-cited-in-AI-answers-like-ChatGPT-instead-of-just-ranking-on-Google/answer/D-L-7-2；DEV 开发者向文章 https://dev.to/l_d_985a85beff7511/i-built-a-free-cli-mcp-server-for-geo-audits-here-is-what-1200-sites-taught-me-d17。全部已核验可见。
- 2026-08-22 — AlternativeTo 提交 **TTCalc - TikTok Shop Fee Calculator** 成功（slug https://alternativeto.net/software/ttcalc--tiktok-shop-fee-calculator/）：Free 定价 + Source available（仓库公开但无 LICENSE）+ 源码 https://github.com/qq136692547-cmyk/deng-tts-tools + 图标 og-default.jpg URL 上传；作者 L.D. Studio（CN），tags=tiktok/e-commerce/calculator，平台 Online/Web；my-submissions 现 2 apps waiting（GeoScore GEO Audit + TTCalc）。
- 2026-08-22 — FB「Tiktok Seller Support」群补发 4 条无链接评论（他加禄语推 TTCalc）：shipping fee 帖、settlement 帖、affiliate 新手帖、free trial 帖；3 条刷新可见，free trial 帖计数+1 但公开线程未渲染（疑似新号隐置，明日复查）。X 两帖当日为 geo 站引流（geoscore.help UTM），TTCalc 通过 FB 群评论+两站资料互挂做交叉引流。

- 2026-08-27 — 全量复查：X 5 条帖存活、无新回复；FB 4 条评论存活，settlement 帖和 PurpleBee free trial 帖两条质疑/纠偏均已用无链接他加禄语回复，PurpleBee“隐置”结论更正为渲染问题。Reddit 6 条评论存活；hubfluence 和 r/SEO 作者追问已回复（均无链接）。Quora 3 views 无回复；Medium 0 responses；DEV 1 reaction + 1 条评论，已回复并核验。

- 2026-08-27 — AlternativeTo 复查更正：TTCalc 提交已被 POX 以“does not meet the quality and benefits we require”驳回并删除（3 天前）；GeoScore 提交同样被驳回（5 天前）。公开 slug 404，my-submissions 为空。先补齐目录价值和证据后再考虑咨询管理员或一次性重发。

- 2026-08-27 — LinkedIn 账户被封锁，从后续平台工作流移除。

- 2026-08-28 — AlternativeTo 重投决策：暂不重投。官方 FAQ 明确将 simple calculators 列入通常不收录类型；TTCalc 直接命中该标准，GeoScore 也可能被归类为 basic AI tool / online tool collection。后续优先真实场景评论、SEO/转化优化、以及可验证的差异化证据。若未来有真实用户量、返回使用证据或明显功能差异，再咨询管理员并一次性重投。
- 2026-08-28 — 当日引流兜底：因浏览器控制层不可用且无登录态，未自动发布；已准备 `D:\Codex\projects\geo-score\promotional-content-pack-2026-08-28.md`。TTCalc 部分含 2 条 X 帖、2 条 FB 无链接评论（含一条 Tagalog/English）、2 条 Reddit 无链接评论和 1 条 Quora 模板。

### 配图唯一性标准（2026-08-28）

- 每次发帖/长回答必须使用与该内容对应的新视觉素材，不得复用历史截图。
- 优先使用本次真实界面截图；若截图不合适，可用 AI 生图生成相关主题图，但不得伪造真实用户数据、平台背书或可信度声明。
- 图片命名带日期+平台+主题（例如 `2026-08-28-x-ttcalc-contribution-margin.png`），避免重复上传同一张图。

## 2026-08-29 — Homepage + AI Product Photo Generator

- Added `/tools/tiktok-product-photo/` using SenseNova `sensenova-u1-fast` with browser-side BYOK stored in `localStorage`.
- Supports product prompt, six scene presets, six marketplace ratios, 1–4 images, local API key save/remove, signed image download, and bilingual UI.
- Updated homepage positioning from four calculators to five seller tools and linked the photo generator from the hero and tools grid.
- Updated tools index, sitemap, llms.txt, translations, and page-specific CSS.
- Validation: `node --check` passed for the generator/i18n scripts; Playwright desktop and mobile screenshots rendered without layout breakage; direct SenseNova API test returned a valid image URL.
- Deployment note: push only the tracked changes; do not commit local Playwright artifacts or unused demo image binaries.

## 2026-08-29 — Free no-key image proxy

- Added `ttcalc-photo-proxy` Cloudflare Worker at `https://ttcalc-photo-proxy.geoscore.help/generate` with backend secret `SN_API_KEY`.
- CORS only allows `https://ttcalc.shop` and `https://www.ttcalc.shop`; request sizes are whitelisted, prompts are 1–1000 chars, and an in-memory limit allows 20 requests/IP/hour.
- Frontend now uses the free proxy when no key is entered, and keeps direct SenseNova BYOK when a key is present; optional key wording was updated in English/Chinese.
- Verified: OPTIONS 204, bad origin 403, bad size 400, and real generation 200 with a signed PNG URL.
- Rollback: revert the frontend commit, remove the Worker custom-domain binding, then delete the Worker.

## 2026-08-29 — Homepage v5 redesign

- Rebuilt `/` with a light editorial layout inspired by StyleKit: grid-textured hero, split headline + visual P&L preview, quick-task links, five-tool grid, 32.1% fee-stack fact section, FAQ, and dark rate-update CTA.
- Added scoped `assets/css/home-v5.css`; the style is limited to `body.home-v5`, so calculator and photo pages continue using the shared stylesheet.
- Preserved canonical, title/meta, GA, AdSense, manifest, sitemap, and consolidated JSON-LD (`WebApplication`, `WebSite`, `Organization`, `FAQPage`).
- Kept bilingual UI via `data-i18n`; added Chinese copy for the new preview, quick paths, headline, and fee-fact sections.
- Local validation: `node --check` passed for `translations.js`, `i18n.js`, and `ux.js`; all 4 JSON-LD blocks parsed; all 77 homepage `data-i18n` keys have Chinese definitions; desktop/mobile Playwright screenshots had no horizontal overflow; browser check reported no console errors and zero failed local asset requests.

## 2026-08-29 — Image-to-image editing

- Added `POST /edit` to the same `ttcalc-photo-proxy` Worker. It calls SenseNova `sensenova-u1.5-lite` with the image supplied as a one-element data-URL array and reuses the shared daily quota model: 5/day/IP anonymous, 20/day signed-in user.
- Enforced the same origin allowlist before `/edit`; the temporary `/probe` endpoint was removed.
- Added an optional product-photo upload/drop zone, preview, and remove control. The browser compresses images locally to a maximum side of 2048px as JPEG before sending them to `/edit`.
- When no key is present, the page uses the Worker proxy. With a user key, it calls SenseNova directly with the edit model. Edit prompts append instructions to keep product shape, materials, colors, labels, and text unchanged.
- Updated photo-page copy in English/Chinese and scoped upload styles.
- Deployed Worker version: `ad309de2-1f2e-4369-811f-0f49fb6f22b5`.
- Validation: direct Worker `/edit` test returned HTTP 200 with a signed image URL; final `/probe` returned 404, bad origin 403, and a missing-image request returned 400. Local Playwright verified upload, preview, remove, and a mocked `/edit` submit reached the endpoint and rendered a result card. `node --check` passed for the Worker and frontend scripts. Only local Google sign-in failed because `127.0.0.1` is not an authorized origin.
- Code commit: `0e89dd8` (frontend + Worker). This handover update is a follow-up commit.
- Preview fix: the upload preview now uses a temporary object URL; the compressed JPEG data URL is sent only to the editing request. File types are now restricted to PNG/JPG/WebP.
