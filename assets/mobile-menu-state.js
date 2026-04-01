const MENU_OPEN_CLASSES = [
  'menu-open',
  'nav-open',
  'drawer-open',
  'offcanvas-open',
  'is-menu-open',
  'fab-open'
];

const WRAPPER_SELECTORS = [
  '.site',
  '.app',
  '.page-shell',
  '.main-wrapper',
  '.layout',
  '.header-container',
  '.nav-wrap',
  '#app',
  '#site'
].join(', ');

const MENU_PANEL_SELECTORS = [
  '[data-mobile-menu]',
  '[data-mobile-nav]',
  '[data-mobile-services-menu]',
  '#fabOverlay .fab-sheet',
  '.drawer',
  '.offcanvas',
  '.mobile-menu',
  '.menu-panel'
].join(', ');

const BACKDROP_SELECTORS = [
  '[data-mobile-backdrop]',
  '#fabOverlay',
  '#fabOverlay .fab-backdrop',
  '.menu-overlay',
  '.drawer-backdrop',
  '.offcanvas-backdrop',
  '.backdrop',
  '.overlay'
].join(', ');

function resetElementEffects(element) {
  if (!(element instanceof HTMLElement)) return;
  element.classList.remove('is-blurred', 'is-dimmed', 'is-shifted', 'is-overlayed', 'is-frozen');
  element.style.transform = '';
  element.style.filter = '';
  element.style.opacity = '';
  element.style.pointerEvents = '';
}

export function closeMobileMenu() {
  const docEl = document.documentElement;
  const body = document.body;

  docEl.classList.remove(...MENU_OPEN_CLASSES);
  body?.classList.remove(...MENU_OPEN_CLASSES);

  document.querySelectorAll(WRAPPER_SELECTORS).forEach((wrapper) => {
    if (!(wrapper instanceof HTMLElement)) return;
    wrapper.classList.remove(...MENU_OPEN_CLASSES);
    resetElementEffects(wrapper);
    wrapper.removeAttribute('inert');
    wrapper.setAttribute('aria-hidden', 'false');
  });

  document.querySelectorAll(MENU_PANEL_SELECTORS).forEach((panel) => {
    if (!(panel instanceof HTMLElement)) return;
    panel.classList.remove('is-open', 'open', 'active', 'is-active', 'is-visible');
    panel.setAttribute('aria-hidden', 'true');
    panel.removeAttribute('inert');
    panel.style.transform = '';
    panel.style.filter = '';
    panel.style.opacity = '';
    panel.style.pointerEvents = '';
  });

  document.querySelectorAll(BACKDROP_SELECTORS).forEach((backdrop) => {
    if (!(backdrop instanceof HTMLElement)) return;
    backdrop.classList.remove('is-open', 'open', 'active', 'is-active', 'is-visible');
    if (backdrop.id === 'chatOverlay') return;
    backdrop.setAttribute('aria-hidden', 'true');
    backdrop.style.opacity = '0';
    backdrop.style.visibility = 'hidden';
    backdrop.style.pointerEvents = 'none';
    if (backdrop.id === 'fabOverlay') {
      backdrop.hidden = true;
    }
  });

  const servicesToggle = document.querySelector('[data-mobile-services-toggle]');
  if (servicesToggle instanceof HTMLElement) {
    servicesToggle.setAttribute('aria-expanded', 'false');
  }

  const menuToggle = document.querySelector('[data-menu-toggle], .hamburger, .menu-toggle, #fabMainToggle');
  if (menuToggle instanceof HTMLElement) {
    menuToggle.setAttribute('aria-expanded', 'false');
    if (menuToggle.id === 'fabMainToggle') {
      menuToggle.textContent = '☰';
    }
  }

  const fabOverlay = document.getElementById('fabOverlay');
  if (fabOverlay instanceof HTMLElement) {
    fabOverlay.hidden = true;
    fabOverlay.style.opacity = '0';
    fabOverlay.style.visibility = 'hidden';
    fabOverlay.style.pointerEvents = 'none';
  }

  if (body instanceof HTMLElement) {
    body.style.overflow = '';
    body.style.position = '';
    body.style.width = '';
    body.style.pointerEvents = '';
  }
}
