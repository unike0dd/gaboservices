import { EN_MESSAGES } from './locales/en/messages.js';

const MOBILE_QUERY = '(max-width: 900px)';
const DESKTOP_QUERY = '(min-width: 901px)';

const SERVICE_LINKS = [
  { key: 'logistics', href: '/services/logistics-operations/', label: EN_MESSAGES.mobileBottomNav.logistics },
  { key: 'admin', href: '/services/administrative-backoffice/', label: EN_MESSAGES.mobileBottomNav.admin },
  { key: 'it', href: '/services/it-support/', label: EN_MESSAGES.mobileBottomNav.it },
  { key: 'customer', href: '/services/customer-relations/', label: EN_MESSAGES.mobileBottomNav.customerRelations }
];

function buildDesktopFabMarkup() {
  return `
    <button class="fab-main-toggle" id="fabMainToggle" type="button" aria-expanded="false" aria-controls="fabOverlay">Quick actions</button>
    <div class="fab-overlay" id="fabOverlay" hidden>
      <div class="fab-backdrop" data-fab-dismiss></div>
      <aside class="fab-sheet" role="dialog" aria-modal="true" aria-label="Quick actions menu">
        <div class="fab-sheet-head">
          <strong>Quick actions</strong>
          <div class="fab-sheet-actions">
            <button class="fab-dismiss" type="button" data-fab-dismiss>Close</button>
            <button class="fab-dismiss fab-dismiss--icon" type="button" data-fab-dismiss aria-label="Close quick actions menu">✕</button>
          </div>
        </div>
        <div class="fab-menu" id="fabQuickMenu">
          <a class="fab-item" data-page="contact" href="/contact" aria-label="${EN_MESSAGES.mobileBottomNav.contact}">
            <span class="fab-item-icon" aria-hidden="true">✉️</span>
            <span>${EN_MESSAGES.mobileBottomNav.contact}</span>
          </a>
          <a class="fab-item" data-page="services" href="/services" aria-label="${EN_MESSAGES.mobileBottomNav.services}">
            <span class="fab-item-icon" aria-hidden="true">🧭</span>
            <span>${EN_MESSAGES.mobileBottomNav.services}</span>
          </a>
        </div>
      </aside>
    </div>
  `;
}

function ensureDesktopFabNav() {
  let wrapper = document.getElementById('fabWrapper');
  if (wrapper) return wrapper;

  wrapper = document.createElement('div');
  wrapper.id = 'fabWrapper';
  wrapper.className = 'fab-wrapper';
  wrapper.innerHTML = buildDesktopFabMarkup();
  document.body.appendChild(wrapper);

  return wrapper;
}

function ensureMobileBottomNav() {
  let wrapper = document.getElementById('mobileBottomNav');
  if (wrapper) return wrapper;

  wrapper = document.createElement('nav');
  wrapper.id = 'mobileBottomNav';
  wrapper.className = 'mobile-bottom-nav';
  wrapper.setAttribute('aria-label', EN_MESSAGES.mobileBottomNav.ariaLabel);
  wrapper.innerHTML = `
    <a class="mobile-bottom-nav__item" data-page="home" href="/" aria-label="${EN_MESSAGES.mobileBottomNav.home}">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
      <span>${EN_MESSAGES.mobileBottomNav.home}</span>
    </a>
    <a class="mobile-bottom-nav__item" data-page="about" href="/about" aria-label="${EN_MESSAGES.mobileBottomNav.about}">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8h.01M11 12h1v4h1M4 12a8 8 0 1 0 16 0 8 8 0 0 0-16 0z"></path></svg>
      <span>${EN_MESSAGES.mobileBottomNav.about}</span>
    </a>
    <div class="mobile-bottom-nav__services">
      <button class="mobile-bottom-nav__item mobile-bottom-nav__trigger" data-page="services" id="servicesTrigger" type="button" aria-expanded="false" aria-controls="servicesMenu" aria-label="${EN_MESSAGES.mobileBottomNav.services}">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h7"></path></svg>
        <span>${EN_MESSAGES.mobileBottomNav.services}</span>
      </button>
      <div class="mobile-bottom-nav__services-menu" id="servicesMenu" hidden>
        <p class="mobile-bottom-nav__menu-heading">${EN_MESSAGES.mobileBottomNav.services}</p>
        ${SERVICE_LINKS.map((item) => `<a class="mobile-bottom-nav__service-item" data-service-link="${item.key}" href="${item.href}">${item.label}</a>`).join('')}
      </div>
    </div>
    <a class="mobile-bottom-nav__item" data-page="learning" href="/learning" aria-label="Learning">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15.5a2.5 2.5 0 0 0-2.5-2.5H4z"></path><path d="M4 5.5V19a2 2 0 0 0 2 2h11.5"></path><path d="M8 7h8"></path><path d="M8 11h8"></path></svg>
      <span>Learning</span>
    </a>
    <a class="mobile-bottom-nav__item" data-page="contact" href="/contact" aria-label="${EN_MESSAGES.mobileBottomNav.contact}">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2h-2.828a2 2 0 0 1-1.414-.586l-4.414-4.414a2 2 0 0 0-2.828 0L2.828 18.414A2 2 0 0 1 1.414 19H0v-4a2 2 0 0 1 2-2h.172a2 2 0 0 0 1.414-.586l4.414-4.414a2 2 0 0 1 2.828 0l4.414 4.414a2 2 0 0 0 1.414.586H19a2 2 0 0 1 2 2z"></path></svg>
      <span>${EN_MESSAGES.mobileBottomNav.contact}</span>
    </a>
  `;

  document.body.appendChild(wrapper);
  return wrapper;
}

