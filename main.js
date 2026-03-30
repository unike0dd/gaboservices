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

function initCenterServicesRotation() {
  const services = [
    {
      center: 'LOGISTICS',
      text: 'Dispatch coordination, shipment visibility, and status follow-up.',
      link: '/services/logistics-operations/'
    },
    {
      center: 'ADMIN BACKOFFICE',
      text: 'Documentation flow, scheduling, and organized follow-up.',
      link: '/services/administrative-backoffice/'
    },
    {
      center: 'IT SUPPORT',
      text: 'Ticket flow, issue tracking, and user support coordination.',
      link: '/services/it-support/'
    },
    {
      center: 'CUSTOMER RELATIONS',
      text: 'Customer communication, response tracking, and continuity.',
      link: '/services/customer-relations/'
    }
  ];

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const wordChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const openServicePageLabel = 'Open service page ↗';
  const titleSpeed = 45;
  const textSpeed = 18;
  const duration = 4200;

  const centerTitle = document.getElementById('centerTitle');
  const centerText = document.getElementById('centerText');
  const centerLink = document.getElementById('centerLink');

  if (!centerTitle || !centerText || !centerLink) return;

  let activeIndex = 0;
  let rotationTimer = null;

  function randomFrom(source) {
    return source[Math.floor(Math.random() * source.length)];
  }

  function scrambleTitle(el, target, speed = 45) {
    return new Promise((resolve) => {
      let step = 0;
      clearInterval(el._timer);

      el._timer = setInterval(() => {
        let output = '';

        for (let i = 0; i < target.length; i += 1) {
          const ch = target[i];

          if (ch === ' ' || ch === '-' || ch === '&') {
            output += ch;
          } else if (i < step) {
            output += target[i];
          } else {
            output += randomFrom(letters);
          }
        }

        el.textContent = output;
        step += 1;

        if (step > target.length + 2) {
          clearInterval(el._timer);
          el.textContent = target;
          resolve();
        }
      }, speed);
    });
  }

  function scrambleWords(el, target, speed = 18) {
    return new Promise((resolve) => {
      let step = 0;
      const chars = target.split('');
      clearInterval(el._timer);

      el._timer = setInterval(() => {
        const output = chars
          .map((ch, i) => {
            if (' .,;:!?-–—↗/&'.includes(ch)) return ch;
            if (i < step) return target[i];
            return randomFrom(wordChars);
          })
          .join('');

        el.textContent = output;
        step += 2;

        if (step >= target.length + 4) {
          clearInterval(el._timer);
          el.textContent = target;
          resolve();
        }
      }, speed);
    });
  }

  async function setService(index) {
    const item = services[index];
    if (!item) return;

    centerLink.classList.remove('show');
    centerLink.href = item.link;
    centerLink.textContent = openServicePageLabel;

    await Promise.all([
      scrambleTitle(centerTitle, item.center, titleSpeed),
      scrambleWords(centerText, item.text, textSpeed)
    ]);

    centerLink.classList.add('show');
  }

  function startRotation() {
    clearInterval(rotationTimer);
    setService(activeIndex);

    rotationTimer = setInterval(() => {
      activeIndex = (activeIndex + 1) % services.length;
      setService(activeIndex);
    }, duration);
  }

  startRotation();
}

initAnalyticsConsentGuard();

document.addEventListener('DOMContentLoaded', () => {
  syncPageMetadata();
  initSiteGovernance();
  initAdaptiveLayout();
  initMobileNav();
  initFabControls();
  initFormStatus();
  initCenterServicesRotation();
});
