import { EN_MESSAGES } from './locales/en/messages.js';
import { closeMobileMenu } from './assets/mobile-menu-state.js';

const DESKTOP_QUERY = '(min-width: 901px)';
const CHATBOT_WIDGET_SCRIPT_URL = 'https://gabo.io/widget.js'; // replace with your actual widget script URL
let chatWidgetInitialized = false;

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
          <button class="fab-item fab-chatbot-trigger" type="button" aria-label="${EN_MESSAGES.fab.chatbot}">
            <span class="fab-item-icon" aria-hidden="true">🤖</span>
            <span>${EN_MESSAGES.fab.chatbot}</span>
          </button>
        </div>
      </aside>
      <div class="chat-overlay" id="fabChatOverlay" hidden>
        <div class="chat-backdrop" data-chat-dismiss></div>
        <div class="chat-panel" role="dialog" aria-modal="true" aria-label="${EN_MESSAGES.fab.chatbot}">
          <div class="chat-panel-head">
            <strong>${EN_MESSAGES.fab.chatbot}</strong>
            <div class="chat-panel-actions">
              <button class="chat-panel-close" type="button" data-chat-dismiss aria-label="Close chatbot">✕</button>
            </div>
          </div>
          <div id="fabChatWidget" class="chat-widget" aria-label="${EN_MESSAGES.fab.chatbot}">
            <p>Loading chatbot…</p>
          </div>
        </div>
      </div>
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

  fabMenu.hidden = false;
  fabToggle.setAttribute('aria-expanded', String(isOpen));
  fabToggle.textContent = isOpen ? '✕ Close actions' : '☰';
  fabOverlay.hidden = !isOpen;
  document.body.classList.toggle('fab-open', isOpen);
  fabOverlay.style.opacity = isOpen ? '1' : '0';
  fabOverlay.style.visibility = isOpen ? 'visible' : 'hidden';
  fabOverlay.style.pointerEvents = isOpen ? 'auto' : 'none';
}

export function setChatOverlayOpenState(isOpen) {
  const chatOverlay = document.getElementById('fabChatOverlay');
  if (!chatOverlay) return;
  if (isOpen) {
    ensureChatWidgetInit();
  }
  chatOverlay.hidden = !isOpen;
  document.body.classList.toggle('chat-open', isOpen);
}

function ensureChatWidgetInit() {
  if (chatWidgetInitialized) return;
  const widgetContainer = document.getElementById('fabChatWidget');
  if (!widgetContainer) return;

  const script = document.createElement('script');
  script.src = CHATBOT_WIDGET_SCRIPT_URL;
  script.async = true;
  script.onload = () => {
    chatWidgetInitialized = true;
    // If the widget exposes an initialization function, call it here
    if (typeof window.fromGabo === 'function') {
      window.fromGabo({ target: '#fabChatWidget' });
    } else if (typeof window.initGaboChatbot === 'function') {
      window.initGaboChatbot({ containerId: 'fabChatWidget' });
    } else {
      widgetContainer.innerHTML = '<p>Chatbot loaded, but no init API was found.</p>';
    }
  };
  script.onerror = () => {
    if (widgetContainer) widgetContainer.innerHTML = '<p>Failed to load chatbot. Please try again later.</p>';
  };
  document.body.appendChild(script);
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
  setChatOverlayOpenState(false);
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

    if (target.closest('.fab-chatbot-trigger')) {
      setDesktopFabOpenState(false);
      setChatOverlayOpenState(true);
      return;
    }

    if (target.closest('[data-chat-dismiss]')) {
      setChatOverlayOpenState(false);
      return;
    }

    if (target.closest('[data-fab-dismiss]')) {
      setDesktopFabOpenState(false);
      return;
    }

    if (target.closest('.fab-item')) setDesktopFabOpenState(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setDesktopFabOpenState(false);
      setChatOverlayOpenState(false);
    }
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
