import { initAdaptiveLayout } from './adaptive-layout.js';

const dictionary = {
  en: {
    home: 'Home', services: 'Services', about: 'About', pricing: 'Pricing', contact: 'Contact',
    heroTitle: 'Professional services for logistics, IT, and customer operations.',
    heroBody: 'Scale support with expert teams, measurable SLAs, and human-centered delivery.',
    startTrial: 'Start Free Trial', schedule: 'Schedule Consultation',
    aboutBody: 'Gabriel Services provides multilingual operational support designed for modern digital businesses.',
    name: 'Name', contactNumber: 'Your Contact Number', countryCode: 'Country code', contactTime: 'Most convenient time to contact you', message: 'Message', send: 'Send',
    sent: 'Message captured. We will contact you shortly.',
    blocked: 'Submission blocked by security checks. Please remove code-like content and retry.',
    serviceLearnMore: 'Learn more',
    serviceLogisticsTitle: 'Logistics Operations',
    serviceLogisticsBody: 'Order workflows, dispatch support, shipment updates, and reporting.',
    serviceItTitle: 'IT Support',
    serviceItBody: 'Tier 1, Tier 2; On - Boarding, Implementation, Troubleshooting, Account Management, Customer Relations and endpoint support.',
    serviceAdminTitle: 'Administrative Backoffice',
    serviceAdminBody: 'Data entry, Documentation, Invoicing billing Support, Accts Payables and Accts Receivable, process, scheduling, Executive assistant services, high level of administrative support.',
    serviceCustomerTitle: 'Customer Relations',
    serviceCustomerBody: 'Omnichannel support, customer retention, and quality monitoring.',
    serviceCardAction: 'View service details'
  },
  es: {
    home: 'Inicio', services: 'Servicios', about: 'Nosotros', pricing: 'Precios', contact: 'Contacto',
    heroTitle: 'Servicios profesionales para logística, TI y operaciones de atención al cliente.',
    heroBody: 'Escale su soporte con equipos expertos, SLA medibles y una entrega centrada en las personas.',
    startTrial: 'Iniciar prueba gratuita', schedule: 'Programar consulta',
    aboutBody: 'Gabriel Services ofrece soporte operativo multilingüe diseñado para negocios digitales modernos.',
    name: 'Nombre', contactNumber: 'Your Contact Number', countryCode: 'Código de país', contactTime: 'Most convenient time to contact you', message: 'Mensaje', send: 'Enviar',
    sent: 'Mensaje recibido. Nos pondremos en contacto pronto.',
    blocked: 'Contenido bloqueado por seguridad. Elimine código malicioso e inténtelo otra vez.',
    serviceLearnMore: 'Más información',
    serviceLogisticsTitle: 'Operaciones Logísticas',
    serviceLogisticsBody: 'Flujos de pedidos, soporte de despacho, actualizaciones de envíos y reportes.',
    serviceItTitle: 'Soporte de TI',
    serviceItBody: 'Resolución de incidencias nivel 1/2, gestión de cuentas y soporte de endpoints.',
    serviceAdminTitle: 'Backoffice Administrativo',
    serviceAdminBody: 'Ingreso de datos, documentación, apoyo de facturación, cuentas por pagar y cobrar, procesos, agenda y asistencia ejecutiva.',
    serviceCustomerTitle: 'Relaciones con Clientes',
    serviceCustomerBody: 'Soporte omnicanal, retención de clientes y monitoreo de calidad.',
    serviceCardAction: 'Ver detalles del servicio'
  }
};

