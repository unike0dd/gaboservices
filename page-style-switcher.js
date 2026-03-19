import { EN_MESSAGES } from './locales/en/messages.js';

(function pageStyleSwitcher() {
  const STORAGE_KEY = 'editorialTheme';
  const THEMES = ['wallstreet', 'time'];
  const labels = EN_MESSAGES.editorialTheme;

  const root = document.documentElement;

  const getStoredTheme = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return THEMES.includes(stored) ? stored : 'wallstreet';
  };

  const applyTheme = (theme, button) => {
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

  const activateTheme = (button, theme) => {
    const resolvedTheme = THEMES.includes(theme) ? theme : 'wallstreet';
    localStorage.setItem(STORAGE_KEY, resolvedTheme);
    applyTheme(resolvedTheme, button);
  };

  const init = () => {
    const button = document.getElementById('editorialThemeBtn');
    if (!button) return;

    button.addEventListener('click', () => {
      const nextTheme = button.dataset.currentTheme === 'time' ? 'wallstreet' : 'time';
      activateTheme(button, nextTheme);
    });

    button.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
        activateTheme(button, 'time');
      }

      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        activateTheme(button, 'wallstreet');
      }
    });

    applyTheme(getStoredTheme(), button);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
