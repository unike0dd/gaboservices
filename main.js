import { initAdaptiveLayout } from './adaptive-layout.js';
import { initChatbotControls } from './chatbot/chatbot-controls.js';
import { initFabControls } from './fab-controls.js';
import { initAnalyticsConsentGuard } from './analytics-consent-guard.js';
import { SITE_METADATA_DEFAULTS } from './site-metadata-defaults.js';
import { initSiteGovernance } from './site-governance.js';
import { EN_MESSAGES } from './locales/en/messages.js';

const activeLocale = 'en';

const getMetadata = () => {
  const siteMetadata = window.SITE_METADATA || {};
  return {
    ...SITE_METADATA_DEFAULTS,
    ...siteMetadata,
    seo: {
      ...SITE_METADATA_DEFAULTS.seo,
      ...(siteMetadata.seo || {}),
      structuredData: {
        ...SITE_METADATA_DEFAULTS.seo.structuredData,
        ...(siteMetadata.seo?.structuredData || {})
      }
    },
    security: {
      ...SITE_METADATA_DEFAULTS.security,
      ...(siteMetadata.security || {})
    },
    media: {
      ...SITE_METADATA_DEFAULTS.media,
      ...(siteMetadata.media || {}),
      allowedEmbeds: {
        ...SITE_METADATA_DEFAULTS.media.allowedEmbeds,
        ...(siteMetadata.media?.allowedEmbeds || {})
      }
    }
  };
};

const getLocalizedValue = (value) => {
  if (value && typeof value === 'object' && value[activeLocale]) return value[activeLocale];
  return typeof value === 'string' ? value : '';
};

function syncPageMetadata() {
  const metadata = getMetadata();
  const localizedName = getLocalizedValue(metadata.name);
  if (localizedName) document.title = localizedName;

  const metaDescription = document.querySelector('meta[name="description"]');
  const localizedDescription = getLocalizedValue(metadata.description);
  if (metaDescription && localizedDescription) {
    metaDescription.setAttribute('content', localizedDescription);
  }

  document.documentElement.lang = activeLocale;
}

function initNavToggle() {
  const navToggle = document.getElementById('navToggle');
  const primaryNav = document.getElementById('primaryNav');
  if (!navToggle || !primaryNav) return;

  const desktopQuery = window.matchMedia('(min-width: 901px)');

  const setNavToggleA11y = (expanded) => {
    navToggle.setAttribute('aria-expanded', String(expanded));
    navToggle.setAttribute(
      'aria-label',
      expanded ? EN_MESSAGES.nav.closeNavigationMenu : EN_MESSAGES.nav.openNavigationMenu
    );
    navToggle.textContent = expanded ? '\u2715' : '\u2630';
    navToggle.classList.toggle('is-active', expanded);
    primaryNav.setAttribute('aria-hidden', String(!expanded));
  };
  const closeNav = () => {
    setNavToggleA11y(false);
    primaryNav.classList.remove('open');
    document.body.classList.remove('nav-open');
  };

  const openNav = () => {
    setNavToggleA11y(true);
    primaryNav.classList.add('open');
    document.body.classList.add('nav-open');
  };

  setNavToggleA11y(false);

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
    if (!isInsideNav && primaryNav.classList.contains('open')) closeNav();
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

initAnalyticsConsentGuard();

document.addEventListener('DOMContentLoaded', () => {
  syncPageMetadata();
  initSiteGovernance();
  initAdaptiveLayout();
  initChatbotControls();
  initFabControls();
  initNavToggle();
  initFormStatus();
});
