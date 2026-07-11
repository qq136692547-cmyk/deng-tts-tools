(function () {
  'use strict';
  var $id = function (s) { return document.getElementById(s); };
  function num(s) { var v = parseFloat(s); return isNaN(v) || v < 0 ? 0 : v; }
  function fmt(n) { return '$' + n.toFixed(2); }

  function calculate() {
    var price  = num($id('salePrice').value);
    var creatorRate = num($id('creatorRate').value) / 100;
    var ship   = num($id('shippingCharged').value);
    var returnRate = num($id('returnRate').value) / 100;
    var fbtTier = parseFloat($id('fbtTier').value);
    var resellRate = num($id('resellRate').value) / 100;

    var total = price + ship;

    // 2026 TikTok Shop US fee structure (verified Jul 2026, multi-source)
    var referral = total * 0.06;        // 6% flat referral fee (payment processing included per tiklytics/dashboardly)
    var fbt      = fbtTier || 0;        // $2.86-$3.58/unit mandatory FBT (eightx 2026)
    var txnFee   = 0.30;                 // $0.30 flat transaction fee per order (darkroom/netsellerprofit/feeyield 2026)
    var creator  = total * creatorRate;

    // Platform fees (before returns)
    var platformFees = referral + fbt + txnFee + creator;
    var payout   = total - platformFees;
    var pct      = total > 0 ? (platformFees / total) * 100 : 0;

    // Return impact: TikTok charges 20% of original referral fee, capped at $5
    var refundAdmin = Math.min(referral * 0.20, 5.00);
    // Only non-resellable returns incur full product cost loss
    var nonResellableRate = returnRate * (1 - resellRate);
    var returnCost  = price * nonResellableRate;   // lost product cost (non-resellable only)
    var returnFee   = refundAdmin * returnRate;     // admin fee applies to all returns
    var netAfterReturns = payout - returnCost - returnFee;
    var netPct = total > 0 ? ((netAfterReturns) / total) * 100 : 0;

    $id('r_total').textContent              = fmt(total);
    $id('r_base').textContent               = '-' + fmt(referral);
    $id('r_fbt').textContent                = '-' + fmt(fbt);
    $id('r_txn').textContent                = '-' + fmt(txnFee);
    $id('r_creator').textContent            = '-' + fmt(creator);
    $id('r_payout').textContent             = fmt(payout);
    $id('r_total_fee').textContent          = fmt(platformFees) + ' (' + pct.toFixed(1) + '%)';
    $id('r_refund_admin').textContent       = '-' + fmt(returnFee);
    $id('r_return_cost').textContent        = '-' + fmt(returnCost);
    $id('r_net_after_returns').textContent  = fmt(netAfterReturns) + ' (' + netPct.toFixed(1) + '%)';
  }

  document.addEventListener('DOMContentLoaded', function () {
    ['salePrice','creatorRate','shippingCharged','returnRate','fbtTier','resellRate'].forEach(function (id) {
      var el = $id(id); if (el) el.addEventListener('input', calculate);
    });
    calculate();
  });
})();
