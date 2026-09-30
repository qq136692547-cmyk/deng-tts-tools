// Shared fee constants (USD) used by every calculator - single source of truth.
// Change a rate here, not in the calculator files. Change log: /rate-updates/
window.TTCALC_RATES = {
  effectiveDate: '2026-07-13',  // FBT rate card in force (TikTok Seller Center)
  referralEffectiveDate: '2024-04-01', // flat 6% US referral rate took effect (see /rate-updates/)
  verifiedDate: '2026-09-29',   // last manual cross-check against Seller Center
  sourceUrl: 'https://seller-us.tiktok.com/university/essay?knowledge_id=3507056320268087',
  // TikTok Shop US no longer charges a separate transaction fee. The referral fee is
  // the only selling fee TikTok's own commission policy defines; independent fee guides
  // read payment processing as sitting inside that 6%. NOTE ON EVIDENCE GRADE (2026-09-30):
  // the policy page lists no separate transaction or processing line, but it never says
  // "includes payment processing" - that phrasing is ours, sourced from the fee guides
  // listed on /rate-updates/#sources, and must not be presented as a TikTok quote.
  // The flat 6% structure took
  // effect 2024-04-01 and replaced the older 2% + $0.30 model. Note the widely cited
  // 2023-04-03 date is the start of a 2023 promotion that temporarily cut the old 2%
  // rate to 0% - it is NOT the date the transaction fee ended. Kept as an explicit 0
  // (rather than deleted) so the four calculators keep working unchanged and the
  // value can be reinstated in one place if TikTok reintroduces it. Cross-checked
  // against multiple independent fee guides; the per-claim source list with dates
  // lives in the "Our sources" table on /rate-updates/#sources.
  transactionFee: 0,            // was 0.30 - removed 2026-09-28, see /rate-updates/
  defaultReferralRate: 6,       // % most categories
  jewelryReferralRate: 5,       // % fine jewelry (5 sub-categories) and listed pre-owned
                                // NOTE: the four calculators read the rate from each page's
                                // own #category <select> (see tools/*/index.html), not from
                                // these two fields. Change those 4 pages (20 <option> values)
                                // in the same commit as any change here.
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
  note.className = 'source-note rate-version';
  // Static equivalent lives at the foot of each calculator's results panel; this is the
  // fallback for any page that has not been given one. Keep the dates in sync with the
  // commission policy and FBT rate card links in that static line.
  note.textContent = 'Referral fee effective ' + window.TTCALC_RATES.referralEffectiveDate +
    ' · FBT rate card effective ' + window.TTCALC_RATES.effectiveDate +
    ' · last checked by hand ' + window.TTCALC_RATES.verifiedDate;
  panel.appendChild(note);
});

// Drift guard: the calculators take the commission rate from each page's #category select.
// If a page's option values stop matching the fields above, say so loudly in the console
// rather than letting the site drift silently. Console-only: no visible behaviour changes.
document.addEventListener('DOMContentLoaded', function () {
  var sel = document.getElementById('category');
  var R = window.TTCALC_RATES;
  if (!sel || !R) return;
  var allowed = [String(R.defaultReferralRate), String(R.jewelryReferralRate)];
  Array.prototype.forEach.call(sel.options, function (o) {
    if (allowed.indexOf(o.value) === -1) {
      console.warn('[rates.js] #category option "' + o.text + '" (value ' + o.value +
        ') does not match any rate in rates.js (' + allowed.join(' / ') + ').');
    }
  });
});
