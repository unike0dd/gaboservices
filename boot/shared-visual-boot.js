import { initAdaptiveLayout } from '../adaptive-layout.js';
import { initFabControls } from '../fab-controls.js';
import { initSiteFooter } from '../footer/footer.js';
import { initMobileNav } from '../assets/mobile-nav.js';
import { initAnalyticsConsentGuard } from '../analytics-consent-guard.js';
import { ACTIVE_LOCALE, getLocalizedValue, getSiteMetadata, initSiteGovernance } from '../site-runtime.js';
import { getLocaleMessages } from '../locales/index.js';

function syncPageMetadata() {
  const metadata = getSiteMetadata();
  const localizedName = getLocalizedValue(metadata.name);
  if (localizedName) document.title = localizedName;
  const metaDescription = document.querySelector('meta[name="description"]');
  const localizedDescription = getLocalizedValue(metadata.description);
  if (metaDescription && localizedDescription) metaDescription.setAttribute('content', localizedDescription);
  document.documentElement.lang = ACTIVE_LOCALE;
}

function ensureChatbotRuntimeStyles() {
  ['/chatbot/chatbot.css', '/chatbot/fab.css'].forEach((href) => {
    const exists = [...document.querySelectorAll('link[rel="stylesheet"]')]
      .some((link) => (link.getAttribute('href') || '').endsWith(href));
    if (exists) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  });
}

function initFormStatus() {
  const localeMessages = getLocaleMessages(ACTIVE_LOCALE);
  [...document.querySelectorAll('form')].forEach((form) => {
    form.addEventListener('submit', () => {
      const status = form.querySelector('[data-status]');
      if (!status) return;
      status.textContent = localeMessages.nav.submitting;
      status.dataset.state = 'review';
    });
  });
}

function initScrollRevealAndCounters() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const main = document.querySelector('main');
  if (!main) return;
  const revealTargets = [...main.querySelectorAll('section, article, [data-reveal], .fade, .info-card, .kpi, .card, .feature-block, .cta')];
  if (reduceMotion) revealTargets.forEach((el) => el.classList.add('fade', 'show'));
  else revealTargets.forEach((el) => el.classList.add('fade', 'show'));

  const counters = main.querySelectorAll('[data-count]');
  if (!counters.length) return;
  if (reduceMotion) {
    counters.forEach((counter) => {
      const suffix = counter.dataset.countSuffix || '';
      counter.innerText = `${counter.dataset.count}${suffix}`;
    });
    return;
  }
  const animateCounter = (counter) => {
    let count = 0;
    const target = Number(counter.dataset.count);
    const suffix = counter.dataset.countSuffix || '';
    const update = () => {
      count += target / 50;
      if (count < target) {
        counter.innerText = `${Math.floor(count)}${suffix}`;
        requestAnimationFrame(update);
      } else counter.innerText = `${target}${suffix}`;
    };
    update();
  };
  counters.forEach(animateCounter);
}

export function initSharedVisualBoot() {
  document.documentElement.classList.add('reveal-ready');
  initAnalyticsConsentGuard();
  syncPageMetadata();
  initSiteGovernance();
  initAdaptiveLayout();
  initMobileNav();
  ensureChatbotRuntimeStyles();
  initFabControls();
  initSiteFooter();
  initFormStatus();
  initScrollRevealAndCounters();
}
