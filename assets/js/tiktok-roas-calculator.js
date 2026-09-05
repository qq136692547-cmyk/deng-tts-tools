(function () {
  'use strict';
  var get = function (s) { return document.getElementById(s); };
  function num(s) { var v = parseFloat(s); return isNaN(v) || v < 0 ? 0 : v; }
  function fmt(n) { return '$' + n.toFixed(2); }

  function calc() {
    var sale = num(get('sale').value);
    var cogs = num(get('cogs').value);
    var returnRate = num(get('returnRate').value) / 100;
    var returnHandlingFee = num(get('returnHandlingFee').value);
    var catSel = get('category');
    var referralRate = catSel ? parseFloat(catSel.value) : 6;
    var creatorPct = num(get('creator').value) / 100;
    var roas = num(get('roas').value);
    var monthlyUnits = num(get('monthlyUnits').value);

    if (isNaN(sale) || sale <= 0) return;

    // 2026 TikTok Shop US fees (Seller Center, Aug 2026)
    var referral = sale * (referralRate / 100); // varies by category (default 6%, Jewelry/Pre-Owned 5%)
    var fbt      = window.FBT_TIERS ? window.FBT_TIERS[+get('fbtTier').value || 0].rates[+get('fbtUnits').value || 0] : 0; // FBT per unit (Seller Center rate card, Jul 13 2026)
    var txn      = 0.30;                         // flat transaction fee per order
    var creator  = sale * creatorPct;
    var platformFees = referral + fbt + txn + creator;

    // Return impact: 20% of referral fee (capped $5) + product cost on returned units
    var returnImpact = sale * returnRate + Math.min(referral * 0.20, 5.00) * returnRate;
    var returnImpact = sale * returnRate + Math.min(referral * 0.20, 5.00) * returnRate + returnHandlingFee * returnRate;

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
