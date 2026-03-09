import { initAdaptiveLayout } from './adaptive-layout.js';
import { initChatbotControls } from './chatbot/chatbot-controls.js';
import { DICTIONARY, LANGUAGE_CODES, PLANS, SERVICES, SUPPORTED_LANGUAGES } from './language-codes.js';
import { initFabControls } from './fab-controls.js';

const metadata = window.SITE_METADATA || {};
if (metadata.name) document.title = metadata.name;
const metaDescription = document.querySelector('meta[name="description"]');
if (metaDescription && metadata.description) metaDescription.setAttribute('content', metadata.description);
let lang = 'en';
const COUNTRY_CODES = [
  { name: 'United States', code: '+1' },
  { name: 'Mexico', code: '+52' },
  { name: 'Spain', code: '+34' },
  { name: 'United Kingdom', code: '+44' },
  { name: 'Colombia', code: '+57' }
];

function resolveInitialLanguage() {
  const params = new URLSearchParams(window.location.search);
  const urlLang = params.get('lang');
  if (urlLang && SUPPORTED_LANGUAGES.includes(urlLang)) {
    localStorage.setItem('lang', urlLang);
    return urlLang;
  }

  const storedLang = localStorage.getItem('lang');
  if (storedLang && SUPPORTED_LANGUAGES.includes(storedLang)) {
    return storedLang;
  }

  return 'en';
}

function syncLanguageQueryParam() {
  const url = new URL(window.location.href);
  url.searchParams.set('lang', lang);
  window.history.replaceState({}, '', url);
}


function setLanguage(nextLang) {
  if (!SUPPORTED_LANGUAGES.includes(nextLang)) return;
  lang = nextLang;
  localStorage.setItem('lang', lang);
  syncLanguageQueryParam();
  renderCards();
  translatePage();
  populateCountryCodes();
}

class TinyGuardML {
  constructor() {
    this.signatures = [
      { pattern: /<script/gi, weight: 4 },
      { pattern: /on\w+\s*=/gi, weight: 3 },
      { pattern: /javascript:/gi, weight: 4 },
      { pattern: /<iframe/gi, weight: 4 },
      { pattern: /\b(select|union|drop|insert|delete|update)\b/gi, weight: 2 },
      { pattern: /\{\{.*\}\}/g, weight: 1 },
      { pattern: /<\/?[a-z][^>]*>/gi, weight: 2 }
    ];
    this.blockThreshold = 6;
    this.reviewThreshold = 3;
    this.lastTamperingWarningAt = 0;
    this.trustedScriptHosts = new Set([
      window.location.hostname,
      'static.cloudflareinsights.com'
    ]);
  }

  isTrustedNode(node) {
    if (!(node instanceof HTMLElement)) return false;

    if (node.tagName === 'SCRIPT') {
      const srcAttr = node.getAttribute('src') || '';
      if (!srcAttr) {
        return node.hasAttribute('data-cf-beacon') || node.hasAttribute('data-cfasync');
      }

      try {
        const scriptUrl = new URL(srcAttr, window.location.origin);
        return this.trustedScriptHosts.has(scriptUrl.hostname);
      } catch {
        return false;
      }
    }

    if (node.tagName === 'IFRAME') {
      const src = node.getAttribute('src') || '';
      return src.startsWith('https://challenges.cloudflare.com');
    }

    return false;
  }

