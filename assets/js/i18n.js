/* TTCalc i18n — lightweight client-side language switcher */
(function () {
  'use strict';
  var LANG_KEY = 'ttcalc_lang';
  var translations = window.TTCALC_I18N || {};
  var originalContent = new Map();

  function captureOriginals() {
    document.querySelectorAll('[data-i18n], [data-i18n-placeholder], [data-i18n-title]').forEach(function (el) {
      if (originalContent.has(el)) return;
      originalContent.set(el, {
        html: el.innerHTML,
        placeholder: el.getAttribute('placeholder'),
        title: el.getAttribute('title')
      });
    });
  }

  function getLang() {
    try { return localStorage.getItem(LANG_KEY) || ''; } catch (e) { return ''; }
  }

  function setLang(lang) {
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
    document.documentElement.lang = lang;
    applyTranslations(lang);
  }

  function applyTranslations(lang) {
    var dict = translations[lang];
    if (!dict) return;
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      var original = originalContent.get(el);
      if (dict[key] !== undefined) {
        el.textContent = dict[key];
      } else if (lang === 'en' && original) {
        el.innerHTML = original.html;
      }
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-placeholder');
      var original = originalContent.get(el);
      if (dict[key] !== undefined) {
        el.setAttribute('placeholder', dict[key]);
      } else if (lang === 'en' && original && original.placeholder !== null) {
        el.setAttribute('placeholder', original.placeholder);
      }
    });
    document.querySelectorAll('[data-i18n-title]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-title');
      var original = originalContent.get(el);
      if (dict[key] !== undefined) {
        el.setAttribute('title', dict[key]);
      } else if (lang === 'en' && original && original.title !== null) {
        el.setAttribute('title', original.title);
      }
    });
  }

  function toggleLang() {
    var current = document.documentElement.lang || 'en';
    var next = current === 'en' ? 'zh' : 'en';
    setLang(next);
    updateBtn(next);
  }

  function updateBtn(lang) {
    var btn = document.getElementById('lang-toggle');
    if (!btn) return;
    btn.textContent = lang === 'zh' ? 'EN' : '中文';
    btn.setAttribute('aria-label', lang === 'zh' ? 'Switch to English' : '切换到中文');
  }

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('lang-toggle');
    if (btn) btn.addEventListener('click', toggleLang);

    captureOriginals();
    var saved = getLang();
    if (saved) {
      document.documentElement.lang = saved;
      applyTranslations(saved);
      updateBtn(saved);
    } else {
      var browser = navigator.language || navigator.userLanguage || '';
      if (browser.indexOf('zh') === 0) {
        setLang('zh');
        updateBtn('zh');
      }
    }
  });
})();
