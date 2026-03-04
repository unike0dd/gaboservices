(() => {
  const SUPPORTED = ['en', 'es'];
  const COPY = {
    en: {
      legalNavigation: 'Legal navigation',
      languageSelector: 'Language selector',
      legalTerms: 'Terms',
      legalCookies: 'Cookies',
      legalPrivacy: 'Privacy & GDPR',
      pageTermsTitle: 'Terms & Conditions | Gabriel Services',
      pageCookiesTitle: 'Cookies Consent | Gabriel Services',
      pagePrivacyTitle: 'Privacy & GDPR | Gabriel Services',
      headingTerms: 'Terms & Conditions',
      headingCookies: 'Cookies Consent',
      headingPrivacy: 'Privacy Policy & GDPR',
      cookieAcceptAll: 'Accept all',
      cookieRejectAll: 'Reject all',
      cookieSavePrefs: 'Save preferences'
    },
    es: {
      legalNavigation: 'Navegación legal',
      languageSelector: 'Selector de idioma',
      legalTerms: 'Términos',
      legalCookies: 'Cookies',
      legalPrivacy: 'Privacidad y RGPD',
      pageTermsTitle: 'Términos y Condiciones | Gabriel Services',
      pageCookiesTitle: 'Consentimiento de Cookies | Gabriel Services',
      pagePrivacyTitle: 'Privacidad y RGPD | Gabriel Services',
      headingTerms: 'Términos y Condiciones',
      headingCookies: 'Consentimiento de Cookies',
      headingPrivacy: 'Política de Privacidad y RGPD',
      cookieAcceptAll: 'Aceptar todo',
      cookieRejectAll: 'Rechazar todo',
      cookieSavePrefs: 'Guardar preferencias'
    }
  };

  const params = new URLSearchParams(window.location.search);
  const requested = params.get('lang');
  const stored = localStorage.getItem('lang');
  const lang = SUPPORTED.includes(requested) ? requested : (SUPPORTED.includes(stored) ? stored : 'en');
  localStorage.setItem('lang', lang);

  const url = new URL(window.location.href);
  url.searchParams.set('lang', lang);
  window.history.replaceState({}, '', url);

  const copy = COPY[lang] || COPY.en;
  document.documentElement.lang = lang;

  document.querySelectorAll('[data-lang-option]').forEach((button) => {
    const buttonLang = button.getAttribute('data-lang-option');
    const active = buttonLang === lang;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
    button.addEventListener('click', () => {
      if (!SUPPORTED.includes(buttonLang)) return;
      localStorage.setItem('lang', buttonLang);
      const next = new URL(window.location.href);
      next.searchParams.set('lang', buttonLang);
      window.location.href = next.toString();
    });
  });

  document.querySelectorAll('[data-i18n]').forEach((node) => {
    const key = node.getAttribute('data-i18n');
    if (copy[key]) node.textContent = copy[key];
  });
  document.querySelectorAll('[data-i18n-aria-label]').forEach((node) => {
    const key = node.getAttribute('data-i18n-aria-label');
    if (copy[key]) node.setAttribute('aria-label', copy[key]);
  });

  const path = window.location.pathname;
  if (path.endsWith('/legal/terms.html')) {
    document.title = copy.pageTermsTitle;
    const h1 = document.querySelector('main h1');
    if (h1) h1.textContent = copy.headingTerms;
  } else if (path.endsWith('/legal/cookies.html')) {
    document.title = copy.pageCookiesTitle;
    const h1 = document.querySelector('main h1');
    if (h1) h1.textContent = copy.headingCookies;
    const acceptAll = document.getElementById('btn-accept-all');
    const rejectAll = document.getElementById('btn-reject-all');
    const savePrefs = document.querySelector('#cookie-prefs-form button[type="submit"]');
    if (acceptAll) acceptAll.textContent = copy.cookieAcceptAll;
    if (rejectAll) rejectAll.textContent = copy.cookieRejectAll;
    if (savePrefs) savePrefs.textContent = copy.cookieSavePrefs;
  } else if (path.endsWith('/legal/privacy-gdpr.html')) {
    document.title = copy.pagePrivacyTitle;
    const h1 = document.querySelector('main h1');
    if (h1) h1.textContent = copy.headingPrivacy;
  }
})();
