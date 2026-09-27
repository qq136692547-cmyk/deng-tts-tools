(function () {
  'use strict';
  var R = window.TTCALC_RATES;
  var $id = function (s) { return document.getElementById(s); };
  function num(s) { var v = parseFloat(s); return isNaN(v) || v < 0 ? 0 : v; }
  function fmt(n) { return '$' + n.toFixed(2); }
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
    var resellRate = num($id('resellRate').value) / 100;

    var total = price + ship;

    // 2026 TikTok Shop US fee structure (verified Jul 2026, multi-source)
    var referral = total * (referralRate / 100); // referral varies by category (default 6%, Jewelry/Pre-Owned 5%)
    var fbt      = window.FBT_TIERS ? window.FBT_TIERS[+$id('fbtTier').value || 0].rates[+$id('fbtUnits').value || 0] : 0; // FBT per unit (Seller Center rate card, Jul 13 2026)
    var txnFee   = R.transactionFee;     // flat transaction fee per order (rates.js)
    var creator  = total * creatorRate;

    // Platform fees (before returns)
    var platformFees = referral + fbt + txnFee + creator;
    var payout   = total - platformFees;
    var pct      = total > 0 ? (platformFees / total) * 100 : 0;

    // Return impact: TikTok charges 20% of original referral fee, capped at $5
    var refundAdmin = Math.min(referral * R.refundAdminRate, R.refundAdminCap);
    // Only non-resellable returns incur full product cost loss
    var nonResellableRate = returnRate * (1 - resellRate);
    var returnCost  = price * nonResellableRate;   // lost product cost (non-resellable only)
    var returnFee   = refundAdmin * returnRate;     // admin fee applies to all returns
    var returnHandling = returnHandlingFee * returnRate; // FBT customer return handling applies per returned unit
    var netAfterReturns = payout - returnCost - returnFee - returnHandling;
    var netPct = total > 0 ? ((netAfterReturns) / total) * 100 : 0;

    $id('r_total').textContent              = fmt(total);
    $id('r_base').textContent               = '-' + fmt(referral);
    var lbl = $id('r_base_lbl'); if (lbl) lbl.textContent = '- Base commission (' + referralRate + '%, incl. payment processing)';
    $id('r_fbt').textContent                = '-' + fmt(fbt);
    var txnEl = $id('r_txn');
    if (txnEl) {
      txnEl.textContent = '-' + fmt(txnFee);
      // TikTok US folded the flat transaction fee into the referral rate (no
      // separate charge since Apr 2023); hide the row when it is 0 so the
      // result stack stays clean. Re-shown automatically if the fee returns.
      var txnRow = $id('row_txn');
      if (txnRow && txnRow.style) txnRow.style.display = txnFee ? '' : 'none';
    }
    $id('r_creator').textContent            = '-' + fmt(creator);
    $id('r_payout').textContent             = fmt(payout);
    $id('r_total_fee').textContent          = fmt(platformFees) + ' (' + pct.toFixed(1) + '%)';
    $id('r_refund_admin').textContent       = '-' + fmt(returnFee);
    $id('r_return_handling').textContent    = '-' + fmt(returnHandling);
    $id('r_return_cost').textContent        = '-' + fmt(returnCost);
    $id('r_net_after_returns').textContent  = fmt(netAfterReturns) + ' (' + netPct.toFixed(1) + '%)';

    announce('Total TikTok Shop fees ' + fmt(platformFees) + ' (' + pct.toFixed(1) + '%), payout ' + fmt(payout) + '.');
  }

  document.addEventListener('DOMContentLoaded', function () {
    ['salePrice','category','creatorRate','shippingCharged','returnRate','returnHandlingFee','fbtTier','fbtUnits','resellRate'].forEach(function (id) {
      var el = $id(id); if (el) el.addEventListener('input', function () {
        calculate();
        if (window.ttcalcTrackCalculator) window.ttcalcTrackCalculator('tiktok-fee');
      });
    });
    calculate();
  });
})();
