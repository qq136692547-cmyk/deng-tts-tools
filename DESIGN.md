# TTCalc — Design System Specification

> 本文件是 TTCalc（ttcalc.shop）唯一的设计权威来源。任何 AI 代理或人在改动 UI 前必须先读本文件。
> 规范建立在 **2026-09-28 对 `assets/css/site.css`、`assets/css/home-v5.css` 的逐行实测**之上，不是凭空设计。
>
> **技术栈红线（不可协商）**：纯静态 HTML + 手写 CSS + 原生 JS，**无构建步骤**。
> 禁止 React / Vue / Vite / Tailwind / PostCSS / Sass / `npm run build`。
> 禁止原子类名（`class="flex items-center"`），只输出语义化类名 + 本文件定义的 CSS。
> 新增 token 一律追加到 `assets/css/site.css` 的 `:root`，**不新建 CSS 框架文件**。
> **修改任何类名前必须先全站 grep**：`ux.js` / `consent.js` / `workspace.js` / `i18n.js` 依赖
> `.faq`、`.faq-v3`、`.hero-stat .n[data-count]`、`.ws-card`、`.consent-bar`、`.adsterra-slot` 等类名。

---

## 1. Visual Theme & Atmosphere

**设计哲学**：编辑级排版（editorial）承载数据密集型内容。这个站卖的是"算得准、说得清"的信任感，不是视觉娱乐。
视觉语言因此选择"**暖纸面 + 衬线标题 + 等宽数字 + 一个暖色强调**"，而不是 AI 默认的"深色玻璃 + 紫蓝渐变"。

| 特征关键词 | 落地方式 |
|---|---|
| **暖中性纸面** | 浅色底 `#FBFBFA` / `#FAF9F6`，不是纯白；正文 `#2F3437`，不是纯黑 |
| **衬线定调** | `Newsreader` 只用于 H1–H3 与卡片标题，承担"可信、有人味"的信号 |
| **等宽管数据** | `Geist Mono` 负责所有金额、百分比、标签、代码；数字列必须水平对齐 |
| **单一暖色强调** | 全站只有一个强调色族（橙）。不引入第二、第三个彩色装饰 |
| **暗色只做剧场** | 深底仅出现在首页 Hero 与工具计算器页；博客/说明页一律浅色，保证长文可读 |

**光影倾向**：浅色页几乎不用阴影（靠 1px 边框与底色差分层级）；深色页用 `inset` 内阴影 + 低透明度外发光制造"玻璃终端"质感。
**质感**：不做毛玻璃滥用。`backdrop-filter` 只允许出现在 sticky header 与深色计算器外壳上。

**当前状态（实测）**：本站在**同一份 CSS 里共存了 4 套互不一致的品牌表达**——

| 作用域 | 文件:行 | `--accent` 实际值 | 覆盖页面数 |
|---|---|---|---|
| `:root`（浅色默认） | `site.css:82–102` | `#111111`（纯黑） | 29 个（全部 blog / about / privacy / terms） |
| `body.home` | `site.css:104–109` | `#111114`（纯黑） | 1（被 home-v5 覆盖） |
| `body.tool-calc` | `site.css:368` | `#F97316`（橙） | 5 个计算器页 |
| `body.home-v5` | `home-v5.css:6–24` | `#F97316` / 文字 `#C2410C` | 1（首页） |

而真正被反复引用的品牌变量 **`--brand-1` 只在 `body.home-v5` 内被定义过**（`home-v5.css:21`）；在 `:root`、`body.home`、`body.tool-calc` 三个作用域下它**未定义**，全靠 `var(--brand-1, #F97316)` 的 fallback 兜住——共 18 处。
`#F97316` 因此成为整份 CSS 中出现次数最多的颜色（**29 次**），却**从来不是一个 token**。这是本规范要修的第一件事。

---

## 2. Color Palette & Roles

### 2.1 现有 token 清单（实测，逐值）

**浅色默认 `:root`** — `assets/css/site.css:82–102`

| 变量名 | 值 | 角色 |
|---|---|---|
| `--bg` | `#FBFBFA` | 页面底（暖白） |
| `--surface` | `#FFFFFF` | 卡片/输入框底 |
| `--surface-soft` | `#F7F6F3` | 次级面（与 Notion 逐值相同） |
| `--ink` | `#2F3437` | 正文（与 Notion 逐值相同） |
| `--ink-soft` | `#787774` | 次要文字（与 Notion 逐值相同） |
| `--ink-dim` | `#B4B2AD` | 最弱文字 / mono 标签 |
| `--line` | `#EAEAEA` | 边框 |
| `--line-soft` | `#F0EFEC` | 弱分隔线 |
| `--accent` | **`#111111`** | 交互色 = 纯黑（**无品牌色**） |
| `--accent-2` | `#333333` | 交互色 hover |

**深色 `body.tool-calc`**（`site.css:368`）：`--bg #0B0B0F` `--ink #111114` `--ink-soft #9B9BAA` `--line rgba(255,255,255,.1)` `--line-soft rgba(255,255,255,.06)` `--accent #F97316` `--accent-2 #DB2777` `--hero-glow-1..4 #FF7A45/#FF4D8D/#8B5CF6/#1E1B4B`

**首页 `body.home-v5`**（`home-v5.css:6–24`）：`--paper #FAF9F6` `--paper-deep #F3F1EC` `--card #fff` `--ink #181818` `--muted #65625B` `--line #E4E1DA` `--line-soft #EFEEE8` `--accent #F97316` `--accent-text #C2410C` `--radius 18px` `--shadow 0 32px 80px -52px rgba(24,24,24,.45)` `--brand-1 var(--accent)`

**被引用但未定义**（只活在 fallback 参数里）：`--brand-1`（`site.css` 共 29 处引用：`245,264,265,267,275,279,283,291,297,313,346,360,383,388,407,412,415,417,457,465,471,472,480,481,488,492,493,499,546`）、`--brand-2`、`--tag-green-fg`、`--tag-green-bg`（`site.css:170`）、`--tool-edge`/`--tool-tint`/`--tool-color`

### 2.2 品牌强调色 — 1 主选 + 2 备选（对比度已实测）

对比度按 WCAG 2.1 相对亮度公式计算；**AA 正文线 = 4.5:1，大字号（≥24px 或 ≥18.66px 粗体）线 = 3:1**。

| 方案 | 色值 | vs `#FFFFFF` | vs `#FAF9F6` | vs `#F7F6F3` | 白字压其上 | 判定 |
|---|---|---|---|---|---|---|
| 现状 `#111111` | 纯黑 | 18.88 | 17.94 | 17.47 | 18.88 | 通过，但**零品牌记忆点** |
| 现状 `#F97316` | Orange 500 | **2.80 ✗** | 2.66 ✗ | **2.59 ✗** | **2.80 ✗** | **浅底上全面不达标**，只能用于深底 |
| **主选 `#C2410C`** | **Orange 700** | **5.18 ✓** | **4.92 ✓** | **4.79 ✓** | **5.18 ✓** | **全通过 AA** |
| 备选 A `#0F766E` | Teal 700 | 5.47 ✓ | 5.20 ✓ | 5.06 ✓ | 5.47 ✓ | 通过，差异化最强 |
| 备选 B `#9A3412` | Orange 800 | **7.31 ✓✓** | 6.94 ✓✓ | 6.76 ✓✓ | 7.31 ✓✓ | 通过 AA+AAA |

