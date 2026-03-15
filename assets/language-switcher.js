(() => {
  const DEFAULT_STORAGE_KEY = 'lang';
  const DEFAULT_QUERY_PARAM = 'lang';
  const DEFAULT_SELECTOR = '[data-lang-option]';

  const sanitizeSupported = (supported = []) => Array.from(new Set(supported.filter(Boolean)));

  function getPathLocale(pathname, supported) {
    const match = (pathname || '').match(/^\/lang\/([a-z]{2})(?:\/|$)/i);
    const locale = (match?.[1] || '').toLowerCase();
    return supported.includes(locale) ? locale : '';
  }

  function resolveInitialLanguage({ supported, defaultLang, storageKey, queryParam }) {
    const pathLocale = getPathLocale(window.location.pathname, supported);
    if (pathLocale) {
      localStorage.setItem(storageKey, pathLocale);
      return pathLocale;
    }

    const params = new URLSearchParams(window.location.search);
    const requested = (params.get(queryParam) || '').toLowerCase();
    if (supported.includes(requested)) {
      localStorage.setItem(storageKey, requested);
      return requested;
    }

    const htmlLang = (document.documentElement.lang || '').toLowerCase();
    if (supported.includes(htmlLang)) {
      localStorage.setItem(storageKey, htmlLang);
      return htmlLang;
    }

    const stored = (localStorage.getItem(storageKey) || '').toLowerCase();
    if (supported.includes(stored)) return stored;

    return defaultLang;
  }

  function syncLanguageInUrl(lang, queryParam, supported) {
    const url = new URL(window.location.href);
    if (getPathLocale(url.pathname, supported)) {
      url.searchParams.delete(queryParam);
    } else {
      url.searchParams.set(queryParam, lang);
    }
    window.history.replaceState({}, '', url);
  }

  function getAlternateLocaleUrl(lang, supported, queryParam) {
    const alternate = document.querySelector(`link[rel="alternate"][hreflang="${lang}"]`);
    const href = alternate?.getAttribute('href');
    if (href) {
      try {
        const alternateUrl = new URL(href, window.location.origin);
        const nextUrl = new URL(`${alternateUrl.pathname}${alternateUrl.search}`, window.location.origin);
        if (getPathLocale(nextUrl.pathname, supported)) {
          nextUrl.searchParams.delete(queryParam);
        }
        nextUrl.hash = window.location.hash;
        return nextUrl;
      } catch {
        // Continue to path-rewrite fallback.
      }
    }

    const currentUrl = new URL(window.location.href);
    const locale = getPathLocale(currentUrl.pathname, supported);
    if (!locale) return null;
    const strippedPath = currentUrl.pathname.replace(/^\/lang\/(en|es)(?=\/|$)/i, '') || '/';
    const rewrittenPath = `/lang/${lang}${strippedPath.startsWith('/') ? strippedPath : `/${strippedPath}`}`;
    const nextUrl = new URL(rewrittenPath, window.location.origin);
    nextUrl.search = currentUrl.search;
    nextUrl.searchParams.delete(queryParam);
    nextUrl.hash = currentUrl.hash;
    return nextUrl;
  }

  function syncLanguageButtons(lang, { selector, getButtonLabel }) {
    document.querySelectorAll(selector).forEach((button) => {
      const buttonLang = (button.getAttribute('data-lang-option') || '').toLowerCase();
      const isActive = buttonLang === lang;
      button.setAttribute('aria-pressed', String(isActive));
      button.classList.toggle('active', isActive);
      button.classList.toggle('is-active', isActive);

      if (typeof getButtonLabel === 'function') {
        const label = getButtonLabel(buttonLang, lang);
        if (label) {
          button.setAttribute('aria-label', label);
          button.setAttribute('title', label);
        }
      }
    });
  }

  function initLanguageSwitcher(options = {}) {
    const supported = sanitizeSupported(options.supported || ['en', 'es']);
    const defaultLang = supported.includes(options.defaultLang) ? options.defaultLang : (supported[0] || 'es');
    const storageKey = options.storageKey || DEFAULT_STORAGE_KEY;
    const queryParam = options.queryParam || DEFAULT_QUERY_PARAM;
    const selector = options.selector || DEFAULT_SELECTOR;

    let lang = resolveInitialLanguage({ supported, defaultLang, storageKey, queryParam });

    const applyLanguage = (nextLang, { triggeredByUser = false } = {}) => {
      if (!supported.includes(nextLang)) return lang;
      lang = nextLang;
      localStorage.setItem(storageKey, lang);
      syncLanguageInUrl(lang, queryParam, supported);
      document.documentElement.lang = lang;
      syncLanguageButtons(lang, { selector, getButtonLabel: options.getButtonLabel });
      if (typeof options.onChange === 'function') {
        options.onChange(lang);
      }

      if (triggeredByUser && options.navigateOnChange !== false) {
        const alternateUrl = getAlternateLocaleUrl(lang, supported, queryParam);
        if (alternateUrl && alternateUrl.href !== window.location.href) {
          window.location.assign(alternateUrl.href);
        }
      }

      return lang;
    };

    document.addEventListener('click', (event) => {
      const trigger = event.target.closest(selector);
      if (!trigger) return;
      const nextLang = (trigger.getAttribute('data-lang-option') || '').toLowerCase();
      applyLanguage(nextLang, { triggeredByUser: true });
    });

    applyLanguage(lang);

    return {
      getLanguage: () => lang,
      setLanguage: (nextLang) => applyLanguage((nextLang || '').toLowerCase())
    };
  }

  window.GaboLanguageSwitcher = { initLanguageSwitcher };
})();
