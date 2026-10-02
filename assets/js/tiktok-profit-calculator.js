(function () {
  'use strict';
  var R = window.TTCALC_RATES;
  var get = function (s) { return document.getElementById(s); };
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
      var el = get('calcSummary');
      if (el) el.textContent = text;
    }, 200);
  }

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
    var referralRate = catSel ? parseFloat(catSel.value) : R.defaultReferralRate;
    var inboundShip = num(get('inboundShip').value);
    var storageFee  = num(get('storageFee').value);
    var resellRate  = num(get('resellRate').value) / 100;
    var shipCharged = num(get('shipCharged').value);   // shipping the buyer pays us

    if (isNaN(sale) || sale <= 0) sale = 0;

    // What the buyer actually pays us. TikTok's referral fee is charged on the buyer's total
    // payment, which includes shipping the buyer pays - its own commission policy note says
    // "buyer payment includes shipping paid by the buyer". Tax is excluded from that base, and
    // this calculator has no tax input, so revenue below is the base. See /rate-updates/.
    var revenue = sale + shipCharged;

    // 2026 TikTok Shop US fees (verified Jul 2026, multi-source)
    var referral = revenue * (referralRate / 100); // varies by category (default 6%, Jewelry/Pre-Owned 5%)
    var fbt      = window.FBT_TIERS ? window.FBT_TIERS[+get('fbtTier').value || 0].rates[+get('fbtUnits').value || 0] : 0; // FBT per unit (Seller Center rate card, Jul 13 2026)
    var txnFee   = R.transactionFee;       // flat transaction fee per order (rates.js)
    var ttsFees  = referral + fbt + txnFee;
    var creator  = sale * creatorPct;  // base = item price, NOT the buyer total (see tiktok-fee-calculator.js: the creator base excludes buyer-paid shipping)
    var ads      = sale * adsPct;
    var profit   = revenue - ttsFees - creator - cogs - ship - inboundShip - storageFee - ads;

    // Return impact: TikTok keeps 20% of the referral fee on a refund (capped at $5/SKU).
    var refundAdmin = Math.min(referral * R.refundAdminRate, R.refundAdminCap);
    // Only non-resellable returns destroy inventory, and the loss is your COST of
    // goods - not the sale price. Using the sale price overstated the loss by the
    // full margin (a $29.99 item costing $6.50 was charged $29.99 of "loss"), which
    // made healthy high-return SKUs look unprofitable.
    var nonResellableRate = returnRate * (1 - resellRate);
    var returnCost  = cogs * nonResellableRate;    // lost product cost (non-resellable only)
    var returnFee   = refundAdmin * returnRate;     // admin fee applies to all returns
    var returnHandling = returnHandlingFee * returnRate; // FBT customer return handling applies per returned unit
    var effectiveProfit = profit - returnCost - returnFee - returnHandling;

    // Monthly view
    var monthlyProfit = effectiveProfit * monthlyUnits;
    var monthlyRevenue = revenue * monthlyUnits;
    var monthlyReturns = Math.round(monthlyUnits * returnRate);

    // ROI / margin
    // Margin is measured against what the buyer pays us, not the item's list price: shipping the
    // buyer pays is revenue passing through, so dividing by the item price alone would flatter it.
    var margin = revenue > 0 ? (effectiveProfit / revenue) * 100 : 0;
    // ROI on direct costs (COGS + ship + inbound + ads + returns)
    var directCosts = cogs + ship + inboundShip + ads + returnCost + returnFee + returnHandling;
    var roiDirect = directCosts > 0 ? (effectiveProfit / directCosts) * 100 : 0;
    // ROI on all costs (direct + platform fees + storage)
    var allCosts = directCosts + ttsFees + creator + storageFee;
    var roiAll = allCosts > 0 ? (effectiveProfit / allCosts) * 100 : 0;

    get('r_sale').textContent              = fmt(sale);
    // Buyer-paid shipping is only shown once there is some - same pattern as the fee calculator's
    // hidden transaction-fee and return rows, so the default result stack is unchanged.
    var scRow = get('row_ship_charged');
    if (shipCharged > 0) {
      get('r_ship_charged').textContent = fmt(shipCharged);
      if (scRow && scRow.style) scRow.style.display = '';
    } else if (scRow && scRow.style) {
      scRow.style.display = 'none';
    }
    get('r_tts_fees').textContent           = '-' + fmt(ttsFees);
    // TikTok US retired that structure when the flat 6% rate took effect
    // (no separate charge since Apr 1, 2024), so only mention it when a non-zero value is configured.
    var lbl = get('r_tts_fees_lbl');
    if (lbl) lbl.textContent = T('calc.js.ttsFees', '- TikTok fees ({0}%{1} + FBT)')
      .replace('{0}', referralRate)
      .replace('{1}', R.transactionFee ? ' + $' + R.transactionFee.toFixed(2) : '');
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
    get('r_monthly_returns').textContent    = T('calc.js.units', '{0} units')
      .replace('{0}', monthlyReturns);

    announce(T('calc.js.profitAnnounce', 'Effective profit {0}, margin {1}%.')
      .replace('{0}', fmt(effectiveProfit)).replace('{1}', margin.toFixed(1)));
  }

  document.addEventListener('DOMContentLoaded', function () {
    ['sale','cogs','ship','shipCharged','category','creator','ads','returnRate','returnHandlingFee','monthlyUnits','fbtTier','fbtUnits','inboundShip','storageFee','resellRate'].forEach(function (id) {
      var el = get(id); if (el) el.addEventListener('input', function () {
        calc();
        if (window.ttcalcTrackCalculator) window.ttcalcTrackCalculator('tiktok-profit');
      });
    });
    calc();
  });
  // See tiktok-fee-calculator.js: the first pass runs before the language is set.
  document.addEventListener('ttcalc:langchange', calc);
})();
