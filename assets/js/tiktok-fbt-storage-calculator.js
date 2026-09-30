(function () {
  'use strict';
  // Rate source: window.FBT_STORAGE_TIERS in assets/js/fbt-rates.js - the single
  // source of truth. This file contains no fee constants on purpose.
  var TIERS = window.FBT_STORAGE_TIERS || [];
  var MIN_CUFT = window.FBT_STORAGE_MIN_CUFT || 0.001;
  var IN3_PER_CUFT = 1728;

  var get = function (s) { return document.getElementById(s); };
  function num(s) { var v = parseFloat(s); return isNaN(v) || v < 0 ? 0 : v; }
  function money(n) { var s = n.toFixed(2); return '$' + s.replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function cuft(n) { return n < 1 ? n.toFixed(4) : n.toFixed(2); }

  var announceTimer;
  function announce(text) {
    clearTimeout(announceTimer);
    announceTimer = setTimeout(function () {
      var el = get('calcSummary');
      if (el) el.textContent = text;
    }, 200);
  }

  // Tier active on a given storage day (1-based).
  function tierAt(day) {
    for (var i = 0; i < TIERS.length; i++) {
      if (day >= TIERS[i].from && day <= TIERS[i].to) return TIERS[i];
    }
    return null;
  }

  // Cost of holding `billableCuft` cubic feet for `days` days, applying each
  // age tier's own rate to the days that fall inside it.
  // Returns { total, rows:[{label, days, rate, cost}] } - rows with zero days are dropped.
  function storageCost(billableCuft, days) {
    var total = 0, rows = [];
    for (var i = 0; i < TIERS.length; i++) {
      var t = TIERS[i];
      var span = Math.max(0, Math.min(days, t.to) - t.from + 1);
      if (span <= 0) continue;
      var cost = span * t.rate * billableCuft;
      total += cost;
      rows.push({ label: t.label, days: span, rate: t.rate, cost: cost });
    }
    return { total: total, rows: rows };
  }

  function calc() {
    var L = num(get('dimL').value), W = num(get('dimW').value), H = num(get('dimH').value);
    var units = num(get('unitCount').value);
    var days = Math.floor(num(get('storageDays').value));
    var price = num(get('sellPrice').value);

    var volIn3 = L * W * H;
    var perUnit = volIn3 / IN3_PER_CUFT;
    // Official floor: minimum chargeable volume 0.001 cu ft per SKU per day.
    var billablePerUnit = Math.max(perUnit, MIN_CUFT);
    var billablePerDay = billablePerUnit * units;

    var warns = [];
    if (volIn3 <= 0) warns.push('Enter the packaged length, width and height to price the storage.');
    if (units <= 0) warns.push('Enter how many units are sitting in the warehouse.');
    if (days > 0 && days <= 60) warns.push('Day ' + days + ' is inside the 60-day free window - this batch has no storage fee yet.');
    if (days > 365) warns.push('Past 365 days the card charges its top rate of ' + money(tierAt(366).rate) + ' per cubic foot per day with no further step.');

    var warnBox = get('sto_warn');
    if (warnBox) {
      if (warns.length) {
        warnBox.style.display = '';
        var list = get('sto_warn_list');
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

    var res = storageCost(billablePerDay, days);
    var perUnitCost = units > 0 ? res.total / units : 0;

    get('r_vol_in3').textContent = volIn3 > 0 ? volIn3.toFixed(0) + ' in\u00b3' : '\u2014';
    get('r_cuft_unit').textContent = perUnit > 0 ? cuft(billablePerUnit) + ' cu ft' : '\u2014';
    get('r_billable').textContent = units > 0 && perUnit > 0 ? cuft(billablePerDay) + ' cu ft' : '\u2014';

    var here = tierAt(days);
    get('r_bracket').textContent = days <= 0
      ? '\u2014'
      : (here
          ? here.label + ' \u00b7 ' + money(here.rate) + '/cu ft/day'
          : '\u2014');

    var tbody = get('bd_body');
    if (tbody) {
      tbody.innerHTML = '';
      if (!res.rows.length) {
        var tr0 = document.createElement('tr');
        tr0.innerHTML = '<td colspan="4">Nothing billed yet - enter a volume, a unit count and more than 60 days.</td>';
        tbody.appendChild(tr0);
      } else {
        res.rows.forEach(function (r) {
          var tr = document.createElement('tr');
          tr.innerHTML = '<td>' + r.label + (r.days > 0 && r.rate === 0 ? ' (free)' : '') + '</td>' +
            '<td class="num">' + r.days + '</td>' +
            '<td class="num">' + (r.rate === 0 ? 'Free' : money(r.rate)) + '</td>' +
            '<td class="num">' + money(r.cost) + '</td>';
          tbody.appendChild(tr);
        });
      }
      var note = get('bd_note');
      if (note) {
        note.textContent = res.rows.length
          ? 'Billed on ' + cuft(billablePerDay) + ' cu ft of warehouse space, every day, sellable and defective units alike.'
          : 'Rates are per cubic foot per day, applied to the volume you entered.';
      }
    }

    get('r_total').textContent = money(res.total);
    get('r_perunit').textContent = money(perUnitCost);
    // Feed the per-unit figure to ux.js's carry mechanism, which reads any
    // element with this id into the next tool's matching input.
    var carry = get('storageFee');
    if (carry) carry.value = units > 0 ? perUnitCost.toFixed(2) : '';
    get('r_share').textContent = price > 0 && perUnitCost > 0
      ? (perUnitCost / price * 100).toFixed(1) + '% of one unit\u2019s price'
      : '\u2014';
    get('r_free').textContent = money(0);

    var sens = get('sens_body');
    if (sens) {
      sens.innerHTML = '';
      [30, 60, 90, 180, 270, 365].forEach(function (d) {
        var r = storageCost(billablePerDay, d);
        var tr = document.createElement('tr');
        if (d === days) tr.className = 'scenario-row--max';
        tr.innerHTML = '<td>' + d + ' days' + (d === days ? ' (your inputs)' : '') + '</td>' +
          '<td class="num">' + money(r.total) + '</td>' +
          '<td class="num">' + (units > 0 ? money(r.total / units) : '\u2014') + '</td>';
        sens.appendChild(tr);
      });
    }

    var qaT = get('qa_total'), qaU = get('qa_perunit');
    if (qaT) qaT.textContent = money(res.total);
    if (qaU) qaU.textContent = money(perUnitCost);

    announce('Storage cost ' + money(res.total) + ' for ' + units + ' units over ' + days +
      ' days, about ' + money(perUnitCost) + ' per unit.');
  }

  function applyPreset(p) {
    Object.keys(p).forEach(function (id) {
      var el = get(id);
      if (el) el.value = p[id];
    });
    calc();
  }

  document.addEventListener('DOMContentLoaded', function () {
    ['dimL', 'dimW', 'dimH', 'unitCount', 'storageDays', 'sellPrice'].forEach(function (id) {
      var el = get(id);
      if (el) el.addEventListener('input', function () {
        calc();
        if (window.ttcalcTrackCalculator) window.ttcalcTrackCalculator('tiktok-fbt-storage');
      });
    });

    // Same 100 units of a 10x8x6 box, two sell-through speeds.
    get('presetFast').addEventListener('click', function () {
      applyPreset({ dimL: 10, dimW: 8, dimH: 6, unitCount: 100, storageDays: 45, sellPrice: 29.99 });
    });
    get('presetSlow').addEventListener('click', function () {
      applyPreset({ dimL: 10, dimW: 8, dimH: 6, unitCount: 100, storageDays: 240, sellPrice: 29.99 });
    });

    calc();
  });
})();
