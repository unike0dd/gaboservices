(function () {
  'use strict';

  var STORAGE_KEY = 'gs_cookie_consent_v1';

  function nowISO() { try { return new Date().toISOString(); } catch { return ''; } }
  function readConsent() { try { var raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; } }
  function writeConsent(consent) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(consent)); return true; } catch { return false; } }

  var MESSAGES = {
    saved: 'Saved. Your preferences were updated.',
    saveError: 'Preferences could not be saved (storage blocked). You can still manage cookies in your browser.',
    accepted: 'All optional cookies were accepted.',
    rejected: 'All optional cookies were rejected.',
    loaded: 'Your current preferences are loaded.',
    empty: 'No saved preferences yet. Choose your settings and save.'
  };

  function t(key) { return MESSAGES[key] || ''; }
  function setStatus(msg) { var el = document.getElementById('cookie-status'); if (el) el.textContent = msg; }
  function formEl() { return document.getElementById('cookie-prefs-form'); }

  function setFormFromConsent(consent) {
    var form = formEl();
    if (!form || !consent) return;
    var prefs = form.elements['preferences'];
    var analytics = form.elements['analytics'];
    var marketing = form.elements['marketing'];
    if (prefs) prefs.checked = !!consent.preferences;
    if (analytics) analytics.checked = !!consent.analytics;
    if (marketing) marketing.checked = !!consent.marketing;
  }

  function applyConsent(consent) { if (!consent) return; }

  function saveFromForm() {
    var form = formEl();
    if (!form) return;
    var consent = {
      necessary: true,
      preferences: !!(form.elements['preferences'] && form.elements['preferences'].checked),
      analytics: !!(form.elements['analytics'] && form.elements['analytics'].checked),
      marketing: !!(form.elements['marketing'] && form.elements['marketing'].checked),
      updatedAt: nowISO()
    };
    var ok = writeConsent(consent);
    if (ok) { applyConsent(consent); setStatus(t('saved')); } else { setStatus(t('saveError')); }
  }

  function acceptAll() { var consent = { necessary: true, preferences: true, analytics: true, marketing: true, updatedAt: nowISO() }; writeConsent(consent); setFormFromConsent(consent); applyConsent(consent); setStatus(t('accepted')); }
  function rejectAll() { var consent = { necessary: true, preferences: false, analytics: false, marketing: false, updatedAt: nowISO() }; writeConsent(consent); setFormFromConsent(consent); applyConsent(consent); setStatus(t('rejected')); }

  function wireUI() {
    var form = formEl(); if (!form) return;
    form.addEventListener('submit', function (e) { e.preventDefault(); saveFromForm(); });
    var btnAll = document.getElementById('btn-accept-all');
    var btnNone = document.getElementById('btn-reject-all');
    if (btnAll) btnAll.addEventListener('click', acceptAll);
    if (btnNone) btnNone.addEventListener('click', rejectAll);
  }

  function init() {
    wireUI();
    var consent = readConsent();
    if (consent) { setFormFromConsent(consent); applyConsent(consent); setStatus(t('loaded')); }
    else { setStatus(t('empty')); }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
