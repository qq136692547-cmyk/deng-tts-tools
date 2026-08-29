/* TTCalc — SenseNova product photo generator */
(function () {
  'use strict';

  var STORAGE_KEY = 'ttcalc_sensenova_api_key';
  var SESSION_KEY = 'ttcalc_session';
  var WORKER_BASE = 'https://ttcalc-photo-proxy.geoscore.help';
  var GOOGLE_CLIENT_ID = '154080569698-1e94rhuipkvgboc6fqfp94fndkodmtea.apps.googleusercontent.com';
  var DEFAULT_ENDPOINT = 'https://token.sensenova.cn/v1/images/generations';
  var FREE_ENDPOINT = 'https://ttcalc-photo-proxy.geoscore.help/generate';
  var FREE_EDIT_ENDPOINT = 'https://ttcalc-photo-proxy.geoscore.help/edit';
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
  var productFileInput = document.getElementById('productImage');
  var photoDrop = document.getElementById('photoDrop');
  var uploadPreview = document.getElementById('uploadPreview');
  var previewCanvas = document.getElementById('previewCanvas');
  var removeImageBtn = document.getElementById('removeImage');
  var sourceImage = null;

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

  function refreshUploadState() {
    uploadPreview.hidden = !sourceImage;
    photoDrop.parentElement.classList.toggle('is-filled', Boolean(sourceImage));
  }

  function clearSelectedImage() {
    sourceImage = null;
    productFileInput.value = '';
    var context = previewCanvas.getContext('2d');
    context.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    refreshUploadState();
  }

  function drawPreview(image) {
    var width = image.naturalWidth || image.width;
    var height = image.naturalHeight || image.height;
    var context = previewCanvas.getContext('2d');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, previewCanvas.width, previewCanvas.height);
    var scale = Math.min(previewCanvas.width / width, previewCanvas.height / height);
    var drawWidth = Math.max(1, Math.round(width * scale));
    var drawHeight = Math.max(1, Math.round(height * scale));
    context.drawImage(image, Math.round((previewCanvas.width - drawWidth) / 2), Math.round((previewCanvas.height - drawHeight) / 2), drawWidth, drawHeight);
  }

  function createEditImage(image) {
    var maxSide = 2048;
    var width = image.naturalWidth || image.width;
    var height = image.naturalHeight || image.height;
    var scale = Math.min(1, maxSide / Math.max(width, height));
    var canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    var context = canvas.getContext('2d');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.92);
  }

  function loadImage(file) {
    return new Promise(function (resolve, reject) {
      var objectUrl = URL.createObjectURL(file);
      var image = new Image();
      image.onload = function () { URL.revokeObjectURL(objectUrl); resolve(image); };
      image.onerror = function () {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('That file could not be read as an image.'));
      };
      image.src = objectUrl;
    });
  }

  function handlePhotoFile(file) {
    if (!file) return;
    var allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
    if (!file.type || allowedTypes.indexOf(file.type) === -1) {
      setStatus('Please choose a PNG, JPG, or WebP image.', 'error');
      clearSelectedImage();
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      setStatus('Please use an image smaller than 12MB.', 'error');
      clearSelectedImage();
      return;
    }
    setStatus('Preparing product photo…', 'busy');
    loadImage(file).then(function (image) {
      drawPreview(image);
      sourceImage = createEditImage(image);
      refreshUploadState();
      setStatus('Product photo ready. Describe the scene you want, then generate.', 'success');
    }).catch(function (error) {
      clearSelectedImage();
      setStatus(error && error.message ? error.message : 'The product photo could not be prepared.', 'error');
    });
  }

  productFileInput.addEventListener('change', function () {
    handlePhotoFile(this.files && this.files[0]);
  });

  photoDrop.addEventListener('dragover', function (event) {
    event.preventDefault();
    photoDrop.classList.add('is-dragover');
  });

  photoDrop.addEventListener('dragleave', function () {
    photoDrop.classList.remove('is-dragover');
  });

  photoDrop.addEventListener('drop', function (event) {
    event.preventDefault();
    photoDrop.classList.remove('is-dragover');
    handlePhotoFile(event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]);
  });

  removeImageBtn.addEventListener('click', clearSelectedImage);

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

  /* ---- Google sign-in for personal free quota ---- */

  function getSession() {
    try {
      var raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function storeSession(session) {
    try { localStorage.setItem(SESSION_KEY, JSON.stringify(session)); } catch (e) {}
  }

  function clearSession() {
    try {
      localStorage.removeItem(SESSION_KEY);
      if (window.google && google.accounts && google.accounts.id) {
        google.accounts.id.disableAutoSelect();
      }
    } catch (e) {}
  }

  var signedOutBox = document.getElementById('authSignedOut');
  var signedInBox = document.getElementById('authSignedIn');
  var authUserEl = document.getElementById('authUser');
  var signOutBtn = document.getElementById('signOutBtn');

  function refreshAuthState() {
    var session = getSession();
    if (session && session.token && session.user) {
      signedOutBox.hidden = true;
      signedInBox.hidden = false;
      authUserEl.textContent = session.user.name ? (session.user.name + ' (' + session.user.email + ')') : session.user.email;
    } else {
      signedOutBox.hidden = false;
      signedInBox.hidden = true;
      authUserEl.textContent = '';
    }
  }

  function handleGoogleCallback(response) {
    var credential = response && response.credential;
    if (!credential) { setStatus('Google sign-in failed. Please try again.', 'error'); return; }
    setStatus('Signing in…', 'busy');
    fetch(WORKER_BASE + '/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: credential })
    }).then(function (resp) {
      return resp.json().then(function (data) { return { ok: resp.ok, data: data }; });
    }).then(function (result) {
      if (!result.ok || !result.data || !result.data.token) {
        throw new Error(result.data && result.data.error ? result.data.error : 'Sign-in failed.');
      }
      storeSession({ token: result.data.token, user: result.data.user });
      refreshAuthState();
      setStatus('Signed in. Your personal free quota is now active.', 'success');
    }).catch(function (err) {
      setStatus(err && err.message ? err.message : 'Sign-in failed.', 'error');
    });
  }

  function initGoogleButton() {
    if (!(window.google && google.accounts && google.accounts.id)) {
      setTimeout(initGoogleButton, 400);
      return;
    }
    google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: handleGoogleCallback });
    google.accounts.id.renderButton(document.getElementById('googleBtnWrap'), {
      theme: 'outline', size: 'large', shape: 'pill', text: 'continue_with', width: 240
    });
  }

  (function loadGsi() {
    var gsi = document.createElement('script');
    gsi.src = 'https://accounts.google.com/gsi/client';
    gsi.async = true;
    gsi.defer = true;
    document.head.appendChild(gsi);
    initGoogleButton();
  })();

  signOutBtn.addEventListener('click', function () {
    clearSession();
    refreshAuthState();
    setStatus('Signed out. Using the shared visitor quota.', 'success');
  });

  refreshAuthState();

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
    if (!apiKey) {
      return fetch(FREE_ENDPOINT, {
        method: 'POST',
        headers: (function () {
          var session = getSession();
          var h = { 'Content-Type': 'application/json' };
          if (session && session.token) h['Authorization'] = 'Bearer ' + session.token;
          return h;
        })(),
        body: JSON.stringify({ prompt: prompt, size: size, seed: seed })
      }).then(function (response) {
        return response.json().catch(function () {
          throw new Error('HTTP ' + response.status + ': the free quota service did not return JSON.');
        }).then(function (data) {
          if (!response.ok) throw new Error(data && data.error ? data.error : 'HTTP ' + response.status);
          if (!data || !data.url) throw new Error('The model returned no image URL.');
          return data.url;
        });
      });
    }

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

  function requestEdit(prompt, image, size, seed) {
    if (apiKeyInput.value.trim() || getStoredKey()) {
      var payload = {
        model: 'sensenova-u1.5-lite',
        prompt: prompt,
        image: [image],
        size: size,
        response_format: 'url',
        watermark: false,
        output_format: 'png'
      };
      if (typeof seed === 'number') payload.seed = seed;

      return fetch(DEFAULT_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + (apiKeyInput.value.trim() || getStoredKey()),
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

    return fetch(FREE_EDIT_ENDPOINT, {
      method: 'POST',
      headers: (function () {
        var session = getSession();
        var h = { 'Content-Type': 'application/json' };
        if (session && session.token) h['Authorization'] = 'Bearer ' + session.token;
        return h;
      })(),
      body: JSON.stringify({ prompt: prompt, image: image, size: size, seed: seed })
    }).then(function (response) {
      return response.json().catch(function () {
        throw new Error('HTTP ' + response.status + ': the free quota service did not return JSON.');
      }).then(function (data) {
        if (!response.ok) throw new Error(data && data.error ? data.error : 'HTTP ' + response.status);
        if (!data || !data.url) throw new Error('The model returned no image URL.');
        return data.url;
      });
    });
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    var product = productInput.value.trim();
    var apiKey = apiKeyInput.value.trim() || getStoredKey();
    if (!product) { setStatus('Describe your product first.', 'error'); productInput.focus(); return; }
    if (product.length > 1000) { setStatus('Please keep the product description under 1000 characters.', 'error'); productInput.focus(); return; }

    var scene = scenes[sceneSelect.value] || scenes.white;
    var size = sizes[ratioSelect.value] || sizes.square;
    var count = Math.max(1, Math.min(4, parseInt(countSelect.value, 10) || 1));
    var prompt;
    if (sourceImage) {
      prompt = 'Replace the background and scene: ' + scene + '. User instructions: ' + product + '. Keep the original product exactly unchanged, including shape, materials, colors, labels, and any text. No watermarks, no logos, no extra text.';
    } else {
      prompt = product + '. ' + scene + '. No watermarks, no logos, no extra text.';
    }

    generateBtn.disabled = true;
    generateBtn.textContent = text('photo.generating', 'Generating…');
    galleryEl.innerHTML = '';
    setStatus('Generating ' + count + (count === 1 ? ' image' : ' images') + '. This usually takes 10–30 seconds.', 'busy');

    var jobs = [];
    for (var i = 0; i < count; i += 1) {
      if (sourceImage) {
        jobs.push(requestEdit(prompt, sourceImage, size, Date.now() + i));
      } else {
        jobs.push(requestPhoto(prompt, size, apiKey, Date.now() + i));
      }
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
