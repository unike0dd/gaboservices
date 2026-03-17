import { EN_MESSAGES } from './locales/en/messages.js';

(function pageStyleSwitcher() {
  const STORAGE_KEY = 'editorialTheme';
  const THEMES = ['wallstreet', 'time'];
  const labels = EN_MESSAGES.editorialTheme;

  const root = document.documentElement;
  const button = document.getElementById('editorialThemeBtn');
  if (!button) return;

  const getStoredTheme = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return THEMES.includes(stored) ? stored : 'wallstreet';
  };

  const applyTheme = (theme) => {
    root.setAttribute('data-editorial-theme', theme);
    const label = labels[theme] || labels.wallstreet;
    button.textContent = label;
    button.setAttribute('aria-label', `${labels.ariaPrefix} ${label}`);
  };

  let currentTheme = getStoredTheme();
  applyTheme(currentTheme);

  button.addEventListener('click', () => {
    currentTheme = currentTheme === 'wallstreet' ? 'time' : 'wallstreet';
    localStorage.setItem(STORAGE_KEY, currentTheme);
    applyTheme(currentTheme);
  });
})();