**选定：主选 `#C2410C`（Orange 700）**。理由三条：
1. **已在仓库内**——`home-v5.css:15` 的 `--accent-text: #C2410C` 就是它，是现状的"可读版"，不是外来色，迁移成本最低。
2. **保住品牌连续性**——与深色页/首页 hero 的橙色同色相，视觉身份不换，只是把"浅底上读不出"的 `#F97316` 换成达标值。
3. **双向达标**——既可做浅底上的文字/链接色（4.79–5.18:1），也可做实心按钮底 + 白字（5.18:1），一个色值覆盖两种用途。

**备选 A `#0F766E`（teal-700）**：唯一能真正"跳出橙+粉 AI 渐变"俗套的方案，5.06–5.47:1 达标，且青绿在"财务/成本"语境里自带精确感。**代价**：首页 hero、5 个计算器页的高光、`--hero-glow-*` 四色径向渐变全部要重做，属于**结构性改版**。
**备选 B `#9A3412`（orange-800）**：同色相最深一档，6.76–7.31:1 直通 AAA。**适用条件**：只想"把橙色改到能读"，不想动任何版式。

**`#F97316` 的保留角色**：降级为 **display/fill 专用色**，只允许出现在深底（`#0B0B0F` 上 7.01:1 ✓）以及纯装饰性填充（卡片顶部 3px 色条、图标底色、渐变端点）。**禁止**作为浅色面上的文字色或边框 focus 色。

### 2.3 语义色（现状缺失，全部为硬编码散落）

现状：**没有任何语义色 token**，同一含义在不同页面用不同硬编码值——
`--danger` 在浅色页是 `#C0263A`（`site.css:444`），在深色页是 `#FF6B7A`（`site.css:397`），工作区删除按钮又是 `#F87171`（`site.css:552`）；`--success` 一律硬编码 `#4ADE80`（`site.css:187,203,365,366,482,501`，共 14 次）；`--warning` 完全缺失。

**建议新增（浅色主题）**：

| Token | 前景 | 前景 vs 白底 | 配套背景 | 前景 vs 背景 | 用途 |
|---|---|---|---|---|---|
| `--success-fg` / `--success-bg` | `#346538` | 6.85 | `#EDF3EC` | **6.08 ✓** | 已存在（`site.css:170` fallback），直接提升为 token |
| `--warning-fg` / `--warning-bg` | `#B45309` | 5.02 | `#FBF3E4` | **4.55 ✓** | 费率变动、口径不确定提示 |
| `--danger-fg` / `--danger-bg` | `#B91C1C` | 6.47 | `#FDECEC` | **5.66 ✓** | 负毛利、失败态 |
| `--info-fg` / `--info-bg` | `#0369A1` | 5.93 | `#E8F2F8` | **5.22 ✓** | 中性说明、来源标注 |
| `--neutral-fg` / `--neutral-bg` | `#57534E` | 6.99 | `#F5F5F4` | **6.99 ✓** | 无状态标签 / 归档 |

**建议新增（深色主题）**，全部实测于 `#0B0B0F`：

| Token | 值 | vs `#0B0B0F` | 说明 |
|---|---|---|---|
| `--success-fg-dark` | `#4ADE80` | 11.27 ✓✓ | 沿用现值 |
| `--warning-fg-dark` | `#FBBF24` | 11.77 ✓✓ | 已在 `--tok-fn` 用过同值 |
| `--danger-fg-dark` | `#FF6B7A` | 7.14 ✓ | 沿用现值 |
| `--info-fg-dark` | `#60A5FA` | 7.73 ✓ | 已在 `--tok-num` 用过同值 |

### 2.4 品牌强调色 token 建议（浅/深双轨）

```css
:root {
  --brand-500: #F97316;  /* display/fill only：深底 & 装饰填充 */
  --brand-600: #C2410C;  /* 浅色面上的交互/文字色（AA 达标） */
  --brand-700: #9A3412;  /* 需要 AAA 时 */
  --brand-bg:  #FDEEE4;  /* 品牌浅底，vs --brand-600 = 4.57:1 */
  --brand-ring: rgba(194,65,12,.25);
  --brand-1: var(--brand-600);   /* ← 把 29 处 fallback 收敛到 token */
  --brand-2: #DB2777;            /* 渐变副色，仅装饰 */
  --success-fg: #346538; --success-bg: #EDF3EC;
  --warning-fg: #B45309; --warning-bg: #FBF3E4;
  --danger-fg:  #B91C1C; --danger-bg:  #FDECEC;
  --info-fg:    #0369A1; --info-bg:    #E8F2F8;
  --neutral-fg: #57534E; --neutral-bg: #F5F5F4;
  --tag-green-fg: var(--success-fg); --tag-green-bg: var(--success-bg);
}
body.tool-calc {   /* 深底上橙色本身就达标，无需降深 */
  --brand-600: #F97316;
  --success-fg: #4ADE80; --warning-fg: #FBBF24; --danger-fg: #FF6B7A; --info-fg: #60A5FA;
}
```

> **注意**：`--accent` / `--accent-2` 已被 `.consent-btn--solid`（`site.css:689–690`）、`.form-row input:focus`（`site.css:438`）、`.quick-answer` 左边框（`site.css:609`）三处引用，**必须保留**。做法是把 `--accent` 重定义为 `var(--brand-600)`，而不是删除它。

### 2.5 可访问性缺陷（实测数值，非主观）

| 位置 | 现状 | 数值 | 判定 |
|---|---|---|---|
| `.section-sub` / `.bento-card p` / `.tool-v3 p` / `.feature p` / `.tool-prose p` 用 `--ink-soft` 压在 `--surface-soft` `#F7F6F3` 上 | `#787774` on `#F7F6F3` | **4.14** | **✗ 不达 AA（需 4.5）** |
| `.section-tag` / `.source-note` / `.quick-answer-label` / `.data-table thead th` 用 `--ink-dim` | `#B4B2AD` on `#FFFFFF` | **2.12** | **✗ 严重不达标** |
| `.form-row input`（浅色）边界 | `--line #EAEAEA` on `#FFFFFF`，且 `background: var(--surface)` = 白压白 | **1.20** | **✗ 未达非文字 3:1**，输入框边界几乎不可见 |
| `.hint`（深色）`rgba(255,255,255,.45)` | on `#0B0B0F` | **4.14** | ✗ 13px 正文不达 AA |
| `.section-tag` / `.source-note`（深色）`rgba(255,255,255,.4)` | on `#0B0B0F` | **3.42** | ✗ 不达 AA |
| focus ring（浅色）`box-shadow: 0 0 0 3px rgba(15,15,30,.08)`（`site.css:438`） | 混白后约 `#EBEBEF` on `#FFFFFF` | ≈1.1 | ✗ 不可见 |
| focus ring（深色）`rgba(249,115,22,.2)`（`site.css:383,388,499`） | 混白后 `#FEE3D0` on `#FFFFFF` | 1.23 | ✗ 仅在深底上有效 |
| `.bento-card .stat-big` / `.section-eyebrow`（`site.css:267,245`）`#F97316` 文字 | on `#FFFFFF` | **2.80** | ✗ 连大字号 3:1 都不到 |

**修复方向**（不改值只改 token 指向）：`--ink-soft` 在浅色面上改用 `#6B6A66`（预计 ≥4.6）；`--ink-dim` 文字用途改用 `--ink-soft`，`--ink-dim` 只留作装饰；输入框边框改用 `--line-strong: #D8D6D1`；浅色 focus ring 改用 `--brand-600` 的 3px 实心环。

---

## 3. Typography Rules

**字体栈**（自托管，`site.css:10–80`，无外部 CDN，`font-display: swap`）：

