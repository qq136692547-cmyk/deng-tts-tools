(function () {
  'use strict';
  var get = function (s) { return document.getElementById(s); };
  function num(s) { var v = parseFloat(s); return isNaN(v) || v < 0 ? 0 : v; }
  function fmt(n) { return '$' + n.toFixed(2); }

  // Amazon 2026 defaults (large standard, 0.75 lb, low-inventory applies)
  function amazonFbaTotal(sale) {
    var referral = Math.max(sale * 0.15, 0.30);
    if (sale < 10) referral += 0.05;
    var fulfillment = 4.98 * 1.035;  // +3.5% fuel surcharge
    var placement = 0.21;
    var lowInv = 0.35;
    return referral + fulfillment + placement + lowInv;
  }

  function tiktokTotal(sale, creatorPct) {
    var base = sale * 0.08;
    var afff = sale * 0.02;
    var pay = Math.max(sale * 0.018, 0.30);
    var creator = sale * (creatorPct / 100);
    return base + afff + pay + creator;
  }

  function calc() {
    var sale   = num(get('sale').value);
    var cogs   = num(get('cogs').value);
    var shipAmz = num(get('shipAmz').value);
    var shipTts = num(get('shipTts').value);
    var creatorPct = num(get('creator').value);
    var adsAmz = num(get('adsAmz').value) / 100;
    var adsTts = num(get('adsTts').value) / 100;

    if (isNaN(sale) || sale <= 0) return;

    var amzFees = amazonFbaTotal(sale);
    var ttsFees = tiktokTotal(sale, creatorPct);

    var amzProfit = sale - amzFees - cogs - shipAmz - (sale * adsAmz);
    var ttsProfit = sale - ttsFees - cogs - shipTts - (sale * adsTts);

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
    ['sale','cogs','shipAmz','shipTts','creator','adsAmz','adsTts'].forEach(function (id) {
      var el = get(id); if (el) el.addEventListener('input', calc);
    });
    calc();
  });
})();