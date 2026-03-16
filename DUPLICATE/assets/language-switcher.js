(() => {
  const DEFAULT_STORAGE_KEY = 'gabrielServices.locale';
  const DEFAULT_QUERY_PARAM = 'lang';
  const DEFAULT_SELECTOR = '[data-lang-option]';

  const sanitizeSupported = (supported = []) => Array.from(new Set(supported.filter(Boolean).map((lang) => String(lang).toLowerCase())));

  const stripTrailingSlash = (value) => (value.length > 1 ? value.replace(/\/+$/, '') : value);

  function readLocaleCookie(name) {
    const safeName = encodeURIComponent(name);
    const match = document.cookie.match(new RegExp(`(?:^|; )${safeName}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : '';
  }

  function writeLocaleCookie(name, value) {
    const safeName = encodeURIComponent(name);
    const safeValue = encodeURIComponent(value);
    const maxAgeSeconds = 60 * 60 * 24 * 365;
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${safeName}=${safeValue}; Max-Age=${maxAgeSeconds}; Path=/; SameSite=Lax${secure}`;
  }

  function normalizePathname(pathname = '/') {
    if (!pathname) return '/';
    const base = pathname.startsWith('/') ? pathname : `/${pathname}`;
    return base.replace(/\/+/g, '/');
  }

  function splitPath(pathname = '/') {
    const normalizedPath = normalizePathname(pathname);
    const trailingSlash = normalizedPath.endsWith('/') && normalizedPath !== '/';
    const trimmed = normalizedPath.replace(/^\/+|\/+$/g, '');
    const segments = trimmed ? trimmed.split('/') : [];
    return { segments, trailingSlash };
  }

  function parsePathLocale(pathname, supported) {
    const { segments } = splitPath(pathname);
    const firstSegment = (segments[0] || '').toLowerCase();

    if (firstSegment === 'es' && supported.includes('es')) {
      return { locale: 'es', explicit: true };
    }

    const fallbackLocale = supported.includes('en') ? 'en' : (supported[0] || 'en');
    return { locale: fallbackLocale, explicit: false };
  }

  function getPathLocale(pathname, supported) {
    return parsePathLocale(pathname, supported).locale;
  }

  function buildLocalePath(pathname, lang, supported) {
    const normalizedLang = (lang || '').toLowerCase();
    if (!supported.includes(normalizedLang)) return null;

    const { segments, trailingSlash } = splitPath(pathname);
    const hasEsPrefix = (segments[0] || '').toLowerCase() === 'es';
    const normalizedSegments = hasEsPrefix ? segments.slice(1) : segments.slice();

    if (normalizedLang === 'en') {
      const nextPath = `/${normalizedSegments.join('/')}`;
      const stablePath = stripTrailingSlash(nextPath || '/');
      if (stablePath === '/') return '/';
      return trailingSlash ? `${stablePath}/` : stablePath;
    }

    const nextSegments = ['es', ...normalizedSegments];
    const nextPath = `/${nextSegments.join('/')}`;
    const stablePath = stripTrailingSlash(nextPath);
    return trailingSlash || stablePath === '/es' ? `${stablePath}/` : stablePath;
  }

  function resolveInitialLanguage({ supported, defaultLang, storageKey, queryParam }) {
    const { locale: pathLocale, explicit } = parsePathLocale(window.location.pathname, supported);
    if (explicit) {
      localStorage.setItem(storageKey, pathLocale);
      writeLocaleCookie(storageKey, pathLocale);
      return pathLocale;
    }

    const stored = (localStorage.getItem(storageKey) || '').toLowerCase();
    if (supported.includes(stored)) return stored;

    const storedCookie = (readLocaleCookie(storageKey) || '').toLowerCase();
    if (supported.includes(storedCookie)) {
      localStorage.setItem(storageKey, storedCookie);
      return storedCookie;
    }

    const htmlLang = (document.documentElement.lang || '').toLowerCase();
    if (supported.includes(htmlLang)) return htmlLang;

    const params = new URLSearchParams(window.location.search);
    const requested = (params.get(queryParam) || '').toLowerCase();
    if (supported.includes(requested)) {
      localStorage.setItem(storageKey, requested);
      writeLocaleCookie(storageKey, requested);
      return requested;
    }

    return supported.includes(defaultLang) ? defaultLang : pathLocale;
  }

  function syncLanguageInUrl(lang, queryParam, supported) {
    const url = new URL(window.location.href);
    const { explicit } = parsePathLocale(url.pathname, supported);
    if (explicit) {
      url.searchParams.delete(queryParam);
    } else {
      url.searchParams.set(queryParam, lang);
    }
    window.history.replaceState({}, '', url);
  }

  function hasPathLocaleAlternates(lang, supported) {
    const expectedPath = buildLocalePath(window.location.pathname, lang, supported);
    if (!expectedPath) return false;

    const canonicalPath = stripTrailingSlash(expectedPath);
    return [...document.querySelectorAll(`link[rel="alternate"][hreflang="${lang}"]`)].some((alternate) => {
      const href = alternate.getAttribute('href');
      if (!href) return false;
      try {
        const pathname = normalizePathname(new URL(href, window.location.origin).pathname);
        return stripTrailingSlash(pathname) === canonicalPath;
      } catch {
        return false;
      }
    });
  }

  function getAlternateLocaleUrl(lang, supported) {
    const currentUrl = new URL(window.location.href);
    const { explicit } = parsePathLocale(currentUrl.pathname, supported);
    const pathCandidate = buildLocalePath(currentUrl.pathname, lang, supported);

    if (pathCandidate && (explicit || hasPathLocaleAlternates(lang, supported))) {
      const nextUrl = new URL(window.location.href);
      nextUrl.pathname = pathCandidate;
      nextUrl.search = currentUrl.search;
      nextUrl.hash = currentUrl.hash;
      return nextUrl;
    }

    const alternate = document.querySelector(`link[rel="alternate"][hreflang="${lang}"]`);
    const href = alternate?.getAttribute('href');
    if (!href) return null;

    try {
      const alternateUrl = new URL(href, window.location.origin);
      const sameOriginUrl = new URL(window.location.href);
      sameOriginUrl.pathname = alternateUrl.pathname;
      sameOriginUrl.search = alternateUrl.search;
      sameOriginUrl.hash = currentUrl.hash;
      return sameOriginUrl;
    } catch {
      return null;
    }
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
    const defaultLang = (options.defaultLang || supported[0] || 'en').toLowerCase();
    const storageKey = options.storageKey || DEFAULT_STORAGE_KEY;
    const queryParam = options.queryParam || DEFAULT_QUERY_PARAM;
    const selector = options.selector || DEFAULT_SELECTOR;

    let lang = resolveInitialLanguage({ supported, defaultLang, storageKey, queryParam });

    const applyLanguage = (nextLang, { triggeredByUser = false } = {}) => {
      const normalizedLang = (nextLang || '').toLowerCase();
      if (!supported.includes(normalizedLang)) return lang;

      if (normalizedLang === lang && triggeredByUser) {
        document.documentElement.lang = lang;
        syncLanguageButtons(lang, { selector, getButtonLabel: options.getButtonLabel });
        return lang;
      }

      lang = normalizedLang;
      localStorage.setItem(storageKey, lang);
      writeLocaleCookie(storageKey, lang);
      syncLanguageInUrl(lang, queryParam, supported);
      document.documentElement.lang = lang;
      syncLanguageButtons(lang, { selector, getButtonLabel: options.getButtonLabel });

      if (typeof options.onChange === 'function') {
        options.onChange(lang);
      }

      if (triggeredByUser && options.navigateOnChange !== false) {
        const alternateUrl = getAlternateLocaleUrl(lang, supported);
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
      getPathLocale: () => getPathLocale(window.location.pathname, supported),
      setLanguage: (nextLang) => applyLanguage((nextLang || '').toLowerCase())
    };
  }

  window.GaboLanguageSwitcher = { initLanguageSwitcher };
})();
