# TTCalc Design System Specification (DESIGN.md)

> **System Name**: Cyber-Fintech OS (TTCalc Design System 2.0)  
> **Target Platform**: TikTok Shop Operating Financial System (`ttcalc.shop`)  
> **Benchmark Standards**: Linear.app (Depth & Precision) · Stripe Dashboard (Financial Clarity) · Mercury (Banking Trust) · Bloomberg Terminal (Data Density)  
> **Compliance Standard**: WCAG 2.1 AA / AAA Accessible Design

---

## 1. Visual Theme & Atmosphere

TTCalc 2.0 is an unapologetic, high-density, browser-native **Financial Operating System (FinTech OS)** for modern e-commerce sellers and cross-border merchants.

### Core Visual Principles:
- **Atmosphere**: Cyber-Fintech Dark. Professional, technical, immersive, and zero-distraction.
- **Surface Philosophy**: Absolute rejection of flat artificial black. Depth is achieved through a **4-level Luminance Ladder** (L0 Canvas to L3 Elevated) with `1px` subtle specular borders, rather than heavy drop shadows.
- **Mathematical Honesty**: Every visual element serves the calculation. Pure flat aesthetics, crisp data lines, no skeuomorphic toys (no non-functional macOS traffic lights), no decorative gradients without semantic meaning.
- **Restraint Over Noise**: Status colors (green, amber, red) are desaturated into tinted fills with bright text, preventing neon fatigue during multi-hour SKU modeling sessions.

---

## 2. Color Palette & Roles

All color tokens are exposed via CSS custom properties in `assets/css/design-tokens.css`.

### 2.1 Surface Elevation Ladder (Luminance Hierarchy)
| Elevation Level | CSS Variable | Hex Value | Purpose |
| :--- | :--- | :--- | :--- |
| **L0 Canvas** | `--bg-canvas` | `#08090a` | Full-page background. True deep tone, zero eye strain. |
| **L1 Panel** | `--bg-panel` | `#0f1115` | Major structural containers, calculator cards, bento cards. |
| **L2 Surface** | `--bg-surface` | `#161920` | Inputs, dropdown selects, nested tables, inactive tab pills. |
| **L3 Elevated** | `--bg-elevated` | `#1c2029` | Modals, active hover states, tooltips, sticky summaries. |

### 2.2 Specular Border System
| Border Token | CSS Variable | Value | Purpose |
| :--- | :--- | :--- | :--- |
| **Hairline Border** | `--border-hairline` | `rgba(255, 255, 255, 0.08)` | Standard card, input, and table cell borders. |
| **Specular Top** | `--border-specular` | `rgba(255, 255, 255, 0.14)` | Top edge highlight simulating overhead ambient lighting. |
| **Focus Ring** | `--border-focus` | `#38bdf8` | High-visibility focus ring with `0 0 0 1px #38bdf8`. |

### 2.3 Desaturated Semantic State Tokens (The Desaturation Rule)
*High-saturation fills on dark backgrounds are strictly prohibited.* All semantic states use:  
$$\text{State Container} = \text{12\% Tinted Background} + \text{100\% High-Legibility Text} + \text{28\% Tinted Border}$$

| Semantic Role | Background Tint | Text Color (WCAG AA+) | Border Accent | Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **Success / Safe** | `rgba(16, 185, 129, 0.12)` | `#34d399` | `rgba(16, 185, 129, 0.28)` | Healthy margins (>20%), break-even safety, verified rates. |
| **Warning / Caution** | `rgba(245, 158, 11, 0.12)` | `#fbbf24` | `rgba(245, 158, 11, 0.28)` | Thin margins (5%–15%), BFCM discount alert, tariff deadlines. |
| **Danger / Loss** | `rgba(239, 68, 68, 0.12)` | `#f87171` | `rgba(239, 68, 68, 0.28)` | Negative net profit, GMV Max cash bleed, unviable SKU. |
| **Accent / Cyan** | `rgba(56, 189, 248, 0.12)` | `#38bdf8` | `rgba(56, 189, 248, 0.28)` | Primary CTAs, active tools, interactive sliders. |

### 2.4 Off-White Text Hierarchy (Anti-Halation Ink Tokens)
*Pure `#ffffff` is forbidden on body paragraphs to prevent astigmatic halation.*
- `--text-display`: `#f7f8f8` (Headings, Verdict big numbers)
- `--text-primary`: `#d0d6e0` (Body copy, form labels, table text — 11.5:1 contrast)
- `--text-muted`: `#8a8f98` (Footnotes, secondary formulas, helper copy — 5.8:1 contrast)
- `--text-dim`: `#565b66` (Breadcrumbs, keyboard hints, disabled text — 3.5:1 contrast)

