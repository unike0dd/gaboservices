import { closeMobileMenu } from './assets/mobile-menu-state.js';
import { getLocaleMessages } from './locales/index.js';
import { BREAKPOINT_QUERIES } from './breakpoints.config.js';

const DESKTOP_QUERY = BREAKPOINT_QUERIES.desktopQuery;

function getCurrentMessages() {
  return getLocaleMessages();
}

function buildChatbotFabMarkup(messages) {
  return `
    <button class="fab-main-toggle" id="fabChatTrigger" type="button" aria-expanded="false" aria-controls="gaboChatbotPanel" aria-label="${messages.fab.chatbot}">
      <span class="fab-main-icon fas fa-message" aria-hidden="true">💬</span>
      <span class="sr-only">${messages.fab.chatbot}</span>
    </button>
  `;
}


function getDesktopFabElements() {
  const wrapper = document.getElementById('fabWrapper');
  if (!(wrapper instanceof HTMLElement)) return null;

  const fabToggle = wrapper.querySelector('#fabChatTrigger');
  if (!(fabToggle instanceof HTMLElement)) {
    return null;
  }

  return { wrapper, fabToggle };
}


export function setDesktopFabOpenState(isOpen) {
  const elements = getDesktopFabElements();
  if (!elements) return;

  const { fabToggle } = elements;
  const messages = getCurrentMessages();
  const isDesktopViewport = window.matchMedia(DESKTOP_QUERY).matches;

  if (isOpen && isDesktopViewport) {
    closeMobileMenu();
  }

  fabToggle.setAttribute('aria-expanded', String(isOpen));
  fabToggle.setAttribute('aria-label', isOpen ? messages.fab.closeQuickActions || 'Close chatbot' : messages.fab.chatbot);
  document.body.classList.toggle('fab-open', isOpen && isDesktopViewport);
  window.dispatchEvent(new CustomEvent(isOpen ? 'gabo:fab-opened' : 'gabo:fab-closed'));
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
  const fabToggle = document.getElementById('fabChatTrigger');
  if (!(fabToggle instanceof HTMLElement)) return;

  const isOpen = fabToggle.getAttribute('aria-expanded') === 'true';
  window.dispatchEvent(new CustomEvent(isOpen ? 'gabo:chatbot-close' : 'gabo:chatbot-open'));
}

export function initFabControls() {
  const wrapper = ensureDesktopFabNav();
  if (!wrapper || wrapper.dataset.navBound === 'true') return;

  wrapper.dataset.navBound = 'true';
  const desktopQuery = window.matchMedia(DESKTOP_QUERY);
  const fabToggle = wrapper.querySelector('#fabChatTrigger');
  if (!(fabToggle instanceof HTMLElement)) return;

  setDesktopFabOpenState(false);

  fabToggle.dataset.chatbotBound = 'true';
  fabToggle.addEventListener('click', toggleFabMenu);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      window.dispatchEvent(new CustomEvent('gabo:chatbot-close'));
    }
  });

  window.addEventListener('gabo:fab-open', () => setDesktopFabOpenState(true));
  window.addEventListener('gabo:fab-close', () => setDesktopFabOpenState(false));

  const handleBreakpointChange = (event) => {
    if (!event.matches) {
      window.dispatchEvent(new CustomEvent('gabo:chatbot-close'));
    }
  };

  if (typeof desktopQuery.addEventListener === 'function') {
    desktopQuery.addEventListener('change', handleBreakpointChange);
  } else if (typeof desktopQuery.addListener === 'function') {
    desktopQuery.addListener(handleBreakpointChange);
  }
}
