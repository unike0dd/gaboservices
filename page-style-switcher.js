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

  const optionMarkup = `
    <span class="editorial-toggle__label editorial-toggle__label--news" data-editorial-theme-option="wallstreet" role="button" aria-hidden="true">${labels.wallstreetShort}</span>
    <span class="editorial-toggle__separator" aria-hidden="true">,</span>
    <span class="editorial-toggle__label editorial-toggle__label--magazine" data-editorial-theme-option="time" role="button" aria-hidden="true">${labels.timeShort}</span>
  `;

  const applyTheme = (theme) => {
    const currentTheme = THEMES.includes(theme) ? theme : 'wallstreet';
    const currentLabel = currentTheme === 'wallstreet' ? labels.wallstreet : labels.time;
    const alternateLabel = currentTheme === 'wallstreet' ? labels.time : labels.wallstreet;

    root.setAttribute('data-editorial-theme', currentTheme);
    button.dataset.currentTheme = currentTheme;
    button.innerHTML = optionMarkup;
    button.setAttribute('aria-label', `${labels.ariaPrefix} ${currentLabel}. Activate ${alternateLabel} next.`);
    button.setAttribute('title', `Current: ${currentLabel}. Click News for ${labels.wallstreet}; click Mags for ${labels.time}.`);
  };

  const activateTheme = (theme) => {
    const resolvedTheme = THEMES.includes(theme) ? theme : 'wallstreet';
    localStorage.setItem(STORAGE_KEY, resolvedTheme);
    applyTheme(resolvedTheme);
  };

  button.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target.closest('[data-editorial-theme-option]') : null;
    if (target instanceof HTMLElement) {
      activateTheme(target.dataset.editorialThemeOption || 'wallstreet');
      return;
    }

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