| Token | 值 | 角色 |
|---|---|---|
| `--font-display` | `'Newsreader', 'Lyon Text', 'Instrument Serif', Georgia, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Noto Sans SC', serif` | H1–H3、卡片标题、大号结果数字 |
| `--font-body` | `'Geist', 'Inter Tight', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` | 正文、UI、按钮 |
| `--font-mono` | `'Geist Mono', 'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace` | 金额/百分比/标签/代码/表格数字 |

Newsreader=OFL 1.1，Geist/Geist Mono=MIT。**不引入任何新字体 CDN**；新增字体必须先评估加载成本与 CLS。

### Type Scale（现状为散落的 clamp()，以下为收敛后的完整层级）

| Token | Font Size | Weight | Line Height | Letter Spacing | 用途 |
|---|---|---|---|---|---|
| `--fs-display` | `clamp(2.8rem, 6.4vw, 4.9rem)` | 500 | 0.98 | -0.035em | 首页 Hero H1（`home-v5.css:169`） |
| `--fs-h1` | `clamp(2rem, 4.6vw, 3.2rem)` | 500 | 1.08 | -0.025em | 工具页 H1（`site.css:429`） |
| `--fs-h2` | `clamp(1.6rem, 3.6vw, 2.4rem)` | 500 | 1.10 | -0.02em | 章节标题 |
| `--fs-h3` | `clamp(1.25rem, 2.8vw, 1.6rem)` | 500 | 1.20 | -0.015em | 文章 H2 / `.section-header h2` |
| `--fs-h4` | `1.15rem` | 500 / 600 | 1.30 | -0.01em | `.feature h3`、`.calc-card h2` |
| `--fs-lg` | `1.0625rem` (17px) | 400 | 1.55 | 0 | `.section-sub` 导语 |
| `--fs-body` | `1rem` (16px) | 400 | 1.60 | 0 | 正文（`site.css:131` 基准） |
| `--fs-sm` | `0.9375rem` (15px) | 400 | 1.65 | 0 | `.tool-prose p`、`.data-table` |
| `--fs-xs` | `0.8125rem` (13px) | 400 | 1.50 | 0 | `.hint`、脚注 |
| `--fs-label` | `0.6875rem` (11px) | 500 | 1.20 | 0.1em + uppercase | mono 标签（`.eyebrow`、`.form-row label`） |
| `--fs-data` | `1.5rem` (24px) | 600 | 1.00 | -0.02em | mono 大数字（`.stat-big`、highlight 结果） |

**排版哲学**：展示层用衬线收取"编辑权威感"，数据层用等宽保证列对齐，正文用中性无衬线保证长文可读。
**`letter-spacing` 规则**：字号越大间距越紧（负值）；mono 标签一律 `uppercase` + 正间距。
**数字对齐**：所有金额/百分比必须 `font-family: var(--font-mono)` 且右对齐（`.data-table .num`）。

---

## 4. Component Stylings

### 4.1 Buttons

⚠️ **现状问题：两套并行按钮系统**。`site.css:231–237` 定义 `.btn/.btn-primary/.btn-ghost`（7 个页面在用），`home-v5.css:195–233` 另起一套 `.v5-btn/.v5-btn-primary/.v5-btn-ghost`（仅首页），圆角一套是 `10px` 一套是 `999px`。**规范：统一以 `.btn` 为唯一基类**，`.v5-btn-*` 视作待合并的遗留。

```css
/* Primary — 品牌实心 + 白字，对比度 5.18:1 */
.btn { display:inline-flex; align-items:center; gap:8px; min-height:44px;
  padding:12px 20px; border-radius:var(--r-control); border:1px solid transparent;
  font-family:var(--font-body); font-size:15px; font-weight:500; text-decoration:none;
  cursor:pointer; transition:transform .2s var(--ease), box-shadow .2s var(--ease),
    background-color .2s var(--ease), color .2s var(--ease); }
.btn-primary { background:var(--brand-600); border-color:var(--brand-600); color:#FFF; box-shadow:var(--shadow-brand); }
.btn-primary:hover { background:var(--brand-700); border-color:var(--brand-700); transform:translateY(-1px); text-decoration:none; }
.btn-primary:active { transform:translateY(0); box-shadow:none; }
.btn-secondary { background:var(--surface); border-color:var(--line-strong); color:var(--ink); }
.btn-secondary:hover { border-color:var(--brand-600); color:var(--brand-600); text-decoration:none; }
.btn-ghost { background:rgba(255,255,255,.06); color:#FFF; border-color:rgba(255,255,255,.16); }
.btn-ghost:hover { background:rgba(255,255,255,.12); border-color:rgba(255,255,255,.24); }
.btn-danger { background:var(--danger-bg); border-color:var(--danger-fg); color:var(--danger-fg); }
.btn-danger:hover { background:var(--danger-fg); color:#FFF; }
.btn:focus-visible { outline:2px solid var(--brand-600); outline-offset:2px; }
.btn:disabled { opacity:.5; cursor:not-allowed; transform:none; }
```

**禁忌**：一个视区内**只允许一个 Primary**；`#F97316` 不得作为按钮底色（白字压其上仅 2.80:1）。`.btn-danger` 仅用于破坏性操作（如清除已存方案）。

### 4.2 Cards

```css
.card { background:var(--surface); border:1px solid var(--line);
  border-radius:var(--r-card); padding:22px; box-shadow:var(--shadow-xs); }
.card:hover { transform:translateY(-2px); box-shadow:var(--shadow-lg); border-color:transparent; }
/* 品牌顶边条:渐变装饰,允许用 --brand-500 */
.card--brand::before { content:""; position:absolute; inset:0 0 auto; height:3px;
  background:linear-gradient(90deg, var(--brand-500), var(--brand-2)); }
```
现状参考：`.calc-card`（`site.css:433`）已是 `16px` 圆角 + `--shadow-xs` 等价阴影，可直接作为基准。

### 4.3 Inputs

```css
.field label { display:block; font-family:var(--font-mono); font-size:var(--fs-label);
  font-weight:500; text-transform:uppercase; letter-spacing:.08em;
  color:var(--ink-soft); margin-bottom:6px; }
.field input, .field select { width:100%; min-height:44px; padding:10px 14px;
  font-family:var(--font-mono); font-size:15px; color:var(--ink);
  background:var(--surface); border:1px solid var(--line-strong);
  border-radius:var(--r-control); transition:border-color .15s var(--ease), box-shadow .15s var(--ease); }
.field input:focus, .field select:focus { outline:none; border-color:var(--brand-600);
  box-shadow:0 0 0 3px var(--brand-ring); }   /* --brand-ring: rgba(194,65,12,.25) */
.field .hint { margin-top:6px; font-size:var(--fs-xs); line-height:1.45; color:var(--ink-soft); }
```
深色面用 `.form-row` / `.calc-field` 已是正确写法（`site.css:381–391`），只需把 focus 色从 `rgba(249,115,22,.2)` 换成 token。

### 4.4 Badges / Tags —— **现状完全缺失**

实测：全站 CSS **零个** `.badge` / `.tag` / `.chip` / `.pill` 类。现有"徽章"全靠硬编码凑：`.eyebrow` 用未定义的 `--tag-green-fg/bg` fallback 显示绿色（`site.css:170`），`.calc-badge` 硬编码 `#4ADE80` + `rgba(74,222,128,.12)`（`site.css:203`），`.demo-pill` 又一次硬编码同值（`site.css:365`）。**同一视觉出现 3 份重复实现。**

