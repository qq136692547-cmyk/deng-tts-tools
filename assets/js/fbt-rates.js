// FBT fulfillment fees, per unit (USD) - TikTok Seller Center rate card
// [single, 2 units, 3 units, 4+ units] per weight tier (effective Nov 1 2026, expanded 16-150 lb)
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
  // Large & Oversize expansion (16-150 lb) - effective 2026-11-01
  { label: '16-20 lb (Large)', rates: [14.50, 14.50, 14.50, 14.50] },
  { label: '20-30 lb (Large)', rates: [18.50, 18.50, 18.50, 18.50] },
  { label: '30-50 lb (Large)', rates: [26.50, 26.50, 26.50, 26.50] },
  { label: '50-70 lb (Large)', rates: [34.50, 34.50, 34.50, 34.50] },
  { label: '70-150 lb (Heavy & Bulky)', rates: [55.00, 55.00, 55.00, 55.00] }
];

// FBT Regional Placement & Shipping Surcharges (USD)
window.FBT_TX_PLACEMENT_FEE = 0.20; // TX Regional Hub Placement Allocation ($0.20/unit)
window.FBT_EXIT_SHIPPING_FEE = 0.70; // Inventory Removal / Exit Shipping Fee per unit
window.FBT_RETURN_HANDLING_STD = 0.70; // Customer return without inspection
window.FBT_RETURN_HANDLING_INSP = 1.00; // Customer return with inspection
window.FBT_RATE_EFFECTIVE = '2026-11-01';
window.FBT_RATE_VERIFIED = '2026-11-01';

// FBT storage fees, USD per cubic foot PER DAY (not per month).
// Source: Seller Center Knowledge Base 3507056320268087
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
