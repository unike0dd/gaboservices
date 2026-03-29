import { resolveWorkerTargets, CHATBOT_STREAM_BRIDGE_NAME } from './chatbot-worker-stream.js';
import { EN_MESSAGES } from '../locales/en/messages.js';

const DESKTOP_QUERY = '(min-width: 901px)';

function getChatbotMountRoot() {
  return document.getElementById('chatbot-root') || document.body;
}

function buildChatPanelMarkup() {
  return `
    <div id="chatOverlay" class="chat-overlay" hidden>
      <aside id="chatPanel" class="chat-panel" aria-label="${EN_MESSAGES.chatbot.panelAriaLabel}" role="dialog" aria-modal="true">
        <div class="chat-panel-head">
          <strong>Gabo io</strong>
          <div class="chat-panel-actions">
            <button class="ghost" type="button" data-chat-dismiss>${EN_MESSAGES.chatbot.close}</button>
            <button id="chatClose" class="ghost" type="button" data-chat-dismiss aria-label="${EN_MESSAGES.chatbot.closeChatbot}">✕</button>
          </div>
        </div>
        <iframe id="chatFrame" title="${EN_MESSAGES.chatbot.iframeTitle}" src="about:blank"></iframe>
      </aside>
    </div>
  `;
}

function ensureFabChatTrigger() {
  const fabMenu = document.getElementById('fabQuickMenu');
  if (!fabMenu) return null;

  let action = fabMenu.querySelector('[data-chat-trigger][data-chat-trigger-context="desktop-fab"]');
  if (action) return action;

  action = document.createElement('button');
  action.className = 'fab-item';
  action.type = 'button';
  action.setAttribute('data-chat-trigger', '');
  action.setAttribute('data-chat-trigger-context', 'desktop-fab');
  action.innerHTML = `
    <span class="fab-item-icon" aria-hidden="true">🤖</span>
    <span>${EN_MESSAGES.fab.chatbot}</span>
  `;

  fabMenu.appendChild(action);
  return action;
}

function syncChatbotLaunchersForViewport(desktopQuery) {
  const isDesktop = desktopQuery.matches;
  const fabChatTrigger = document.querySelector('[data-chat-trigger][data-chat-trigger-context="desktop-fab"]');

  if (isDesktop) {
    ensureFabChatTrigger();
  } else if (fabChatTrigger) {
    fabChatTrigger.remove();
  }

  ensureMobileChatLauncher();
}

function ensureMobileChatLauncher() {
  let trigger = document.getElementById('mobileChatLauncher');
  if (trigger) return trigger;

  trigger = document.createElement('button');
  trigger.id = 'mobileChatLauncher';
  trigger.className = 'mobile-chat-launcher';
  trigger.type = 'button';
  trigger.setAttribute('data-chat-trigger', '');
  trigger.setAttribute('aria-label', 'Open Gabo io chat');
  trigger.innerHTML = `
    <span class="mobile-chat-launcher__icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" focusable="false">
        <path d="M12 3v2" />
        <path d="M8 4.5 6.5 3" />
        <path d="M16 4.5 17.5 3" />
        <path d="M7 9.5A3.5 3.5 0 0 1 10.5 6h3A3.5 3.5 0 0 1 17 9.5v4A3.5 3.5 0 0 1 13.5 17h-3A3.5 3.5 0 0 1 7 13.5z" />
        <path d="M9.25 10.5h.01" />
        <path d="M14.75 10.5h.01" />
        <path d="M9.5 13.5c.7.67 1.5 1 2.5 1s1.8-.33 2.5-1" />
        <path d="M9 17v1.25A1.75 1.75 0 0 0 10.75 20H11" />
        <path d="M15 17v1.25A1.75 1.75 0 0 1 13.25 20H13" />
      </svg>
    </span>
    <span class="mobile-chat-launcher__label">Chat</span>
  `;

  getChatbotMountRoot().appendChild(trigger);
  return trigger;
}

async function probeGatewayAvailability(gatewayUrl) {
  if (!gatewayUrl) return { healthy: false, checked: false };

  let gatewayOrigin;
  try {
    gatewayOrigin = new URL(gatewayUrl, window.location.href).origin;
  } catch {
    return { healthy: false, checked: false };
  }

  if (gatewayOrigin !== window.location.origin) {
    return { healthy: true, checked: false };
  }

  const candidates = ['/api/health', '/health'];
  for (const route of candidates) {
    try {
      const url = new URL(route, gatewayUrl).toString();
      const response = await fetch(url, { method: 'GET', credentials: 'omit', cache: 'no-store' });
      if (response.ok) return { healthy: true, checked: true };
    } catch {
      // noop: try the next health endpoint candidate.
    }
  }

  return { healthy: false, checked: true };
}