```css
.badge { display:inline-flex; align-items:center; gap:6px; padding:4px 10px;
  border-radius:var(--r-full); font-family:var(--font-mono); font-size:var(--fs-label);
  font-weight:500; letter-spacing:.04em; text-transform:uppercase; white-space:nowrap;
  background:var(--neutral-bg); color:var(--neutral-fg); }
.badge--success { background:var(--success-bg); color:var(--success-fg); } /* 6.08:1 */
.badge--warning { background:var(--warning-bg); color:var(--warning-fg); } /* 4.55:1 */
.badge--danger  { background:var(--danger-bg);  color:var(--danger-fg);  } /* 5.66:1 */
.badge--info    { background:var(--info-bg);    color:var(--info-fg);    } /* 5.22:1 */
.badge--brand   { background:var(--brand-bg);   color:var(--brand-600);  } /* 4.57:1 */
.badge .dot { width:6px; height:6px; border-radius:50%; background:currentColor; }
```
品牌标签（"2026 rates"）用 `.badge--brand`，**不要**再用 `#4ADE80` 表示"新"——绿色在本规范里专指 success。

### 4.5 Navigation

```css
.site-header { position:sticky; top:0; z-index:var(--z-header);
  background:rgba(251,251,250,.85); backdrop-filter:saturate(140%) blur(8px);
  border-bottom:1px solid var(--line-soft); }
.main-nav a { padding:8px 12px; border-radius:var(--r-sm); font-size:14px; color:var(--ink-soft); }
.main-nav a:hover, .main-nav a[aria-current="page"] { color:var(--ink); background:var(--surface-soft); }
```
深色作用域（`body.home` / `body.tool-calc`）需同步覆盖为 `rgba(11,11,15,.55)` + `rgba(255,255,255,.06)` 边线（`site.css:143`），并保证导航文字在深底上 ≥4.5:1（现状 `rgba(255,255,255,.72)` ≈ 8.9:1，达标）。

### 4.6 Modals / Overlays

现状**无 Modal 组件**，只有 `.consent-bar`（`site.css:667–691`，底部滑入，`z-index:900`）。新增 Modal 一律：

```css
.modal-backdrop { position:fixed; inset:0; z-index:var(--z-modal);
  background:rgba(11,11,15,.55); backdrop-filter:blur(4px); }
.modal { max-width:var(--content-w); margin:auto; background:var(--surface);
  border-radius:var(--r-card); padding:var(--s-5); box-shadow:var(--shadow-xl); }
```
必须处理 Esc 关闭、焦点陷阱、`aria-modal="true"`、打开时锁 `body` 滚动。

---

## 5. Layout Principles

**Spacing System** — 现有 `--s-1..--s-10` 已是 4px 基数，**保留不重命名**：

| Token | 值 | Token | 值 |
|---|---|---|---|
| `--s-1` | 4px | `--s-6` | 32px |
| `--s-2` | 8px | `--s-7` | 48px |
| `--s-3` | 12px | `--s-8` | 64px |
| `--s-4` | 16px | `--s-9` | 96px |
| `--s-5` | 24px | `--s-10` | 128px |

建议新增语义别名（提升可读性，不引入新数值）：
```css
--space-section-y: var(--s-9);   /* 96px 章节纵向间距,移动端降 --s-7 */
--space-card-pad:  var(--s-5);   /* 24px 卡片内边距 */
--space-stack:     var(--s-4);   /* 16px 元素纵向堆叠 */
--space-inline:    var(--s-2);   /* 8px 行内间距 */
```

**Grid / Container**：
- `--max-w: 1080px`（全站统一容器，`.container` 横向 padding `24px`，`site.css:139`）。首页实际用 1180px，**规范收紧为 1080px**，或把首页值提升为 `--max-w-wide: 1180px`，禁止页面内硬编码宽度。
- `--content-w: 720px`（`.tool-prose`、`.quick-answer`、`.data-table`、`.formula`、`.embed-box` 共用）。**这是本设计系统最重要的一个约束**：长的可读正文一律不超过 720px（约 65–72ch）。
- 栅格策略：优先 CSS Grid（`.calc-layout` 用 `1fr` → `min-width:860px` 切 `1fr 1fr`），不引入 12 栏栅格系统。**不引入容器宽度断点以外的布局框架。**

**留白哲学**：数据页（工具页）用"紧凑块 + 明确边框"，编辑页（博客）用"大留白 + 无边线"。
`.faq summary` 24px 纵向内边距、`.nextstep-grid` 12px 间距、`.data-table td` 10px 内边距——**同类语义必须沿用同一档位，不允许出现 11px / 13px 这类散值**。

---

## 6. Depth & Elevation

**现状：零阴影 token，36 处 `box-shadow` 全是硬编码**（`site.css` 30 处 + `home-v5.css` 6 处），同一视觉层级出现多个近似值。

### Shadow System（建议新增，值取自现有硬编码，保证视觉不变）

```css
:root {
  --shadow-xs:  0 1px 2px rgba(15,15,30,.04);                      /* 静态卡片 */
  --shadow-sm:  0 2px 8px -4px rgba(15,15,30,.08);                 /* 输入框 hover */
  --shadow-md:  0 12px 30px -12px rgba(15,15,30,.16);              /* 下拉/浮层 */
  --shadow-lg:  0 18px 40px -16px rgba(15,15,30,.18);              /* 卡片 hover */
  --shadow-xl:  0 24px 50px -20px rgba(15,15,30,.22);              /* 大卡片 hover */
  --shadow-brand: 0 18px 38px -26px rgba(194,65,12,.55);           /* Primary 按钮 */
  --shadow-inset-dark: inset 0 1px 2px rgba(0,0,0,.3);             /* 深色输入框 */
  --shadow-overlay-up: 0 -10px 30px -20px rgba(0,0,0,.4);          /* 底部 consent bar */
}
```

| 层级 | 用途 |
|---|---|
| `--shadow-xs` | 静态卡片（`.calc-card` `site.css:433` 现用值） |
| `--shadow-sm` | 输入框 hover / 轻浮层 |
| `--shadow-md` | 浮层、`.nextstep-card:hover` 现用值 |
| `--shadow-lg` | `.bento-card:hover` / `.feature:hover` 现用值 |
| `--shadow-xl` | `.tool-v3:hover` 现用值 |
| `--shadow-brand` | Primary 按钮（首页现用 `rgba(24,24,24,.7)`，改指向品牌色） |
| `--shadow-inset-dark` | 深色 `.calc-field .input`（`site.css:211`） |
| `--shadow-overlay-up` | `.consent-bar`（`site.css:670`） |

### Surface Layers

| 层 | 浅色 | 深色 | 说明 |
|---|---|---|---|
| `background` | `--bg #FBFBFA` | `#0B0B0F` | 页面底 |
| `surface` | `--surface #FFFFFF` | `rgba(255,255,255,.04)` | 卡片 |
| `surface-soft` | `--surface-soft #F7F6F3` | `rgba(255,255,255,.06)` | 次级块、代码底 |
| `elevated` | `--surface` + `--shadow-md` | `rgba(255,255,255,.08)` | 浮层 |
| `overlay` | `rgba(11,11,15,.55)` + blur | 同左 | 遮罩 |

### Z-index Scale（现状 4 个散值：`1 / 50 / 100 / 900`）

```css
--z-base:0; --z-raised:1; --z-header:50; --z-skip:100;
--z-overlay:800; --z-consent:900; --z-modal:1000;
```

**Backdrop Effects**：只允许 `blur(8px)`（header）/ `blur(14px)`（深色 header）/ `blur(18px)`（计算器外壳）三档，不新增。

---

## 7. Do's and Don'ts

