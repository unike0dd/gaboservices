import { initAdaptiveLayout } from './adaptive-layout.js';
import { initChatbotControls } from './chatbot/chatbot-controls.js';
import { initFabControls } from './fab-controls.js';

const metadata = window.SITE_METADATA || {};
if (metadata.name) document.title = metadata.name;

const metaDescription = document.querySelector('meta[name="description"]');
if (metaDescription && metadata.description) {
  metaDescription.setAttribute('content', metadata.description);
}

document.documentElement.lang = 'en';

function initNavToggle() {
  const navToggle = document.getElementById('navToggle');
  const primaryNav = document.getElementById('primaryNav');
  if (!navToggle || !primaryNav) return;

  const desktopQuery = window.matchMedia('(min-width: 901px)');

  const closeNav = () => {
    navToggle.setAttribute('aria-expanded', 'false');
    primaryNav.classList.remove('open');
    document.body.classList.remove('nav-open');
  };

  const openNav = () => {
    navToggle.setAttribute('aria-expanded', 'true');
    primaryNav.classList.add('open');
    document.body.classList.add('nav-open');
  };

  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    if (expanded) {
      closeNav();
      return;
    }
    openNav();
  });

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
    if (!isInsideNav) closeNav();
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
      status.textContent = 'Submitting...';
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
