// landed-cost.js - TikTok Shop landed cost calculator
// Math only: the duty rate is whatever the seller enters (per-layer inputs),
// sourced from their HTS line. This file never hardcodes a "current" rate.
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

  function compute() {
    var goods = num('goods');
    var units = Math.max(1, Math.round(num('units')) || 1);
    var freight = num('freight');
    var insurance = num('insurance');
    var other = num('otherFees');
    var ratePct = num('mfn') + num('s301') + num('s232');
    var duty = goods * ratePct / 100;
    var total = goods + freight + insurance + duty + other;

    $('r_base').textContent = money(goods);
    $('r_rate').textContent = pct(ratePct);
    $('r_duty').textContent = '-' + money(duty);
    $('r_ship').textContent = '-' + money(freight + insurance);
    $('r_other').textContent = '-' + money(other);
    $('r_total').textContent = money(total);
    $('r_unit').textContent = money(total / units);
    $('r_dutyunit').textContent = money(duty / units);

    if (window.ttcalcTrackCalculator) window.ttcalcTrackCalculator('landed_cost');
  }

  // Origin switch: Section 301 is a China-only trade action, so reset it when
  // the seller picks a non-China origin and restore the common default (25%,
  // the consumer-goods lists) when they switch back - only if untouched.
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

  function init() {
    ['goods', 'units', 'freight', 'insurance', 'mfn', 's301', 's232', 'otherFees']
      .forEach(function (id) {
        var el = $(id);
        if (el) el.addEventListener('input', compute);
      });
    wireOrigin();
    compute();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
