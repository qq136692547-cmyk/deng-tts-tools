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

  function tiktokTotal(sale, cat, creatorPct, crossBorder) {
    var base = sale * cat;
    // removed AFFF
    var pay = Math.max(sale * 0.018, 0.30);
    var cross = crossBorder ? sale * 0.01 : 0;
    var creator = sale * (creatorPct / 100);
    return base + pay + cross + creator;
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

    var amzFulfill = num(get('amzFulfillRate').value);
    var amzRefRate = num(get('amzRefRate').value);
    var amzPlacement = num(get('amzPlacement').value);
    var amzLowInv = num(get('amzLowInv').value);

    if (isNaN(sale) || sale <= 0) return;

    var amzFees = amazonFbaTotal(sale, amzFulfill, amzRefRate, amzPlacement, amzLowInv);
    var ttsFees = tiktokTotal(sale, 0.06, creatorPct, false);

    var amzProfit = sale - amzFees - cogs - shipAmz - (sale * adsAmz);
    var ttsProfit = sale - ttsFees - cogs - shipTts - (sale * adsTts);

    // Return rate impact
    amzProfit = amzProfit * (1 - returnRate);
    ttsProfit = ttsProfit * (1 - returnRate);

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
    ['sale','cogs','shipAmz','shipTts','creator','adsAmz','adsTts','returnRate','amzFulfillRate','amzRefRate','amzPlacement','amzLowInv'].forEach(function (id) {
      var el = get(id); if (el) el.addEventListener('input', calc);
    });
    calc();
  });
})();