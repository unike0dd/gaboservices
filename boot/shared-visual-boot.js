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
  if (metaDescription && localizedDescription) {
    metaDescription.setAttribute('content', localizedDescription);
  }

  document.documentElement.lang = ACTIVE_LOCALE;
}

function ensureChatbotRuntimeStyles() {
  const requiredStyles = ['/chatbot/chatbot.css', '/chatbot/fab.css'];

  const hasStylesheet = (target) => [...document.querySelectorAll('link[rel="stylesheet"]')]
    .some((link) => {
      const href = link.getAttribute('href') || '';
      return href === target || href.endsWith(target);
    });

  requiredStyles.forEach((href) => {
    if (hasStylesheet(href)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  });
}

function initFormStatus() {
  const localeMessages = getLocaleMessages(ACTIVE_LOCALE);
  const forms = [...document.querySelectorAll('form')];
  forms.forEach((form) => {
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

  const revealSelectors = [
    'section',
    'article',
    '[data-reveal]',
    '.fade',
    '.info-card',
    '.kpi',
    '.card',
    '.feature-block',
    '.cta'
  ];
  const excludedSelectors = [
    'nav',
    'header',
    '#mobile-nav-root',
    '.mobile-nav',
    '.chatbot-fab',
    '.chatbot-root',
    '.chatbot-container',
    '.modal',
    '.dropdown',
    'button',
    'input',
    'textarea',
    'select',
    '[data-reveal-ignore]',
    '[data-no-reveal]',
    '.ops-hero__flip-inner',
    '.ops-hero__flip-card'
  ].join(', ');

  const revealTargets = [...new Set([
    ...main.querySelectorAll(revealSelectors.join(', '))
  ])].filter((el) => {
    if (el.matches(excludedSelectors)) return false;
    return !el.closest(excludedSelectors);
  });

  const fadeTargets = revealTargets.filter((el) => el.classList.contains('fade'));
  const standardTargets = revealTargets.filter((el) => !el.classList.contains('fade'));
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

  if (reduceMotion) {
    fadeTargets.forEach((el) => el.classList.add('show'));
    standardTargets.forEach((el) => {
      el.classList.add('fade', 'show');
    });
  } else {
    standardTargets.forEach((el) => el.classList.add('fade'));

    if (typeof window.IntersectionObserver !== 'function') {
      revealTargets.forEach((el) => el.classList.add('show'));
    } else {
      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add('show');
          revealObserver.unobserve(entry.target);
        });
      }, {
        threshold: 0.12,
        rootMargin: '0px 0px -8% 0px'
      });

      revealTargets.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const isInitiallyVisible = rect.top <= viewportHeight * 0.82;
        if (isInitiallyVisible) {
          el.classList.add('show');
          return;
        }
        revealObserver.observe(el);
      });
    }
  }

  const counters = main.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const animateCounter = (counter) => {
    if (counter.dataset.countStarted === 'true') return;
    counter.dataset.countStarted = 'true';

    let count = 0;
    const target = Number(counter.dataset.count);
    const suffix = counter.dataset.countSuffix || '';

    const update = () => {
      count += target / 50;
      if (count < target) {
        counter.innerText = `${Math.floor(count)}${suffix}`;
        requestAnimationFrame(update);
      } else {
        counter.innerText = `${target}${suffix}`;
      }
    };

    update();
  };

  if (reduceMotion) {
    counters.forEach((counter) => {
      const suffix = counter.dataset.countSuffix || '';
      counter.innerText = `${counter.dataset.count}${suffix}`;
    });
    return;
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    });
  }, {
    threshold: 0.35
  });

  counters.forEach((counter) => counterObserver.observe(counter));
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