const services = {
  en: [
    { key: 'logistics', title: 'Logistics Operations', body: 'Order workflows, dispatch support, shipment updates, and reporting.', href: '/services/logistics-operations/' },
    { key: 'it', title: 'IT Support', body: 'Tier 1, Tier 2; On - Boarding, Implementation, Troubleshooting, Account Management, Customer Relations and endpoint support.', href: '/services/it-support/' },
    { key: 'admin', title: 'Administrative Backoffice', body: 'Data entry, Documentation, Invoicing billing Support, Accts Payables and Accts Receivable, process, scheduling, Executive assistant services, high level of administrative support.', href: '/services/administrative-backoffice/' },
    { key: 'customer', title: 'Customer Relations', body: 'Omnichannel support, customer retention, and quality monitoring.', href: '/services/customer-relations/' }
  ],
  es: [
    { key: 'logistics', title: 'Operaciones Logísticas', body: 'Flujos de pedidos, soporte de despacho, actualizaciones de envíos y reportes.', href: '/services/logistics-operations/' },
    { key: 'it', title: 'Soporte de TI', body: 'Resolución de incidencias nivel 1/2, gestión de cuentas y soporte de endpoints.', href: '/services/it-support/' },
    { key: 'admin', title: 'Backoffice Administrativo', body: 'Ingreso de datos, documentación, apoyo de facturación y control de procesos.', href: '/services/administrative-backoffice/' },
    { key: 'customer', title: 'Relaciones con Clientes', body: 'Soporte omnicanal, retención de clientes y monitoreo de calidad.', href: '/services/customer-relations/' }
  ]
};

const plans = {
  en: [
    { name: 'Individual', price: '$3,950/mo', points: ['Email support', 'Business hours', 'Monthly report'] },
    { name: 'Small Business', price: '$4,850/mo', points: ['24/7 support', 'Priority SLA', 'Weekly optimization'] },
    { name: 'Medium Business', price: '$5,950/mo', points: ['Dedicated team', 'Custom integrations', 'Compliance alignment'] }
  ],
  es: [
    { name: 'Individual', price: '$3,950 usd/mes', points: ['Soporte por correo', 'Horario laboral', 'Reporte mensual'] },
    { name: 'Small Business', price: '$4,850 usd/mes', points: ['Soporte 24/7', 'SLA prioritario', 'Optimización semanal'] },
    { name: 'Medium Business', price: '$5,950 usd/mes', points: ['Equipo dedicado', 'Integraciones a medida', 'Alineación de cumplimiento'] }
  ]
};

const root = document.documentElement;
const metadata = window.SITE_METADATA || {};
if (metadata.name) document.title = metadata.name;
const metaDescription = document.querySelector('meta[name="description"]');
if (metaDescription && metadata.description) metaDescription.setAttribute('content', metadata.description);
const supportedLanguages = ['en', 'es'];
let lang = supportedLanguages.includes(localStorage.getItem('lang')) ? localStorage.getItem('lang') : 'en';

function setLanguage(nextLang) {
  if (!supportedLanguages.includes(nextLang)) return;
  lang = nextLang;
  localStorage.setItem('lang', lang);
  renderCards();
  translatePage();
  populateCountryCodes();
}

class TinyGuardML {
  constructor() {
    this.signatures = [
      /<script/gi,
      /on\w+\s*=/gi,
      /javascript:/gi,
      /<iframe/gi,
      /\b(select|union|drop|insert|delete|update)\b/gi,
      /\{\{.*\}\}/g,
      /<\/?[a-z][^>]*>/gi
    ];
  }

