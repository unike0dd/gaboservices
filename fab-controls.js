import { closeMobileMenu } from './assets/mobile-menu-state.js';

const DESKTOP_QUERY = '(min-width: 901px)';

function buildChatbotFabMarkup() {
  return `
    <button class="fab-main-toggle" id="fabChatTrigger" type="button" aria-expanded="false" aria-controls="gaboChatbotPanel" aria-label="Open Chatbot Gabo io">
      💬 Chatbot Gabo io
    </button>
  `;
}

function getFabTrigger() {
  const wrapper = document.getElementById('fabWrapper');
  if (!wrapper) return null;
  return wrapper.querySelector('#fabChatTrigger');
}

export function setDesktopFabOpenState(isOpen) {
  const trigger = getFabTrigger();
  if (!trigger) return;
  trigger.setAttribute('aria-expanded', String(isOpen));
}

export function ensureDesktopFabNav() {
  let wrapper = document.getElementById('fabWrapper');
  if (wrapper) return wrapper;

  wrapper = document.createElement('div');
  wrapper.id = 'fabWrapper';
  wrapper.className = 'fab-wrapper';
  wrapper.innerHTML = buildChatbotFabMarkup();
  document.body.appendChild(wrapper);

  return wrapper;
}

export function initFabControls() {
  const wrapper = ensureDesktopFabNav();
  if (!wrapper || wrapper.dataset.navBound === 'true') return;

  wrapper.dataset.navBound = 'true';
  const desktopQuery = window.matchMedia(DESKTOP_QUERY);
  const trigger = getFabTrigger();

  setDesktopFabOpenState(false);

  trigger?.addEventListener('click', () => {
    closeMobileMenu();
    setDesktopFabOpenState(true);
    window.dispatchEvent(new CustomEvent('gabo:chatbot-open'));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    setDesktopFabOpenState(false);
    window.dispatchEvent(new CustomEvent('gabo:chatbot-close'));
  });

  window.addEventListener('gabo:chatbot-close', () => {
    setDesktopFabOpenState(false);
  });

  const handleBreakpointChange = (event) => {
    if (!event.matches) {
      setDesktopFabOpenState(false);
      window.dispatchEvent(new CustomEvent('gabo:chatbot-close'));
    }
  };

  if (typeof desktopQuery.addEventListener === 'function') {
    desktopQuery.addEventListener('change', handleBreakpointChange);
  } else if (typeof desktopQuery.addListener === 'function') {
    desktopQuery.addListener(handleBreakpointChange);
  }
}
