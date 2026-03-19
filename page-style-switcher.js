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
    const currentTheme = THEMES.includes(theme) ? theme : 'wallstreet';
    const currentLabel = currentTheme === 'wallstreet' ? labels.wallstreet : labels.time;
    const alternateLabel = currentTheme === 'wallstreet' ? labels.time : labels.wallstreet;

    root.setAttribute('data-editorial-theme', currentTheme);
    button.dataset.currentTheme = currentTheme;
    button.dataset.nextTheme = currentTheme === 'wallstreet' ? 'time' : 'wallstreet';
    button.textContent = currentTheme === 'wallstreet' ? labels.wallstreetShort : labels.timeShort;
    button.setAttribute('aria-label', `${labels.ariaPrefix} ${currentLabel}. Activate ${alternateLabel} next.`);
    button.setAttribute('title', `Current: ${currentLabel}. Click to switch to ${alternateLabel}.`);
  };

  const activateTheme = (theme) => {
    const resolvedTheme = THEMES.includes(theme) ? theme : 'wallstreet';
    localStorage.setItem(STORAGE_KEY, resolvedTheme);
    applyTheme(resolvedTheme);
  };

  button.addEventListener('click', () => {
    const nextTheme = button.dataset.currentTheme === 'time' ? 'wallstreet' : 'time';
    activateTheme(nextTheme);
  });

  button.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      activateTheme('time');
    }

    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      activateTheme('wallstreet');
    }
  });

  applyTheme(getStoredTheme());
})();
