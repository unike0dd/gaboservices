import { initAdaptiveLayout } from './adaptive-layout.js';
import { initFabControls } from './fab-controls.js';
import { initMobileNav } from './assets/mobile-nav.js';
import { initAnalyticsConsentGuard } from './analytics-consent-guard.js';
import { initSiteGovernance } from './site-governance.js';
import { ACTIVE_LOCALE, getLocalizedValue, getSiteMetadata } from './site-metadata.js';
import { EN_MESSAGES } from './locales/en/messages.js';

function syncPageMetadata() {
  const metadata = getSiteMetadata();
  const localizedName = getLocalizedValue(metadata.name);
  if (localizedName) document.title = localizedName;

  const metaDescription = document.querySelector('meta[name="description"]');
  const localizedDescription = getLocalizedValue(metadata.description);
  if (metaDescription && localizedDescription) {
    metaDescription.setAttribute('content', localizedDescription);
  }

  document.documentElement.lang = ACTIVE_LOCALE;
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
  initMobileNav();
  initFabControls();
  initFormStatus();
});
