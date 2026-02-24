(function pageStyleSwitcher() {
  const STORAGE_KEY = 'editorialTheme';
  const THEMES = ['wallstreet', 'time', 'newspaper'];

  const root = document.documentElement;
  const buttons = [...document.querySelectorAll('.editorial-toggle[data-editorial-theme]')];
  if (!buttons.length) return;

  const getStoredTheme = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return THEMES.includes(stored) ? stored : 'wallstreet';
  };

  const applyTheme = (theme) => {
    root.setAttribute('data-editorial-theme', theme);

    buttons.forEach((button) => {
      const selected = button.dataset.editorialTheme === theme;
      button.setAttribute('aria-pressed', String(selected));
      button.classList.toggle('active', selected);
    });
  };

  let currentTheme = getStoredTheme();
  applyTheme(currentTheme);

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      currentTheme = button.dataset.editorialTheme;
      localStorage.setItem(STORAGE_KEY, currentTheme);
      applyTheme(currentTheme);
    });
  });
})();
