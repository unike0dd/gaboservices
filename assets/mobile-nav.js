import { BREAKPOINT_QUERIES } from '../breakpoints.config.js';
import { EN_MESSAGES } from '../locales/en/messages.js';
import { ES_MESSAGES } from '../locales/es/messages.js';

const MOBILE_QUERY = BREAKPOINT_QUERIES.mobileQuery;
const LOCALE_MESSAGES = { en: EN_MESSAGES, es: ES_MESSAGES };

const ROUTES = {
  primary: [
    { key: 'home', href: '/' },
    { key: 'about', href: '/about/' },
    { key: 'services', href: null },
    { key: 'chatbot', href: null },
    { key: 'careers', href: '/careers/' },
    { key: 'contact', href: '/contact/' }
  ],
  services: [
    { key: 'logistics', href: '/services/logistics-operations/' },
    { key: 'admin', href: '/services/administrative-backoffice/' },
    { key: 'it', href: '/services/it-support/' },
    { key: 'customerRelations', href: '/services/customer-relations/' },
    { key: 'learning', href: '/learning/' }
  ]
};

const ICONS = {
  home: '<path d="M3 10.5 12 3l9 7.5V21H3z"></path><path d="M9 21v-6h6v6"></path>',
  about: '<circle cx="12" cy="12" r="9"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path>',
  services: '<rect x="4" y="5" width="16" height="4" rx="1.5"></rect><rect x="4" y="10" width="16" height="4" rx="1.5"></rect><rect x="4" y="15" width="16" height="4" rx="1.5"></rect>',
  chatbot: '<path d="M4 6h16v10H8l-4 4V6z"></path><circle cx="9" cy="11" r="1"></circle><circle cx="12" cy="11" r="1"></circle><circle cx="15" cy="11" r="1"></circle>',
  careers: '<path d="M3 8h18v11H3z"></path><path d="M8 8V6h8v2"></path><path d="M3 13h18"></path>',
  contact: '<path d="M4 7h16v10H4z"></path><path d="m4 8 8 6 8-6"></path>'
};

function iconMarkup(key) {
  return `<svg class="mobile-nav__icon" viewBox="0 0 24 24" aria-hidden="true">${ICONS[key]}</svg>`;
}

function resolveActivePage() {
  if (document.body.dataset.servicePage === 'true') return 'services';
  const dataPage = document.body.dataset.page;
  if (dataPage) return dataPage;
  const pageKey = document.body.dataset.pageKey;
  if (pageKey === 'learning') return 'services';
  return pageKey || 'home';
}

function getMessages() {
  const lang = String(document.documentElement.lang || 'en').toLowerCase().split('-')[0];
  return LOCALE_MESSAGES[lang] || EN_MESSAGES;
}

function buildMarkup(activePage, labels) {
  return `
    <div class="mobile-nav-layer" data-mobile-nav-layer>
      <nav class="mobile-nav" aria-label="${labels.ariaLabel}" data-mobile-nav>
        ${ROUTES.primary
          .map((item) => {
            if (item.key === 'services') {
              return `
                <div class="mobile-nav__services" data-mobile-services>
                  <button
                    class="mobile-nav__trigger${activePage === 'services' ? ' is-active' : ''}"
                    type="button"
                    data-mobile-services-toggle
                    aria-expanded="false"
                    aria-controls="mobile-services-menu"
                  >
                    ${iconMarkup(item.key)}
                    <span class="mobile-nav__label">${labels[item.key]}</span>
                  </button>
                  <div id="mobile-services-menu" class="mobile-nav__submenu" data-mobile-services-menu>
                    ${ROUTES.services
                      .map(
                        (service) =>
                          `<a class="mobile-nav__submenu-link" href="${service.href}" data-service-link="${service.key}">${labels[service.key]}</a>`
                      )
                      .join('')}
                  </div>
                </div>
              `;
            }

            if (item.key === 'chatbot') {
              return `
                <button class="mobile-nav__item" type="button" data-mobile-chatbot-trigger>
                  ${iconMarkup(item.key)}
                  <span class="mobile-nav__label">${labels[item.key]}</span>
                </button>
              `;
            }

            const activeClass = activePage === item.key ? ' is-active' : '';
            return `<a class="mobile-nav__item${activeClass}" href="${item.href}" data-mobile-item="${item.key}">${iconMarkup(item.key)}<span class="mobile-nav__label">${labels[item.key]}</span></a>`;
          })
          .join('')}
      </nav>
    </div>
  `;
}

export function initMobileNav() {
  const mobileQuery = window.matchMedia(MOBILE_QUERY);
  const root = document.getElementById('mobile-nav-root') || document.body.appendChild(document.createElement('div'));
  if (!root.id) root.id = 'mobile-nav-root';

  const activePage = resolveActivePage();
  const labels = getMessages().mobileBottomNav;
  root.innerHTML = buildMarkup(activePage, labels);

  const layer = root.querySelector('[data-mobile-nav-layer]');
  const servicesContainer = root.querySelector('[data-mobile-services]');
  const servicesToggle = root.querySelector('[data-mobile-services-toggle]');
  const servicesMenu = root.querySelector('[data-mobile-services-menu]');
  const chatbotTrigger = root.querySelector('[data-mobile-chatbot-trigger]');

  if (!layer || !servicesContainer || !servicesToggle || !servicesMenu || !chatbotTrigger) return;

  const setOpen = (open) => {
    servicesToggle.setAttribute('aria-expanded', String(open));
    servicesMenu.classList.toggle('is-open', open);
    servicesMenu.setAttribute('aria-hidden', String(!open));
    servicesMenu.toggleAttribute('inert', !open);
  };

  const closeMenu = () => {
    setOpen(false);
  };

  document.body.classList.add('has-mobile-nav');
  setOpen(false);

  servicesToggle.addEventListener('click', (event) => {
    event.stopPropagation();
    const isOpen = servicesToggle.getAttribute('aria-expanded') === 'true';
    setOpen(!isOpen);
  });

  servicesMenu.addEventListener('click', (event) => {
    if (event.target instanceof Element && event.target.closest('.mobile-nav__submenu-link')) {
      closeMenu();
    }
  });

  chatbotTrigger.addEventListener('click', () => {
    closeMenu();
    window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent('gabo:chatbot-open'));
    }, 0);
  });

  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    if (!servicesContainer.contains(event.target)) closeMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMenu();
      servicesToggle.focus();
    }
  });

  window.addEventListener('resize', closeMenu);
  window.addEventListener('orientationchange', closeMenu);
  window.addEventListener('pagehide', closeMenu);

  mobileQuery.addEventListener('change', (event) => {
    if (!event.matches) closeMenu();
  });
}