  sanitize(rawValue) {
    return rawValue.replace(/[<>`]/g, '').replace(/javascript:/gi, '').trim();
  }

  score(value) {
    return this.signatures.reduce((acc, regex) => {
      regex.lastIndex = 0;
      return acc + (regex.test(value) ? 1 : 0);
    }, 0);
  }

  validateForm(form) {
    const honeypots = [...form.querySelectorAll('.hp-field')];
    const honeypotTriggered = honeypots.some((field) => field.value.trim().length > 0);

    const inputs = [...form.querySelectorAll('input:not(.hp-field), textarea')];
    let riskScore = honeypotTriggered ? 10 : 0;

    inputs.forEach((field) => {
      const cleaned = this.sanitize(field.value);
      riskScore += this.score(field.value);
      field.value = cleaned;
    });

    return {
      allowed: riskScore < 2,
      riskScore,
      honeypotTriggered
    };
  }

  monitorGlobalTampering() {
    const observer = new MutationObserver((changes) => {
      const suspicious = changes.some((change) => {
        const node = change.target;
        return node instanceof HTMLElement && /script|iframe/i.test(node.innerHTML || '');
      });
      if (suspicious) {
        console.warn('[TinyGuardML] Potential tampering detected; content inspection recommended.');
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }
}

const tinyGuard = new TinyGuardML();
let activeServiceKey = null;

let serviceCarouselTimer = null;

function setupServiceCarousel() {
  const track = document.getElementById('serviceCards');
  if (!track) return;

  const cards = [...track.querySelectorAll('.service-card')];
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
  };

  const stepToNext = () => {
    carouselIndex = (carouselIndex + 1) % cards.length;
    const currentCard = cards[carouselIndex];
    if (!currentCard) return;

    setCarouselFocus(carouselIndex);
    track.scrollTo({ left: currentCard.offsetLeft, behavior: 'smooth' });
  };

  let isPaused = false;
  const pause = () => { isPaused = true; };
  const resume = () => { isPaused = false; };

  setCarouselFocus(carouselIndex);

  track.addEventListener('mouseenter', pause);
  track.addEventListener('mouseleave', resume);
  track.addEventListener('focusin', pause);
  track.addEventListener('focusout', () => {
    if (!track.contains(document.activeElement)) resume();
  });

  serviceCarouselTimer = window.setInterval(() => {
    if (!isPaused) stepToNext();
  }, 5000);
}

function renderCards() {
  const localizedServices = services[lang] || services.en;
  const localizedPlans = plans[lang] || plans.en;
  const copy = dictionary[lang] || dictionary.en;

  const serviceCards = document.getElementById('serviceCards');
  if (serviceCards) {
    serviceCards.innerHTML = localizedServices.map((service) => `
    <article class="card service-card" data-service-card="${service.key}">
      <button class="service-card-trigger" type="button" data-service-key="${service.key}" aria-expanded="${String(activeServiceKey === service.key)}">
        <span class="service-card-label">Service</span>
        <h3>${service.title}</h3>
        <p>${service.body}</p>
        <span class="service-card-action">${copy.serviceCardAction} →</span>
      </button>
    </article>
  `).join('');
    bindServiceCardActions(localizedServices);
    setupServiceCarousel();
  }

  const pricingCards = document.getElementById('pricingCards');
  if (pricingCards) {
    pricingCards.innerHTML = localizedPlans.map((plan) => `
    <article class="price-card">
      <h3>${plan.name}</h3>
      <p class="price">${plan.price}</p>
      <ul>${plan.points.map((point) => `<li>${point}</li>`).join('')}</ul>
    </article>
  `).join('');
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

async function populateCountryCodes() {

  const selects = [...document.querySelectorAll('select[name="contact_country_code"], select[name="applicant_contact_country_code"]')];
  if (!selects.length) return;

  const fallback = [
    { name: 'United States', code: '+1' },
    { name: 'Mexico', code: '+52' },
    { name: 'Spain', code: '+34' },
    { name: 'United Kingdom', code: '+44' },
    { name: 'Colombia', code: '+57' }
  ];

  const fillSelects = (items) => {
    const copy = dictionary[lang] || dictionary.en;
    const placeholder = copy.countryCodePlaceholder || 'Select country code';
    const options = [`<option value="">${placeholder}</option>`]
      .concat(items.map((item) => `<option value="${item.code}">${item.name} (${item.code})</option>`));

    selects.forEach((select) => {
      const current = select.value;
      select.innerHTML = options.join('');
      if (current) select.value = current;
    });
  };

  try {
    const response = await fetch('https://restcountries.com/v3.1/all?fields=name,idd');
    if (!response.ok) throw new Error('country source unavailable');
    const countries = await response.json();
    const entries = [];

    countries.forEach((country) => {
      const name = country?.name?.common;
      const root = country?.idd?.root;
      const suffixes = country?.idd?.suffixes || [];
      if (!name || !root) return;
      suffixes.forEach((suffix) => {
        const code = `${root}${suffix || ''}`;
        entries.push({ name, code });
      });
    });

    const unique = [];
    const seen = new Set();
    entries
      .sort((a, b) => a.name.localeCompare(b.name) || a.code.localeCompare(b.code))
      .forEach((entry) => {
        const key = `${entry.name}-${entry.code}`;
        if (seen.has(key)) return;
        seen.add(key);
        unique.push(entry);
      });

    fillSelects(unique.length ? unique : fallback);
  } catch (error) {
    fillSelects(fallback);
  }
}

function translatePage() {
  const copy = dictionary[lang] || dictionary.en;
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach((node) => {
    const key = node.dataset.i18n;
    if (copy[key]) node.textContent = copy[key];
  });
  document.querySelectorAll('[data-i18n-aria-label]').forEach((node) => {
    const key = node.dataset.i18nAriaLabel;
    if (copy[key]) node.setAttribute('aria-label', copy[key]);
  });
  const langToggleBtn = document.getElementById('langToggleBtn');
  if (langToggleBtn) {
    const isEnglish = lang === 'en';
    langToggleBtn.textContent = isEnglish ? 'EN' : 'ES';
    langToggleBtn.setAttribute('aria-pressed', String(isEnglish));
    langToggleBtn.setAttribute('aria-label', isEnglish ? 'Switch language to Spanish' : 'Cambiar idioma a inglés');
    langToggleBtn.classList.add('active');
  }
}

function bindFabControls() {
  const fabMain = document.getElementById('fabMain');
  const fabMenu = document.getElementById('fabMenu');
  const fabChat = document.getElementById('fabChat');
  const chatPanel = document.getElementById('chatPanel');
  const chatClose = document.getElementById('chatClose');
  const chatFrame = document.getElementById('chatFrame');

  if (!fabMain || !fabMenu || !fabChat || !chatPanel || !chatClose || !chatFrame) return;

  fabMain.addEventListener('click', () => {
    const expanded = fabMain.getAttribute('aria-expanded') === 'true';
    fabMain.setAttribute('aria-expanded', String(!expanded));
    fabMenu.hidden = expanded;
  });

  fabChat.addEventListener('click', () => {
    const shieldForm = document.createElement('form');
    shieldForm.innerHTML = '<input class="hp-field" value="" /><textarea></textarea>';
    const guard = tinyGuard.validateForm(shieldForm);
    if (!guard.allowed) return;

    if (chatFrame.src === 'about:blank') {
      chatFrame.src = 'https://gabos.io';
    }
    chatPanel.hidden = false;
  });

  chatClose.addEventListener('click', () => {
    chatPanel.hidden = true;
  });
}


function getRepeatableTemplate(type) {
  if (type === 'expertise') {
    return `
      <select required name="expertise_level[]" aria-label="Level of Expertise">
        <option value="">Select level</option>
        <option value="Entry">Entry</option>
        <option value="Junior">Junior</option>
        <option value="Mid">Mid</option>
        <option value="Advance">Advance</option>
        <option value="Expert">Expert</option>
      </select>
      <textarea required name="expertise_notes[]" rows="2" placeholder="Describe your expertise"></textarea>
    `;
  }

  const placeholders = {
    experience: 'Describe your experience',
    education: 'Share your education background',
    certification: 'List your certifications',
    skills: 'Add your skills',
    languages: 'List language(s) and level',
    instruction: 'Add custom instruction'
  };

  return `<textarea required name="${type}[]" rows="2" placeholder="${placeholders[type] || 'Add details'}"></textarea>`;
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

  lockBtn.textContent = locked ? '🔒' : '🔓';
  lockBtn.setAttribute('aria-pressed', String(locked));
  lockBtn.setAttribute('aria-label', locked ? 'Unlock section' : 'Lock section');
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

    if (!verdict.allowed) {
      status.textContent = dictionary[lang].blocked;
      status.dataset.state = 'blocked';
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
    status.textContent = dictionary[lang].sent;
    status.dataset.state = 'ok';
  });
}

function bindEvents() {
  const langToggleBtn = document.getElementById('langToggleBtn');
  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', () => {
      setLanguage(lang === 'en' ? 'es' : 'en');
    });
  }

  const navToggle = document.getElementById('navToggle');
  const nav = document.getElementById('primaryNav');
  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      nav.classList.toggle('open');
    });
  }

  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const verdict = tinyGuard.validateForm(form);
      const status = document.getElementById('formStatus');

      if (!status) return;

      if (!verdict.allowed) {
        status.textContent = dictionary[lang].blocked;
        status.dataset.state = 'blocked';
        form.querySelectorAll('.hp-field').forEach((node) => {
          node.value = '';
        });
        return;
      }

      form.reset();
      status.textContent = dictionary[lang].sent;
      status.dataset.state = 'ok';
    });
  }

  const yearNode = document.getElementById('year');
  if (yearNode) yearNode.textContent = String(new Date().getFullYear());

  bindFabControls();
  setupJoinForm();
}

renderCards();
translatePage();
populateCountryCodes();
bindEvents();
initAdaptiveLayout();
tinyGuard.monitorGlobalTampering();
