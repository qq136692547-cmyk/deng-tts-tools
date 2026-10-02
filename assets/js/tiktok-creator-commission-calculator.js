(function () {
  'use strict';
  var R = window.TTCALC_RATES;
  var get = function (s) { return document.getElementById(s); };

  // Calculator copy built in JS goes through the shared dictionary when it is
  // available (i18n.js loads before this file).
  function T(key, fallback) { return window.ttcalcT ? window.ttcalcT(key, fallback) : fallback; }
  function num(s) { var v = parseFloat(s); return isNaN(v) || v < 0 ? 0 : v; }
  function fmt(n) { var s = n.toFixed(2); return '$' + s.replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  // Official commission range documented by TikTok's Ads help center:
  // "You can set a commission rate from 1% and 80%." (snapshot 2026-09-30, /review/evidence)
  var OFFICIAL_MAX = 80;
  // Third-party US cross-category average (~13%) used only as a benchmark tick;
  // TikTok publishes no official average.
  var BENCH = 13;

  var announceTimer;
  function announce(text) {
    clearTimeout(announceTimer);
    announceTimer = setTimeout(function () {
      var el = get('calcSummary');
      if (el) el.textContent = text;
    }, 200);
  }

  // Everything the product earns per unit BEFORE creator commission.
  // Mirrors tiktok-profit-calculator.js exactly: same fee lines, same bases,
  // same return math - so a 0% rate here equals that page's effective profit.
  function floorProfit() {
    var sale       = num(get('sale').value);
    var cogs       = num(get('cogs').value);
    var ship       = num(get('ship').value);
    var adsPct     = num(get('ads').value) / 100;
    var returnRate = num(get('returnRate').value) / 100;
    var returnHandlingFee = num(get('returnHandlingFee').value);
    var monthlyUnits = num(get('monthlyUnits').value);
    var catSel = get('category');
    var referralRate = catSel ? parseFloat(catSel.value) : R.defaultReferralRate;
    var inboundShip = num(get('inboundShip').value);
    var storageFee  = num(get('storageFee').value);
    var resellRate  = num(get('resellRate').value) / 100;
    var shipCharged = num(get('shipCharged').value);
    var sampleCount = num(get('sampleCount').value);
    var sampleCost  = num(get('sampleCost').value);

    var revenue = sale + shipCharged;
    var referral = revenue * (referralRate / 100);
    var fbt = window.FBT_TIERS ? window.FBT_TIERS[+get('fbtTier').value || 0].rates[+get('fbtUnits').value || 0] : 0;
    var ads = sale * adsPct;
    // Creator samples given away are a real cost, amortized across the month's units.
    var sampleAmort = monthlyUnits > 0 ? (sampleCount * sampleCost) / monthlyUnits : 0;
    var refundAdmin = Math.min(referral * R.refundAdminRate, R.refundAdminCap);
    var nonResellableRate = returnRate * (1 - resellRate);
    var returnCost  = cogs * nonResellableRate;
    var returnFee   = refundAdmin * returnRate;
    var returnHandling = returnHandlingFee * returnRate;

    var floor = revenue - referral - fbt - cogs - ship - inboundShip - storageFee - ads - sampleAmort
              - returnCost - returnFee - returnHandling;
    return { floor: floor, revenue: revenue, sale: sale, sampleAmort: sampleAmort, monthlyUnits: monthlyUnits };
  }

  function effectiveProfit(ctx, creatorPct) {
    // Creator commission applies to the item price, not the buyer's total payment
    // (same convention as tiktok-fee-calculator.js / tiktok-profit-calculator.js).
    return ctx.floor - ctx.sale * creatorPct;
  }

  function renderScenarioRow(tbody, ctx, pct, highlight) {
    var eff = effectiveProfit(ctx, pct / 100);
    var margin = ctx.revenue > 0 ? (eff / ctx.revenue) * 100 : 0;
    var tr = document.createElement('tr');
    if (highlight) tr.className = 'scenario-row--max';
    tr.innerHTML =
      '<td>' + pct + '%' + (highlight ? T('cc.row.yourMax', ' (your max)') : '') + '</td>' +
      '<td class="num">-' + fmt(ctx.sale * pct / 100) + '</td>' +
      '<td class="num">' + fmt(eff) + '</td>' +
      '<td class="num">' + margin.toFixed(1) + '%</td>';
    tbody.appendChild(tr);
  }

  function calc() {
    var ctx = floorProfit();
    var useAmount = get('targetModeAmount').checked;
    var targetProfit = useAmount ? num(get('targetProfit').value)
                                 : (num(get('targetMargin').value) / 100) * ctx.revenue;

    var maxPct = ctx.sale > 0 ? ((ctx.floor - targetProfit) / ctx.sale) * 100 : 0;
    var bePct  = ctx.sale > 0 ? (ctx.floor / ctx.sale) * 100 : 0;

    var capped = maxPct > OFFICIAL_MAX;
    var clamped = Math.min(Math.max(maxPct, 0), OFFICIAL_MAX);

    var note = '';
    if (ctx.sale <= 0) {
      note = T('cc.note.noPrice', 'Enter a sale price to calculate.');
    } else if (maxPct < 0) {
      note = T('cc.note.negative', 'Even a 0% commission loses money on these inputs - fix the unit economics first.');
    } else if (maxPct === 0) {
      note = T('cc.note.zeroOnly', 'The product only breaks even at a 0% commission.');
    } else if (capped) {
      note = T('cc.note.capped', 'Capped at the official {0}% maximum - your unit economics would allow more.').replace('{0}', OFFICIAL_MAX);
    } else {
      note = T('cc.note.range', 'Official range is 1%\u2013{0}% \u00b7 ~13% is a third-party US average, not an official figure').replace('{0}', OFFICIAL_MAX);
    }

    get('r_max_rate').textContent = maxPct < 0 ? '—' : clamped.toFixed(1) + '%';
    get('r_max_note').textContent = note;

    // Scale: fill up to the clamped rate, benchmark tick at ~13%, marker at max.
    var fill = get('scale_fill');
    var you  = get('scale_you');
    var bench = get('scale_bench');
    if (fill) fill.style.width = (maxPct < 0 ? 0 : (clamped / OFFICIAL_MAX) * 100) + '%';
    if (you)  you.style.left  = (maxPct < 0 ? 0 : (clamped / OFFICIAL_MAX) * 100) + '%';
    if (bench) bench.style.left = (BENCH / OFFICIAL_MAX) * 100 + '%';

    var effAtMax = maxPct < 0 ? Math.min(ctx.floor, 0) : effectiveProfit(ctx, clamped / 100);
    var marginAtMax = ctx.revenue > 0 ? (effAtMax / ctx.revenue) * 100 : 0;
    get('r_profit_at_max').textContent = fmt(effAtMax);
    get('r_margin_at_max').textContent = marginAtMax.toFixed(1) + '%';
    get('r_breakeven_rate').textContent = bePct < 0 ? T('cc.be.none', 'none - product loses money at 0%') : bePct.toFixed(1) + '%';
    get('r_profit_at_zero').textContent = fmt(ctx.floor);
    get('r_sample_amort').textContent = fmt(ctx.sampleAmort);
    get('r_monthly_at_max').textContent = fmt(effAtMax * ctx.monthlyUnits);

    var qa = get('qa_max');
    if (qa) qa.textContent = maxPct < 0 ? T('cc.qa.no', 'no') : clamped.toFixed(1) + '%';

    var tbody = get('scenario_body');
    if (tbody) {
      tbody.innerHTML = '';
      var rates = [0, 5, 10, 15, 20];
      var maxShown = false;
      for (var i = 0; i < rates.length; i++) {
        var hit = !maxShown && maxPct >= 0 && clamped <= rates[i];
        renderScenarioRow(tbody, ctx, rates[i], hit);
        maxShown = maxShown || hit;
      }
      if (!maxShown && maxPct >= 0) {
        renderScenarioRow(tbody, ctx, Math.round(clamped * 10) / 10, true);
      }
      var sn = get('scenario_note');
      if (sn) {
        sn.textContent = maxPct < 0
          ? T('cc.scenario.none', 'No commission is affordable on these inputs - every row below loses money once returns are averaged in.')
          : T('cc.scenario.ok', 'Your maximum rate is highlighted. All rows use the costs you entered; creator commission applies to the item price.');
      }
    }

    announce(T('cc.announce', 'Maximum affordable creator rate {0}.').replace('{0}', maxPct < 0 ? T('cc.announce.none', 'none') : clamped.toFixed(1) + T('cc.announce.pct', ' percent')));
  }

  function syncTargetMode() {
    var useAmount = get('targetModeAmount').checked;
    get('field_targetMargin').style.display = useAmount ? 'none' : '';
    get('field_targetProfit').style.display = useAmount ? '' : 'none';
    calc();
  }

  function applyPreset(p) {
    Object.keys(p).forEach(function (id) {
      var el = get(id);
      if (el) el.value = p[id];
    });
    syncTargetMode();
  }

  document.addEventListener('DOMContentLoaded', function () {
    ['sale','cogs','ship','shipCharged','category','ads','returnRate','returnHandlingFee','monthlyUnits',
     'fbtTier','fbtUnits','inboundShip','storageFee','resellRate','sampleCount','sampleCost',
     'targetMargin','targetProfit'].forEach(function (id) {
      var el = get(id); if (el) el.addEventListener('input', function () {
        calc();
        if (window.ttcalcTrackCalculator) window.ttcalcTrackCalculator('tiktok-creator-commission');
      });
    });
    var mMargin = get('targetModeMargin');
    var mAmount = get('targetModeAmount');
    if (mMargin) mMargin.addEventListener('change', syncTargetMode);
    if (mAmount) mAmount.addEventListener('change', syncTargetMode);

    get('presetThin').addEventListener('click', function () {
      applyPreset({ sale: 19.99, cogs: 6.50, ship: 3.00, shipCharged: 0, ads: 10, inboundShip: 1.00,
                    storageFee: 0.15, returnRate: 8, returnHandlingFee: 0.70, resellRate: 50,
                    monthlyUnits: 100, sampleCount: 0, sampleCost: 0, targetMargin: 20, targetProfit: 5.00,
                    fbtTier: 1, fbtUnits: 0 });
    });
    get('presetHealthy').addEventListener('click', function () {
      applyPreset({ sale: 39.99, cogs: 12.00, ship: 3.00, shipCharged: 0, ads: 10, inboundShip: 1.00,
                    storageFee: 0.15, returnRate: 5, returnHandlingFee: 0.70, resellRate: 50,
                    monthlyUnits: 100, sampleCount: 10, sampleCost: 12.00, targetMargin: 25, targetProfit: 5.00,
                    fbtTier: 3, fbtUnits: 0 });
    });

    calc();
  });
  // i18n sets the language after this script runs, and the quick answer's live figure
  // (span#qa_max) is re-created by the dictionary swap - so re-render on a switch.
  document.addEventListener('ttcalc:langchange', calc);
})();
