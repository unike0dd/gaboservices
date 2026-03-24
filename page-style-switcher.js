import { EN_MESSAGES } from './locales/en/messages.js';

(function pageStyleSwitcher() {
  const STORAGE_KEY = 'editorialTheme';
  const labels = EN_MESSAGES.editorialTheme;

  const root = document.documentElement;

  const applyTheme = (button) => {
    root.setAttribute('data-editorial-theme', 'wallstreet');
    localStorage.setItem(STORAGE_KEY, 'wallstreet');

    if (!button) return;

    button.dataset.currentTheme = 'wallstreet';
    button.dataset.nextTheme = 'wallstreet';
    button.textContent = "";
    button.setAttribute('aria-label', `${labels.ariaPrefix} ${labels.wallstreet}.`);
    button.setAttribute('title', `Current: ${labels.wallstreet}.`);
    button.setAttribute('aria-disabled', 'true');
    button.disabled = true;
  };

  const init = () => {
    const button = document.getElementById('editorialThemeBtn');
    applyTheme(button);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
