(function () {
  'use strict';
  var get = function (s) { return document.getElementById(s); };
  function num(s) { var v = parseFloat(s); return isNaN(v) || v < 0 ? 0 : v; }
  function fmt(n) { return '$' + n.toFixed(2); }

  function calc() {
    var sale       = num(get('sale').value);
    var cogs       = num(get('cogs').value);
    var ship       = num(get('ship').value);
    var creatorPct = num(get('creator').value) / 100;
    var adsPct     = num(get('ads').value) / 100;
    var returnRate = num(get('returnRate').value) / 100;
    var returnHandlingFee = num(get('returnHandlingFee').value);
    var monthlyUnits = num(get('monthlyUnits').value);
    var catSel = get('category');
    var referralRate = catSel ? parseFloat(catSel.value) : 6;
    var inboundShip = num(get('inboundShip').value);
    var storageFee  = num(get('storageFee').value);
    var resellRate  = num(get('resellRate').value) / 100;

    if (isNaN(sale) || sale <= 0) sale = 0;

    // 2026 TikTok Shop US fees (verified Jul 2026, multi-source)
    var referral = sale * (referralRate / 100); // varies by category (default 6%, Jewelry/Pre-Owned 5%)
    var fbt      = window.FBT_TIERS ? window.FBT_TIERS[+get('fbtTier').value || 0].rates[+get('fbtUnits').value || 0] : 0; // FBT per unit (Seller Center rate card, Jul 13 2026)
    var txnFee   = 0.30;                   // $0.30 flat transaction fee per order
    var ttsFees  = referral + fbt + txnFee;
    var creator  = sale * creatorPct;
    var ads      = sale * adsPct;
    var profit   = sale - ttsFees - creator - cogs - ship - inboundShip - storageFee - ads;

    // Return impact: 20% of referral fee, capped at $5
    var refundAdmin = Math.min(referral * 0.20, 5.00);
    // Only non-resellable returns incur full product cost loss
    var nonResellableRate = returnRate * (1 - resellRate);
    var returnCost  = sale * nonResellableRate;    // lost product cost (non-resellable only)
    var returnFee   = refundAdmin * returnRate;     // admin fee applies to all returns
    var returnHandling = returnHandlingFee * returnRate; // FBT customer return handling applies per returned unit
    var effectiveProfit = profit - returnCost - returnFee - returnHandling;

    // Monthly view
    var monthlyProfit = effectiveProfit * monthlyUnits;
    var monthlyRevenue = sale * monthlyUnits;
    var monthlyReturns = Math.round(monthlyUnits * returnRate);

    // ROI / margin
    var margin = sale > 0 ? (effectiveProfit / sale) * 100 : 0;
    // ROI on direct costs (COGS + ship + inbound + ads + returns)
    var directCosts = cogs + ship + inboundShip + ads + returnCost + returnFee + returnHandling;
    var roiDirect = directCosts > 0 ? (effectiveProfit / directCosts) * 100 : 0;
    // ROI on all costs (direct + platform fees + storage)
    var allCosts = directCosts + ttsFees + creator + storageFee;
    var roiAll = allCosts > 0 ? (effectiveProfit / allCosts) * 100 : 0;

    get('r_sale').textContent              = fmt(sale);
    get('r_tts_fees').textContent           = '-' + fmt(ttsFees);
    var lbl = get('r_tts_fees_lbl'); if (lbl) lbl.textContent = '- TikTok fees (' + referralRate + '% + $0.30 + FBT)';
    get('r_creator_fee').textContent        = '-' + fmt(creator);
    get('r_cogs').textContent               = '-' + fmt(cogs);
    get('r_ship').textContent               = '-' + fmt(ship);
    get('r_inbound_ship').textContent       = '-' + fmt(inboundShip);
    get('r_storage').textContent            = '-' + fmt(storageFee);
    get('r_ads').textContent                = '-' + fmt(ads);
    get('r_profit').textContent             = fmt(profit);
    var rMargin = document.getElementById('r_roi_margin');
    var rDirect = document.getElementById('r_roi_direct');
    var rAll    = document.getElementById('r_roi_all');
    if (rMargin) rMargin.textContent = margin.toFixed(1) + '%';
    if (rDirect) rDirect.textContent = roiDirect.toFixed(1) + '%';
    if (rAll)    rAll.textContent    = roiAll.toFixed(1) + '%';
    get('r_return_cost').textContent        = '-' + fmt(returnCost);
    get('r_return_fee').textContent         = '-' + fmt(returnFee);
    get('r_return_handling').textContent    = '-' + fmt(returnHandling);
    get('r_eff_profit').textContent         = fmt(effectiveProfit);
    get('r_monthly_revenue').textContent    = fmt(monthlyRevenue);
    get('r_monthly_profit').textContent     = fmt(monthlyProfit);
    get('r_monthly_returns').textContent    = monthlyReturns + ' units';
  }

  document.addEventListener('DOMContentLoaded', function () {
    ['sale','cogs','ship','category','creator','ads','returnRate','returnHandlingFee','monthlyUnits','fbtTier','fbtUnits','inboundShip','storageFee','resellRate'].forEach(function (id) {
      var el = get(id); if (el) el.addEventListener('input', function () {
        calc();
        if (window.ttcalcTrackCalculator) window.ttcalcTrackCalculator('tiktok-profit');
      });
    });
    calc();
  });
})();
