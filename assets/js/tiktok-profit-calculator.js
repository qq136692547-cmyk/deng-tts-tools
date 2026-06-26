(function () {
  'use strict';
  var get = function (s) { return document.getElementById(s); };
  function num(s) { var v = parseFloat(s); return isNaN(v) || v < 0 ? 0 : v; }
  function fmt(n) { return '$' + n.toFixed(2); }

  function calc() {
    var sale       = num(get('sale').value);
    var cat        = parseFloat(get('cat').value);
    var cogs       = num(get('cogs').value);
    var ship       = num(get('ship').value);
    var creatorPct = num(get('creator').value) / 100;
    var adsPct     = num(get('ads').value) / 100;
    var crossBorder = get('isCrossBorder').value;

    if (isNaN(sale) || sale <= 0) sale = 0;
    if (isNaN(cat) || cat <= 0) cat = 0;

    // TikTok fees: base + AFFF + payment (with min) + cross-border
    var baseFee = sale * cat;
    var afff = sale * 0.02;
    var payment = Math.max(sale * 0.018, 0.30);
    var cross = crossBorder === 'yes' ? sale * 0.01 : 0;
    var ttsFees = baseFee + afff + payment + cross;

    var creator = sale * creatorPct;
    var ads = sale * adsPct;
    var profit = sale - ttsFees - creator - cogs - ship - ads;
    var margin = sale > 0 ? (profit / sale) * 100 : 0;
    var costBase = cogs + ship + ads;
    var roi = costBase > 0 ? (profit / costBase) * 100 : 0;

    get('r_sale').textContent        = fmt(sale);
    get('r_tts_fees').textContent     = '-' + fmt(ttsFees);
    get('r_creator_fee').textContent  = '-' + fmt(creator);
    get('r_cogs').textContent         = '-' + fmt(cogs);
    get('r_ship').textContent         = '-' + fmt(ship);
    get('r_ads').textContent          = '-' + fmt(ads);
    get('r_profit').textContent       = fmt(profit);
    get('r_roi').textContent          = margin.toFixed(1) + '% / ' + roi.toFixed(1) + '%';
  }

  document.addEventListener('DOMContentLoaded', function () {
    ['sale','cat','cogs','ship','creator','ads','isCrossBorder'].forEach(function (id) {
      var el = get(id); if (el) el.addEventListener('input', calc);
    });
    calc();
  });
})();