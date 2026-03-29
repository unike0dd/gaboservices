import { EN_MESSAGES } from './locales/en/messages.js';

const DESKTOP_QUERY = '(min-width: 901px)';

function buildDesktopFabMarkup() {
  return `
    <button class="fab-main-toggle" id="fabMainToggle" type="button" aria-expanded="false" aria-controls="fabOverlay">☰</button>
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
          <a class="fab-item" data-page="contact" href="/contact" aria-label="${EN_MESSAGES.fab.contact}">
            <span class="fab-item-icon" aria-hidden="true">✉️</span>
            <span>${EN_MESSAGES.fab.contact}</span>
          </a>
          <a class="fab-item" data-page="careers" href="/careers" aria-label="${EN_MESSAGES.fab.careers}">
            <span class="fab-item-icon" aria-hidden="true">💼</span>
            <span>${EN_MESSAGES.fab.careers}</span>
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

export function initFabControls() {
  const desktopWrapper = ensureDesktopFabNav();
  if (!desktopWrapper || desktopWrapper.dataset.navBound === 'true') return;

  desktopWrapper.dataset.navBound = 'true';
  const fabToggle = desktopWrapper.querySelector('#fabMainToggle');
  const fabOverlay = desktopWrapper.querySelector('#fabOverlay');
  const desktopQuery = window.matchMedia(DESKTOP_QUERY);

  const setDesktopFabOpen = (isOpen) => {
    if (!fabToggle || !fabOverlay) return;
    fabToggle.setAttribute('aria-expanded', String(isOpen));
    fabToggle.textContent = isOpen ? '✕ Close actions' : '☰';
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