### 2.5 Light-Paper Print Tokens (`@media print`)
For A4 selection reports and client-facing PDFs, tokens automatically remap:
- `--bg-canvas`: `#ffffff`
- `--bg-panel`: `#f8fafc`
- `--text-primary`: `#0f172a`
- `--border-hairline`: `#cbd5e1`

---

## 3. Typography Rules

### 3.1 Font Stacks
```css
/* UI, Headings & Form Text */
--font-sans: 'Geist', 'Inter', -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;

/* Financial Figures, Calculations, Tables & Formulas */
--font-mono: 'Geist Mono', 'JetBrains Mono', 'SF Mono', ui-monospace, Menlo, monospace;
```

### 3.2 Numeric Discipline
All financial metrics, percentages, multipliers (ROAS), and table cells must enforce:
```css
font-variant-numeric: tabular-nums lining-nums;
font-feature-settings: "tnum" 1, "cv01" 1, "ss03" 1;
```

### 3.3 Type Scale & Micro-Typography
| Level | Font Size | Weight | Line Height | Letter Spacing | Font Stack | Use Case |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero Big** | `38px–48px` | 700 | 1.12 | `-0.035em` | Sans | Home Hero Title |
| **Verdict Stat** | `36px–42px` | 600 | 1.00 | `-0.03em` | Mono | Sticky Net Profit / Break-even ROAS |
| **Section H2** | `24px–28px` | 600 | 1.25 | `-0.02em` | Sans | Section Headers, Calculator Titles |
| **Card H3** | `17px–19px` | 600 | 1.30 | `-0.015em` | Sans | Bento Card Titles, Modal Headers |
| **Body Standard** | `14px` | 400 | 1.60 | `0` | Sans | Explanatory Paragraphs, Guides |
| **Input & Table** | `13px–14px` | 500 | 1.40 | `0` | Mono / Sans | Input Fields, Table Cells |
| **Badge & Meta** | `11px–12px` | 600 | 1.20 | `+0.04em` | Sans (Caps) | Eyebrow Badges, Status Pills |
| **Footnote** | `11px` | 400 | 1.45 | `0` | Sans | Disclaimers, Timestamp Verification |

---

## 4. Component Stylings

### 4.1 Input Fields & Dropdown Selects (`.fin-input`, `.fin-select`)
```css
.fin-input, .fin-select {
  height: 40px;
  background: var(--bg-surface);
  border: 1px solid var(--border-hairline);
  border-radius: 8px;
  padding: 0 12px;
  font-family: var(--font-mono);
  font-size: 14px;
  color: var(--text-display);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.fin-input:focus-visible, .fin-select:focus-visible {
  outline: none;
  border-color: var(--border-focus);
  box-shadow: 0 0 0 1px var(--border-focus), 0 0 16px rgba(56, 189, 248, 0.20);
}
```

### 4.2 Bento & Calculator Cards (`.fin-card`)
```css
.fin-card {
  background: var(--bg-panel);
  border: 1px solid var(--border-hairline);
  box-shadow: inset 0 1px 0 0 var(--border-specular);
  border-radius: 14px;
  padding: 24px;
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s ease, box-shadow 0.2s ease;
}
.fin-card:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.18);
  box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.22), 0 16px 36px -12px rgba(0, 0, 0, 0.65);
}
```

### 4.3 Policy Verification HUD Strip (Replaces Fake macOS Dots)
```html
<div class="fin-hud-bar">
  <div class="hud-item hud-status"><span class="hud-dot pulse"></span> RATES VERIFIED: NOV 1, 2026</div>
  <div class="hud-item hud-calc-name">TTCALC FINANCIAL ENGINE // CLIENT-SIDE</div>
  <div class="hud-item hud-meta">ZERO SERVERS &middot; 100% PRIVATE</div>
</div>
```

---

## 5. Layout Architecture & Screen Real Estate

