// batch-calculator.js — TikTok Shop Multi-SKU CSV Batch Profit Calculator
// 100% Client-Side In-Browser Computation (November 1, 2026 Rate Card)
(function () {
  'use strict';

  var R = window.TTCALC_RATES || {
    referralRate: 6.0,
    transactionFee: 0.00,
    refundAdminRate: 0.20,
    refundAdminCap: 5.00
  };

  var FBT = window.FBT_TIERS || [];

  function $(id) { return document.getElementById(id); }

  function money(val) {
    var v = parseFloat(val);
    if (isNaN(v)) return '$0.00';
    var prefix = v < 0 ? '-$' : '$';
    return prefix + Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function pct(val) {
    var v = parseFloat(val);
    if (isNaN(v)) return '0.0%';
    return v.toFixed(1) + '%';
  }

  function getFbtFeeByWeightOz(oz) {
    if (isNaN(oz) || oz <= 0) return 4.28;
    var lb = oz / 16;
    if (oz <= 4) return 4.28;
    if (oz <= 8) return 4.52;
    if (oz <= 12) return 4.70;
    if (oz <= 16) return 5.10;
    if (lb <= 2) return 5.71;
    if (lb <= 3) return 6.27;
    if (lb <= 4) return 6.92;
    if (lb <= 5) return 7.66;
    if (lb <= 6) return 8.58;
    if (lb <= 7) return 8.88;
    if (lb <= 8) return 9.22;
    if (lb <= 9) return 9.42;
    if (lb <= 10) return 9.63;
    if (lb <= 11) return 10.64;
    if (lb <= 12) return 10.75;
    if (lb <= 13) return 10.98;
    if (lb <= 14) return 11.44;
    if (lb <= 15) return 11.85;
    if (lb <= 16) return 12.67;
    if (lb <= 20) return 14.50;
    if (lb <= 30) return 18.50;
    if (lb <= 50) return 26.50;
    if (lb <= 70) return 34.50;
    return 55.00;
  }

  var demoCatalog = [
    { sku: 'TTS-MIC-01', name: 'Wireless Lavalier Microphone', price: 29.99, cogs: 5.50, weightOz: 6, commPct: 15, returnPct: 10 },
    { sku: 'TTS-LAMP-02', name: 'Sunset Projection Lamp', price: 19.99, cogs: 3.80, weightOz: 14, commPct: 15, returnPct: 8 },
    { sku: 'TTS-GUASHA-03', name: 'Natural Jade Gua Sha Tool', price: 14.99, cogs: 1.80, weightOz: 4, commPct: 20, returnPct: 5 },
    { sku: 'TTS-OIL-04', name: 'Rosemary Hair Growth Oil 2oz', price: 18.50, cogs: 2.50, weightOz: 5, commPct: 20, returnPct: 6 },
    { sku: 'TTS-UTENSIL-05', name: 'Silicone Kitchen Utensils 12Pcs', price: 34.99, cogs: 8.20, weightOz: 32, commPct: 10, returnPct: 7 },
    { sku: 'TTS-YOGA-06', name: 'Seamless High-Waist Leggings', price: 24.99, cogs: 4.80, weightOz: 9, commPct: 15, returnPct: 18 },
    { sku: 'TTS-TUMBLER-07', name: 'Stainless Insulated Tumbler 40oz', price: 27.99, cogs: 6.90, weightOz: 22, commPct: 10, returnPct: 9 },
    { sku: 'TTS-LED-08', name: 'RGB Smart LED Light Strip 32ft', price: 16.99, cogs: 3.20, weightOz: 11, commPct: 15, returnPct: 12 },
    { sku: 'TTS-TEETH-09', name: 'Activated Coconut Charcoal Powder', price: 15.99, cogs: 1.90, weightOz: 4, commPct: 20, returnPct: 6 },
    { sku: 'TTS-PET-10', name: 'Reusable Pet Hair Lint Roller', price: 12.99, cogs: 2.10, weightOz: 7, commPct: 15, returnPct: 8 }
  ];

  var currentCatalog = [];

  function calculateItem(item) {
    var price = Math.max(0, parseFloat(item.price) || 0);
    var cogs = Math.max(0, parseFloat(item.cogs) || 0);
    var weightOz = Math.max(0.1, parseFloat(item.weightOz) || 4);
    var commPct = Math.max(0, parseFloat(item.commPct) || 0);
    var returnPct = Math.max(0, parseFloat(item.returnPct) || 0);

    // 1. Referral fee: 6% of gross price
    var referral = price * 0.06;

    // 2. FBT fulfillment fee
    var fbtFee = getFbtFeeByWeightOz(weightOz);

    // 3. Creator affiliate commission
    var commAmount = price * (commPct / 100);

    // 4. Return impact (20% refund admin fee + 50% non-resellable inventory loss)
    var returnRatio = returnPct / 100;
    var refundAdmin = Math.min(referral * 0.20, 5.00) * returnRatio;
    var inventoryLoss = cogs * returnRatio * 0.50;
    var returnTotalCost = refundAdmin + inventoryLoss;

    // 5. Total TikTok fees & deductions
    var totalDeductions = referral + fbtFee + commAmount + returnTotalCost;

    // 6. Net Profit per unit
    var netProfit = price - totalDeductions - cogs;

    // 7. Net Margin
    var netMargin = price > 0 ? (netProfit / price) * 100 : 0;

    // 8. GMV Max Break-Even ROAS
    var profitBeforeAds = price - referral - fbtFee - commAmount - returnTotalCost - cogs;
    var breakEvenROAS;
    if (profitBeforeAds > 0) {
      breakEvenROAS = price / profitBeforeAds;
    } else {
      breakEvenROAS = 99.9;
    }

    // 9. Safety Status
    var statusClass, statusLabel;
    if (netProfit <= 0 || breakEvenROAS > 5.0) {
      statusClass = 'badge-risk';
      statusLabel = 'Loss / High Risk';
    } else if (netMargin < 12 || breakEvenROAS > 3.5) {
      statusClass = 'badge-caution';
      statusLabel = 'Slim Margin';
    } else if (netMargin < 22) {
      statusClass = 'badge-moderate';
      statusLabel = 'Healthy';
    } else {
      statusClass = 'badge-safe';
      statusLabel = 'Prime Margin';
    }

    return {
      sku: item.sku || 'SKU-00',
      name: item.name || 'Product',
      price: price,
      cogs: cogs,
      weightOz: weightOz,
      commPct: commPct,
      returnPct: returnPct,
      referral: referral,
      fbtFee: fbtFee,
      commAmount: commAmount,
      returnTotalCost: returnTotalCost,
      totalDeductions: totalDeductions,
      netProfit: netProfit,
      netMargin: netMargin,
      breakEvenROAS: breakEvenROAS,
      statusClass: statusClass,
      statusLabel: statusLabel
    };
  }

  function renderTable() {
    var tbody = $('batchTableBody');
    if (!tbody) return;

    if (currentCatalog.length === 0) {
      tbody.innerHTML = '<tr><td colspan="12" class="empty-state">No products loaded. Click "Load 10 Demo SKUs" or upload your CSV catalog.</td></tr>';
      updateSummaryMetrics([]);
      return;
    }

    var html = '';
    var calculatedList = [];

    currentCatalog.forEach(function (rawItem, idx) {
      var calc = calculateItem(rawItem);
      calculatedList.push(calc);

      html += '<tr data-idx="' + idx + '">';
      html += '<td class="col-center">' + (idx + 1) + '</td>';
      html += '<td><input type="text" class="table-input sku-input" value="' + escapeHtml(calc.sku) + '" data-field="sku" /></td>';
      html += '<td><input type="text" class="table-input name-input" value="' + escapeHtml(calc.name) + '" data-field="name" /></td>';
      html += '<td><input type="number" step="0.01" class="table-input num-input" value="' + calc.price.toFixed(2) + '" data-field="price" /></td>';
      html += '<td><input type="number" step="0.01" class="table-input num-input" value="' + calc.cogs.toFixed(2) + '" data-field="cogs" /></td>';
      html += '<td><input type="number" step="0.1" class="table-input num-input" value="' + calc.weightOz.toFixed(1) + '" data-field="weightOz" /></td>';
      html += '<td><input type="number" step="1" class="table-input num-input" value="' + calc.commPct.toFixed(0) + '" data-field="commPct" />%</td>';
      html += '<td><input type="number" step="1" class="table-input num-input" value="' + calc.returnPct.toFixed(0) + '" data-field="returnPct" />%</td>';
      html += '<td class="col-num">' + money(calc.totalDeductions) + '</td>';
      html += '<td class="col-num ' + (calc.netProfit >= 0 ? 'profit-pos' : 'profit-neg') + '">' + money(calc.netProfit) + '</td>';
      html += '<td class="col-num"><span class="margin-badge ' + calc.statusClass + '">' + pct(calc.netMargin) + '</span></td>';
      html += '<td class="col-center"><span class="roas-tag">' + (calc.breakEvenROAS >= 99 ? '>10x' : calc.breakEvenROAS.toFixed(2) + 'x') + '</span></td>';
      html += '<td class="col-center"><button type="button" class="btn-del-row" title="Delete SKU">&times;</button></td>';
      html += '</tr>';
    });

    tbody.innerHTML = html;
    updateSummaryMetrics(calculatedList);
    wireRowInputs();
  }

  function updateSummaryMetrics(list) {
    var countEl = $('kpiSkuCount');
    var revEl = $('kpiGrossRev');
    var profitEl = $('kpiNetProfit');
    var marginEl = $('kpiBlendedMargin');
    var healthEl = $('kpiHealthRatio');

    if (!list || list.length === 0) {
      if (countEl) countEl.textContent = '0 SKUs';
      if (revEl) revEl.textContent = '$0.00';
      if (profitEl) profitEl.textContent = '$0.00';
      if (marginEl) marginEl.textContent = '0.0%';
      if (healthEl) healthEl.textContent = '0 Safe / 0 At Risk';
      return;
    }

    var totalRev = 0;
    var totalProfit = 0;
    var safeCount = 0;
    var riskCount = 0;

    list.forEach(function (c) {
      // Assuming catalog baseline: 50 units projected per SKU
      var assumedUnits = 50;
      totalRev += c.price * assumedUnits;
      totalProfit += c.netProfit * assumedUnits;
      if (c.netProfit > 0 && c.breakEvenROAS <= 3.5) {
        safeCount++;
      } else {
        riskCount++;
      }
    });

    var blendedMargin = totalRev > 0 ? (totalProfit / totalRev) * 100 : 0;

    if (countEl) countEl.textContent = list.length + ' SKUs';
    if (revEl) revEl.textContent = money(totalRev);
    if (profitEl) {
      profitEl.textContent = (totalProfit >= 0 ? '+' : '') + money(totalProfit);
      profitEl.className = 'kpi-val ' + (totalProfit >= 0 ? 'text-green' : 'text-red');
    }
    if (marginEl) {
      marginEl.textContent = pct(blendedMargin);
      marginEl.className = 'kpi-val ' + (blendedMargin >= 18 ? 'text-green' : (blendedMargin >= 10 ? 'text-yellow' : 'text-red'));
    }
    if (healthEl) {
      healthEl.innerHTML = '<span class="text-green">' + safeCount + ' Safe</span> / <span class="text-red">' + riskCount + ' At Risk</span>';
    }
  }

  function wireRowInputs() {
    var tbody = $('batchTableBody');
    if (!tbody) return;

    var inputs = tbody.querySelectorAll('.table-input');
    inputs.forEach(function (input) {
      input.addEventListener('change', function () {
        var tr = input.closest('tr');
        var idx = parseInt(tr.getAttribute('data-idx'), 10);
        var field = input.getAttribute('data-field');
        if (currentCatalog[idx]) {
          var val = input.value.trim();
          if (field === 'price' || field === 'cogs' || field === 'weightOz' || field === 'commPct' || field === 'returnPct') {
            currentCatalog[idx][field] = parseFloat(val) || 0;
          } else {
            currentCatalog[idx][field] = val;
          }
          renderTable();
        }
      });
    });

    var delBtns = tbody.querySelectorAll('.btn-del-row');
    delBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var tr = btn.closest('tr');
        var idx = parseInt(tr.getAttribute('data-idx'), 10);
        if (currentCatalog[idx]) {
          currentCatalog.splice(idx, 1);
          renderTable();
        }
      });
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Parse uploaded CSV text into catalog objects
  function parseCSV(text) {
    var lines = text.split(/\r?\n/).filter(function (l) { return l.trim().length > 0; });
    if (lines.length < 2) return [];

    var headerLine = lines[0].toLowerCase();
    var headers = parseCSVLine(headerLine);

    var idxSku = headers.findIndex(function (h) { return h.indexOf('sku') !== -1; });
    var idxName = headers.findIndex(function (h) { return h.indexOf('name') !== -1 || h.indexOf('title') !== -1 || h.indexOf('product') !== -1; });
    var idxPrice = headers.findIndex(function (h) { return h.indexOf('price') !== -1 || h.indexOf('sale') !== -1; });
    var idxCogs = headers.findIndex(function (h) { return h.indexOf('cogs') !== -1 || h.indexOf('cost') !== -1; });
    var idxWeight = headers.findIndex(function (h) { return h.indexOf('weight') !== -1 || h.indexOf('oz') !== -1 || h.indexOf('lb') !== -1; });
    var idxComm = headers.findIndex(function (h) { return h.indexOf('comm') !== -1 || h.indexOf('affiliate') !== -1; });
    var idxReturn = headers.findIndex(function (h) { return h.indexOf('return') !== -1 || h.indexOf('refund') !== -1; });

    // Fallbacks if header labels are missing
    if (idxSku === -1) idxSku = 0;
    if (idxName === -1) idxName = 1;
    if (idxPrice === -1) idxPrice = 2;
    if (idxCogs === -1) idxCogs = 3;
    if (idxWeight === -1) idxWeight = 4;

    var items = [];
    for (var i = 1; i < lines.length; i++) {
      var row = parseCSVLine(lines[i]);
      if (row.length < 2) continue;

      var sku = (idxSku !== -1 && row[idxSku]) ? row[idxSku] : ('SKU-' + i);
      var name = (idxName !== -1 && row[idxName]) ? row[idxName] : ('Product ' + i);
      var price = idxPrice !== -1 ? (parseFloat(row[idxPrice].replace(/[^0-9.]/g, '')) || 0) : 19.99;
      var cogs = idxCogs !== -1 ? (parseFloat(row[idxCogs].replace(/[^0-9.]/g, '')) || 0) : 4.50;
      var weight = idxWeight !== -1 ? (parseFloat(row[idxWeight].replace(/[^0-9.]/g, '')) || 8) : 8;
      var comm = idxComm !== -1 ? (parseFloat(row[idxComm].replace(/[^0-9.]/g, '')) || 15) : 15;
      var ret = idxReturn !== -1 ? (parseFloat(row[idxReturn].replace(/[^0-9.]/g, '')) || 8) : 8;

      items.push({
        sku: sku,
        name: name,
        price: price,
        cogs: cogs,
        weightOz: weight,
        commPct: comm,
        returnPct: ret
      });
    }

    return items;
  }

  function parseCSVLine(line) {
    var result = [];
    var cur = '';
    var inQuotes = false;
    for (var i = 0; i < line.length; i++) {
      var c = line[i];
      if (c === '"') {
        inQuotes = !inQuotes;
      } else if (c === ',' && !inQuotes) {
        result.push(cur.trim().replace(/^"|"$/g, ''));
        cur = '';
      } else {
        cur += c;
      }
    }
    result.push(cur.trim().replace(/^"|"$/g, ''));
    return result;
  }

  // Export analyzed table to enriched CSV
  function exportEnrichedCSV() {
    if (currentCatalog.length === 0) {
      alert('No catalog data to export. Please load or upload products first.');
      return;
    }

    var csvHeaders = [
      'SKU', 'Product Name', 'Sale Price ($)', 'COGS ($)', 'Weight (oz)',
      'Creator Comm (%)', 'Return Rate (%)', 'FBT Fee ($)', 'TikTok 6% Referral ($)',
      'Creator Fee ($)', 'Return Admin & Loss ($)', 'Total Deductions ($)',
      'Net Profit / Unit ($)', 'Net Margin (%)', 'Break-Even ROAS', 'Health Status'
    ];

    var csvRows = [csvHeaders.join(',')];

    currentCatalog.forEach(function (rawItem) {
      var c = calculateItem(rawItem);
      var row = [
        '"' + (c.sku || '').replace(/"/g, '""') + '"',
        '"' + (c.name || '').replace(/"/g, '""') + '"',
        c.price.toFixed(2),
        c.cogs.toFixed(2),
        c.weightOz.toFixed(1),
        c.commPct.toFixed(1),
        c.returnPct.toFixed(1),
        c.fbtFee.toFixed(2),
        c.referral.toFixed(2),
        c.commAmount.toFixed(2),
        c.returnTotalCost.toFixed(2),
        c.totalDeductions.toFixed(2),
        c.netProfit.toFixed(2),
        c.netMargin.toFixed(1) + '%',
        (c.breakEvenROAS >= 99 ? '99.9x' : c.breakEvenROAS.toFixed(2) + 'x'),
        '"' + c.statusLabel + '"'
      ];
      csvRows.push(row.join(','));
    });

    var blob = new Blob([csvRows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'TTCalc_TikTok_Shop_Catalog_Analysis_' + (new Date().toISOString().slice(0, 10)) + '.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    if (window.ttcalcTrackEvent) window.ttcalcTrackEvent('batch_csv_export');
  }

  // Download blank CSV template
  function downloadTemplateCSV() {
    var headers = ['SKU', 'Product Name', 'Sale Price', 'COGS', 'Weight Oz', 'Creator Comm Pct', 'Return Rate Pct'];
    var sampleRows = [
      headers.join(','),
      'TTS-SAMPLE-01,Sample Product 1,29.99,6.50,8,15,10',
      'TTS-SAMPLE-02,Sample Product 2,19.99,4.20,12,20,8'
    ];
    var blob = new Blob([sampleRows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'ttcalc_catalog_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function init() {
    // 1. Load Demo Button
    var btnDemo = $('btnLoadDemo');
    if (btnDemo) {
      btnDemo.addEventListener('click', function () {
        currentCatalog = JSON.parse(JSON.stringify(demoCatalog));
        renderTable();
        if (window.ttcalcTrackEvent) window.ttcalcTrackEvent('batch_demo_loaded');
      });
    }

    // 2. Clear Button
    var btnClear = $('btnClearBatch');
    if (btnClear) {
      btnClear.addEventListener('click', function () {
        if (currentCatalog.length > 0 && confirm('Clear all SKUs from the table?')) {
          currentCatalog = [];
          renderTable();
        }
      });
    }

    // 3. Add SKU Row Button
    var btnAdd = $('btnAddRow');
    if (btnAdd) {
      btnAdd.addEventListener('click', function () {
        var newIdx = currentCatalog.length + 1;
        currentCatalog.push({
          sku: 'SKU-' + (newIdx < 10 ? '0' + newIdx : newIdx),
          name: 'New Product ' + newIdx,
          price: 24.99,
          cogs: 5.00,
          weightOz: 8,
          commPct: 15,
          returnPct: 8
        });
        renderTable();
      });
    }

    // 4. Download Template
    var btnTemplate = $('btnDownloadTemplate');
    if (btnTemplate) {
      btnTemplate.addEventListener('click', downloadTemplateCSV);
    }

    // 5. Export CSV
    var btnExport = $('btnExportCSV');
    if (btnExport) {
      btnExport.addEventListener('click', exportEnrichedCSV);
    }

    // 6. CSV File Upload
    var fileInput = $('csvFileInput');
    if (fileInput) {
      fileInput.addEventListener('change', function (e) {
        var file = e.target.files && e.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function (evt) {
          var text = evt.target.result;
          var items = parseCSV(text);
          if (items.length > 0) {
            currentCatalog = items;
            renderTable();
            if (window.ttcalcTrackEvent) window.ttcalcTrackEvent('batch_csv_uploaded', { count: items.length });
          } else {
            alert('Could not parse valid products from CSV. Please check formatting or use our template.');
          }
          fileInput.value = '';
        };
        reader.readAsText(file);
      });
    }

    // Default initialization: load demo items on first visit
    currentCatalog = JSON.parse(JSON.stringify(demoCatalog));
    renderTable();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
