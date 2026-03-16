(function bootstrapLanguageSwitcher() {
  const STORAGE_KEY = 'gabrielServices.locale';
  const SUPPORTED = ['en', 'es'];

  function normalizeLang(value) {
    const lang = (value || '').toLowerCase();
    return SUPPORTED.includes(lang) ? lang : 'en';
  }

  function detectLang(defaultLang = 'en') {
    const pathMatch = window.location.pathname.match(/^\/es(?:\/|$)/i);
    if (pathMatch) return 'es';

    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) return normalizeLang(saved);

    return normalizeLang(defaultLang || document.documentElement.lang || 'en');
  }

  window.GaboLanguageSwitcher = {
    initLanguageSwitcher({ supported = SUPPORTED, defaultLang = 'en', onChange } = {}) {
      const activeSupported = supported.filter((lang) => SUPPORTED.includes(lang));
      let current = detectLang(defaultLang);
      if (!activeSupported.includes(current)) {
        current = activeSupported[0] || 'en';
      }

      const notify = () => {
        document.documentElement.lang = current;
        window.localStorage.setItem(STORAGE_KEY, current);
        if (typeof onChange === 'function') onChange(current);
      };

      const bind = () => {
        document.querySelectorAll('[data-lang-option]').forEach((button) => {
          button.addEventListener('click', () => {
            const nextLang = normalizeLang(button.getAttribute('data-lang-option'));
            if (!activeSupported.includes(nextLang) || nextLang === current) return;
            current = nextLang;
            notify();
          });
        });
      };

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
        },
        getLanguage() {
          return current;
        }
      };
    }
  };
})();