### 5.1 Desktop Split-Pane Layout (Calculators)
To prevent the **13/14-inch Laptop Sticky Truncation Trap**:
```
┌────────────────────────────────────────────────────────────────────────┐
│  SITE HEADER (60px)                                                    │
├───────────────────────────────────┬────────────────────────────────────┤
│  LEFT PANE (46% width)            │  RIGHT PANE (54% width)            │
│  - Parameter Adjustment Form      │  - STICKY VERDICT HUD (Max 580px)  │
│  - Pricing, COGS, Category        │    * Big Net Profit & Margin       │
│  - FBT Weight Tier, Units         │    * Break-even ROAS               │
│  - Commission & Ad Spend          │    * Compact Stacked Waterfall Bar │
│  - Return Rate & Sampling         │    * 1-Click PDF / Sheets Action   │
├───────────────────────────────────┴────────────────────────────────────┤
│  FULL-WIDTH ANALYTICAL DECK (100% width · 1200px max)                  │
│  - 6x6 Margin & ROAS Stress Heatmap (Cells 140px+ wide, zero overflow) │
│  - BFCM Promotion Discount Breakeven Simulator                         │
│  - Regulatory Citations, FAQ Schema, and Audit Logs                   │
└────────────────────────────────────────────────────────────────────────┘
```
- **Sticky Constraint**: Right pane `max-height: calc(100vh - 88px)`. No vertical overflow on 768px height viewports.
- **Heatmap Rule**: 6×6 stress matrices MUST render in the full-width analytical deck below the split-pane.

### 5.2 Homepage Bento Grid (3×2 Symmetric Matrix)
- 6-column base grid: `grid-template-columns: repeat(6, 1fr); gap: 18px;`
- Row 1: Fee Calculator (`span 2`), Profit Calculator (`span 2`), ROAS Calculator (`span 2`)
- Row 2: Batch Calculator (`span 2`), Landed Cost & Tariff Radar (`span 2`), vs Amazon FBA (`span 2`)
- **Zero Odd Cards**: Exactly 3 items per row, 2 rows, 100% geometric balance.

---

## 6. Depth & Elevation

```css
:root {
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.4);
  --shadow-md: 0 4px 16px -2px rgba(0, 0, 0, 0.5);
  --shadow-lg: 0 16px 36px -8px rgba(0, 0, 0, 0.7);
  --shadow-modal: 0 24px 64px -12px rgba(0, 0, 0, 0.85);
}
```

---

## 7. Do's and Don'ts (Strict Engineering Anti-Patterns)

### ❌ DON'T:
1. **NO Fake OS Chrome**: Never inject `<div class="traffic">` macOS window dots.
2. **NO Literary Serifs**: Never use `Newsreader`, `Times`, or italic serif display fonts on numerical calculators.
3. **NO White Body Text on Dark Canvas**: Never use `#ffffff` for paragraphs (violates halation rules; use `#d0d6e0`).
4. **NO Container `data-i18n`**: Never attach `data-i18n` to elements containing child nodes (`<a>`, `<div>`, `<li>` with icons).
5. **NO Neon Fills**: Never fill entire table cells with pure saturated `#10b981` or `#ef4444`. Use 12% opacity tints.
6. **NO Dark Printouts**: Never allow dark backgrounds to print on A4 paper.

### ✅ DO:
1. **Always Tabular-Nums**: Format all numbers with `font-variant-numeric: tabular-nums`.
2. **Leaf-Node i18n**: Only place `data-i18n` on pure text leaf nodes (`<h3>`, `<p>`, `<span>`).
3. **Specular Top Edges**: Give primary cards `box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.12)`.
4. **Desaturated States**: Pair soft tints (`rgba(16,185,129,0.12)`) with high-contrast text (`#34d399`).
5. **Print Inversion**: Invert to clean white paper with black text on `@media print`.

---

## 8. Responsive Breakpoints

| Breakpoint | Viewport Width | Strategy |
| :--- | :--- | :--- |
| **Desktop Wide** | `≥ 1280px` | 3×2 Bento Grid · Split-Pane live HUD · Full-width 6×6 deck. |
| **Laptop Standard** | `1024px – 1279px` | Right pane sticky height strictly constrained to 540px. |
| **Tablet** | `768px – 1023px` | Bento Grid collapses to 2 columns (3 rows). Split-pane collapses to stacked view. |
| **Mobile** | `< 768px` | Single column. Floating sticky bottom mini-HUD for Net Profit & ROAS. Touch targets ≥ 48px. |

---

## 9. Quality Verification Gate
Before releasing any updated page:
- [ ] Contrast ratio for all body copy vs background is `≥ 7.0:1` (approaching AAA).
- [ ] Zero DOM node destruction when toggling language to Chinese.
- [ ] Print preview (`Ctrl + P`) renders pure white paper with crisp black text.
- [ ] 6×6 matrix cells have at least 120px width on laptop viewports.
- [ ] No layout shift (CLS = 0) upon input recalculation.
