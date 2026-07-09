(function () {
  'use strict';
  var get = function (s) { return document.getElementById(s); };
  function num(s) { var v = parseFloat(s); return isNaN(v) || v < 0 ? 0 : v; }
  function fmt(n) { return '$' + n.toFixed(2); }

  function amazonFbaTotal(sale, fulfillment, refRate, placement, lowInv) {
    var referral = Math.max(sale * (refRate / 100), 0.30);
    if (sale < 10) referral += 0.05;
    return referral + fulfillment + placement + lowInv;
  }

  function tiktokTotal(sale, creatorPct, fbtTier) {
    var referral = sale * 0.06;           // 6% flat (includes payment processing)
    var fbt      = fbtTier || 0;          // $2.86-$3.58/unit
    var creator  = sale * (creatorPct / 100);
    return referral + fbt + creator;
  }

  function calc() {
    var sale   = num(get('sale').value);
    var cogs   = num(get('cogs').value);
    var shipAmz = num(get('shipAmz').value);
    var shipTts = num(get('shipTts').value);
    var creatorPct = num(get('creator').value);
    var adsAmz = num(get('adsAmz').value) / 100;
    var adsTts = num(get('adsTts').value) / 100;
    var returnRate = num(get('returnRate').value) / 100;
    var fbtTier = parseFloat(get('fbtTier').value);
    var resellRate = num(get('resellRate').value) / 100;

    var amzFulfill = num(get('amzFulfillRate').value);
    var amzRefRate = num(get('amzRefRate').value);
    var amzPlacement = num(get('amzPlacement').value);
    var amzLowInv = num(get('amzLowInv').value);

    if (isNaN(sale) || sale <= 0) return;

    var amzFees = amazonFbaTotal(sale, amzFulfill, amzRefRate, amzPlacement, amzLowInv);
    var ttsFees = tiktokTotal(sale, creatorPct, fbtTier);

    var amzProfit = sale - amzFees - cogs - shipAmz - (sale * adsAmz);
    var ttsProfit = sale - ttsFees - cogs - shipTts - (sale * adsTts);

    // Return impact (consistent with Fee/Profit calculators)
    // Only non-resellable returns incur full product cost loss
    var nonResellableRate = returnRate * (1 - resellRate);

    var ttsReferral = sale * 0.06;
    var ttsRefundAdmin = Math.min(ttsReferral * 0.20, 5.00);
    var amzReferral = Math.max(sale * (amzRefRate / 100), 0.30);
    var amzRefundAdmin = Math.min(amzReferral * 0.20, 5.00);

    var ttsReturnCost = sale * nonResellableRate;
    var ttsReturnFee  = ttsRefundAdmin * returnRate;
    var amzReturnCost = sale * nonResellableRate;
    var amzReturnFee  = amzRefundAdmin * returnRate;

    amzProfit = amzProfit - amzReturnCost - amzReturnFee;
    ttsProfit = ttsProfit - ttsReturnCost - ttsReturnFee;

    var amzMargin = sale > 0 ? (amzProfit / sale) * 100 : 0;
    var ttsMargin = sale > 0 ? (ttsProfit / sale) * 100 : 0;

    get('r_amz_fees').textContent   = fmt(amzFees);
    get('r_tts_fees').textContent   = fmt(ttsFees);
    get('r_amz_profit').textContent = fmt(amzProfit);
    get('r_tts_profit').textContent = fmt(ttsProfit);
    get('r_amz_margin').textContent = amzMargin.toFixed(1) + '%';
    get('r_tts_margin').textContent = ttsMargin.toFixed(1) + '%';

    var diff = Math.abs(amzProfit - ttsProfit);
    var winner = ttsProfit >= amzProfit ? 'TikTok Shop' : 'Amazon FBA';
    get('r_winner').textContent = winner + ' pays ' + fmt(diff) + ' more per unit';
  }

  document.addEventListener('DOMContentLoaded', function () {
    ['sale','cogs','shipAmz','shipTts','creator','adsAmz','adsTts','returnRate','fbtTier','amzFulfillRate','amzRefRate','amzPlacement','amzLowInv','resellRate'].forEach(function (id) {
      var el = get(id); if (el) el.addEventListener('input', calc);
    });
    calc();
  });
})();
