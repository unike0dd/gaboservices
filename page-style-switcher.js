(function pageStyleSwitcher() {
  const STORAGE_KEY = 'editorialTheme';
  const THEMES = ['wallstreet', 'time'];

  const labels = {
    wallstreet: 'Wall Street Finish',
    time: 'TIME Magazine Finish'
  };

  const root = document.documentElement;
  const button = document.getElementById('editorialThemeBtn');
  if (!button) return;

  const getStoredTheme = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return THEMES.includes(stored) ? stored : 'wallstreet';
  };

  const applyTheme = (theme) => {
    root.setAttribute('data-editorial-theme', theme);
    button.textContent = labels[theme];
    button.setAttribute('aria-label', `Switch landing and navigation look. Current: ${labels[theme]}`);
  };

  let currentTheme = getStoredTheme();
  applyTheme(currentTheme);

  button.addEventListener('click', () => {
    currentTheme = currentTheme === 'wallstreet' ? 'time' : 'wallstreet';
    localStorage.setItem(STORAGE_KEY, currentTheme);
    applyTheme(currentTheme);
  });
})();
