import { initAdaptiveLayout } from './adaptive-layout.js';
import { initChatbotControls } from './chatbot/chatbot-controls.js';
import { initFabControls } from './fab-controls.js';
import { EN_MESSAGES } from './locales/en/messages.js';

const metadata = window.SITE_METADATA || {};
const activeLocale = 'en';

const getLocalizedValue = (value) => {
  if (value && typeof value === 'object' && value[activeLocale]) return value[activeLocale];
  return typeof value === 'string' ? value : '';
};

const localizedName = getLocalizedValue(metadata.name);
if (localizedName) document.title = localizedName;

const metaDescription = document.querySelector('meta[name="description"]');
const localizedDescription = getLocalizedValue(metadata.description);
if (metaDescription && localizedDescription) {
  metaDescription.setAttribute('content', localizedDescription);
}

document.documentElement.lang = activeLocale;

function initNavToggle() {
  const navToggle = document.getElementById('navToggle');
  const primaryNav = document.getElementById('primaryNav');
  if (!navToggle || !primaryNav) return;

  const desktopQuery = window.matchMedia('(min-width: 901px)');
  const navBackdrop = document.createElement('button');
  navBackdrop.type = 'button';
  navBackdrop.className = 'nav-backdrop';
  navBackdrop.setAttribute('aria-label', EN_MESSAGES.nav.closeNavigationMenu);
  navBackdrop.hidden = true;
  document.body.appendChild(navBackdrop);

  const navCloseBtn = document.createElement('button');
  navCloseBtn.type = 'button';
  navCloseBtn.className = 'nav-close-floating';
  navCloseBtn.setAttribute('aria-label', EN_MESSAGES.nav.closeNavigationMenu);
  navCloseBtn.textContent = '✕';
  navCloseBtn.hidden = true;
  document.body.appendChild(navCloseBtn);

  const closeNav = () => {
    navToggle.setAttribute('aria-expanded', 'false');
    primaryNav.classList.remove('open');
    document.body.classList.remove('nav-open');
    navBackdrop.hidden = true;
    navCloseBtn.hidden = true;
  };

  const openNav = () => {
    navToggle.setAttribute('aria-expanded', 'true');
    primaryNav.classList.add('open');
    document.body.classList.add('nav-open');
    navBackdrop.hidden = false;
    navCloseBtn.hidden = false;
  };

  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    if (expanded) {
      closeNav();
      return;
    }
    openNav();
  });

  navCloseBtn.addEventListener('click', closeNav);
  navBackdrop.addEventListener('click', closeNav);

  primaryNav.addEventListener('click', (event) => {
    if (event.target instanceof Element && event.target.closest('a')) {
      closeNav();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeNav();
  });

  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    const isInsideNav = event.target.closest('#primaryNav') || event.target.closest('#navToggle');
    if (!isInsideNav && !navBackdrop.hidden) closeNav();
  });

  desktopQuery.addEventListener('change', (event) => {
    if (event.matches) closeNav();
  });
}

function initFormStatus() {
  const forms = [...document.querySelectorAll('form')];
  forms.forEach((form) => {
    form.addEventListener('submit', () => {
      const status = form.querySelector('[data-status]');
      if (!status) return;
      status.textContent = EN_MESSAGES.nav.submitting;
      status.dataset.state = 'review';
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initAdaptiveLayout();
  initChatbotControls();
  initFabControls();
  initNavToggle();
  initFormStatus();
});
