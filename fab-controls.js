import { closeMobileMenu } from './assets/mobile-menu-state.js';
import { EN_MESSAGES } from './locales/en/messages.js';
import { ES_MESSAGES } from './locales/es/messages.js';
import { BREAKPOINT_QUERIES } from './breakpoints.config.js';

const DESKTOP_QUERY = BREAKPOINT_QUERIES.desktopQuery;

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
    <button class="fab-main-toggle" id="fabMainToggle" type="button" aria-expanded="false" aria-controls="fabOverlay" aria-label="${messages.fab.openQuickActions}">Chatbot Gabo io</button>
    <div class="fab-overlay" id="fabOverlay" hidden>
      <div class="fab-backdrop" data-fab-dismiss></div>
      <aside class="fab-sheet" role="dialog" aria-modal="true" aria-label="Options menu">
        <div class="fab-sheet-head">
          <strong>OPTIONS</strong>
          <div class="fab-sheet-actions">
            <button class="fab-dismiss" type="button" data-fab-dismiss>Close</button>
            <button class="fab-dismiss fab-dismiss--icon" type="button" data-fab-dismiss aria-label="Close options menu">✕</button>
          </div>
        </div>
        <div class="fab-menu" id="fabQuickMenu">
          <button class="fab-item" id="fabChatTrigger" type="button" aria-label="${messages.fab.chatbot}">
            <span class="fab-item-icon" aria-hidden="true">💬</span>
            <span>${messages.fab.chatbot}</span>
          </button>
        </div>
        <div id="fabChatMount" class="fab-chat-mount"></div>
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
  const fabSheet = fabOverlay.querySelector('.fab-sheet');
  const fabBackdrop = fabOverlay.querySelector('.fab-backdrop');
  const messages = getCurrentMessages();

  if (isOpen) {
    closeMobileMenu();
  }

  fabToggle.setAttribute('aria-expanded', String(isOpen));
  fabToggle.textContent = isOpen ? '✕' : 'Chatbot Gabo io';
  fabToggle.setAttribute('aria-label', isOpen ? messages.fab.closeQuickActions || 'Close quick actions' : messages.fab.openQuickActions);
  fabOverlay.hidden = !isOpen;
  fabOverlay.setAttribute('aria-hidden', String(!isOpen));
  if (fabSheet instanceof HTMLElement) {
    fabSheet.setAttribute('aria-hidden', String(!isOpen));
  }
  if (fabBackdrop instanceof HTMLElement) {
    fabBackdrop.setAttribute('aria-hidden', String(!isOpen));
  }
  document.body.classList.toggle('fab-open', isOpen);
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

  window.addEventListener('gabo:fab-open', () => setDesktopFabOpenState(true));
  window.addEventListener('gabo:fab-close', () => setDesktopFabOpenState(false));

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
