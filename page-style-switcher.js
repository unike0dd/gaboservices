(function pageStyleSwitcher() {
  const STORAGE_KEY = 'editorialTheme';
  const THEMES = ['wallstreet', 'time'];

  const labels = {
    en: {
      wallstreet: 'News Cut',
      time: 'Magazine Cut',
      ariaPrefix: 'Switch landing and navigation look. Current:'
    },
    es: {
      wallstreet: 'Cote Estilo Revista',
      time: 'Corte Estilo Prensa',
      ariaPrefix: 'Cambiar apariencia de inicio y navegación. Actual:'
    }
  };

  const root = document.documentElement;
  const button = document.getElementById('editorialThemeBtn');
  if (!button) return;

  const getStoredTheme = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return THEMES.includes(stored) ? stored : 'wallstreet';
  };

  const getLang = () => {
    const storedLang = localStorage.getItem('lang');
    if (storedLang === 'es' || storedLang === 'en') return storedLang;
    return root.lang === 'es' ? 'es' : 'en';
  };

  const applyTheme = (theme) => {
    root.setAttribute('data-editorial-theme', theme);
    const lang = getLang();
    const locale = labels[lang] || labels.en;
    const label = locale[theme] || labels.en[theme];
    button.textContent = label;
    button.setAttribute('aria-label', `${locale.ariaPrefix} ${label}`);
  };

  let currentTheme = getStoredTheme();
  applyTheme(currentTheme);

  button.addEventListener('click', () => {
    currentTheme = currentTheme === 'wallstreet' ? 'time' : 'wallstreet';
    localStorage.setItem(STORAGE_KEY, currentTheme);
    applyTheme(currentTheme);
  });
})();
