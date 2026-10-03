(function () {
  'use strict';
  var R = window.TTCALC_RATES;
  var get = function (s) { return document.getElementById(s); };

  // Copy built in JS goes through the shared dictionary when it is available
  // (i18n.js loads after this file, but always before DOMContentLoaded).
  function T(key, fallback) { return window.ttcalcT ? window.ttcalcT(key, fallback) : fallback; }
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

  // BOTH channels charge their referral fee on the buyer's total price, shipping included:
  // Amazon - "An item's total price includes its list price, as well as shipping costs and any
  // gift-wrapping charges"; TikTok - "buyer payment includes shipping paid by the buyer".
  // Changing only one side would compare two different bases. See /rate-updates/.
  function amazonFbaTotal(itemPrice, buyerTotal, fulfillment, refRate, placement, lowInv, fuelPct) {
    var referral = Math.max(buyerTotal * (refRate / 100), R.amazonMinReferralFee);
    if (itemPrice < 10) referral += 0.05;   // media closing fee: keyed to the ITEM price, not the buyer total
    var fuel = fulfillment * (fuelPct / 100);
    return referral + fulfillment + fuel + placement + lowInv;
  }

  function tiktokTotal(itemPrice, buyerTotal, creatorPct, fbtTier, referralRate) {
    var referral = buyerTotal * (referralRate / 100); // varies by category (default 6%)
    var fbt      = fbtTier || 0;          // weight-based FBT per unit (Seller Center 2026, incl. multi-item)
    var creator  = itemPrice * (creatorPct / 100);  // base = item price, NOT the buyer total
    var txn      = R.transactionFee;      // flat transaction fee per order (rates.js)
    return referral + fbt + txn + creator;
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
    var returnHandlingFee = num(get('returnHandlingFee').value);
    var fbtTier = window.FBT_TIERS ? window.FBT_TIERS[+get('fbtTier').value || 0].rates[+get('fbtUnits').value || 0] : 0; // FBT per unit (incl. multi-item, rate card Jul 13 2026)
    var amzFuelPct = num(get('amzFuelPct').value);
    var catSel = get('category');
    var referralRate = catSel ? parseFloat(catSel.value) : R.defaultReferralRate;
    var resellRate = num(get('resellRate').value) / 100;
    var shipChargedTts = num(get('shippingChargedTts').value);  // shipping the buyer pays on TikTok
    var shipChargedAmz = num(get('shippingChargedAmz').value);  // shipping the buyer pays on Amazon

    var amzFulfill = num(get('amzFulfillRate').value);
    var amzRefRate = num(get('amzRefRate').value);
    var amzPlacement = num(get('amzPlacement').value);
    var amzLowInv = num(get('amzLowInv').value);

    if (isNaN(sale) || sale <= 0) {
      // Same reasoning as the other calculators: keep the guard, add the explanation.
      var w0 = get('r_winner');
      if (w0) {
        w0.textContent = T('va.note.noPrice', 'Enter a sale price to compare the two.');
        w0.classList.remove('good', 'bad');
      }
      announce(T('va.note.noPrice', 'Enter a sale price to compare the two.'));
      return;
    }

    // What the buyer pays on each channel: item price plus whatever shipping we charge them.
    // Tax is excluded from both platforms' referral bases and this tool has no tax input.
    var amzRevenue = sale + shipChargedAmz;
    var ttsRevenue = sale + shipChargedTts;

    var amzFees = amazonFbaTotal(sale, amzRevenue, amzFulfill, amzRefRate, amzPlacement, amzLowInv, amzFuelPct);
    var ttsFees = tiktokTotal(sale, ttsRevenue, creatorPct, fbtTier, referralRate);

    var amzProfit = amzRevenue - amzFees - cogs - shipAmz - (sale * adsAmz);
    var ttsProfit = ttsRevenue - ttsFees - cogs - shipTts - (sale * adsTts);

    // Return impact (consistent with Fee/Profit calculators)
    // Only non-resellable returns incur full product cost loss
    var nonResellableRate = returnRate * (1 - resellRate);

    var ttsReferral = ttsRevenue * (referralRate / 100);
    var ttsRefundAdmin = Math.min(ttsReferral * R.refundAdminRate, R.refundAdminCap);
    var amzReferral = Math.max(amzRevenue * (amzRefRate / 100), R.amazonMinReferralFee);
    var amzRefundAdmin = Math.min(amzReferral * R.refundAdminRate, R.refundAdminCap);

    // Lost inventory on a non-resellable return is the COST of goods, not the sale
    // price (see tiktok-profit-calculator.js) - applies to both channels.
    var ttsReturnCost = cogs * nonResellableRate;
    // TikTok return handling stacks with the estimated refund admin fee on returned units.
    var ttsReturnFee  = ttsRefundAdmin * returnRate + returnHandlingFee * returnRate;
    var amzReturnCost = cogs * nonResellableRate;
    var amzReturnFee  = amzRefundAdmin * returnRate;

    amzProfit = amzProfit - amzReturnCost - amzReturnFee;
    ttsProfit = ttsProfit - ttsReturnCost - ttsReturnFee;

    var amzMargin = amzRevenue > 0 ? (amzProfit / amzRevenue) * 100 : 0;
    var ttsMargin = ttsRevenue > 0 ? (ttsProfit / ttsRevenue) * 100 : 0;

    get('r_amz_fees').textContent   = fmt(amzFees);
    get('r_tts_fees').textContent   = fmt(ttsFees);
    get('r_amz_profit').textContent = fmt(amzProfit);
    get('r_tts_profit').textContent = fmt(ttsProfit);
    get('r_amz_margin').textContent = amzMargin.toFixed(1) + '%';
    get('r_tts_margin').textContent = ttsMargin.toFixed(1) + '%';

    var diff = Math.abs(amzProfit - ttsProfit);
    var winner = ttsProfit >= amzProfit
      ? T('va.chan.tts', 'TikTok Shop')
      : T('va.chan.amz', 'Amazon FBA');
    get('r_winner').textContent = T('va.winner', '{0} pays {1} more per unit').replace('{0}', winner).replace('{1}', fmt(diff));

    announce(T('va.announce', '{0} pays {1} more per unit; TikTok net {2}, Amazon net {3}.')
      .replace('{0}', winner).replace('{1}', fmt(diff))
      .replace('{2}', fmt(ttsProfit)).replace('{3}', fmt(amzProfit)));
  }

  document.addEventListener('DOMContentLoaded', function () {
    ['sale','cogs','shipAmz','shipTts','shippingChargedTts','shippingChargedAmz','creator','adsAmz','adsTts','returnRate','returnHandlingFee','fbtTier','fbtUnits','category','amzFulfillRate','amzRefRate','amzPlacement','amzLowInv','amzFuelPct','resellRate'].forEach(function (id) {
      var el = get(id); if (el) el.addEventListener('input', function () {
        calc();
        if (window.ttcalcTrackCalculator) window.ttcalcTrackCalculator('tiktok-vs-amazon');
      });
    });
    calc();
  });
  // i18n sets the language after this script runs, and the winner line is built
  // here - so re-render on a switch or it keeps the previous language.
  document.addEventListener('ttcalc:langchange', calc);
})();
