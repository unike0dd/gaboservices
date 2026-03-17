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
        document.querySelectorAll('[data-lang-option]').forEach((button) => {
          const buttonLang = normalizeLang(button.getAttribute('data-lang-option'));
          const isActive = buttonLang === current;
          button.setAttribute('aria-pressed', String(isActive));
          button.classList.toggle('active', isActive);
          button.classList.toggle('is-active', isActive);
          button.disabled = false;
        });
      };

      const notify = () => {
        document.documentElement.lang = current;
        window.localStorage.setItem(STORAGE_KEY, current);
        syncButtons();
        if (typeof onChange === 'function') onChange(current);
      };

      const bind = () => {
        document.querySelectorAll('[data-lang-option]').forEach((button) => {
          button.disabled = false;
          button.addEventListener('click', () => {
            const nextLang = normalizeLang(button.getAttribute('data-lang-option'));
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
