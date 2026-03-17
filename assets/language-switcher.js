(function bootstrapLanguageSwitcher() {
  const STORAGE_KEY = 'gabrielServices.locale';
  const SUPPORTED = ['en', 'es'];

  function normalizeLang(value) {
    const lang = (value || '').toLowerCase();
    return SUPPORTED.includes(lang) ? lang : 'en';
  }

  function detectLang(defaultLang = 'en') {
    const pathMatch = window.location.pathname.match(/^\/(en|es)(?:\/|$)/i);
    if (pathMatch) return normalizeLang(pathMatch[1]);

    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) return normalizeLang(saved);

    return normalizeLang(defaultLang || document.documentElement.lang || 'en');
  }



  function toLocalizedPath(targetLang) {
    const normalizedTarget = normalizeLang(targetLang);
    const sourceUrl = new URL(window.location.pathname + window.location.search + window.location.hash, window.location.origin);
    const unlocalizedPath = sourceUrl.pathname.replace(/^\/(en|es)(?=\/|$)/i, '') || '/';
    const normalizedPath = unlocalizedPath === '/'
      ? '/'
      : (/\.[a-z0-9]+$/i.test(unlocalizedPath) ? unlocalizedPath : (unlocalizedPath.endsWith('/') ? unlocalizedPath : `${unlocalizedPath}/`));
    sourceUrl.pathname = `/${normalizedTarget}${normalizedPath === '/' ? '/' : normalizedPath}`;
    return `${sourceUrl.pathname}${sourceUrl.search}${sourceUrl.hash}`;
  }

  window.GaboLanguageSwitcher = {
    initLanguageSwitcher({ supported = SUPPORTED, defaultLang = 'en', onChange } = {}) {
      const activeSupported = supported.filter((lang) => SUPPORTED.includes(lang));
      let current = detectLang(defaultLang);
      if (!activeSupported.includes(current)) {
        current = activeSupported[0] || 'en';
      }

      const syncButtons = () => {
        document.querySelectorAll('[data-lang-option]').forEach((control) => {
          const buttonLang = normalizeLang(control.getAttribute('data-lang-option'));
          const isActive = buttonLang === current;
          control.setAttribute('aria-pressed', String(isActive));
          control.classList.toggle('active', isActive);
          control.classList.toggle('is-active', isActive);
          if ('disabled' in control) control.disabled = false;
        });
      };

      const notify = () => {
        document.documentElement.lang = current;
        window.localStorage.setItem(STORAGE_KEY, current);
        syncButtons();
        if (typeof onChange === 'function') onChange(current);
      };

      const bind = () => {
        document.querySelectorAll('[data-lang-option]').forEach((control) => {
          if ('disabled' in control) control.disabled = false;
          control.addEventListener('click', (event) => {
            if (control.tagName === 'A') event.preventDefault();
            const nextLang = normalizeLang(control.getAttribute('data-lang-option'));
            if (!activeSupported.includes(nextLang) || nextLang === current) return;
            current = nextLang;
            notify();
            window.location.assign(toLocalizedPath(current));
          });
        });
      };

      notify();

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bind, { once: true });
      } else {
        bind();
      }

      return {
        setLanguage(nextLang) {
          const normalized = normalizeLang(nextLang);
          if (!activeSupported.includes(normalized) || normalized === current) return;
          current = normalized;
          notify();
          window.location.assign(toLocalizedPath(current));
        },
        getLanguage() {
          return current;
        }
      };
    }
  };
})();
