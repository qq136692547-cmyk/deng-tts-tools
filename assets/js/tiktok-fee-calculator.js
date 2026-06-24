(function () {
  'use strict';
  var $id = function (s) { return document.getElementById(s); };
  function num(s) { var v = parseFloat(s); return isNaN(v) || v < 0 ? 0 : v; }
  function fmt(n) { return '$' + n.toFixed(2); }

  function calculate() {
    var price  = num($id('salePrice').value);
    var cat    = parseFloat($id('category').value);
    var creatorRate = num($id('creatorRate').value) / 100;
    var crossBorder = $id('isCrossBorder').value === '1';
    var ship   = num($id('shippingCharged').value);

    var total = price + ship;

    var base   = total * cat;
    var afff   = total * 0.02;
    var payMin = 0.30;
    var payment = Math.max(total * 0.018, payMin);
    var cross  = crossBorder ? total * 0.01 : 0;
    var creator = total * creatorRate;
    var totalFee = base + afff + payment + cross + creator;
    var payout = total - totalFee;
    var pct = total > 0 ? (totalFee / total) * 100 : 0;

    $id('r_total').textContent     = fmt(total);
    $id('r_base').textContent      = '-' + fmt(base);
    $id('r_afff').textContent      = '-' + fmt(afff);
    $id('r_payment').textContent   = '-' + fmt(payment);
    $id('r_cross').textContent     = '-' + fmt(cross);
    $id('r_creator').textContent   = '-' + fmt(creator);
    $id('r_payout').textContent    = fmt(payout);
    $id('r_total_fee').textContent = fmt(totalFee) + ' (' + pct.toFixed(1) + '%)';
  }

  document.addEventListener('DOMContentLoaded', function () {
    ['salePrice','category','creatorRate','isCrossBorder','shippingCharged'].forEach(function (id) {
      var el = $id(id); if (el) el.addEventListener('input', calculate);
    });
    calculate();
  });
})();