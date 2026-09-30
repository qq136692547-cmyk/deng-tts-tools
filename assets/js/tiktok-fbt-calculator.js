(function () {
  'use strict';
  var TIERS = window.FBT_TIERS || [];
  // Tier upper bounds in lb, matching window.FBT_TIERS labels:
  // '<=4 oz','4-8 oz','8-12 oz','12-16 oz','1-2 lb',...,'15-16 lb'.
  var BOUNDS = [0.25, 0.5, 0.75, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
  // Official chargeable-weight rules, FBT Rate Card (rendered snapshot 2026-09-30,
  // review/evidence/tiktok-fbt-rate-card-2026-09-30.rendered.html):
  // - actual weight <= 2 lb AND volume <= 332 in^3 -> billed on actual weight only
  //   ("Effective May 1, 2026, If a unit's actual weight is less than or equal to
  //    2lb and its volume (Length x Width x Height) is less than or equal to 332
  //    in^3, shipping charges will be based solely on the actual unit weight")
  // - otherwise -> "the greater of actual unit weight or dimensional weight.
  //   Dimensional weight is calculated using the formula:
  //   Length x Width x Height / 166 (in inches)"
  // Eligibility: "Each unit must not exceed 150 lbs in actual weight, and no
  // single side ... may be greater than 108 inches."
  var DIM_DIVISOR = 166;
  var LIGHT_LB = 2, LIGHT_VOL = 332;
  var MAX_LB = 150, MAX_SIDE = 108;
  // The published per-unit rate card on this site runs to 16 lb; heavier units
  // fall under the extended heavy/bulky tiers (up to 150 lb) priced on a
  // separate schedule we do not model.
  var CARD_MAX_LB = 16;

  var get = function (s) { return document.getElementById(s); };
  function num(s) { var v = parseFloat(s); return isNaN(v) || v < 0 ? 0 : v; }
  function fmt(n) { var s = n.toFixed(2); return '$' + s.replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function fmtW(n) { return n >= 1 ? n.toFixed(2) + ' lb' : (n * 16).toFixed(1) + ' oz'; }

  var announceTimer;
  function announce(text) {
    clearTimeout(announceTimer);
    announceTimer = setTimeout(function () {
      var el = get('calcSummary');
      if (el) el.textContent = text;
    }, 200);
  }

  function tierIndex(wLb) {
    for (var i = 0; i < BOUNDS.length; i++) {
      if (wLb <= BOUNDS[i] + 1e-9) return i;
    }
    return -1;
  }

  function calc() {
    var wIn = num(get('weight').value);
    var wLb = get('weightUnit').value === 'lb' ? wIn : wIn / 16;
    var L = num(get('dimL').value), W = num(get('dimW').value), H = num(get('dimH').value);
    var unitsIdx = +get('fbtUnits').value || 0;
    var returnRate = num(get('returnRate').value) / 100;
    var returnHandlingFee = num(get('returnHandlingFee').value);
    var resellRate = num(get('resellRate').value) / 100;
    var monthlyUnits = num(get('monthlyUnits').value);
    var selfShip = num(get('selfShip').value);
    var threePL = num(get('threePL').value);

    var vol = L * W * H;
    var maxSide = Math.max(L, W, H);
    var dim = vol / DIM_DIVISOR;

    var basis, chargeable;
    if (wLb <= LIGHT_LB && vol <= LIGHT_VOL) {
      chargeable = wLb;
      basis = 'Actual weight only - this unit is at or under 2 lb and ' + vol.toFixed(0) +
              ' in\u00b3 is at or under the 332 in\u00b3 threshold (official rule effective May 1, 2026).';
    } else {
      chargeable = Math.max(wLb, dim);
      basis = dim > wLb
        ? 'Dimensional weight governs - L\u00d7W\u00d7H\u00f7166 = ' + dim.toFixed(2) + ' lb exceeds the actual ' + fmtW(wLb) + '.'
        : 'Actual weight governs - ' + fmtW(wLb) + ' exceeds the dimensional ' + dim.toFixed(2) + ' lb.';
    }

    // Eligibility warnings straight from the official footnote.
    var warns = [];
    if (wLb > MAX_LB) warns.push('Actual weight ' + fmtW(wLb) + ' exceeds the 150 lb FBT eligibility limit.');
    if (maxSide > MAX_SIDE) warns.push('Longest side ' + maxSide.toFixed(0) + ' in exceeds the 108 in FBT eligibility limit.');
    var tier = tierIndex(chargeable);
    var beyondCard = tier === -1;
    if (beyondCard) warns.push('Chargeable weight ' + fmtW(chargeable) + ' is above the published per-unit rate card (to 16 lb). Items up to 150 lb are served by the extended heavy/bulky tiers priced on a separate schedule - this calculator does not model them.');

    var warnBox = get('fbt_warn');
    if (warnBox) {
      if (warns.length) {
        warnBox.style.display = '';
        var list = get('fbt_warn_list');
        if (list) {
          list.innerHTML = '';
          warns.forEach(function (w) {
            var li = document.createElement('li');
            li.textContent = w;
            list.appendChild(li);
          });
        }
      } else {
        warnBox.style.display = 'none';
      }
    }

    get('r_actual').textContent = fmtW(wLb);
    get('r_volume').textContent = vol.toFixed(0) + ' in\u00b3';
    get('r_dim').textContent = dim.toFixed(2) + ' lb';
    get('r_chargeable').textContent = beyondCard ? fmtW(chargeable) : fmtW(chargeable);
    get('r_basis').textContent = basis;

    var tierLabel = TIERS[tier] ? TIERS[tier].label : 'beyond rate card';
    var fee = TIERS[tier] ? TIERS[tier].rates[unitsIdx] : null;
    get('r_tier').textContent = TIERS[tier]
      ? tierLabel + ' - ' + fmt(fee) + ' per unit' + (unitsIdx > 0 ? ' (multi-unit order)' : '')
      : tierLabel;

    // Effective fulfillment cost per unit sold:
    //   fulfillment fee + return drag, where a returned unit costs its handling
    //   fee, and a resold return ships again (another fulfillment fee).
    var returnDrag = fee === null ? null
      : returnRate * returnHandlingFee + returnRate * resellRate * fee;
    var eff = fee === null ? null : fee + returnDrag;

    get('r_fee').textContent = fee === null ? '—' : fmt(fee);
    get('r_return_drag').textContent = returnDrag === null ? '—' : '+' + fmt(returnDrag);
    get('r_eff').textContent = eff === null ? '—' : fmt(eff);
    get('r_monthly_fbt').textContent = eff === null ? '—' : fmt(eff * monthlyUnits);

    // Comparison vs your own numbers. Self-ship and 3PL rates have no official
    // schedule - they are whatever you enter (label + packaging, or your 3PL quote).
    var alts = [
      { name: 'FBT (computed above)', cost: eff, ours: true },
      { name: 'Self-ship (your rate)', cost: selfShip },
      { name: '3PL (your rate)', cost: threePL }
    ];
    var tbody = get('cmp_body');
    if (tbody) {
      tbody.innerHTML = '';
      var best = null;
      alts.forEach(function (a) {
        if (a.cost !== null && (best === null || a.cost < best.cost)) best = a;
      });
      alts.forEach(function (a) {
        var tr = document.createElement('tr');
        if (best && a === best) tr.className = 'scenario-row--max';
        var label = a.name + (best && a === best ? ' (lowest)' : '');
        tr.innerHTML = '<td>' + label + '</td><td class="num">' +
          (a.cost === null ? '—' : fmt(a.cost)) + '</td><td class="num">' +
          (a.cost === null ? '—' : fmt(a.cost * monthlyUnits)) + '</td>';
        tbody.appendChild(tr);
      });
      var note = get('cmp_note');
      if (note) {
        if (eff === null) {
          note.textContent = 'Enter a chargeable weight inside the rate card to compare costs.';
        } else {
          var fbtDelta = best && !best.ours ? (eff - best.cost) : 0;
          note.textContent = best && best.ours
            ? 'FBT is the lowest of the three on these inputs - about ' + fmt((Math.min(selfShip, threePL) - eff)) +
              ' less per unit than the best alternative, or ' + fmt((Math.min(selfShip, threePL) - eff) * monthlyUnits) + ' a month.'
            : 'The lowest option on these inputs is ' + best.name.toLowerCase() + '. FBT runs ' + fmt(fbtDelta) +
              ' more per unit here - about ' + fmt(fbtDelta * monthlyUnits) + ' a month. What FBT bundles in: warehouse storage (first 60 days free) and itemized return handling, which you would otherwise handle yourself.';
        }
      }
    }

    var qa = get('qa_weight');
    if (qa) qa.textContent = beyondCard ? fmtW(chargeable) : (TIERS[tier] ? tierLabel : fmtW(chargeable));

    announce('Chargeable weight ' + (chargeable >= 1 ? chargeable.toFixed(2) + ' pounds' : (chargeable * 16).toFixed(1) + ' ounces') +
      (fee === null ? ', beyond the published rate card.' : ', tier ' + tierLabel + ', ' + fmt(fee) + ' per unit.'));
  }

  function applyPreset(p) {
    Object.keys(p).forEach(function (id) {
      var el = get(id);
      if (el) el.value = p[id];
    });
    calc();
  }

  document.addEventListener('DOMContentLoaded', function () {
    ['weight', 'weightUnit', 'dimL', 'dimW', 'dimH', 'fbtUnits', 'returnRate',
     'returnHandlingFee', 'resellRate', 'monthlyUnits', 'selfShip', 'threePL']
      .forEach(function (id) {
        var el = get(id);
        if (el) el.addEventListener('input', function () {
          calc();
          if (window.ttcalcTrackCalculator) window.ttcalcTrackCalculator('tiktok-fbt');
        });
      });

    // Same 8 oz product, two boxes: the packaging alone moves it two tiers.
    get('presetBulky').addEventListener('click', function () {
      applyPreset({ weight: 8, weightUnit: 'oz', dimL: 10, dimW: 8, dimH: 6,
                    fbtUnits: 0, returnRate: 5, returnHandlingFee: 0.70, resellRate: 50,
                    monthlyUnits: 100, selfShip: 4.50, threePL: 5.50 });
    });
    get('presetCompact').addEventListener('click', function () {
      applyPreset({ weight: 8, weightUnit: 'oz', dimL: 6, dimW: 4, dimH: 2,
                    fbtUnits: 0, returnRate: 5, returnHandlingFee: 0.70, resellRate: 50,
                    monthlyUnits: 100, selfShip: 4.50, threePL: 5.50 });
    });

    calc();
  });
})();
