// FBT fulfillment fees, per unit (USD) - TikTok Seller Center rate card, effective Jul 13 2026
// [single, 2 units, 3 units, 4+ units] per weight tier (verified Aug 21 2026)
window.FBT_TIERS = [
  { label: '<=4 oz', rates: [4.28, 2.52, 1.91, 1.56] },
  { label: '4-8 oz', rates: [4.52, 2.91, 2.36, 1.93] },
  { label: '8-12 oz', rates: [4.7, 3.05, 2.61, 2.23] },
  { label: '12-16 oz', rates: [5.1, 3.16, 2.78, 2.36] },
  { label: '1-2 lb', rates: [5.71, 3.92, 3.14, 2.6] },
  { label: '2-3 lb', rates: [6.27, 4.3, 3.25, 2.76] },
  { label: '3-4 lb', rates: [6.92, 4.7, 3.55, 3.12] },
  { label: '4-5 lb', rates: [7.66, 5.09, 4.54, 4.54] },
  { label: '5-6 lb', rates: [8.58, 6.19, 5.46, 5.46] },
  { label: '6-7 lb', rates: [8.88, 6.5, 6.14, 6.08] },
  { label: '7-8 lb', rates: [9.22, 6.9, 6.76, 6.7] },
  { label: '8-9 lb', rates: [9.42, 7, 6.77, 6.59] },
  { label: '9-10 lb', rates: [9.63, 7.46, 7.3, 7.3] },
  { label: '10-11 lb', rates: [10.64, 8.3, 8.1, 8.1] },
  { label: '11-12 lb', rates: [10.75, 9.2, 9, 9] },
  { label: '12-13 lb', rates: [10.98, 10.04, 10.04, 10.04] },
  { label: '13-14 lb', rates: [11.44, 10.42, 10.42, 10.42] },
  { label: '14-15 lb', rates: [11.85, 10.8, 10.8, 10.8] },
  { label: '15-16 lb', rates: [12.67, 12.67, 12.67, 12.67] },
];

// FBT storage fees, USD per cubic foot PER DAY (not per month).
// Source: the storage-fee table embedded as an image in "FBT Rate Card & FAQ"
// (Seller Center, knowledge_id=3507056320268087, heading "(Starting 12/15/2025)").
// The table is an image on the official page - a text-only read of that page
// shows only the 60-day free window and the 14%-43% discount range, never these
// per-tier rates, so do not "correct" these numbers from a text scrape.
// Archived: review/evidence/tiktok-fbt-storage-rate-table-2026-09-30.jpeg
// Governing prose ("D. FBT Storage Fee Updates (Effective Dec 15, 2025)"):
//   "storage fees for inventory held for the first 60 days will remain free";
//   tiers made "more granular between 91 and 270 days";
//   beyond 270 days fees "remain unchanged"; discounts up to 270 days 14%-43%.
// min: "The minimum chargeable volume is 0.001 cubit feet per sku per day" [sic].
// Billing: daily at 23:59 on the total cubic feet of all units, sellable and
// defective alike; "Storage Days = Outbound Time - Inbound Time".
window.FBT_STORAGE_TIERS = [
  { from: 1,   to: 30,      rate: 0,    label: '30 days or less' },
  { from: 31,  to: 60,      rate: 0,    label: '31-60 days' },
  { from: 61,  to: 90,      rate: 0.03, label: '61-90 days' },
  { from: 91,  to: 120,     rate: 0.04, label: '91-120 days' },
  { from: 121, to: 180,     rate: 0.06, label: '121-180 days' },
  { from: 181, to: 270,     rate: 0.12, label: '181-270 days' },
  { from: 271, to: 365,     rate: 0.14, label: '271-365 days' },
  { from: 366, to: Infinity, rate: 0.27, label: 'Over 365 days' }
];
window.FBT_STORAGE_MIN_CUFT = 0.001; // per SKU per day
window.FBT_STORAGE_EFFECTIVE = '2025-12-15';