**Do's**
1. **新颜色一律先加 token 再引用**。任何 `#RRGGBB` 直写在选择器里都视为缺陷（现状 `#F97316` 直写 29 次、`#4ADE80` 14 次）。
2. 浅色面上的交互色只用 `--brand-600 #C2410C`（≥4.79:1）；`--brand-500 #F97316` 只允许出现在深底或纯装饰填充。
3. 长正文容器固定 `--content-w: 720px`；表格/代码块横向超出时用 `overflow-x:auto`，不压缩字号。
4. 所有金额、百分比、费率数字用 `--font-mono`，同一列必须右对齐。
5. 语义含义只用语义色：绿=success、黄=warning、红=danger、蓝=info。**不要用 `#4ADE80` 表示"新"**。
6. 扩展 `:root` 时**只追加、不重命名**已有 token（`--s-*`、`--r-*`、`--max-w`、`--content-w`、`--ease` 已被全站引用）。
7. 触摸目标 ≥44×44px（现状 `.copy-results-btn` `min-height:44px`、`.ws-card` `min-height:44px` 是正确示范）。
8. 每个页面**只允许一个 Primary 按钮**。

**Don'ts**
1. 禁止 Tailwind / 任何原子类；禁止 React / Vue / Vite / 打包链；禁止 `npm run build`。
2. 禁止把 `#F97316` 用作浅色面上的正文、链接、标签文字或按钮底色（2.59–2.80:1，全部不达标）。
3. 禁止新增第 5 套主题作用域。现有已 4 套（`:root` / `body.home` / `body.tool-calc` / `body.home-v5`），新页面必须归入既有之一。
4. 禁止把 `--ink-dim #B4B2AD` 用于任何需要被阅读的文字（2.12:1）。
5. 禁止在浅色面用 `box-shadow` 做焦点指示（`rgba(15,15,30,.08)` ≈1.1:1 不可见）——一律用 `outline: 2px solid var(--brand-600)`。
6. 禁止再新增按钮/徽章变体类名（`.v5-btn-*`、`.demo-pill`、`.calc-badge` 三套并存已是负债），改用 `.btn-*` / `.badge--*`。
7. 禁止改 `.adsterra-*`、`.consent-*`、`.ws-card`、`.faq`、`.faq-v3`、`.hero-stat .n` 等被 JS `querySelector` 的类名——改名会静默失效。改前必须全站 grep。
8. 禁止动画化布局属性（`width`/`height`/`top`）；只动 `transform`/`opacity`。禁止回弹缓动，只用 `--ease: cubic-bezier(0.22,1,0.36,1)`。

---

## 8. Responsive Behavior

⚠️ **技术事实**：原生 CSS 的媒体查询**不支持 `var()`**（`@media (max-width: var(--bp-md))` 无效）。
因此断点在本项目中是**文档常量**，必须写死 px，但取值必须来自下表，不得自行发明。

### Breakpoints（现状 10 个散值 → 收敛为 4 个）

| Token（文档常量） | 值 | 名称 | 规则 |
|---|---|---|---|
| `BP-SM` | **480px** | mobile | 单列；导航字号 12px；章节纵向间距 `--s-7`；`.calc-body` 单列 |
| `BP-MD` | **720px** | tablet | 工具页主体单列；`.footer-grid` → 2 列 |
| `BP-LG` | **1024px** | desktop | 多列布局全开（`.calc-layout` 1fr 1fr） |
| `BP-XL` | **1280px** | wide | 容器锁定 `--max-w`，不再放大字号 |

**迁移映射**（现状 → 目标）：`360px`→并入 `480px`；`600px`→`640px`→**统一为 `720px`**；`640px`→`720px`；`860px`→`1024px`；`900px`→`1024px`；`home-v5 的 1024px` 保留。

### Touch Targets
- 最小 **44×44px**（WCAG 2.5.5 Target Size AAA / 2.5.8 AA=24px，本项目取 44px）。
- 移动端导航允许横向滚动（`.main-nav` 已实现 `overflow-x:auto` + 隐藏滚动条，`site.css:578`），**但不得隐藏任何功能项**。

### 折叠策略
- 不隐藏关键功能。移动端优先**重排/堆叠**，次选横向滚动，最后才考虑折叠进 Accordion（`.faq` 已是 `<details>` 原生折叠，可复用）。
- 表格在 `BP-SM` 下：降字号到 13px + 减内边距（`site.css:637` 现做法），**不要**转成卡片式重排（会破坏数据列对齐）。
- 广告位在 `BP-SM` 下依赖容器横向滚动（`.adsterra-banner overflow-x:auto`），保留固定 width/height 属性以维持 CLS=0。

### Font Scaling
- 使用 `clamp()` 流体字号（现有 `--fs-display` / `--fs-h1` / `--fs-h2` 已如此）。
- `article p` / `article li` 在 `BP-SM` 下锁定 15px（`site.css:535`）。
- 尊重 `prefers-reduced-motion: reduce`（`site.css:514–520` 已实现，新组件必须一并加入该块）。
- 必须尊重 `-webkit-text-size-adjust: 100%`（`site.css:130` 已设），不得用 `user-scalable=no`。

---

## 9. Agent Prompt Guide

### Quick Reference（生成任何 UI 前必读）

```
品牌色   --brand-600 #C2410C（浅面文字/交互，AA 达标）  |  --brand-500 #F97316（仅深底/装饰）
文字     --ink #2F3437 | --ink-soft #787774（≥15px 才可用）| --ink-dim #B4B2AD（禁用于正文）
底色     --bg #FBFBFA | --surface #FFFFFF | --surface-soft #F7F6F3
暗色     --bg #0B0B0F | 卡片 rgba(255,255,255,.04) | 线 rgba(255,255,255,.1)
圆角     --r-sm 4 | --r-control 10（按钮/输入）| --r-lg 12 | --r-card 16 | --r-full 9999
间距     4/8/12/16/24/32/48/64/96/128（--s-1..--s-10）
阴影     --shadow-xs/md/lg/xl（浅色靠线，不靠影）
宽度     --max-w 1080px（容器）| --content-w 720px（正文）
缓动     --ease cubic-bezier(0.22,1,0.36,1)
断点     480 / 720 / 1024 / 1280（写死 px，不能用 var()）
禁止     React/Vue/Vite/Tailwind/原子类/新字体 CDN/动画化布局属性
```

### 可直接复制的组件 Prompt

1. **生成一个费率结果卡片**：用 `--font-mono` 显示 4 行「项目 / 金额」，右对齐，金额用 `--ink`；最后一行 `.result-row.highlight` 用深底 `linear-gradient(135deg, rgba(249,115,22,.2), rgba(219,39,119,.2))` + 白字，字号 `--fs-data`。
2. **生成一个费率变动提示徽章**：`.badge.badge--warning`，文案 `Fees updated 2026-09`，`--warning-bg #FBF3E4` / `--warning-fg #B45309`（4.55:1）。禁止用绿色。
3. **生成一个工具页 H1 区**：`.eyebrow`（`--fs-label` mono 大写）+ `<h1>`（`--fs-h1` Newsreader 500）+ `.subtitle`（`--fs-lg`，`--ink-soft`，`max-width:68ch`），纵向间距 `--s-3` / `--s-4` / `--s-6`。
4. **生成一篇文章的正文区**：`.tool-prose` 包裹，`max-width: var(--content-w)`，`p` 用 `--fs-sm`/1.65/`--ink-soft`，`h3` 用 Newsreader `--fs-h4`，链接 `--ink` + 下划线。
5. **生成一个数据表**：`.data-table`，`th` 用 mono 11px 大写 `--ink-dim`，数字列 `class="num"` 右对齐 mono，`.total` 行加粗 + 上边线。
6. **生成一个空状态**：居中单列，`--fs-h4` Newsreader 标题 + `--fs-sm` `--ink-soft` 说明 + 一个 `.btn-primary` 行动按钮。不要插图，不要 emoji。

