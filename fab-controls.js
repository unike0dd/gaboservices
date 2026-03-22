import { EN_MESSAGES } from './locales/en/messages.js';

const MOBILE_QUERY = '(max-width: 900px)';
const DESKTOP_QUERY = '(min-width: 901px)';

const SERVICE_LINKS = [
  { key: 'logistics', href: '/services/logistics-operations/', label: EN_MESSAGES.mobileBottomNav.logistics },
  { key: 'admin', href: '/services/administrative-backoffice/', label: EN_MESSAGES.mobileBottomNav.admin },
  { key: 'it', href: '/services/it-support/', label: EN_MESSAGES.mobileBottomNav.it },
  { key: 'customer', href: '/services/customer-relations/', label: EN_MESSAGES.mobileBottomNav.customerRelations }
];

function ensureDesktopFabNav() {
  let wrapper = document.getElementById('fabWrapper');
  if (wrapper) return wrapper;

  wrapper = document.createElement('div');
  wrapper.id = 'fabWrapper';
  wrapper.className = 'fab-wrapper';
  wrapper.innerHTML = `
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
    <button class="fab-main-toggle" id="fabMainToggle" type="button" aria-expanded="true" aria-controls="fabQuickMenu">Quick actions</button>
  `;

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
    <button class="mobile-bottom-nav__item mobile-bottom-nav__trigger" data-page="services" id="servicesTrigger" type="button" aria-expanded="false" aria-controls="servicesMenu" aria-label="${EN_MESSAGES.mobileBottomNav.services}">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h7"></path></svg>
      <span>${EN_MESSAGES.mobileBottomNav.services}</span>
      <div class="mobile-bottom-nav__services-menu" id="servicesMenu" hidden>
        ${SERVICE_LINKS.map((item) => `<a class="mobile-bottom-nav__service-item" data-service-link="${item.key}" href="${item.href}">${item.label}</a>`).join('')}
      </div>
    </button>
    <a class="mobile-bottom-nav__item" data-page="contact" href="/contact" aria-label="${EN_MESSAGES.mobileBottomNav.contact}">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2h-2.828a2 2 0 0 1-1.414-.586l-4.414-4.414a2 2 0 0 0-2.828 0L2.828 18.414A2 2 0 0 1 1.414 19H0v-4a2 2 0 0 1 2-2h.172a2 2 0 0 0 1.414-.586l4.414-4.414a2 2 0 0 1 2.828 0l4.414 4.414a2 2 0 0 0 1.414.586H19a2 2 0 0 1 2 2z"></path></svg>
      <span>${EN_MESSAGES.mobileBottomNav.contact}</span>
    </a>
    <a class="mobile-bottom-nav__item" data-page="careers" href="/careers" aria-label="${EN_MESSAGES.mobileBottomNav.careers}">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 13.255A23.931 23.931 0 0 1 12 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2m4 6h.01M5 20h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z"></path></svg>
      <span>${EN_MESSAGES.mobileBottomNav.careers}</span>
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
    if (wrapper) syncActiveState(wrapper);
    return;
  }

  wrapper.dataset.navBound = 'true';
  if (desktopWrapper && desktopWrapper.dataset.navBound !== 'true') {
    desktopWrapper.dataset.navBound = 'true';
    const fabToggle = desktopWrapper.querySelector('#fabMainToggle');
    const fabMenu = desktopWrapper.querySelector('#fabQuickMenu');
    const desktopQuery = window.matchMedia(DESKTOP_QUERY);

    const setDesktopFabOpen = (isOpen) => {
      if (!fabToggle || !fabMenu) return;
      fabToggle.setAttribute('aria-expanded', String(isOpen));
      fabMenu.hidden = !isOpen;
    };

    setDesktopFabOpen(desktopQuery.matches);

    fabToggle?.addEventListener('click', () => {
      const isOpen = fabToggle.getAttribute('aria-expanded') === 'true';
      setDesktopFabOpen(!isOpen);
    });

    desktopQuery.addEventListener('change', (event) => {
      setDesktopFabOpen(event.matches);
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
    const clickedServiceLink = event.target instanceof Element ? event.target.closest('.mobile-bottom-nav__service-item') : null;
    if (clickedServiceLink) {
      setMenuOpen(false);
      return;
    }

    event.stopPropagation();
    const isOpen = servicesTrigger.getAttribute('aria-expanded') === 'true';
    setMenuOpen(!isOpen);
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
