import { closeMobileMenu } from './assets/mobile-menu-state.js';
import { EN_MESSAGES } from './locales/en/messages.js';
import { ES_MESSAGES } from './locales/es/messages.js';

const DESKTOP_QUERY = '(min-width: 901px)';

const LOCALE_MESSAGES = {
  en: EN_MESSAGES,
  es: ES_MESSAGES
};

function getCurrentMessages() {
  const lang = String(document.documentElement.lang || 'en').toLowerCase();
  const locale = lang.split('-')[0];
  return LOCALE_MESSAGES[locale] || EN_MESSAGES;
}

function buildChatbotFabMarkup(messages) {
  return `
    <button class="fab-main-toggle" id="fabMainToggle" type="button" aria-expanded="false" aria-controls="fabOverlay" aria-label="${messages.fab.openQuickActions}">☰</button>
    <div class="fab-overlay" id="fabOverlay" hidden>
      <div class="fab-backdrop" data-fab-dismiss></div>
      <aside class="fab-sheet" role="dialog" aria-modal="true" aria-label="Options menu">
        <div class="fab-sheet-head">
          <strong>OPTIONS</strong>
        </div>
        <div class="fab-menu" id="fabQuickMenu">
          <button class="fab-item" id="fabChatTrigger" type="button" aria-label="${messages.fab.chatbot}">
            <span class="fab-item-icon" aria-hidden="true">💬</span>
            <span>${messages.fab.chatbot}</span>
          </button>
        </div>
        <div id="fabChatMount" class="fab-chat-mount" hidden></div>
      </aside>
    </div>
  `;
}

function getDesktopFabElements() {
  const wrapper = document.getElementById('fabWrapper');
  if (!(wrapper instanceof HTMLElement)) return null;

  const fabToggle = wrapper.querySelector('#fabMainToggle');
  const fabOverlay = wrapper.querySelector('#fabOverlay');
  const fabMenu = wrapper.querySelector('#fabQuickMenu');

  if (!(fabToggle instanceof HTMLElement) || !(fabOverlay instanceof HTMLElement) || !(fabMenu instanceof HTMLElement)) {
    return null;
  }

  return { wrapper, fabToggle, fabOverlay, fabMenu };
}

export function setDesktopFabOpenState(isOpen) {
  const elements = getDesktopFabElements();
  if (!elements) return;

  const { fabToggle, fabOverlay } = elements;

  if (isOpen) {
    closeMobileMenu();
  }

  fabToggle.setAttribute('aria-expanded', String(isOpen));
  fabToggle.textContent = isOpen ? '✕' : '☰';
  fabOverlay.hidden = !isOpen;
  document.body.classList.toggle('fab-open', isOpen);
  fabOverlay.style.opacity = isOpen ? '1' : '0';
  fabOverlay.style.visibility = isOpen ? 'visible' : 'hidden';
  fabOverlay.style.pointerEvents = isOpen ? 'auto' : 'none';
}

export function ensureDesktopFabNav() {
  let wrapper = document.getElementById('fabWrapper');
  if (wrapper) return wrapper;

  wrapper = document.createElement('div');
  wrapper.id = 'fabWrapper';
  wrapper.className = 'fab-wrapper';
  wrapper.innerHTML = buildChatbotFabMarkup(getCurrentMessages());
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
  const wrapper = ensureDesktopFabNav();
  if (!wrapper || wrapper.dataset.navBound === 'true') return;

  wrapper.dataset.navBound = 'true';
  const desktopQuery = window.matchMedia(DESKTOP_QUERY);
  const fabToggle = wrapper.querySelector('#fabMainToggle');
  if (!(fabToggle instanceof HTMLElement)) return;

  setDesktopFabOpenState(false);

  fabToggle.addEventListener('click', toggleFabMenu);

  wrapper.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    if (target.closest('[data-fab-dismiss]')) {
      setDesktopFabOpenState(false);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setDesktopFabOpenState(false);
    }
  });

  const handleBreakpointChange = (event) => {
    if (!event.matches) {
      setDesktopFabOpenState(false);
    }
  };

  if (typeof desktopQuery.addEventListener === 'function') {
    desktopQuery.addEventListener('change', handleBreakpointChange);
  } else if (typeof desktopQuery.addListener === 'function') {
    desktopQuery.addListener(handleBreakpointChange);
  }
}
