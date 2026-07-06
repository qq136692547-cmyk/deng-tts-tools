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
    var returnRate = num(get('returnRate').value) / 100;
    var monthlyUnits = num(get('monthlyUnits').value);

    if (isNaN(sale) || sale <= 0) sale = 0;
    if (isNaN(cat) || cat <= 0) cat = 0;

    // TikTok fees
    var baseFee = sale * cat;
    // removed AFFF
    var payment = Math.max(sale * 0.018, 0.30);
    var cross = crossBorder === 'yes' ? sale * 0.01 : 0;
    var ttsFees = baseFee + payment + cross;

    var creator = sale * creatorPct;
    var ads = sale * adsPct;
    var profit = sale - ttsFees - creator - cogs - ship - ads;

    // Return impact
    var returnCost = sale * returnRate;
    var returnHandling = returnRate > 0 ? sale * returnRate * 1.5 : 0;
    var effectiveProfit = profit - returnCost - returnHandling;

    // Monthly view
    var monthlyProfit = effectiveProfit * monthlyUnits;
    var monthlyRevenue = sale * monthlyUnits;
    var monthlyReturns = Math.round(monthlyUnits * returnRate);

    // ROI / margin based on effective profit
    var margin = sale > 0 ? (effectiveProfit / sale) * 100 : 0;
    var costBase = cogs + ship + ads + returnCost + returnHandling;
    var roi = costBase > 0 ? (effectiveProfit / costBase) * 100 : 0;

    get('r_sale').textContent              = fmt(sale);
    get('r_tts_fees').textContent           = '-' + fmt(ttsFees);
    get('r_creator_fee').textContent        = '-' + fmt(creator);
    get('r_cogs').textContent               = '-' + fmt(cogs);
    get('r_ship').textContent               = '-' + fmt(ship);
    get('r_ads').textContent                = '-' + fmt(ads);
    get('r_profit').textContent             = fmt(effectiveProfit);
    get('r_roi').textContent                = margin.toFixed(1) + '% / ' + roi.toFixed(1) + '%';
    get('r_return_cost').textContent        = '-' + fmt(returnCost);
    get('r_return_handling').textContent    = '-' + fmt(returnHandling);
    get('r_effective_profit').textContent   = fmt(effectiveProfit);
    get('r_monthly_revenue').textContent    = fmt(monthlyRevenue);
    get('r_monthly_profit').textContent     = fmt(monthlyProfit);
    get('r_monthly_returns').textContent    = monthlyReturns + ' units';
  }

  document.addEventListener('DOMContentLoaded', function () {
    ['sale','cat','cogs','ship','creator','ads','isCrossBorder','returnRate','monthlyUnits'].forEach(function (id) {
      var el = get(id); if (el) el.addEventListener('input', calc);
    });
    calc();
  });
})();