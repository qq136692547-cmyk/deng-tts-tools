(function () {
  'use strict';
  var R = window.TTCALC_RATES;
  var get = function (s) { return document.getElementById(s); };
  function num(s) { var v = parseFloat(s); return isNaN(v) || v < 0 ? 0 : v; }
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
    var sale = num(get('sale').value);
    var cogs = num(get('cogs').value);
    var returnRate = num(get('returnRate').value) / 100;
    var returnHandlingFee = num(get('returnHandlingFee').value);
    var catSel = get('category');
    var referralRate = catSel ? parseFloat(catSel.value) : R.defaultReferralRate;
    var creatorPct = num(get('creator').value) / 100;
    var roas = num(get('roas').value);
    var monthlyUnits = num(get('monthlyUnits').value);

    if (isNaN(sale) || sale <= 0) return;

    // 2026 TikTok Shop US fees (Seller Center, Aug 2026)
    var referral = sale * (referralRate / 100); // varies by category (default 6%, Jewelry/Pre-Owned 5%)
    var fbt      = window.FBT_TIERS ? window.FBT_TIERS[+get('fbtTier').value || 0].rates[+get('fbtUnits').value || 0] : 0; // FBT per unit (Seller Center rate card, Jul 13 2026)
    var txn      = R.transactionFee;             // flat transaction fee per order (rates.js)
    var creator  = sale * creatorPct;
    var platformFees = referral + fbt + txn + creator;

    // Return impact: inventory loss on returned units is charged against COGS
    // (not the sale price) + 20% of referral fee (capped $5) + FBT return handling.
    // This page has no resale-rate input, so it treats returned units as fully
    // unsellable - the conservative end, and identical to the Profit Calculator
    // when its resale rate is 0%. We now share their cost-of-goods definition
    // instead of writing off the full sale price. See /rate-updates/ (2026-09-28).
    var returnImpact = cogs * returnRate + Math.min(referral * R.refundAdminRate, R.refundAdminCap) * returnRate + returnHandlingFee * returnRate;

    var preAdProfit = sale - platformFees - cogs - returnImpact;
    var preAdMargin = sale > 0 ? (preAdProfit / sale) * 100 : 0;
    var beRoas = preAdProfit > 0 ? sale / preAdProfit : 0;
    var adCost = roas > 0 ? sale / roas : 0;

    // Corrected ROAS: revenue after returns divided by ad spend
    var correctedRevenue = sale * (1 - returnRate);
    var correctedRoas = adCost > 0 ? correctedRevenue / adCost : 0;
    var netProfit = preAdProfit - adCost;
    var netMargin = sale > 0 ? (netProfit / sale) * 100 : 0;
    // Monthly projection uses the rounded per-unit figures shown above
    var adCostR = Math.round(adCost * 100) / 100;
    var netProfitR = Math.round(netProfit * 100) / 100;
    var monthlyAd = adCostR * monthlyUnits;
    var monthlyProfit = netProfitR * monthlyUnits;

    get('r_platform_fees').textContent = '-' + fmt(platformFees);
    get('r_return_impact').textContent = '-' + fmt(returnImpact);
    get('r_pre_ad_profit').textContent = fmt(preAdProfit) + ' (' + preAdMargin.toFixed(1) + '%)';
    get('r_be_roas').textContent = beRoas > 0 ? beRoas.toFixed(2) + 'x' : '—';
    get('r_ad_cost').textContent = '-' + fmt(adCost);
    get('r_corrected_roas').textContent = correctedRoas > 0 ? correctedRoas.toFixed(2) + 'x' : '—';
    get('r_net_profit').textContent = fmt(netProfit) + ' (' + netMargin.toFixed(1) + '%)';
    get('r_monthly_ad').textContent = '-' + fmt(monthlyAd);
    get('r_monthly_profit').textContent = fmt(monthlyProfit);

    var st = get('r_status');
    var status = '';
    if (roas <= 0) { status = 'Enter a reported ROAS'; st.classList.remove('good', 'bad'); }
    else if (beRoas <= 0) { status = 'Not profitable before ads'; st.classList.remove('good'); st.classList.add('bad'); }
    else if (roas > beRoas) { status = 'Above break-even'; st.classList.remove('bad'); st.classList.add('good'); }
    else if (roas < beRoas) { status = 'Below break-even'; st.classList.remove('good'); st.classList.add('bad'); }
    else { status = 'At break-even'; st.classList.remove('good', 'bad'); }
    st.textContent = status;

    announce('Net profit ' + fmt(netProfit) + ' (' + netMargin.toFixed(1) + '%), ' + status + '.');
  }

  document.addEventListener('DOMContentLoaded', function () {
    ['sale','cogs','category','fbtTier','fbtUnits','returnRate','returnHandlingFee','creator','roas','monthlyUnits'].forEach(function (id) {
      var el = get(id); if (el) el.addEventListener('input', function () {
        calc();
        if (window.ttcalcTrackCalculator) window.ttcalcTrackCalculator('tiktok-roas');
      });
    });
    calc();
  });
})();
