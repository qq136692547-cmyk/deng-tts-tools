# TTCalc — 100% In-Browser TikTok Shop Profit & Financial OS (Nov 2026)

[![Production Status](https://img.shields.io/badge/Production-Live%20v2.0-38bdf8?style=flat-square)](https://ttcalc.shop/)
[![Verified Rates](https://img.shields.io/badge/Rates-November%202026%20Verified-34d399?style=flat-square)](https://ttcalc.shop/rate-updates/)
[![Privacy Guarantee](https://img.shields.io/badge/Privacy-100%25%20In--Browser%20Zero--Upload-10b981?style=flat-square)](https://ttcalc.shop/privacy/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

> **🛡️ Zero Ads · Zero Account Required · 100% Client-Side Privacy**  
> All mathematical calculations, CSV batch imports, and financial stress simulations run entirely inside the client's browser. Product costs, pricing strategies, and margins never touch any remote server.

- **Production Domain**: [https://ttcalc.shop/](https://ttcalc.shop/)
- **Architecture**: Static HTML5 + CSS Variables (`design-tokens.css`) + Vanilla JavaScript (Zero build step, sub-millisecond execution).

---

## 3×2 Golden Suite: The 6 Core Financial Engines

| Engine | Directory | Key Capabilities |
| :--- | :--- | :--- |
| **01. Fee Calculator** | [`/tools/tiktok-fee-calculator/`](https://ttcalc.shop/tools/tiktok-fee-calculator/) | Referral fees (6%/5%), FBT fulfillment tiers, creator commission, flat order fees. |
| **02. Profit Calculator** | [`/tools/tiktok-profit-calculator/`](https://ttcalc.shop/tools/tiktok-profit-calculator/) | Net profit per unit, margin %, direct ROI, non-resellable return losses, BFCM volume surge required to break even. |
| **03. ROAS Calculator** | [`/tools/tiktok-roas-calculator/`](https://ttcalc.shop/tools/tiktok-roas-calculator/) | GMV Max break-even ROAS safety line, net profit at reported ROAS, 6×6 stress testing sandbox. |
| **04. Multi-SKU Batch Mode** | [`/tools/tiktok-batch-calculator/`](https://ttcalc.shop/tools/tiktok-batch-calculator/) | Drag-and-drop CSV batch processing for 100+ SKUs simultaneously in browser memory. |
| **05. DDP Landed Cost Radar** | [`/tools/tiktok-landed-cost-calculator/`](https://ttcalc.shop/tools/tiktok-landed-cost-calculator/) | MFN, Section 301 (7.5%–25%), and CBP MPF/HMF fees. Models the Nov 9, 2026 tariff exclusion expiry. |
| **06. TikTok vs Amazon FBA** | [`/tools/tiktok-vs-amazon/`](https://ttcalc.shop/tools/tiktok-vs-amazon/) | Side-by-side per-unit net profit and take-home comparison on identical SKUs. |

---

## Verified Rate Baseline (November 2026)

- **FBT Fulfillment (Nov 1, 2026 Rate Card)**:
  - Small standard: 1–6 oz ($4.28) up to 16 oz ($4.85)
  - Large standard: 1–2 lb ($5.48) up to 15–16 lb ($12.67)
  - Oversize & Heavy Bulky: 16–50 lb tiers up to 150 lb tiers ($55.00)
- **Section 301 Tariff Exclusions**:
  - Models the November 9, 2026 expiration impact on 178 product categories.
- **Micro-Typography & Precision**:
  - Forced tabular figures (`font-variant-numeric: tabular-nums`) across all financial figures.
  - 4-level luminance ladder (`#08090a` canvas, `#0f1115` panels, `#161920` surfaces).
  - `@media print` paper inversion (clean white background, dark ink) for A4 executive reports.

---

## Embeddable Widgets for B2B Publishers (`?embed=1`)

Cross-border e-commerce blogs, seller news portals, and SaaS publishers can embed any TTCalc tool cleanly without ads, headers, or footers:

```html
<!-- Free TikTok Shop Profit Calculator Widget -->
<iframe
  src="https://ttcalc.shop/tools/tiktok-profit-calculator/?embed=1"
  width="100%"
  height="720"
  frameborder="0"
  style="border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; background: #0f1115;"
  title="TikTok Shop Profit Calculator"
></iframe>
```

---

## Local Development

Run any static HTTP server from the project root:

```bash
# Python
python -m http.server 8000

# Node.js
npx serve .
```

---

## Deployment & Verification

- **Production Cloudflare Deployment**:
  ```bash
  wrangler pages deploy . --project-name=ttcalc --branch=main
  ```
- **Live Healthcheck**:
  ```bash
  curl -s https://ttcalc.shop/ | grep "Single-Unit Financial Engine"
  ```

---

## License

MIT License. See [LICENSE](LICENSE) for details. Developed & maintained by L.D. Studio.
