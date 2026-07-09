(function () {
  'use strict';
  var $id = function (s) { return document.getElementById(s); };
  function num(s) { var v = parseFloat(s); return isNaN(v) || v < 0 ? 0 : v; }
  function fmt(n) { return '$' + n.toFixed(2); }

  function calculate() {
    var price  = num($id('salePrice').value);
    var creatorRate = num($id('creatorRate').value) / 100;
    var crossBorder = $id('isCrossBorder').value === '1';
    var ship   = num($id('shippingCharged').value);
    var returnRate = num($id('returnRate').value) / 100;
    var fbtTier = parseFloat($id('fbtTier').value);

    var total = price + ship;

    // 2026 TikTok Shop US fee structure (verified Jul 2026)
    var referral = total * 0.06;        // 6% flat referral fee (includes payment processing)
    var fbt      = fbtTier || 0;        // $2.86-$3.58/unit mandatory FBT
    var cross    = crossBorder ? total * 0.01 : 0;
    var creator  = total * creatorRate;
    var totalFee = referral + fbt + cross + creator;
    var payout   = total - totalFee;
    var pct      = total > 0 ? (totalFee / total) * 100 : 0;

    // Return impact: TikTok charges 20% of original referral fee, capped at $5
    var refundAdmin = Math.min(referral * 0.20, 5.00);
    var returnCost  = price * returnRate;  // lost product cost
    var returnFee   = refundAdmin * returnRate;  // admin fee per unit sold
    var netAfterReturns = payout - returnCost - returnFee;
    var netPct = total > 0 ? ((total - totalFee - returnCost - returnFee) / total) * 100 : 0;

    $id('r_total').textContent              = fmt(total);
    $id('r_base').textContent               = '-' + fmt(referral);
    $id('r_fbt').textContent                = '-' + fmt(fbt);
    $id('r_payment').textContent            = 'included in 6%';
    $id('r_cross').textContent              = '-' + fmt(cross);
    $id('r_creator').textContent            = '-' + fmt(creator);
    $id('r_payout').textContent             = fmt(payout);
    $id('r_total_fee').textContent          = fmt(totalFee) + ' (' + pct.toFixed(1) + '%)';
    $id('r_refund_admin').textContent       = '-' + fmt(returnFee);
    $id('r_return_cost').textContent        = '-' + fmt(returnCost);
    $id('r_net_after_returns').textContent  = fmt(netAfterReturns) + ' (' + netPct.toFixed(1) + '%)';
  }

  document.addEventListener('DOMContentLoaded', function () {
    ['salePrice','creatorRate','isCrossBorder','shippingCharged','returnRate','fbtTier'].forEach(function (id) {
      var el = $id(id); if (el) el.addEventListener('input', calculate);
    });
    calculate();
  });
})();