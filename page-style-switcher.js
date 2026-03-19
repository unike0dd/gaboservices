import { EN_MESSAGES } from './locales/en/messages.js';

(function pageStyleSwitcher() {
  const STORAGE_KEY = 'editorialTheme';
  const THEMES = ['wallstreet', 'time'];
  const labels = EN_MESSAGES.editorialTheme;

  const root = document.documentElement;
  const legacyToggle = document.getElementById('editorialThemeBtn');
  if (!legacyToggle) return;

  const getStoredTheme = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return THEMES.includes(stored) ? stored : 'wallstreet';
  };

  const createSegmentedToggle = () => {
    const wrapper = document.createElement('div');
    wrapper.id = legacyToggle.id;
    wrapper.className = legacyToggle.className;
    wrapper.setAttribute('role', 'group');
    wrapper.setAttribute('aria-label', labels.ariaPrefix);
    wrapper.innerHTML = `
      <button
        type="button"
        class="editorial-toggle__option editorial-toggle__option--news"
        data-editorial-theme-option="wallstreet"
      >${labels.wallstreet}</button>
      <button
        type="button"
        class="editorial-toggle__option editorial-toggle__option--magazine"
        data-editorial-theme-option="time"
      >${labels.time}</button>
    `;

    legacyToggle.replaceWith(wrapper);
    return wrapper;
  };

  const buttonGroup = createSegmentedToggle();
  const optionButtons = [...buttonGroup.querySelectorAll('[data-editorial-theme-option]')];
  if (!optionButtons.length) return;

  const applyTheme = (theme) => {
    const currentTheme = THEMES.includes(theme) ? theme : 'wallstreet';
    root.setAttribute('data-editorial-theme', currentTheme);
    buttonGroup.dataset.currentTheme = currentTheme;

    optionButtons.forEach((optionButton) => {
      const optionTheme = optionButton.getAttribute('data-editorial-theme-option');
      const isActive = optionTheme === currentTheme;
      optionButton.setAttribute('aria-pressed', String(isActive));
      optionButton.setAttribute('tabindex', isActive ? '0' : '-1');
      optionButton.classList.toggle('is-active', isActive);
      optionButton.title = isActive ? `Current: ${optionButton.textContent}.` : `Activate ${optionButton.textContent}.`;
    });
  };

  const activateTheme = (theme) => {
    const resolvedTheme = THEMES.includes(theme) ? theme : 'wallstreet';
    localStorage.setItem(STORAGE_KEY, resolvedTheme);
    applyTheme(resolvedTheme);
  };

  buttonGroup.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target.closest('[data-editorial-theme-option]') : null;
    if (!(target instanceof HTMLButtonElement)) return;
    activateTheme(target.dataset.editorialThemeOption || 'wallstreet');
  });

  buttonGroup.addEventListener('keydown', (event) => {
    const activeIndex = optionButtons.findIndex((optionButton) => optionButton.getAttribute('aria-pressed') === 'true');
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      const nextIndex = (activeIndex + 1 + optionButtons.length) % optionButtons.length;
      const nextTheme = optionButtons[nextIndex]?.dataset.editorialThemeOption;
      if (nextTheme) {
        activateTheme(nextTheme);
        optionButtons[nextIndex].focus();
      }
    }

    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      const nextIndex = (activeIndex - 1 + optionButtons.length) % optionButtons.length;
      const nextTheme = optionButtons[nextIndex]?.dataset.editorialThemeOption;
      if (nextTheme) {
        activateTheme(nextTheme);
        optionButtons[nextIndex].focus();
      }
    }
  });

  applyTheme(getStoredTheme());
})();
