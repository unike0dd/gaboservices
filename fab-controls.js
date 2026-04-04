import { EN_MESSAGES } from './locales/en/messages.js';
import { closeMobileMenu } from './assets/mobile-menu-state.js';

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
          <a class="fab-item" data-page="contact" href="/contact/" aria-label="${EN_MESSAGES.fab.contact}">
            <span class="fab-item-icon" aria-hidden="true">✉️</span>
            <span>${EN_MESSAGES.fab.contact}</span>
          </a>
          <a class="fab-item" data-page="careers" href="/careers/" aria-label="${EN_MESSAGES.fab.careers}">
            <span class="fab-item-icon" aria-hidden="true">💼</span>
            <span>${EN_MESSAGES.fab.careers}</span>
          </a>
          <button class="fab-item" id="fabChatTrigger" type="button" aria-label="${EN_MESSAGES.fab.chat}">
            <span class="fab-item-icon" aria-hidden="true">💬</span>
            <span>${EN_MESSAGES.fab.chat}</span>
          </button>
        </div>
        <div id="fabChatMount" class="fab-chat-mount" hidden></div>
      </aside>
    </div>
  `;
}

function getDesktopFabElements() {
  const wrapper = document.getElementById('fabWrapper');
  if (!wrapper) return null;

  const fabToggle = wrapper.querySelector('#fabMainToggle');
  const fabOverlay = wrapper.querySelector('#fabOverlay');
  const fabMenu = wrapper.querySelector('#fabQuickMenu');
  if (!fabToggle || !fabOverlay || !fabMenu) return null;

  return { wrapper, fabToggle, fabOverlay, fabMenu };
}

export function setDesktopFabOpenState(isOpen) {
  const elements = getDesktopFabElements();
  if (!elements) return;

  const { fabToggle, fabOverlay, fabMenu } = elements;

  if (isOpen) {
    closeMobileMenu();
  }

  if (!isOpen) {
    fabMenu.hidden = false;
    const chatMount = elements.wrapper.querySelector('#fabChatMount');
    if (chatMount instanceof HTMLElement) chatMount.hidden = true;
  }
  fabToggle.setAttribute('aria-expanded', String(isOpen));
  fabToggle.textContent = isOpen ? '✕ Close actions' : '☰';
  fabOverlay.hidden = !isOpen;
  document.body.classList.toggle('fab-open', isOpen);
  fabOverlay.style.opacity = isOpen ? '1' : '0';
  fabOverlay.style.visibility = isOpen ? 'visible' : 'hidden';
  fabOverlay.style.pointerEvents = isOpen ? 'auto' : 'none';
}

function setFabChatMode(isChatOpen) {
  const elements = getDesktopFabElements();
  if (!elements) return;
  const chatMount = elements.wrapper.querySelector('#fabChatMount');
  if (!(chatMount instanceof HTMLElement)) return;
  elements.fabMenu.hidden = isChatOpen;
  chatMount.hidden = !isChatOpen;
}

export function ensureDesktopFabNav() {
  let wrapper = document.getElementById('fabWrapper');
  if (wrapper) return wrapper;

  wrapper = document.createElement('div');
  wrapper.id = 'fabWrapper';
  wrapper.className = 'fab-wrapper';
  wrapper.innerHTML = buildDesktopFabMarkup();
  document.body.appendChild(wrapper);

  return wrapper;
}

function toggleFabMenu() {
  const fabToggle = document.getElementById('fabMainToggle');
  if (!(fabToggle instanceof HTMLElement)) return;

  const isOpen = fabToggle.getAttribute('aria-expanded') === 'true';
  setDesktopFabOpenState(!isOpen);
}

export function initFabControls() {
  const desktopWrapper = ensureDesktopFabNav();
  if (!desktopWrapper || desktopWrapper.dataset.navBound === 'true') return;

  desktopWrapper.dataset.navBound = 'true';
  const fabToggle = desktopWrapper.querySelector('#fabMainToggle');
  const desktopQuery = window.matchMedia(DESKTOP_QUERY);

  setDesktopFabOpenState(false);

  fabToggle?.addEventListener('click', toggleFabMenu);

  desktopWrapper.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    if (target.closest('#fabChatTrigger')) {
      setDesktopFabOpenState(true);
      setFabChatMode(true);
      window.dispatchEvent(new CustomEvent('gabo:chatbot-open'));
      return;
    }

    if (target.closest('[data-fab-dismiss]')) {
      setFabChatMode(false);
      setDesktopFabOpenState(false);
      return;
    }

    if (target.closest('.fab-item')) {
      setFabChatMode(false);
      setDesktopFabOpenState(false);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setFabChatMode(false);
      setDesktopFabOpenState(false);
    }
  });

  window.addEventListener('gabo:chatbot-close', () => {
    setFabChatMode(false);
    setDesktopFabOpenState(false);
  });

  const handleBreakpointChange = (event) => {
    if (!event.matches) setDesktopFabOpenState(false);
  };

  if (typeof desktopQuery.addEventListener === 'function') {
    desktopQuery.addEventListener('change', handleBreakpointChange);
  } else if (typeof desktopQuery.addListener === 'function') {
    desktopQuery.addListener(handleBreakpointChange);
  }
}
