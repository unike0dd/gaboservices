(() => {
  const root = document.documentElement;
  const STORAGE_KEY = 'gabrielServices.locale';
  const SUPPORTED = new Set(['en', 'es']);

  function normalize(value) {
    const code = (value || '').toLowerCase();
    return SUPPORTED.has(code) ? code : 'en';
  }

  function detectActiveLang() {
    const match = window.location.pathname.match(/^\/(en|es)(?:\/|$)/i);
    if (match) return normalize(match[1]);
    return normalize(window.localStorage.getItem(STORAGE_KEY) || root.lang || 'en');
  }

  function localizedPath(targetLang) {
    const normalizedTarget = normalize(targetLang);
    const url = new URL(window.location.pathname + window.location.search + window.location.hash, window.location.origin);
    const unlocalizedPath = url.pathname.replace(/^\/(en|es)(?=\/|$)/i, '') || '/';
    const normalizedPath = unlocalizedPath === '/'
      ? '/'
      : (/\.[a-z0-9]+$/i.test(unlocalizedPath) ? unlocalizedPath : (unlocalizedPath.endsWith('/') ? unlocalizedPath : `${unlocalizedPath}/`));
    url.pathname = `/${normalizedTarget}${normalizedPath === '/' ? '/' : normalizedPath}`;
    return `${url.pathname}${url.search}${url.hash}`;
  }

  const current = detectActiveLang();
  root.lang = current;
  window.localStorage.setItem(STORAGE_KEY, current);

  document.querySelectorAll('[data-lang-option]').forEach((button) => {
    const buttonLang = normalize(button.getAttribute('data-lang-option'));
    const isActive = buttonLang === current;
    button.setAttribute('aria-pressed', String(isActive));
    button.classList.toggle('active', isActive);
    button.classList.toggle('is-active', isActive);
    button.disabled = false;

    button.addEventListener('click', () => {
      const nextLang = normalize(button.getAttribute('data-lang-option'));
      if (nextLang === detectActiveLang()) return;
      window.localStorage.setItem(STORAGE_KEY, nextLang);
      root.lang = nextLang;
      window.location.assign(localizedPath(nextLang));
    });
  });
})();
