import { initAdaptiveLayout } from './adaptive-layout.js';
import { initFabControls } from './fab-controls.js';
import { DICTIONARY, LANGUAGE_CODES, PLANS, SERVICES, SUPPORTED_LANGUAGES } from './language-codes.js';

const root = document.documentElement;
const metadata = window.SITE_METADATA || {};
if (metadata.name) document.title = metadata.name;
const metaDescription = document.querySelector('meta[name="description"]');
if (metaDescription && metadata.description) metaDescription.setAttribute('content', metadata.description);
const supportedLanguages = SUPPORTED_LANGUAGES;
let lang = 'en';

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

  const moveTo = (index) => {
    carouselIndex = index;
    const currentCard = cards[carouselIndex];
    if (!currentCard) return;

    setCarouselFocus(carouselIndex);
    track.scrollTo({ left: currentCard.offsetLeft, behavior: 'smooth' });
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

function renderCards() {
  const localizedServices = SERVICES[lang] || SERVICES.en;
  const localizedPlans = PLANS[lang] || PLANS.en;
  const copy = DICTIONARY[lang] || DICTIONARY.en;

  const serviceCards = document.getElementById('serviceCards');
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
  const copy = DICTIONARY[lang] || DICTIONARY.en;
  document.documentElement.lang = lang;
  if (copy.pageTitle) document.title = copy.pageTitle;
  if (metaDescription && copy.pageDescription) {
    metaDescription.setAttribute('content', copy.pageDescription);
  }
  document.querySelectorAll('[data-i18n]').forEach((node) => {
    const key = node.dataset.i18n;
    if (copy[key]) node.textContent = copy[key];
  });
  document.querySelectorAll('[data-i18n-aria-label]').forEach((node) => {
    const key = node.dataset.i18nAriaLabel;
    if (copy[key]) node.setAttribute('aria-label', copy[key]);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((node) => {
    const key = node.dataset.i18nPlaceholder;
    if (copy[key]) node.setAttribute('placeholder', copy[key]);
  });
  document.querySelectorAll('[data-i18n-title]').forEach((node) => {
    const key = node.dataset.i18nTitle;
    if (copy[key]) node.setAttribute('title', copy[key]);
  });
  document.querySelectorAll('[data-i18n-content]').forEach((node) => {
    const key = node.dataset.i18nContent;
    if (copy[key]) node.setAttribute('content', copy[key]);
  });
  const langButtons = [...document.querySelectorAll('[data-lang-option]')];
  if (langButtons.length) {
    langButtons.forEach((button) => {
      const buttonLang = button.getAttribute('data-lang-option');
      const isActive = buttonLang === lang;
      const codeLabel = LANGUAGE_CODES[buttonLang];
      if (codeLabel) button.textContent = codeLabel;
      button.setAttribute('aria-pressed', String(isActive));
      button.classList.toggle('active', isActive);
      if (buttonLang === 'en') {
        button.setAttribute('aria-label', copy.switchToEnglish || 'Switch language to English');
      }
      if (buttonLang === 'es') {
        button.setAttribute('aria-label', copy.switchToSpanish || 'Cambiar idioma a español');
      }
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

    if (!verdict.allowed) {
      const copy = DICTIONARY[lang] || DICTIONARY.en;
      status.textContent = copy.blocked;
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
    const copy = DICTIONARY[lang] || DICTIONARY.en;
    status.textContent = copy.sent;
    status.dataset.state = 'ok';
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

      if (!status) return;

      if (!verdict.allowed) {
        const copy = DICTIONARY[lang] || DICTIONARY.en;
        status.textContent = copy.blocked;
        status.dataset.state = 'blocked';
        form.querySelectorAll('.hp-field').forEach((node) => {
          node.value = '';
        });
        return;
      }

      form.reset();
      const copy = DICTIONARY[lang] || DICTIONARY.en;
      status.textContent = copy.sent;
      status.dataset.state = 'ok';
    });
  }

  const yearNode = document.getElementById('year');
  if (yearNode) yearNode.textContent = String(new Date().getFullYear());

  initFabControls();
  setupJoinForm();
}

renderCards();
translatePage();
populateCountryCodes();
bindEvents();
initAdaptiveLayout();
tinyGuard.monitorGlobalTampering();