function syncActiveState(wrapper) {
  const pageKey = document.body.dataset.pageKey || 'home';
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
  wrapper.querySelectorAll('.mobile-bottom-nav__item[data-page]').forEach((item) => {
    const isServicesRoute = item.dataset.page === 'services' && pathname.startsWith('/services');
    item.classList.toggle('active', item.dataset.page === pageKey || isServicesRoute);
  });
}

function syncServiceLinks(wrapper) {
  const linkMap = new Map(
    [...document.querySelectorAll('[data-service-link]')]
      .filter((link) => link instanceof HTMLAnchorElement)
      .map((link) => [link.dataset.serviceLink, link.getAttribute('href')])
  );

  wrapper.querySelectorAll('.mobile-bottom-nav__service-item').forEach((link) => {
    const href = linkMap.get(link.dataset.serviceLink);
    if (href) link.setAttribute('href', href);
  });
}

export function initFabControls() {
  const desktopWrapper = ensureDesktopFabNav();
  const wrapper = ensureMobileBottomNav();
  if (!wrapper || wrapper.dataset.navBound === 'true') {
    if (wrapper) {
      syncActiveState(wrapper);
      syncServiceLinks(wrapper);
    }
    return;
  }

  wrapper.dataset.navBound = 'true';
  if (desktopWrapper && desktopWrapper.dataset.navBound !== 'true') {
    desktopWrapper.dataset.navBound = 'true';
    const fabToggle = desktopWrapper.querySelector('#fabMainToggle');
    const fabOverlay = desktopWrapper.querySelector('#fabOverlay');
    const desktopQuery = window.matchMedia(DESKTOP_QUERY);

    const setDesktopFabOpen = (isOpen) => {
      if (!fabToggle || !fabOverlay) return;
      fabToggle.setAttribute('aria-expanded', String(isOpen));
      fabToggle.textContent = isOpen ? '✕ Close actions' : 'Quick actions';
      fabOverlay.hidden = !isOpen;
      document.body.classList.toggle('fab-open', isOpen);
    };

    setDesktopFabOpen(false);

    fabToggle?.addEventListener('click', () => {
      const isOpen = fabToggle.getAttribute('aria-expanded') === 'true';
      setDesktopFabOpen(!isOpen);
    });

    desktopWrapper.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      if (target.closest('[data-fab-dismiss]')) {
        setDesktopFabOpen(false);
        return;
      }

      if (target.closest('.fab-item')) setDesktopFabOpen(false);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') setDesktopFabOpen(false);
    });

    desktopQuery.addEventListener('change', (event) => {
      if (!event.matches) setDesktopFabOpen(false);
    });
  }
  syncActiveState(wrapper);
  syncServiceLinks(wrapper);

  const servicesTrigger = wrapper.querySelector('#servicesTrigger');
  const servicesMenu = wrapper.querySelector('#servicesMenu');
  const mobileQuery = window.matchMedia(MOBILE_QUERY);

  if (!servicesTrigger || !servicesMenu) return;

  const setMenuOpen = (isOpen) => {
    servicesTrigger.setAttribute('aria-expanded', String(isOpen));
    servicesMenu.hidden = !isOpen;
    servicesMenu.classList.toggle('open', isOpen);
  };

  setMenuOpen(false);

  servicesTrigger.addEventListener('click', (event) => {
    event.stopPropagation();
    const isOpen = servicesTrigger.getAttribute('aria-expanded') === 'true';
    setMenuOpen(!isOpen);
  });

  servicesMenu.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    if (event.target.closest('.mobile-bottom-nav__service-item')) setMenuOpen(false);
  });

  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    if (!wrapper.contains(event.target)) setMenuOpen(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMenuOpen(false);
  });

  mobileQuery.addEventListener('change', (event) => {
    if (!event.matches) setMenuOpen(false);
  });
}
