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

  const getAlternateTheme = (theme) => (theme === 'wallstreet' ? 'time' : 'wallstreet');

  const applyTheme = (theme) => {
    const currentLabel = labels[theme] || labels.wallstreet;
    const alternateTheme = getAlternateTheme(theme);
    const alternateLabel = labels[alternateTheme] || labels.time;

    root.setAttribute('data-editorial-theme', theme);
    button.dataset.currentTheme = theme;
    button.innerHTML = `
      <span class="editorial-toggle__label editorial-toggle__label--news">${labels.wallstreet}</span>
      <span class="editorial-toggle__separator" aria-hidden="true">·</span>
      <span class="editorial-toggle__label editorial-toggle__label--magazine">${labels.time}</span>
    `;
    button.setAttribute('aria-label', `${labels.ariaPrefix} ${currentLabel}. Activate ${alternateLabel} next.`);
    button.setAttribute('title', `Current: ${currentLabel}. Click to activate ${alternateLabel}.`);
  };

  let currentTheme = getStoredTheme();
  applyTheme(currentTheme);

  button.addEventListener('click', () => {
    currentTheme = getAlternateTheme(currentTheme);
    localStorage.setItem(STORAGE_KEY, currentTheme);
    applyTheme(currentTheme);
  });
})();
