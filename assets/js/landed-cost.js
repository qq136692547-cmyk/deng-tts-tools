// landed-cost.js - TikTok Shop landed cost calculator
// Incorporates US CBP Formal Entry fees: MPF (19 CFR 24.23) + HMF (19 CFR 24.24)
(function () {
  'use strict';

  function $(id) { return document.getElementById(id); }
  function num(id) {
    var v = parseFloat($(id) && $(id).value);
    return isNaN(v) || v < 0 ? 0 : v;
  }
  function money(v) {
    return '$' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function pct(v) {
    return (Math.round(v * 10) / 10).toLocaleString('en-US') + '%';
  }

  var catPresets = {
    elec: { mfn: 0, s301: 25 },
    beauty: { mfn: 3.5, s301: 25 },
    home: { mfn: 5.0, s301: 25 },
    apparel: { mfn: 14.0, s301: 25 },
    shoes: { mfn: 20.0, s301: 25 },
    bags: { mfn: 17.5, s301: 25 },
    toys: { mfn: 0, s301: 25 }
  };

  // Calculates US CBP Formal Entry fees (19 CFR 24.23 & 24.24)
  function calcCbpFormalFees(goods) {
    // MPF: 0.3464% of FOB value (min $33.58, max $651.50)
    var mpf = Math.min(Math.max(goods * 0.003464, 33.58), 651.50);
    // HMF: 0.125% of FOB value
    var hmf = goods * 0.00125;
    // Standard customs broker entry preparation fee
    var broker = 125.00;
    return {
      mpf: mpf,
      hmf: hmf,
      broker: broker,
      total: mpf + hmf + broker
    };
  }

  function compute() {
    var goods = num('goods');
    var units = Math.max(1, Math.round(num('units')) || 1);
    var freight = num('freight');
    var insurance = num('insurance');

    // Auto CBP formal entry fees
    var autoCbp = $('autoCbpFees');
    var otherInput = $('otherFees');
    if (autoCbp && autoCbp.checked) {
      var cbp = calcCbpFormalFees(goods);
      if (otherInput) {
        otherInput.value = cbp.total.toFixed(2);
      }
      var hint = $('cbpFeesHint');
      if (hint) {
        hint.innerHTML = '<strong>CBP Formal Entry:</strong> MPF ' + money(cbp.mpf) + ' + HMF ' + money(cbp.hmf) + ' + Broker filing ' + money(cbp.broker) + ' = <strong>' + money(cbp.total) + '</strong>';
      }
    }

    var other = num('otherFees');
    var ratePct = num('mfn') + num('s301') + num('s232');
    var duty = goods * ratePct / 100;
    var total = goods + freight + insurance + duty + other;
    var unitLanded = total / units;

    $('r_base').textContent = money(goods);
    $('r_rate').textContent = pct(ratePct);
    $('r_duty').textContent = '-' + money(duty);
    $('r_ship').textContent = '-' + money(freight + insurance);
    $('r_other').textContent = '-' + money(other);
    $('r_total').textContent = money(total);
    $('r_unit').textContent = money(unitLanded);
    $('r_dutyunit').textContent = money(duty / units);

    var transferBtn = $('btnTransferProfit');
    if (transferBtn) {
      transferBtn.innerHTML = '<span>🚀 Transfer ' + money(unitLanded) + ' Landed Cost to Profit Calculator &rarr;</span>';
    }

    if (window.ttcalcTrackCalculator) window.ttcalcTrackCalculator('landed_cost');
  }

  // Origin switch: Section 301 is a China-only trade action
  function wireOrigin() {
    var origin = $('origin'), s301 = $('s301');
    if (!origin || !s301) return;
    origin.addEventListener('change', function () {
      if (origin.value === 'cn') {
        if (s301.value === '0' || s301.value === '') s301.value = '25';
      } else {
        s301.value = '0';
      }
      compute();
    });
  }

  // Category presets helper
  function wirePresets() {
    var presetSel = $('catPreset');
    var origin = $('origin');
    var mfn = $('mfn');
    var s301 = $('s301');
    if (!presetSel) return;
    presetSel.addEventListener('change', function () {
      var val = presetSel.value;
      if (catPresets[val]) {
        var p = catPresets[val];
        if (mfn) mfn.value = p.mfn;
        if (s301) {
          if (origin && origin.value !== 'cn') {
            s301.value = 0;
          } else {
            s301.value = p.s301;
          }
        }
        compute();
      }
    });
  }

  // 1-Click transfer to Profit Calculator
  function wireTransfer() {
    var btn = $('btnTransferProfit');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var goods = num('goods');
      var units = Math.max(1, Math.round(num('units')) || 1);
      var freight = num('freight');
      var insurance = num('insurance');
      var other = num('otherFees');
      var ratePct = num('mfn') + num('s301') + num('s232');
      var duty = goods * ratePct / 100;
      var total = goods + freight + insurance + duty + other;
      var unitLanded = (total / units).toFixed(2);
      window.location.href = '/tools/tiktok-profit-calculator/?cogs=' + encodeURIComponent(unitLanded) + '&from=landed_cost';
    });
  }

  function init() {
    ['goods', 'units', 'freight', 'insurance', 'mfn', 's301', 's232', 'otherFees']
      .forEach(function (id) {
        var el = $(id);
        if (el) el.addEventListener('input', compute);
      });
    var autoCbp = $('autoCbpFees');
    if (autoCbp) autoCbp.addEventListener('change', compute);

    wireOrigin();
    wirePresets();
    wireTransfer();
    compute();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