### 迭代建议（8–10 条）

1. **先做 token 落地，再改视觉**：把 `--brand-1/--brand-2/--tag-green-*/--tool-*` 6 个幽灵变量在 `:root` 中正式定义，29 处 fallback 自动收敛——**零视觉变化，纯技术债清理**，风险最低。
2. **修 `--ink-soft` 在 `--surface-soft` 上的 4.14:1**：这是全站出现最广的可访问性缺陷（覆盖 `.section-sub`/`.feature p`/`.tool-prose p`）。候选值 `#6B6A66`。
3. **修浅色输入框边界 1.20:1**：新增 `--line-strong: #D8D6D1` 专供表单控件边框，达 3:1。
4. **删死代码**：`site.css` 中约 138 行（20%）组件类零 HTML 引用——`.hero-v3`、`.bento-*`、`.tool-v3`、`.section-eyebrow`、`.demo-tab*`、`.tok-*`、`.hero-stats`、`.trust-strip`、`.kbd`、`.subscribe-*`、`.calc-layout`、`.calc-card`、`.faq-v3`。删前逐一 grep 确认（`ux.js:63,97` 有两个无害的残留选择器需一并清理）。
5. **统一按钮为 `.btn`**：把首页 `.v5-btn-*` 4 个变体并入 `.btn-primary/secondary/ghost`，圆角从 `999px` 收敛到 `--r-control 10px`（或反向统一为 pill，二者择一，不得并存）。
6. **统一徽章为 `.badge--*`**：合并 `.eyebrow` / `.calc-badge` / `.demo-pill` 三份重复实现。
7. **断点从 10 个收敛到 4 个**：优先合并 `600/640` 两档，这是出现频率最高的一对散值。
8. **给 focus 态一个统一 token**：`--focus-ring: 2px solid var(--brand-600)` + `offset:2px`，替换浅色面上不可见的 `rgba(15,15,30,.08)` 阴影。
9. **`--accent` / `--accent-2` 保留名称、改指向品牌色**，而不是删掉——它们被 `.consent-btn--solid` 等 3 处引用。
10. **每加一个 token，就删掉对应的硬编码**。`#F97316`（29 处）、`#4ADE80`（14 处）、`#111114`（10 处）应归零。

---

## 附录：Token 迁移对照表

### A. 现有 token —— 保留（不重命名，只追加）

| token | 值 | 位置 |
|---|---|---|
| `--bg` `--surface` `--surface-soft` | `#FBFBFA` `#FFFFFF` `#F7F6F3` | `site.css:83–85` |
| `--ink` `--ink-soft` `--ink-dim` | `#2F3437` `#787774` `#B4B2AD` | `site.css:86–88` |
| `--line` `--line-soft` | `#EAEAEA` `#F0EFEC` | `site.css:89–90` |
| `--accent` `--accent-2` | `#111111` `#333333` | `site.css:91–92`（**值改指向品牌色**） |
| `--font-display` `--font-body` `--font-mono` | 见 §3 | `site.css:93–95` |
| `--r-sm` `--r-md` `--r-lg` | `4px` `6px` `12px` | `site.css:96` |
| `--s-1`…`--s-10` | `4…128px` | `site.css:97–98` |
| `--max-w` `--content-w` `--ease` | `1080px` `720px` `cubic-bezier(.22,1,.36,1)` | `site.css:99–101` |
| `--hero-glow-1..4` | `#FF7A45` `#FF4D8D` `#8B5CF6` `#1E1B4B` | `site.css:368` |
| `--paper` `--paper-deep` `--card` `--muted` `--accent-text` `--radius` `--shadow` | 见 §2.1 | `home-v5.css:7–17` |

### B. 现有"幽灵变量" —— 从 fallback 提升为正式 token

| 变量 | 现状态 | 建议正式值 | 受影响引用数 |
|---|---|---|---|
| `--brand-1` | 仅 `home-v5.css:21` 定义 | `var(--brand-600)` | 29 处 fallback |
| `--brand-2` | **从未定义** | `#DB2777` | 3 处 |
| `--tag-green-fg` | **从未定义** | `var(--success-fg)` = `#346538` | 1 处（`site.css:170`） |
| `--tag-green-bg` | **从未定义** | `var(--success-bg)` = `#EDF3EC` | 1 处 |
| `--tool-edge` `--tool-tint` `--tool-color` | **从未定义** | 随 `.tool-v3` 一并删除（死代码） | 4 处 |

### C. 建议新增 token（含具体值）

| 类别 | 新增 token | 值 | 对应现状硬编码 |
|---|---|---|---|
| 品牌 | `--brand-500` | `#F97316` | 29 处直写 |
| 品牌 | `--brand-600` | `#C2410C` | `home-v5 --accent-text` |
| 品牌 | `--brand-700` | `#9A3412` | 无（新增，供 AAA 场景） |
| 品牌 | `--brand-bg` | `#FDEEE4` | 无 |
| 品牌 | `--brand-ring` | `rgba(194,65,12,.25)` | `rgba(249,115,22,.2)` 6 处 |
| 语义 | `--success-fg/-bg` | `#346538` / `#EDF3EC` | `site.css:170` fallback |
| 语义 | `--warning-fg/-bg` | `#B45309` / `#FBF3E4` | 无（缺失） |
| 语义 | `--danger-fg/-bg` | `#B91C1C` / `#FDECEC` | `#C0263A`(L444) `#FF6B7A`(L397) `#F87171`(L552) |
| 语义 | `--info-fg/-bg` | `#0369A1` / `#E8F2F8` | 无（缺失） |
| 语义 | `--neutral-fg/-bg` | `#57534E` / `#F5F5F4` | 无（缺失） |
| 语义(深) | `--success-fg-dark` 等 4 个 | `#4ADE80` `#FBBF24` `#FF6B7A` `#60A5FA` | 14 处 `#4ADE80` 等 |
| 线条 | `--line-strong` | `#D8D6D1` | 表单边框用 `--line`（1.20:1 ✗） |
| 文字 | `--ink-soft`（浅面取值调整） | `#6B6A66` | `#787774` 在 `#F7F6F3` 上 4.14 ✗ |
| 圆角 | `--r-xs` | `2px` | 1 处 `2px` |
| 圆角 | `--r-control` | `10px` | **12 处 `10px`** |
| 圆角 | `--r-card` | `16px` | 6 处 `16px` |
| 圆角 | `--r-xl` | `18px` | `home-v5 --radius` |
| 圆角 | `--r-full` | `9999px` | 8 处 `9999px` + 2 处 `999px` |
| 字号 | `--fs-display/h1/h2/h3/h4/lg/body/sm/xs/label/data` | 见 §3 | 全部散落 clamp()/px |
| 阴影 | `--shadow-xs/sm/md/lg/xl/brand/inset-dark/overlay-up` | 见 §6 | 36 处硬编码 |
| 层级 | `--z-base/raised/header/skip/overlay/consent/modal` | `0/1/50/100/800/900/1000` | 4 处散值 |
| 间距别名 | `--space-section-y/card-pad/stack/inline` | `96/24/16/8px` | 语义别名 |
| 焦点 | `--focus-ring` | `2px solid var(--brand-600)` | `rgba(15,15,30,.08)` 不可见 |

### D. 建议删除（死代码，零 HTML 引用）