  sanitize(rawValue) {
    return rawValue.replace(/[<>`]/g, '').replace(/javascript:/gi, '').trim();
  }

  score(value) {
    return this.signatures.reduce((acc, signature) => {
      signature.pattern.lastIndex = 0;
      return acc + (signature.pattern.test(value) ? signature.weight : 0);
    }, 0);
  }

  validateForm(form) {
    const honeypots = [...form.querySelectorAll('.hp-field')];
    const honeypotTriggered = honeypots.some((field) => field.value.trim().length > 0);

    const inputs = [...form.querySelectorAll('input:not(.hp-field), textarea')];
    let riskScore = honeypotTriggered ? 10 : 0;
    const flaggedFields = [];

    inputs.forEach((field) => {
      const cleaned = this.sanitize(field.value);
      const fieldScore = this.score(field.value);
      riskScore += fieldScore;
      if (fieldScore > 0) {
        flaggedFields.push(field);
      }
      field.value = cleaned;
    });

    const blocked = riskScore >= this.blockThreshold;
    const needsReview = !blocked && riskScore >= this.reviewThreshold;

    return {
      allowed: !blocked,
      riskScore,
      honeypotTriggered,
      needsReview,
      blocked,
      flaggedFields
    };
  }

  applyFieldFeedback(fields = []) {
    document.querySelectorAll('[data-security-state]').forEach((field) => {
      field.dataset.securityState = '';
      field.removeAttribute('data-security-state');
    });

    fields.forEach((field) => {
      field.dataset.securityState = 'review';
      field.setAttribute('title', 'Security review suggested for this field.');
    });
  }

  toStatus(copy, verdict) {
    if (verdict.blocked) {
      return { text: copy.blocked, state: 'blocked' };
    }
    if (verdict.needsReview) {
      return { text: copy.review, state: 'review' };
    }
    return { text: copy.sent, state: 'ok' };
  }

  monitorGlobalTampering() {
    const observer = new MutationObserver((changes) => {
      const suspicious = changes.some((change) => {
        return [...change.addedNodes].some((node) => {
          if (!(node instanceof HTMLElement)) return false;

          const suspiciousTag = /^(script|iframe|object|embed)$/i.test(node.tagName);
          const hasInlineEvent = [...node.attributes].some((attribute) => /^on/i.test(attribute.name));
          if (hasInlineEvent) return true;
          if (!suspiciousTag) return false;
          return !this.isTrustedNode(node);
        });
      });
      if (suspicious) {
        const now = Date.now();
        if (now - this.lastTamperingWarningAt < 2500) return;
        this.lastTamperingWarningAt = now;
        console.warn('[TinyGuardML] Potential tampering detected; content inspection recommended.');
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }
}

const tinyGuard = new TinyGuardML();
let activeServiceKey = null;
let activeHeroServiceIndex = -1;

const HERO_SERVICE_MEDIA = {
  logistics: [
    { title: 'Dispatch visibility', subtitle: 'Routes • ETA • Driver updates' },
    { title: 'Shipment control', subtitle: 'Tracking • Exceptions • Escalations' },
    { title: 'Billing ops', subtitle: 'AP/AR • Invoicing • Reconciliation' }
  ],
  admin: [
    { title: 'Executive support', subtitle: 'Calendar • Follow-up • Reporting' },
    { title: 'Document flow', subtitle: 'Records • SOPs • Compliance checks' },
    { title: 'Office coordination', subtitle: 'Scheduling • Inbox • Team support' }
  ],
  customer: [
    { title: 'Customer care', subtitle: 'Retention • QA • Omnichannel support' },
    { title: 'Revenue support', subtitle: 'Lead handling • Upsell • Follow-up' },
    { title: 'Account service', subtitle: 'Billing communication • Case closure' }
  ],
  it: [
    { title: 'Help desk', subtitle: 'Ticket triage • User assistance' },
    { title: 'Level I / II support', subtitle: 'Troubleshooting • Escalation paths' },
    { title: 'Implementation', subtitle: 'Onboarding • Rollout • Hypercare' }
  ]
};

const HERO_SERVICE_DETAILS = {
  en: {
    logistics: {
      eyebrow: 'Logistics Operations',
      card1Title: 'Dispatch Support',
      card1Text: 'Tracking, routing updates, pickup and delivery coordination, and issue follow-up.',
      card2Title: 'Accounts Flow',
      card2Text: 'Billing support, document follow-up, and payable / receivable coordination.',
      metric1Value: '24/7',
      metric1Label: 'Tracking rhythm',
      metric2Value: 'SLA',
      metric2Label: 'Response control',
      metric3Value: 'Flow',
      metric3Label: 'Exception handling'
    },
    admin: {
      eyebrow: 'Administrative Backoffice',
      card1Title: 'Executive Support',
      card1Text: 'Calendar coordination, reporting support, inbox structure, and internal continuity.',
      card2Title: 'Digital Office Admin',
      card2Text: 'Data entry, document organization, recurring tasks, and workflow stability.',
      metric1Value: 'Clean',
      metric1Label: 'Records flow',
      metric2Value: 'On time',
      metric2Label: 'Admin cadence',
      metric3Value: 'Order',
      metric3Label: 'Process support'
    },
    customer: {
      eyebrow: 'Customer Relations',
      card1Title: 'Customer Experience',
      card1Text: 'Issue handling, feedback loops, after-sales communication, and confidence care.',
      card2Title: 'Sales Support',
      card2Text: 'Lead handling, qualification flow, and response management for revenue continuity.',
      metric1Value: 'CX',
      metric1Label: 'Retention support',
      metric2Value: 'Care',
      metric2Label: 'After-sales flow',
      metric3Value: 'NPS',
      metric3Label: 'Experience rhythm'
    },
    it: {
      eyebrow: 'IT Support',
      card1Title: 'Tier 1 Support',
      card1Text: 'Ticket intake, triage, password resets, and basic troubleshooting.',
      card2Title: 'Tier 2 Support',
      card2Text: 'Escalation handling, issue diagnosis, and implementation support continuity.',
      metric1Value: 'T1/T2',
      metric1Label: 'Support layers',
      metric2Value: 'Fast',
      metric2Label: 'Ticket response',
      metric3Value: 'Assist',
      metric3Label: 'Endpoint help'
    }
  },
  es: {
    logistics: {
      eyebrow: 'Operaciones Logísticas',
      card1Title: 'Soporte de Despacho',
      card1Text: 'Rastreo, actualizaciones de ruta, coordinación de recolección y entrega, y seguimiento de incidencias.',
      card2Title: 'Flujo de Cuentas',
      card2Text: 'Apoyo en facturación, seguimiento documental y coordinación de cuentas por pagar y cobrar.',
      metric1Value: '24/7',
      metric1Label: 'Ritmo de rastreo',
      metric2Value: 'SLA',
      metric2Label: 'Control de respuesta',
      metric3Value: 'Flujo',
      metric3Label: 'Manejo de excepciones'
    },
    admin: {
      eyebrow: 'Backoffice Administrativo',
      card1Title: 'Soporte Ejecutivo',
      card1Text: 'Coordinación de agenda, apoyo en reportes, estructura de bandeja y continuidad interna.',
      card2Title: 'Administración Digital',
      card2Text: 'Ingreso de datos, organización documental, tareas recurrentes y estabilidad operativa.',
      metric1Value: 'Limpio',
      metric1Label: 'Flujo de registros',
      metric2Value: 'A tiempo',
      metric2Label: 'Cadencia admin',
      metric3Value: 'Orden',
      metric3Label: 'Soporte de procesos'
    },
    customer: {
      eyebrow: 'Relaciones con Clientes',
      card1Title: 'Experiencia del Cliente',
      card1Text: 'Gestión de incidencias, retroalimentación, comunicación postventa y atención continua.',
      card2Title: 'Soporte Comercial',
      card2Text: 'Gestión de leads, calificación y seguimiento de respuestas para continuidad comercial.',
      metric1Value: 'CX',
      metric1Label: 'Soporte de retención',
      metric2Value: 'Atención',
      metric2Label: 'Flujo postventa',
      metric3Value: 'NPS',
      metric3Label: 'Ritmo de experiencia'
    },
    it: {
      eyebrow: 'Soporte de TI',
      card1Title: 'Soporte Nivel 1',
      card1Text: 'Recepción y triaje de tickets, restablecimiento de accesos y soporte básico.',
      card2Title: 'Soporte Nivel 2',
      card2Text: 'Gestión de escalaciones, diagnóstico de incidentes y continuidad de implementación.',
      metric1Value: 'N1/N2',
      metric1Label: 'Capas de soporte',
      metric2Value: 'Ágil',
      metric2Label: 'Respuesta a tickets',
      metric3Value: 'Ayuda',
      metric3Label: 'Soporte endpoint'
    }
  }
};

const heroCarouselState = {};
let serviceCarouselTimer = null;

function setupServiceCarousel() {
  const track = document.getElementById('serviceCards');
  if (!track) return;

  const cards = [...track.querySelectorAll('.service-card')];
  const toggles = [...document.querySelectorAll('.service-carousel-toggle')];
  if (cards.length < 2) return;

  if (serviceCarouselTimer) {
    window.clearInterval(serviceCarouselTimer);
    serviceCarouselTimer = null;
  }

  let carouselIndex = 0;

  const setCarouselFocus = (index) => {
    cards.forEach((card, cardIndex) => {
      card.classList.toggle('is-carousel-focus', cardIndex === index);
    });

    toggles.forEach((toggle, toggleIndex) => {
      const isCurrent = toggleIndex === index;
      toggle.classList.toggle('is-current', isCurrent);
      toggle.setAttribute('aria-pressed', String(isCurrent));
    });
  };

  const moveTo = (index, behavior = 'smooth') => {
    carouselIndex = index;
    const currentCard = cards[carouselIndex];
    if (!currentCard) return;

    setCarouselFocus(carouselIndex);
    track.scrollTo({ left: currentCard.offsetLeft, behavior });
  };

  const stepToNext = () => {
    const nextIndex = (carouselIndex + 1) % cards.length;
    moveTo(nextIndex);
  };

  let isPaused = false;
  const pause = () => { isPaused = true; };
  const resume = () => { isPaused = false; };

  setCarouselFocus(carouselIndex);

  toggles.forEach((toggle) => {
    toggle.addEventListener('click', () => {
      const requestedIndex = Number(toggle.dataset.serviceIndex);
      if (Number.isNaN(requestedIndex)) return;
      moveTo(requestedIndex);
    });
  });

  let scrollSyncFrame = null;
  const syncIndexFromScroll = () => {
    scrollSyncFrame = null;
    const offset = track.scrollLeft;
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    cards.forEach((card, index) => {
      const distance = Math.abs(card.offsetLeft - offset);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    if (closestIndex !== carouselIndex) {
      carouselIndex = closestIndex;
      setCarouselFocus(carouselIndex);
    }
  };

  track.addEventListener('scroll', () => {
    if (scrollSyncFrame) return;
    scrollSyncFrame = window.requestAnimationFrame(syncIndexFromScroll);
  }, { passive: true });

  track.addEventListener('mouseenter', pause);
  track.addEventListener('mouseleave', resume);
  track.addEventListener('focusin', pause);
  track.addEventListener('focusout', () => {
    if (!track.contains(document.activeElement)) resume();
  });

  serviceCarouselTimer = window.setInterval(() => {
    if (!isPaused) stepToNext();
  }, 8000);
}

function renderServiceHeroAccordion(localizedServices, copy) {
  const heroAccordion = document.getElementById('serviceHeroAccordion');
  if (!heroAccordion) return;

  const heroShell = heroAccordion.closest('.services-hero-accordion');
  const isMobileHeroLayout = () => window.matchMedia('(max-width: 780px)').matches;
  const hasActiveIndex = Number.isInteger(activeHeroServiceIndex) && activeHeroServiceIndex >= 0;
  const safeIndex = hasActiveIndex ? Math.max(0, Math.min(activeHeroServiceIndex, localizedServices.length - 1)) : -1;
  activeHeroServiceIndex = safeIndex;

  localizedServices.forEach((service) => {
    if (!Number.isInteger(heroCarouselState[service.key])) {
      heroCarouselState[service.key] = 0;
    }
  });

  const buildHeroSlides = (service) => {
    const mediaSlides = HERO_SERVICE_MEDIA[service.key] || [{ title: service.title, subtitle: service.body }];
    const activeSlide = heroCarouselState[service.key] || 0;
    const dots = mediaSlides.map((_, slideIndex) => `
      <button
        type="button"
        class="hero-media-dot ${slideIndex === activeSlide ? 'is-active' : ''}"
        data-action="hero-dot"
        data-service-key="${service.key}"
        data-slide-index="${slideIndex}"
        aria-label="${copy.serviceShowPrefix || 'Show'} ${service.title} ${slideIndex + 1}"
      ></button>
    `).join('');

    return `
      <div class="hero-media-carousel" data-hero-carousel="${service.key}">
        <button type="button" class="hero-media-nav" data-action="hero-prev" data-service-key="${service.key}" aria-label="Previous media">←</button>
        <div class="hero-media-viewport">
          <div class="hero-media-track" role="group" aria-label="${service.title} media">
            ${mediaSlides.map((slide, slideIndex) => `
              <article class="hero-media-slide ${slideIndex === activeSlide ? 'is-active' : ''}" aria-hidden="${String(slideIndex !== activeSlide)}">
                <div class="hero-media-visual hero-media-visual--${service.key}"></div>
                <h4>${slide.title}</h4>
                <p>${slide.subtitle}</p>
              </article>
            `).join('')}
          </div>
        </div>
        <button type="button" class="hero-media-nav" data-action="hero-next" data-service-key="${service.key}" aria-label="Next media">→</button>
      </div>
      <div class="hero-media-dots">${dots}</div>
    `;
  };

  heroAccordion.innerHTML = localizedServices.map((service, index) => {
    const serviceDetails = HERO_SERVICE_DETAILS[lang]?.[service.key] || HERO_SERVICE_DETAILS.en[service.key];
    return `
      <article class="service-hero-column ${safeIndex >= 0 && index === safeIndex ? 'is-active' : ''}" data-hero-service-index="${index}" data-hero-service-key="${service.key}">
        <button
          type="button"
          class="service-hero-tab service-hero-tab--${service.key}"
          aria-expanded="${String(safeIndex >= 0 && index === safeIndex)}"
          aria-label="${copy.serviceShowPrefix || 'Show'} ${service.title}"
        >
          <span class="service-hero-tab-name">${service.title}</span>
        </button>
        <div class="service-hero-content">
          <span class="service-hero-eyebrow">${serviceDetails.eyebrow}</span>
          <div class="service-hero-content-grid">
            <div class="service-hero-primary">
              <h3>${service.title}</h3>
              <p>${service.body}</p>
              ${buildHeroSlides(service)}
            </div>
            <div class="service-hero-features">
              <article class="service-feature-card">
                <strong>${serviceDetails.card1Title}</strong>
                <span>${serviceDetails.card1Text}</span>
              </article>
              <article class="service-feature-card">
                <strong>${serviceDetails.card2Title}</strong>
                <span>${serviceDetails.card2Text}</span>
              </article>
            </div>
          </div>
          <div class="service-hero-bottom-row">
            <div class="service-hero-metrics">
              <div class="service-hero-metric"><strong>${serviceDetails.metric1Value}</strong><span>${serviceDetails.metric1Label}</span></div>
              <div class="service-hero-metric"><strong>${serviceDetails.metric2Value}</strong><span>${serviceDetails.metric2Label}</span></div>
              <div class="service-hero-metric"><strong>${serviceDetails.metric3Value}</strong><span>${serviceDetails.metric3Label}</span></div>
            </div>
            <a class="service-hero-link" href="${service.href}">${copy.serviceCardAction || 'View service details'} →</a>
          </div>
        </div>
      </article>
    `;
  }).join('');

  const setActive = (index) => {
    activeHeroServiceIndex = Number.isInteger(index) && index >= 0 ? index : -1;
    const columns = heroAccordion.querySelectorAll('.service-hero-column');
    columns.forEach((column, columnIndex) => {
      const isActive = activeHeroServiceIndex >= 0 && columnIndex === activeHeroServiceIndex;
      column.classList.toggle('is-active', isActive);
      const tab = column.querySelector('.service-hero-tab');
      if (tab) tab.setAttribute('aria-expanded', String(isActive));
    });

    if (!heroShell) return;
    const activeService = localizedServices[activeHeroServiceIndex];
    if (!activeService) {
      delete heroShell.dataset.activeServiceKey;
      return;
    }
    heroShell.dataset.activeServiceKey = activeService.key;
  };

  const mobileAccordion = window.matchMedia('(max-width: 480px)').matches;
  setActive(mobileAccordion && localizedServices.length ? 0 : -1);

  heroAccordion.onmouseover = (event) => {
    if (isMobileHeroLayout()) return;
    const column = event.target.closest('.service-hero-column');
    if (!column) return;
    const index = Number(column?.dataset.heroServiceIndex);
    if (!Number.isInteger(index)) return;
    setActive(index);
  };


  heroAccordion.onmouseleave = () => {
    setActive(isMobileHeroLayout() ? 0 : -1);
  };

  heroAccordion.onfocusin = (event) => {
    const column = event.target.closest('.service-hero-column');
    if (!column) return;
    const index = Number(column?.dataset.heroServiceIndex);
    if (!Number.isInteger(index)) return;
    setActive(index);
  };

  heroAccordion.onclick = (event) => {
    const tab = event.target.closest('.service-hero-tab');
    if (tab) {
      const column = tab.closest('.service-hero-column');
      const index = Number(column?.dataset.heroServiceIndex);
      if (Number.isInteger(index)) {
        const shouldCollapse = isMobileHeroLayout() && activeHeroServiceIndex === index;
        setActive(shouldCollapse ? -1 : index);
      }
      return;
    }

    const control = event.target.closest('[data-action]');
    if (!control) return;

    const action = control.dataset.action;
    const serviceKey = control.dataset.serviceKey;
    if (!serviceKey || !heroCarouselState[serviceKey] && heroCarouselState[serviceKey] !== 0) return;

    const mediaSlides = HERO_SERVICE_MEDIA[serviceKey] || [];
    const totalSlides = mediaSlides.length || 1;

    if (action === 'hero-prev') {
      heroCarouselState[serviceKey] = (heroCarouselState[serviceKey] - 1 + totalSlides) % totalSlides;
      renderServiceHeroAccordion(localizedServices, copy);
      return;
    }

    if (action === 'hero-next') {
      heroCarouselState[serviceKey] = (heroCarouselState[serviceKey] + 1) % totalSlides;
      renderServiceHeroAccordion(localizedServices, copy);
      return;
    }

    if (action === 'hero-dot') {
      const slideIndex = Number(control.dataset.slideIndex);
      if (Number.isNaN(slideIndex)) return;
      heroCarouselState[serviceKey] = slideIndex;
      renderServiceHeroAccordion(localizedServices, copy);
    }
  };
}

function renderCards() {
  const localizedServices = SERVICES[lang] || SERVICES.en;
  const localizedPlans = PLANS[lang] || PLANS.en;
  const copy = DICTIONARY[lang] || DICTIONARY.en;

  const serviceCards = document.getElementById('serviceCards');
  renderServiceHeroAccordion(localizedServices, copy);
  if (serviceCards) {
    serviceCards.innerHTML = localizedServices.map((service) => `
    <article class="card service-card" data-service-card="${service.key}">
      <button class="service-card-trigger" type="button" data-service-key="${service.key}" aria-expanded="${String(activeServiceKey === service.key)}">
        <span class="service-card-label">${copy.serviceLabel}</span>
        <h3>${service.title}</h3>
        <p>${service.body}</p>
        <span class="service-card-action">${copy.serviceCardAction} →</span>
      </button>
    </article>
  `).join('');

    let toggleRow = document.getElementById('serviceCarouselToggles');
    if (!toggleRow) {
      toggleRow = document.createElement('div');
      toggleRow.id = 'serviceCarouselToggles';
      toggleRow.className = 'service-carousel-toggles';
      toggleRow.setAttribute('aria-label', copy.serviceCarouselToggles || 'Service carousel toggles');
      serviceCards.insertAdjacentElement('afterend', toggleRow);
    } else if (toggleRow.previousElementSibling !== serviceCards) {
      serviceCards.insertAdjacentElement('afterend', toggleRow);
    }

    toggleRow.innerHTML = localizedServices.map((service, index) => `
      <button
        type="button"
        class="service-carousel-toggle"
        data-service-index="${index}"
        data-service-key="${service.key}"
        aria-label="${copy.serviceShowPrefix || 'Show'} ${service.title}"
        aria-pressed="false"
      >
        ${service.title}
      </button>
    `).join('');

    bindServiceCardActions(localizedServices);
    setupServiceCarousel();
  }

  const pricingCards = document.getElementById('pricingCards');
  if (pricingCards) {
    const allFeatures = [...new Set(localizedPlans.flatMap((plan) => plan.points))];

    pricingCards.innerHTML = `
      <section class="pricing-compare" aria-label="${copy.pricing}">
        <div class="pricing-compare-header" role="row">
          <div class="pricing-feature-heading" role="columnheader">${copy.pricingFeaturesLabel || 'Features'}</div>
          ${localizedPlans.map((plan) => `
            <article class="price-card pricing-plan-heading" role="columnheader">
              <h3>${plan.name}</h3>
              <p class="price">${plan.price}</p>
            </article>
          `).join('')}
        </div>
        <div class="pricing-compare-body">
          ${allFeatures.map((feature) => `
            <div class="pricing-feature-row" role="row">
              <p class="pricing-feature-name">${feature}</p>
              ${localizedPlans.map((plan) => `
                <span class="pricing-feature-value" aria-label="${plan.name}: ${feature}">
                  ${plan.points.includes(feature) ? '✓' : '—'}
                </span>
              `).join('')}
            </div>
          `).join('')}
        </div>
      </section>
    `;

    const pricingCompare = pricingCards.querySelector('.pricing-compare');
    if (pricingCompare) {
      const toggleCompactPlanHeadings = () => {
        pricingCompare.classList.toggle('is-scrolled', pricingCompare.scrollTop > 8);
      };

      pricingCompare.addEventListener('scroll', toggleCompactPlanHeadings, { passive: true });
      toggleCompactPlanHeadings();
    }
  }
}

function highlightActiveServiceCard() {
  document.querySelectorAll('[data-service-card]').forEach((card) => {
    const isActive = card.getAttribute('data-service-card') === activeServiceKey;
    card.classList.toggle('active', isActive);
    const trigger = card.querySelector('.service-card-trigger');
    if (trigger) trigger.setAttribute('aria-expanded', String(isActive));
  });
}

function updateServiceDetail(localizedServices, shouldScroll = false) {
  const detailPanel = document.getElementById('serviceDetailPanel');
  const detailTitle = document.getElementById('serviceDetailTitle');
  const detailBody = document.getElementById('serviceDetailBody');
  const detailLink = document.getElementById('serviceDetailLink');
  if (!detailPanel || !detailTitle || !detailBody || !detailLink) return;

  if (!activeServiceKey) {
    detailPanel.hidden = true;
    highlightActiveServiceCard();
    return;
  }

  const selected = localizedServices.find((item) => item.key === activeServiceKey);
  if (!selected) {
    activeServiceKey = null;
    detailPanel.hidden = true;
    highlightActiveServiceCard();
    return;
  }

  detailTitle.textContent = selected.title;
  detailBody.textContent = selected.body;
  detailLink.setAttribute('href', selected.href);
  detailPanel.hidden = false;
  highlightActiveServiceCard();
  if (shouldScroll) detailPanel.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

function bindServiceCardActions(localizedServices) {
  const triggers = document.querySelectorAll('.service-card-trigger');
  if (!triggers.length) return;

  triggers.forEach((button) => {
    button.addEventListener('click', () => {
      const key = button.dataset.serviceKey;
      activeServiceKey = key || null;
      updateServiceDetail(localizedServices, true);
    });
  });

  updateServiceDetail(localizedServices, false);
}

function populateCountryCodes() {

  const selects = [...document.querySelectorAll('select[name="contact_country_code"], select[name="applicant_contact_country_code"]')];
  if (!selects.length) return;

  const fillSelects = (items) => {
    const copy = DICTIONARY[lang] || DICTIONARY.en;
    const placeholder = copy.countryCodePlaceholder || 'Select country code';
    const options = [`<option value="">${placeholder}</option>`]
      .concat(items.map((item) => `<option value="${item.code}">${item.name} (${item.code})</option>`));

    selects.forEach((select) => {
      const current = select.value;
      select.innerHTML = options.join('');
      if (current) select.value = current;
    });
  };

  fillSelects(COUNTRY_CODES);
}


function renderFooter(copy) {
  const footerContainer = document.querySelector('.site-footer .container');
  if (!footerContainer) return;

  const currentYear = new Date().getFullYear();
  footerContainer.classList.add('footer-grid');
  footerContainer.innerHTML = `
    <div class="footer-column">
      <h3>${copy.footerCompany || 'Company'}</h3>
      <a href="/about">${copy.about || 'About'}</a>
      <a href="/services">${copy.services || 'Services'}</a>
      <a href="/careers">${copy.careers || 'Careers'}</a>
    </div>
    <div class="footer-column">
      <h3>${copy.footerSupport || 'Support'}</h3>
      <a href="/contact">${copy.contact || 'Contact'}</a>
      <a href="/learning">${copy.learning || 'Learning'}</a>
      <a href="/sitemap.xml">${copy.footerSitemap || 'Sitemap'}</a>
    </div>
    <div class="footer-column">
      <h3>${copy.footerLegal || 'Legal'}</h3>
      <a href="/legal/terms.html">${copy.footerTerms || 'T&C'}</a>
      <a href="/legal/cookies.html">${copy.footerCookies || 'Cookies Consent'}</a>
      <a href="/legal/privacy-gdpr.html">${copy.footerGdpr || 'GDPR'}</a>
    </div>
    <p class="footer-copy">© ${currentYear} ${copy.footerCopyright || 'Gabriel Professional SMBs Services'}</p>
  `;
}

function applyLocalizedAttributes(copy, datasetKey, attributeName) {
  const selector = `[data-i18n-${datasetKey}]`;
  const dataKey = `i18n${datasetKey.charAt(0).toUpperCase()}${datasetKey.slice(1)}`;

  document.querySelectorAll(selector).forEach((node) => {
    const key = node.dataset[dataKey];
    if (copy[key]) node.setAttribute(attributeName, copy[key]);
  });
}

function getLanguageToggleLabel(buttonLang, copy) {
  const labels = {
    en: copy.switchToEnglish || 'Switch language to English',
    es: copy.switchToSpanish || 'Cambiar idioma a español'
  };

  return labels[buttonLang] || '';
}

function translatePage() {
  const copy = DICTIONARY[lang] || DICTIONARY.en;
  document.documentElement.lang = lang;
  if (copy.pageTitle) document.title = copy.pageTitle;
  if (metaDescription && copy.pageDescription) {
    metaDescription.setAttribute('content', copy.pageDescription);
  }

  renderFooter(copy);
  document.querySelectorAll('[data-i18n]').forEach((node) => {
    const key = node.dataset.i18n;
    if (copy[key]) node.textContent = copy[key];
  });

  [
    ['ariaLabel', 'aria-label'],
    ['placeholder', 'placeholder'],
    ['title', 'title'],
    ['content', 'content']
  ].forEach(([datasetKey, attributeName]) => applyLocalizedAttributes(copy, datasetKey, attributeName));

  const langButtons = [...document.querySelectorAll('[data-lang-option]')];
  if (langButtons.length) {
    langButtons.forEach((button) => {
      const buttonLang = button.getAttribute('data-lang-option');
      const isActive = buttonLang === lang;
      const codeLabel = LANGUAGE_CODES[buttonLang];
      if (codeLabel) button.textContent = codeLabel;
      button.setAttribute('aria-pressed', String(isActive));
      button.classList.toggle('active', isActive);
      const label = getLanguageToggleLabel(buttonLang, copy);
      if (label) button.setAttribute('aria-label', label);
    });
  }

  const legacyLangToggleBtn = document.getElementById('langToggleBtn');
  if (legacyLangToggleBtn) {
    const isEnglish = lang === 'en';
    legacyLangToggleBtn.textContent = isEnglish ? LANGUAGE_CODES.en : LANGUAGE_CODES.es;
    legacyLangToggleBtn.setAttribute('aria-pressed', String(isEnglish));
    legacyLangToggleBtn.setAttribute('aria-label', isEnglish ? 'Switch language to Spanish' : 'Cambiar idioma a inglés');
    legacyLangToggleBtn.classList.add('active');
  }
}

function getRepeatableTemplate(type) {
  const copy = DICTIONARY[lang] || DICTIONARY.en;

  if (type === 'expertise') {
    return `
      <select required name="expertise_level[]" data-i18n-aria-label="expertise" aria-label="${copy.expertise || 'Level of Expertise'}">
        <option value="" data-i18n="selectLevel">${copy.selectLevel || 'Select level'}</option>
        <option value="Entry" data-i18n="entry">${copy.entry || 'Entry'}</option>
        <option value="Junior" data-i18n="junior">${copy.junior || 'Junior'}</option>
        <option value="Mid" data-i18n="mid">${copy.mid || 'Mid'}</option>
        <option value="Advance" data-i18n="advanced">${copy.advanced || 'Advanced'}</option>
        <option value="Expert" data-i18n="expert">${copy.expert || 'Expert'}</option>
      </select>
      <textarea required name="expertise_notes[]" rows="2" data-i18n-placeholder="placeholderExpertise" placeholder="${copy.placeholderExpertise || 'Describe your expertise'}"></textarea>
    `;
  }

  const placeholders = {
    experience: 'placeholderExperience',
    education: 'placeholderEducation',
    certification: 'placeholderCertification',
    skills: 'placeholderSkills',
    languages: 'placeholderLanguages',
    instruction: 'placeholderSkills'
  };

  const placeholderKey = placeholders[type] || 'placeholderSkills';
  const placeholder = copy[placeholderKey] || copy.placeholderSkills || 'Add details';

  return `<textarea required name="${type}[]" rows="2" data-i18n-placeholder="${placeholderKey}" placeholder="${placeholder}"></textarea>`;
}


function setRepeatableLockState(block, locked) {
  const addBtn = block.querySelector('.repeat-add');
  const removeBtn = block.querySelector('.repeat-remove');
  const lockBtn = block.querySelector('.repeat-lock');
  const fields = [...block.querySelectorAll('textarea, select, input')];

  addBtn.disabled = locked;
  removeBtn.disabled = locked;

  fields.forEach((field) => {
    if (field.closest('.secure-actions')) return;
    if (field.tagName === 'TEXTAREA' || field.tagName === 'INPUT') {
      field.readOnly = locked;
    }
    field.disabled = locked && field.tagName === 'SELECT';
  });

  const copy = DICTIONARY[lang] || DICTIONARY.en;
  lockBtn.textContent = locked ? '🔒' : '🔓';
  lockBtn.setAttribute('aria-pressed', String(locked));
  lockBtn.setAttribute('aria-label', locked ? (copy.unlockSection || 'Unlock section') : (copy.lockSection || 'Lock section'));
}

function setupJoinForm() {
  const joinForm = document.getElementById('joinForm');
  if (!joinForm) return;

  joinForm.querySelectorAll('.secure-repeatable').forEach((block) => {
    const type = block.dataset.repeatable;
    const list = block.querySelector('.repeatable-list');
    const addBtn = block.querySelector('.repeat-add');
    const removeBtn = block.querySelector('.repeat-remove');
    const lockBtn = block.querySelector('.repeat-lock');

    addBtn.addEventListener('click', () => {
      if (addBtn.disabled) return;
      const wrapper = document.createElement('div');
      wrapper.className = type === 'expertise' ? 'expertise-entry' : 'repeatable-entry';
      wrapper.innerHTML = getRepeatableTemplate(type).trim();
      list.appendChild(wrapper);
    });

    removeBtn.addEventListener('click', () => {
      if (removeBtn.disabled || list.children.length <= 1) return;
      list.removeChild(list.lastElementChild);
    });

    lockBtn.addEventListener('click', () => {
      const currentlyLocked = lockBtn.getAttribute('aria-pressed') === 'true';
      setRepeatableLockState(block, !currentlyLocked);
    });

    const startsLocked = lockBtn.getAttribute('aria-pressed') === 'true';
    setRepeatableLockState(block, startsLocked);
  });

  joinForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const verdict = tinyGuard.validateForm(joinForm);
    const status = document.getElementById('joinFormStatus');
    const copy = DICTIONARY[lang] || DICTIONARY.en;

    tinyGuard.applyFieldFeedback(verdict.flaggedFields);

    if (!verdict.allowed) {
      const statusMessage = tinyGuard.toStatus(copy, verdict);
      status.textContent = statusMessage.text;
      status.dataset.state = statusMessage.state;
      joinForm.querySelectorAll('.hp-field').forEach((node) => {
        node.value = '';
      });
      return;
    }

    joinForm.reset();
    joinForm.querySelectorAll('.repeatable-list').forEach((list) => {
      while (list.children.length > 1) {
        list.removeChild(list.lastElementChild);
      }
    });
    const statusMessage = tinyGuard.toStatus(copy, verdict);
    status.textContent = statusMessage.text;
    status.dataset.state = statusMessage.state;
  });
}


function normalizePagePath(value) {
  if (!value) return '/';
  const stripped = value.replace(/index\.html$/i, '').replace(/\/+$/, '');
  return stripped || '/';
}

function syncNavCurrentDestination() {
  const nav = document.getElementById('primaryNav');
  if (!nav) return;

  const currentPath = normalizePagePath(window.location.pathname);
  const currentHash = window.location.hash || '#home';

  nav.querySelectorAll('a[href]').forEach((link) => {
    const href = link.getAttribute('href') || '';
    const isHashTarget = href.startsWith('#');

    let isActive = false;
    if (isHashTarget) {
      isActive = currentPath === '/' && href === currentHash;
    } else {
      const target = new URL(href, window.location.origin);
      isActive = normalizePagePath(target.pathname) === currentPath;
    }

    if (isActive) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

function bindEvents() {
  const langButtons = [...document.querySelectorAll('[data-lang-option]')];
  if (langButtons.length) {
    langButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const nextLang = button.getAttribute('data-lang-option');
        if (nextLang) setLanguage(nextLang);
      });
    });
  }

  const legacyLangToggleBtn = document.getElementById('langToggleBtn');
  if (legacyLangToggleBtn) {
    legacyLangToggleBtn.addEventListener('click', () => {
      setLanguage(lang === 'en' ? 'es' : 'en');
    });
  }

  syncNavCurrentDestination();
  window.addEventListener('hashchange', syncNavCurrentDestination, { passive: true });

  const navToggle = document.getElementById('navToggle');
  const nav = document.getElementById('primaryNav');
  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      nav.classList.toggle('open');
      syncNavCurrentDestination();
    });
  }

  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const verdict = tinyGuard.validateForm(form);
      const status = document.getElementById('formStatus');
      const copy = DICTIONARY[lang] || DICTIONARY.en;

      if (!status) return;

      tinyGuard.applyFieldFeedback(verdict.flaggedFields);

      if (!verdict.allowed) {
        const statusMessage = tinyGuard.toStatus(copy, verdict);
        status.textContent = statusMessage.text;
        status.dataset.state = statusMessage.state;
        form.querySelectorAll('.hp-field').forEach((node) => {
          node.value = '';
        });
        return;
      }

      form.reset();
      const statusMessage = tinyGuard.toStatus(copy, verdict);
      status.textContent = statusMessage.text;
      status.dataset.state = statusMessage.state;
    });
  }

  const yearNode = document.getElementById('year');
  if (yearNode) yearNode.textContent = String(new Date().getFullYear());

  initChatbotControls();
  setupJoinForm();
}

lang = resolveInitialLanguage();
syncLanguageQueryParam();
initFabControls();
renderCards();
translatePage();
populateCountryCodes();
bindEvents();
initAdaptiveLayout();
tinyGuard.monitorGlobalTampering();