function ensureChatPanelMarkup() {
  let chatOverlay = document.getElementById('chatOverlay');
  let chatPanel = document.getElementById('chatPanel');
  let chatFrame = document.getElementById('chatFrame');

  if (!chatOverlay || !chatPanel || !chatFrame) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = buildChatPanelMarkup();
    getChatbotMountRoot().append(...wrapper.children);

    chatOverlay = document.getElementById('chatOverlay');
    chatPanel = document.getElementById('chatPanel');
    chatFrame = document.getElementById('chatFrame');
  }

  return { chatOverlay, chatPanel, chatFrame };
}

export function initChatbotControls() {
  const desktopQuery = window.matchMedia(DESKTOP_QUERY);
  syncChatbotLaunchersForViewport(desktopQuery);

  if (!document.querySelector('[data-chat-trigger]')) return;

  const { chatOverlay, chatPanel, chatFrame } = ensureChatPanelMarkup();
  if (!chatOverlay || !chatPanel || !chatFrame) return;

  const workerTargets = resolveWorkerTargets(window.SITE_METADATA || {}, window.location.origin);
  const configuredGatewayUrl = workerTargets.gatewayUrl;
  const configuredChatbotEmbedUrl = workerTargets.embedUrl;

  chatFrame.dataset.gatewayUrl = configuredGatewayUrl;
  chatFrame.dataset.streamBridge = CHATBOT_STREAM_BRIDGE_NAME;

  let gatewayHealthy = true;
  let chatStatus = chatPanel.querySelector('#chatStatus');
  if (!(chatStatus instanceof HTMLElement)) {
    chatStatus = document.createElement('p');
    chatStatus.className = 'chat-status';
    chatStatus.id = 'chatStatus';
    chatStatus.hidden = true;
    chatStatus.setAttribute('role', 'status');
    chatStatus.setAttribute('aria-live', 'polite');
    chatPanel.querySelector('.chat-panel-head')?.insertAdjacentElement('afterend', chatStatus);
  }

  probeGatewayAvailability(configuredGatewayUrl).then(({ healthy, checked }) => {
    gatewayHealthy = healthy;
    if (healthy || !checked) return;

    chatStatus.hidden = false;
    chatStatus.textContent = EN_MESSAGES.chatbot.unavailable;
  });

  const fabToggle = document.getElementById('fabMainToggle');
  const fabMenu = document.getElementById('fabQuickMenu');
  let lastTrigger = null;

  const setFabOpenState = (isOpen) => {
    if (!fabMenu || !fabToggle) return;
    fabMenu.hidden = !isOpen;
    fabToggle.setAttribute('aria-expanded', String(isOpen));
  };

  const setOpenState = (isOpen) => {
    chatOverlay.hidden = !isOpen;
    if (isOpen) {
      document.body.classList.add('chat-open');
      return;
    }

    document.body.classList.remove('chat-open');
    if (lastTrigger instanceof HTMLElement) {
      lastTrigger.focus();
    }
  };

  const closeChat = () => {
    if (chatOverlay.hidden) return;
    setOpenState(false);
  };

  const openChatFromTrigger = (trigger) => {
    if (!gatewayHealthy) {
      chatStatus.hidden = false;
      chatStatus.textContent = EN_MESSAGES.chatbot.unavailable;
      return;
    }

    if (chatFrame.src === 'about:blank') {
      chatFrame.src = configuredChatbotEmbedUrl;
    }
    lastTrigger = trigger;
    setFabOpenState(false);
    setOpenState(true);
  };

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const trigger = target.closest('[data-chat-trigger]');
    if (!(trigger instanceof HTMLElement)) return;

    openChatFromTrigger(trigger);
  });

  chatPanel.querySelectorAll('[data-chat-dismiss]').forEach((button) => {
    const dismissHandler = (event) => {
      event.preventDefault();
      closeChat();
    };

    button.addEventListener('click', dismissHandler);
    button.addEventListener('touchend', dismissHandler, { passive: false });
  });

  const closeFromOverlay = (event) => {
    const target = event.target;
    if (!(target instanceof Node)) return;
    if (!chatPanel.contains(target)) {
      closeChat();
    }
  };

  chatOverlay.addEventListener('click', closeFromOverlay);
  chatOverlay.addEventListener('touchstart', closeFromOverlay, { passive: true });
  chatOverlay.addEventListener('pointerdown', closeFromOverlay);

  desktopQuery.addEventListener('change', () => {
    syncChatbotLaunchersForViewport(desktopQuery);
  });

  document.addEventListener('keydown', (event) => {
    if ((event.key === 'Escape' || event.key === 'Esc') && !chatOverlay.hidden) {
      event.preventDefault();
      closeChat();
    }
    if (event.key === 'Escape' || event.key === 'Esc') {
      setFabOpenState(false);
    }
  });
}