`site.css` 中 `.hero-v3`(173–194)、`.home-section/section-eyebrow/section-title/section-sub`(239–250)、`.bento-*`(252–268)、`.tool-v3`(270–285)、`.faq-v3 + .faq-animate`(286–308)、`.trust-strip`(310–313)、`.kbd`(339)、`.hero-stats/hero-stat`(341–348)、`.demo-tab* + .tok-*`(350–367)、`.calc-layout/calc-card`(431–434)、`.subscribe-*`(496–508)。
合计约 **138 行 / 699 行 ≈ 20%**。删除前须 grep 确认，并同步清理 `assets/js/ux.js:63,97` 的两处残留选择器。

---

*本规范基于 2026-09-28 对仓库的逐行实测生成。参考品牌设计语言：**Vercel**（字体来源，精确克制的黑白与等宽数字）、**Notion**（暖中性色板来源，`#F7F6F3`/`#787774` 逐值重合）、**Stripe**（数据密集型信息设计）。产出的是 TTCalc 自己的设计系统，不是任何一个品牌的复制。*

---

## 附录 E：独立复核（design-arch · 2026-09-28）

本节是对上文正文的**独立二次核验**，只记录三件事：**被证实的**、**被修正的**、**被遗漏的**。所有结论附可复现指令。

### E.1 ✅ 已证实：附录 D 死代码清单成立（这是本文件风险最高的一条，已逐类验证）

对全部 46 个 HTML 页面逐类 grep，正文 §4.4 / 附录 D 列为死代码的类名，**HTML 引用数全部为 0**：

```
hero-v3 / bento-card / bento-v3 / tool-v3 / hero-stats / trust-strip /
demo-tab / section-eyebrow / faq-v3 / kbd / subscribe-form / calc-card /
calc-layout / tok-str / home-section   →  均为 0
```

且额外确认其中 9 个在 `assets/js/` 中引用数亦为 0。**结论：附录 D 的 138 行删除建议在"无 HTML 引用"这一点上准确。**

**唯一需修正的例外**：`.faq-v3` **被 JS 引用**——
`assets/js/ux.js:97` → `document.querySelectorAll('.faq, .faq-v3')`
删除 `.faq-v3` 的 CSS 时必须同步把该选择器收敛为 `.faq`，否则留下一个永不命中的死选择器（功能无害，但会误导后续维护者以为 `.faq-v3` 仍在使用）。

### E.2 ⚠️ 遗漏项 1：主题不是 4 套，是 **5 套**（修正 §7 Don'ts #3、"出现第 5 套主题"的判定）

正文 §7 Don'ts #3 写"现有已 4 套，禁止新增第 5 套"。实测**第 5 套已经存在**，且不在 `site.css` / `home-v5.css` 里，因此在只读这两份 CSS 时不可见——它以**内联 `<style>`** 形式分散在 3 个博客页：

| 页面 | 位置 | 内联主题 |
|---|---|---|
| `blog/tiktok-shop-first-sale-playbook-2026/index.html` | `:103–115` | `--bg:#0a0a0f --accent:#6C63FF --ink:#f5f5f7 --ink-soft:#a1a1aa --line:rgba(255,255,255,.08) --surface-soft:rgba(255,255,255,.03) --r-sm:8px --r-md:12px --r-lg:16px` |
| `blog/tiktok-shop-shipping-costs-2026/index.html` | `:103–115` | 同上 |
| `blog/tiktok-shop-account-suspension-appeal-2026/index.html` | `:103–115` | 同上 |

三页**同时加载 `site.css`**（各 1 处 `<link>`），再用内联 `:root` 把它整份覆盖掉——`--accent` 变成紫色 `#6C63FF`、`--r-sm/md/lg` 被从 `4/6/12px` 重定义为 `8/12/16px`。**后果**：这 3 页与其余 43 页视觉断裂（紫色 vs 黑色/橙色），且圆角体系与全站不一致；同时因为 `--r-*` 被就地重定义，任何基于"圆角 = 4/6/12"的假设在这 3 页都会失效。

> 复现：`grep -rl "6C63FF" --include=*.html .` → 3 个文件。
> **建议**：并入 §B.3 迭代建议，作为"消除视觉断裂"的独立条目；迁移时**只改样式，不动文案与结构**。

### E.3 ⚠️ 遗漏项 2：`.blog-post` 是一个 22 页在用的**空类**

| 事实 | 数值 |
|---|---|
| `blog-post` 出现总次数 | **27** |
| 使用页面数 | **22** |
| 形态 | `<body class="blog-post">` **5 页** + `<main id="main" class="blog-post">` **17 页** |
| `assets/css/site.css` 中 `.blog-post` 规则数 | **0** |

复现：`grep -c blog-post assets/css/site.css` → `0`；`grep -rh "blog-post" --include=*.html . | wc -l` → `27`。

**判定**：这是一个"有类名、无样式"的孤儿钩子。它不影响渲染（因此长期未被发现），但会让任何读代码的人误以为博客页有专属样式体系。**二选一**：给 `.blog-post` 补规则（推荐，让博客排版有明确归属），或从 22 个页面移除。**不要维持现状。**

### E.4 ⚠️ 遗漏项 3：`--r-lg: 12px` 是零引用死 token

| Token | `var()` 引用次数 |
|---|---|
| `--r-sm` | 3 |
| `--r-md` | 6 |
| `--r-lg` | **0** |

复现：`grep -ro "var(--r-lg)" assets/css/ | wc -l` → `0`。
正文附录 A 把 `--r-lg` 列入"保留"清单，但未标注它**在全站从未被使用过**。保留无害，只是别指望它现在起了作用——正文 §4.4 提到的圆角问题（10px 出现 12 次等）实际全靠字面量支撑。

### E.5 ⚠️ 遗漏项 4：首页有**独立的** `--ink-dim` 对比度陷阱——**只改 `:root` 修不好首页**

token 继承链实测（`site.css` 先加载，`home-v5.css` 后加载）：

| Token | 首页最终取值 | 来源 | 对比度 |
|---|---|---|---|
| `--ink` | `#181818` | `home-v5.css:10` | ✅ |
| `--ink-soft` | `#5A5A66` | **`site.css:106`（`body.home`）**——home-v5 **不定义**它 | **6.57 : 1 ✅ 达标** |
| `--ink-dim` | `#9B9BAA` | **`site.css:106`（`body.home`）**——home-v5 **不定义**它 | **2.65 : 1 ❌** |
| `--accent` | `#F97316` | `home-v5.css:14` | 2.80:1（文字场景 ❌） |
| `--muted` | `#65625B` | `home-v5.css:11` | 5.78 : 1 ✅ |

**两条关键推论**：
1. **index.html 的 `--ink-dim` 是 `#9B9BAA`（2.65:1），不是 `:root` 的 `#B4B2AD`（2.05:1）**。修 §B.3 迭代建议 2 / 4（`--ink-soft`、`--ink-dim`）时，**必须连 `site.css:104–109` 的 `body.home` 作用域一起改**，否则首页行为与其余页面不一致。
2. 首页同时存在**两个语义重复的次级文字 token**：`--muted #65625B`（home-v5 用，6 处）与继承来的 `--ink-soft #5A5A66`（site.css 规则用）——两者都达标但互不相等，是本规范应收敛的重复。**`#5A5A66` 值得作为 `--ink-soft` 的修正参考值**，它是站内实测已达标（6.57:1）的暖灰。

### E.6 ⚠️ 遗漏项 5：改 `--accent` 需要同时改 **3 个作用域**，否则"改了却看不出变化"

`--accent` 被以下作用域**就地重定义**，只改 `:root` 不会传导：

