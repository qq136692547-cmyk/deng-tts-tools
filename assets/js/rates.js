// Shared fee constants (USD) used by every calculator - single source of truth.
// Change a rate here, not in the calculator files. Change log: /rate-updates/
window.TTCALC_RATES = {
  effectiveDate: '2026-07-13',  // rate card in force (TikTok Seller Center)
  verifiedDate: '2026-09-28',   // last manual cross-check against Seller Center
  sourceUrl: 'https://seller-us.tiktok.com/university/essay?knowledge_id=3507056320268087',
  // TikTok Shop US no longer charges a separate transaction fee. The referral fee is a
  // unified charge that already covers payment processing: the flat 6% structure took
  // effect 2024-04-01 and replaced the older 2% + $0.30 model. Note the widely cited
  // 2023-04-03 date is the start of a 2023 promotion that temporarily cut the old 2%
  // rate to 0% - it is NOT the date the transaction fee ended. Kept as an explicit 0 (rather than deleted) so the four calculators
  // keep working unchanged and the value can be reinstated in one place if TikTok
  // reintroduces it. Cross-checked 2026-09-28 against seven independent fee guides.
  transactionFee: 0,            // was 0.30 - removed 2026-09-28, see /rate-updates/
  defaultReferralRate: 6,       // % most categories; Jewelry / Pre-Owned select 5%
  refundAdminRate: 0.20,        // share of the referral fee kept when an order is refunded
  refundAdminCap: 5.00,         // per-SKU cap on that refund admin fee
  amazonMinReferralFee: 0.30    // Amazon referral fee floor per item (vs-Amazon tool)
};

// Footnote the rate version at the end of each calculator's results panel.
// Appended to .calc-results (not the flex header) so the existing layout cannot shift.
document.addEventListener('DOMContentLoaded', function () {
  var panel = document.querySelector('.calc-results');
  if (!panel || panel.querySelector('.rate-version')) return;
  var note = document.createElement('div');
  note.className = 'rate-version';
  note.textContent = 'Rates effective ' + window.TTCALC_RATES.effectiveDate +
    ' · verified ' + window.TTCALC_RATES.verifiedDate;
  panel.appendChild(note);
});
