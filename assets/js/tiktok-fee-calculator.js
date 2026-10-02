(function () {
  'use strict';
  var R = window.TTCALC_RATES;
  var $id = function (s) { return document.getElementById(s); };
  function num(s) { var v = parseFloat(s); return isNaN(v) || v < 0 ? 0 : v; }
  // JS-built strings go through the shared dictionary when it is available.
  function T(key, fallback) { return window.ttcalcT ? window.ttcalcT(key, fallback) : fallback; }
  function fmt(n) { var s = n.toFixed(2); return '$' + s.replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  // Single-line summary is the only live region; announcing the whole result
  // block made screen readers repeat every row on each keystroke.
  var announceTimer;
  function announce(text) {
    clearTimeout(announceTimer);
    announceTimer = setTimeout(function () {
      var el = $id('calcSummary');
      if (el) el.textContent = text;
    }, 200);
  }

  function calculate() {
    var price  = num($id('salePrice').value);
    var creatorRate = num($id('creatorRate').value) / 100;
    var ship   = num($id('shippingCharged').value);
    var returnRate = num($id('returnRate').value) / 100;
    var returnHandlingFee = num($id('returnHandlingFee').value);
    var catSel = $id('category');
    var referralRate = catSel ? parseFloat(catSel.value) : R.defaultReferralRate;

    var total = price + ship;

    // 2026 TikTok Shop US fee structure (verified Jul 2026, multi-source)
    // The referral base INCLUDES buyer-paid shipping. TikTok's own commission
    // policy note says it outright: "buyer payment includes shipping paid by the
    // buyer". Do not "correct" this to exclude shipping - see /rate-updates/
    // 2026-09-29 for the source-by-source review behind that decision.
    var referral = total * (referralRate / 100); // referral varies by category (default 6%, Jewelry/Pre-Owned 5%)
    var fbt      = window.FBT_TIERS ? window.FBT_TIERS[+$id('fbtTier').value || 0].rates[+$id('fbtUnits').value || 0] : 0; // FBT per unit (Seller Center rate card, Jul 13 2026)
    var txnFee   = R.transactionFee;     // flat transaction fee per order (rates.js)
    // EVIDENCE GRADE: SECONDARY ONLY. The creator/affiliate commission base is the item price,
    // not the buyer's total - four independent affiliate-commission write-ups agree and none
    // disagree (see /rate-updates/). We have NOT obtained TikTok's own affiliate policy page,
    // so this must never be presented as an official TikTok rule in user-facing copy.
    var creator  = price * creatorRate;

    // Platform fees (before returns)
    var platformFees = referral + fbt + txnFee + creator;
    var payout   = total - platformFees;
    var pct      = total > 0 ? (platformFees / total) * 100 : 0;

    // Return impact: TikTok keeps 20% of the original referral fee (capped at $5/SKU)
    // on a refund, and FBT adds a per-return handling fee. Lost inventory on a
    // non-resellable return is deliberately NOT modelled here: this is a fee
    // calculator with no COGS input, so product-cost loss lives in the Profit
    // Calculator (which charges it against COGS, not the sale price).
    var refundAdmin = Math.min(referral * R.refundAdminRate, R.refundAdminCap);
    var returnFee   = refundAdmin * returnRate;     // admin fee applies to all returns
    var returnHandling = returnHandlingFee * returnRate; // FBT customer return handling applies per returned unit
    var netAfterReturns = payout - returnFee - returnHandling;
    var netPct = total > 0 ? ((netAfterReturns) / total) * 100 : 0;

    $id('r_total').textContent              = fmt(total);
    $id('r_base').textContent               = '-' + fmt(referral);
    var lbl = $id('r_base_lbl');
    if (lbl) lbl.textContent = T('calc.js.baseCommission', '- Base commission ({0}%)')
      .replace('{0}', referralRate);
    $id('r_fbt').textContent                = '-' + fmt(fbt);
    var txnEl = $id('r_txn');
    if (txnEl) {
      txnEl.textContent = '-' + fmt(txnFee);
      // TikTok US retired the old 2% + $0.30 structure when the flat 6% rate took
      // effect on 1 April 2024 (no separate charge since then); hide the row when it is 0 so the
      // result stack stays clean. Re-shown automatically if the fee returns.
      var txnRow = $id('row_txn');
      if (txnRow && txnRow.style) txnRow.style.display = txnFee ? '' : 'none';
    }
    $id('r_creator').textContent            = '-' + fmt(creator);
    $id('r_payout').textContent             = fmt(payout);
    $id('r_total_fee').textContent          = fmt(platformFees) + ' (' + pct.toFixed(1) + '%)';
    $id('r_refund_admin').textContent       = '-' + fmt(returnFee);
    $id('r_return_handling').textContent    = '-' + fmt(returnHandling);
    $id('r_net_after_returns').textContent  = fmt(netAfterReturns) + ' (' + netPct.toFixed(1) + '%)';
    // With returns at 0% these two rows are always $0.00 and the payout row is
    // duplicated by "Net after returns" - hide them, same pattern as the txn row.
    var showReturns = returnRate > 0;
    var raRow = $id('row_refund_admin'), rhRow = $id('row_return_handling');
    if (raRow && raRow.style) raRow.style.display = showReturns ? '' : 'none';
    if (rhRow && rhRow.style) rhRow.style.display = showReturns ? '' : 'none';

    announce(T('calc.js.feeAnnounce', 'Total TikTok Shop fees {0} ({1}%), payout {2}.')
      .replace('{0}', fmt(platformFees)).replace('{1}', pct.toFixed(1)).replace('{2}', fmt(payout)));
  }

  document.addEventListener('DOMContentLoaded', function () {
    ['salePrice','category','creatorRate','shippingCharged','returnRate','returnHandlingFee','fbtTier','fbtUnits'].forEach(function (id) {
      var el = $id(id); if (el) el.addEventListener('input', function () {
        calculate();
        if (window.ttcalcTrackCalculator) window.ttcalcTrackCalculator('tiktok-fee');
      });
    });
    calculate();
  });
  // The script runs before i18n.js sets the language, so the first pass is always
  // English; re-run once the switch has happened.
  document.addEventListener('ttcalc:langchange', calculate);
})();