| 作用域 | 文件:行 | 当前值 |
|---|---|---|
| `:root` | `site.css:91` | `#111111` |
| `body.home` | `site.css:108` | `#111114` |
| `body.tool-calc` | `site.css:368` | `#F97316` |
| `body.home-v5` | `home-v5.css:14` | `#F97316` |

**影响面**：只改 `:root` → 5 个计算器页（`tool-calc`）与首页（`home-v5`）**维持橙色不变**，只有 29 个默认浅色页（blog / about / privacy / terms）变成品牌黑→橙。这会造成"改了一半"的诡异状态。**执行 §B.3 迭代建议 3 时，必须一次性改 `site.css:91`、`site.css:368`、`home-v5.css:14` 三处（`site.css:108` 建议一并改以保持一致）。**

### E.7 ⚠️ 遗漏项 6：断点迁移方案（§8）存在回归风险——现状里混着**容器宽**

正文 §8 称"现状 10 个散值 → 收敛为 4 个（480 / 720 / 1024 / 1280）"，并把 `640px → 720px`、`860/900px → 1024px`、`980px` 并入。实测现状是 **11 个**，且其中 3 个**根本不是设备断点，而是容器宽度**：

| max-width | 次数 | 实际语义 | 是否设备断点 |
|---|---|---|---|
| `360px` | 1 | `.logo span` 隐藏 | ✅ 设备（孤例） |
| `480px` | 17 | 手机 | ✅ 设备 |
| `600px` | 1 | `.tools-v3` 单列（孤例） | ✅ 设备 |
| `640px` | 15 | 平板竖 / 手机横 | ✅ 设备 |
| `720px` | 7 | `.calc-body` 折叠 / `.footer-grid` | ✅ 设备 |
| `760px` | 2 | `.faq` 最大宽 | ❌ **容器宽** |
| `880px` | 6 | `.calc-window` / `.nextstep` 最大宽 | ❌ **容器宽** |
| `900px` | 4 | 3 列 → 2 列 | ✅ 设备 |
| `980px` | 1 | hero 标题限宽（孤例） | ❌ **容器宽** |
| `1180px` | 2 | 首页容器 | ❌ **容器宽** |
| `min-width:860px` | 1 | `.calc-layout` 两列 | ✅ 设备 |

**风险**：把 `760/880/1180` 这类**容器宽**并入设备断点序列，会让"容器该多窄"和"屏幕该多宽"两个正交的问题互相污染——例如把 `.faq { max-width: 760px }` 改成"断点 720px"会直接改变 FAQ 的视觉宽度。

**修正建议**：分两类治理，不要合成一条序列：
- **设备断点**（保留在 `@media`）：`480 / 640 / 900` 三档 + `min-width: 860px` 归一为 `900px`；`360` 与 `600` 两个孤例删除（并入 480 / 640）。
- **容器宽**（迁到 `@container`）：`720 / 760 / 880 / 1080 / 1180`——`.calc-window`、`.calc-card`、`.faq`、`.tool-prose` 是首选容器候选。这也是 impeccable 技能推荐的方向（"响应式优先用 `@container`"）。

### E.8 ⚠️ 遗漏项 7：触摸目标违规清单（正文只给了 44px 原则，未给待修项）

按实测 padding + font-size 推算的可点击高度：

| 元素 | 位置 | 实测高度 | 判定 |
|---|---|---|---|
| `.main-nav a` @360px | `site.css:166`（`padding:4px 5px` + `11px`） | ≈ **19px** | ❌ |
| `.main-nav a` @480px | `site.css:160`（`padding:5px 6px` + `12px`） | ≈ **22px** | ❌ |
| `.lang-toggle` | `site.css:559`（`padding:4px 12px` + `12px`） | ≈ **22px** | ❌ |
| `.ws-del` | `site.css:551`（`14px` + `padding:0 2px`） | ≈ **16px** | ❌ |
| `.footer-col a` | `site.css:327`（`14px`，行高 1.45，无 padding） | ≈ **20px** | ❌ |
| `.copy-results-btn` | `site.css:479`（`min-height:44px`） | **44px** | ✅ 正确示范 |
| `.ws-card` | `site.css:548`（`min-height:44px`） | **44px** | ✅ 正确示范 |
| 深色 `.form-row input` / `.calc-field input` | `site.css:381,387`（`min-height:48px`） | **48px** | ✅ 正确示范 |
| 浅色 `.form-row input` | `site.css:437`（无 `min-height`） | ≈ **41px** | ⚠️ 临界 |

修复手法：文字型链接不改视觉，用伪元素扩热区（`position:relative` + `::after { position:absolute; inset:-12px 0 }`）。

### E.9 ✅ 双路交叉验证：对比度数值双方**完全一致**

本规范正文的对比度与 design-arch 的独立计算（同一 WCAG 2.1 相对亮度公式、两条独立实现）在以下关键值上**逐位吻合**，因此**主选 `#C2410C` 的结论经双路验证成立**：

| 色对 | 双方实测 | 判定 |
|---|---|---|
| `#787774` on `#FBFBFA` | 4.32 | ❌ AA |
| `#787774` on `#F7F6F3` | 4.14 | ❌ AA |
| `#787774` on `#FFFFFF` | 4.48 | ❌ AA |
| `#B4B2AD` on `#FFFFFF` | 2.12 | ❌ 严重 |
| `#F97316` on `#FFFFFF` | 2.80 | ❌ 连大字号都不到 |
| **`#C2410C` on `#FFFFFF`** | **5.18** | **✅ AA** |
| `#9A3412` on `#FFFFFF` | 7.31 | ✅ AAA |
| `#4ADE80` on `#0B0B0F` | 11.27 | ✅ AAA |
| `#FF6B7A` on `#0B0B0F` | 7.14 | ✅ AA |

**唯一实质分歧在"未达标项如何修"而非"是否未达标"**：本节 E.5 建议 `--ink-soft` 参考站内已达标值 `#5A5A66`（6.57:1，与暖中性纸面同族）；正文 §B.3/§附录 C 建议 `#6B6A66`（预估 ≥4.6:1）。两者都通过，`#5A5A66` 余量更大且**已在站内实际使用**，建议优先采用；`#6B6A66` 作为备选。

### E.10 复核结论

| 检查项 | 结论 |
|---|---|
| 现有 token 清单完整性 | ✅ 准确，与 design-arch 实测逐值一致 |
| 品牌色 1 主选 + 2 备选 + 对比度 | ✅ 成立，双路验证 |
| 语义色 / 阴影 / 断点 / 组件缺失诊断 | ✅ 成立 |
| 死代码清单（附录 D） | ✅ **证实**（15 类零引用），需补 `.faq-v3` 的 JS 例外 |
| 主题套数 | ⚠️ **修正为 5 套**（漏 3 页内联紫黑主题，见 E.2） |
| `.blog-post` 空类 | ⚠️ **遗漏**（22 页在用、零规则，见 E.3） |
| 死 token `--r-lg` | ⚠️ **遗漏**（零引用，见 E.4） |
| 首页 token 继承链 | ⚠️ **遗漏**（只改 `:root` 修不好首页，见 E.5） |
| `--accent` 多作用域重定义 | ⚠️ **遗漏**（需改 3 处，见 E.6） |
| 断点分类（设备 vs 容器） | ⚠️ **修正**（4 个是容器宽，不应并入设备断点，见 E.7） |
| 触摸目标违规清单 | ⚠️ **遗漏**（5 处违规 + 3 处正确示范，见 E.8） |

> **本附录不改动正文任何结论，只做补充与修正。** 执行顺序建议：E.5 / E.6（避免"改一半"）→ E.3 / E.4（清理空类与死 token）→ E.2（消除第 5 套主题）→ E.7 / E.8（断点与触摸目标）。
