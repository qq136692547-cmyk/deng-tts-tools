/* TTCalc — SenseNova product photo generator */
(function () {
  'use strict';

  var STORAGE_KEY = 'ttcalc_sensenova_api_key';
  var DEFAULT_ENDPOINT = 'https://token.sensenova.cn/v1/images/generations';
  var DEFAULT_MODEL = 'sensenova-u1-fast';

  var form = document.getElementById('photoForm');
  var translations = window.TTCALC_I18N || {};
  var productInput = document.getElementById('productPrompt');
  var sceneSelect = document.getElementById('scenePreset');
  var ratioSelect = document.getElementById('ratioPreset');
  var countSelect = document.getElementById('photoCount');
  var apiKeyInput = document.getElementById('apiKey');
  var saveKeyBtn = document.getElementById('saveKey');
  var clearKeyBtn = document.getElementById('clearKey');
  var generateBtn = document.getElementById('generateBtn');
  var statusEl = document.getElementById('photoStatus');
  var galleryEl = document.getElementById('photoGallery');

  var scenes = {
    white: 'studio product photograph, seamless pure white background, soft shadow, professional commercial lighting, centered composition, crisp focus, high detail',
    podium: 'product on a minimal round podium, pastel gradient backdrop, editorial studio lighting, clean commercial composition, soft reflections',
    lifestyle: 'lifestyle product photograph in a bright modern home, natural warm light, shallow depth of field, realistic props, TikTok-ready composition',
    model: 'product held by an adult model, close crop on the product and hands, neutral studio background, fashion e-commerce lighting, no visible text',
    holiday: 'seasonal holiday product photograph, tasteful festive props, rich colors, clean commercial lighting, centered product focus',
    outdoor: 'outdoor lifestyle product photograph, clean natural daylight, soft shadows, simple uncluttered background, professional product focus'
  };

  var sizes = {
    square: '2048x2048',
    portrait: '1536x2752',
    wide: '2752x1536',
    fourFive: '1824x2272',
    fourThree: '2368x1760',
    threeTwo: '2496x1664'
  };

  function setStatus(message, type) {
    statusEl.textContent = message || '';
    statusEl.className = type ? 'photo-status is-' + type : 'photo-status';
  }

  function text(key, fallback) {
    var dict = translations[document.documentElement.lang || 'en'] || translations.en || {};
    return dict[key] !== undefined ? dict[key] : fallback;
  }

  function getStoredKey() {
    try { return localStorage.getItem(STORAGE_KEY) || ''; } catch (e) { return ''; }
  }

  function storeKey(value) {
    try { localStorage.setItem(STORAGE_KEY, value); } catch (e) {}
  }

  function removeStoredKey() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
  }

  function refreshKeyState() {
    var key = getStoredKey();
    if (key) {
      apiKeyInput.value = key;
      apiKeyInput.type = 'password';
      saveKeyBtn.textContent = text('photo.saved', 'Saved');
      clearKeyBtn.textContent = text('photo.removeKey', 'Remove key');
      clearKeyBtn.hidden = false;
    } else {
      saveKeyBtn.textContent = text('photo.saveKey', 'Save key');
      clearKeyBtn.hidden = true;
    }
  }

  function download(url, filename) {
    var link = document.createElement('a');
    link.href = url;
    link.download = filename || 'ttcalc-product-photo.png';
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function createCard(url, index) {
    var card = document.createElement('article');
    card.className = 'photo-card';

    var image = document.createElement('img');
    image.src = url;
    image.alt = 'Generated product photo ' + (index + 1);
    image.loading = 'lazy';

    var actions = document.createElement('div');
    actions.className = 'photo-card-actions';

    var name = document.createElement('span');
    name.textContent = 'Photo ' + (index + 1);

    var actionsRight = document.createElement('div');
    actionsRight.className = 'photo-card-buttons';

    var open = document.createElement('a');
    open.href = url;
    open.target = '_blank';
    open.rel = 'noopener';
    open.className = 'ghost-button';
    open.textContent = 'Open';

    var save = document.createElement('button');
    save.type = 'button';
    save.className = 'primary-button';
    save.textContent = 'Download';
    save.addEventListener('click', function () {
      var filename = 'ttcalc-product-photo-' + Date.now() + '-' + (index + 1) + '.png';
      fetch(url)
        .then(function (response) { return response.blob(); })
        .then(function (blob) {
          var objectUrl = URL.createObjectURL(blob);
          download(objectUrl, filename);
          setTimeout(function () { URL.revokeObjectURL(objectUrl); }, 5000);
        })
        .catch(function () { download(url, filename); });
    });

    actionsRight.appendChild(open);
    actionsRight.appendChild(save);
    actions.appendChild(name);
    actions.appendChild(actionsRight);
    card.appendChild(image);
    card.appendChild(actions);
    return card;
  }

  function requestPhoto(prompt, size, apiKey, seed) {
    var payload = {
      model: DEFAULT_MODEL,
      prompt: prompt,
      size: size,
      response_format: 'url',
      output_format: 'png'
    };
    if (typeof seed === 'number') payload.seed = seed;

    return fetch(DEFAULT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    }).then(function (response) {
      return response.json().catch(function () {
        throw new Error('HTTP ' + response.status + ': the image service did not return JSON.');
      }).then(function (data) {
        if (!response.ok) {
          var detail = data && data.error && (data.error.message || data.error.code);
          throw new Error(detail ? 'HTTP ' + response.status + ': ' + detail : 'HTTP ' + response.status);
        }
        var urls = (data && data.data ? data.data : [])
          .map(function (item) { return item && item.url; })
          .filter(Boolean);
        if (!urls.length) throw new Error('The model returned no image URL.');
        return urls[0];
      });
    });
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    var product = productInput.value.trim();
    var apiKey = apiKeyInput.value.trim() || getStoredKey();
    if (!product) { setStatus('Describe your product first.', 'error'); productInput.focus(); return; }
    if (!apiKey) { setStatus('Add your free SenseNova API key, then save or generate.', 'error'); apiKeyInput.focus(); return; }

    var scene = scenes[sceneSelect.value] || scenes.white;
    var size = sizes[ratioSelect.value] || sizes.square;
    var count = Math.max(1, Math.min(4, parseInt(countSelect.value, 10) || 1));
    var prompt = product + '. ' + scene + '. No watermarks, no logos, no extra text.';

    generateBtn.disabled = true;
    generateBtn.textContent = text('photo.generating', 'Generating…');
    galleryEl.innerHTML = '';
    setStatus('Generating ' + count + (count === 1 ? ' image' : ' images') + '. This usually takes 10–30 seconds.', 'busy');

    var jobs = [];
    for (var i = 0; i < count; i += 1) {
      jobs.push(requestPhoto(prompt, size, apiKey, Date.now() + i));
    }

    Promise.allSettled(jobs).then(function (results) {
      var urls = [];
      var errors = [];
      results.forEach(function (result) {
        if (result.status === 'fulfilled') urls.push(result.value);
        else errors.push(result.reason && result.reason.message ? result.reason.message : 'Generation failed.');
      });

      urls.forEach(function (url, index) {
        galleryEl.appendChild(createCard(url, index));
      });

      if (!urls.length) {
        setStatus(errors[0] || 'Generation failed. Please try again.', 'error');
      } else if (errors.length) {
        setStatus(errors.length + ' of ' + count + ' images failed. Retry the failed ones for better yield.', 'warning');
      } else {
        setStatus('Done. ' + urls.length + (urls.length === 1 ? ' image is' : ' images are') + ' ready below.', 'success');
      }

      generateBtn.disabled = false;
      generateBtn.textContent = text('photo.generate', 'Generate product photo');
    });
  });

  saveKeyBtn.addEventListener('click', function () {
    var value = apiKeyInput.value.trim();
    if (!value) { setStatus('Paste your SenseNova API key first.', 'error'); return; }
    storeKey(value);
    refreshKeyState();
    setStatus('API key saved on this device only.', 'success');
  });

  clearKeyBtn.addEventListener('click', function () {
    removeStoredKey();
    apiKeyInput.value = '';
    refreshKeyState();
    setStatus('API key removed from this device.', 'success');
  });

  refreshKeyState();
})();
