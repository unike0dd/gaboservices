import { initFabControls } from '../fab-controls.js';
import { resolveWorkerTargets, CHATBOT_STREAM_BRIDGE_NAME } from './chatbot-worker-stream.js';
class ChatbotTinyGuard {
  constructor() {
    this.signatures = [
      /<script/gi,
      /on\w+\s*=/gi,
      /javascript:/gi,
      /<iframe/gi,
      /\b(select|union|drop|insert|delete|update)\b/gi,
      /\{\{.*\}\}/g,
      /<\/?[a-z][^>]*>/gi
    ];
  }

  sanitize(rawValue) {
    return rawValue.replace(/[<>`]/g, '').replace(/javascript:/gi, '').trim();
  }

  score(value) {
    return this.signatures.reduce((acc, regex) => {
      regex.lastIndex = 0;
      return acc + (regex.test(value) ? 1 : 0);
    }, 0);
  }

  validateSignal(signal) {
    const cleaned = this.sanitize(signal);
    return this.score(cleaned) < 2;
  }
}

function buildChatPanelMarkup() {
  return `
    <div id="chatOverlay" class="chat-overlay" hidden>
      <aside id="chatPanel" class="chat-panel" aria-label="Chatbot panel" role="dialog" aria-modal="true">
        <div class="chat-panel-head">
          <strong>Gabo io</strong>
          <div class="chat-panel-actions">
            <button class="ghost" type="button" data-chat-dismiss>Close</button>
            <button id="chatClose" class="ghost" type="button" data-chat-dismiss aria-label="Close chatbot">✕</button>
          </div>
        </div>
        <iframe id="chatFrame" title="Gabriel chatbot" src="about:blank"></iframe>
      </aside>
    </div>
  `;
}

function ensureFabChatTrigger() {
  const fabMenu = document.getElementById('fabQuickMenu');
  if (!fabMenu) return;
  if (fabMenu.querySelector('[data-chat-trigger]')) return;

  const action = document.createElement('button');
  action.className = 'fab-item';
  action.type = 'button';
  action.setAttribute('data-chat-trigger', '');
  action.innerHTML = `
    <span class="fab-item-icon" aria-hidden="true">🤖</span>
    <span>Chatbot</span>
  `;

  fabMenu.appendChild(action);
}

async function probeGatewayAvailability(gatewayUrl) {
  if (!gatewayUrl) return false;

  try {
    const gatewayOrigin = new URL(gatewayUrl, window.location.href).origin;
    if (gatewayOrigin !== window.location.origin) {
      return true;
    }
  } catch {
    return false;
  }

  const candidates = ['/api/health', '/health'];
  for (const route of candidates) {
    try {
      const url = new URL(route, gatewayUrl).toString();
      const response = await fetch(url, { method: 'GET', credentials: 'omit', cache: 'no-store' });
      if (response.ok) return true;
    } catch {
      // noop: try the next health endpoint candidate.
    }
  }

  return false;
}


function ensureChatPanelMarkup() {
  let chatOverlay = document.getElementById('chatOverlay');
  let chatPanel = document.getElementById('chatPanel');
  let chatFrame = document.getElementById('chatFrame');

  if (!chatOverlay || !chatPanel || !chatFrame) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = buildChatPanelMarkup();
    document.body.append(...wrapper.children);

    chatOverlay = document.getElementById('chatOverlay');
    chatPanel = document.getElementById('chatPanel');
    chatFrame = document.getElementById('chatFrame');
  }

  return { chatOverlay, chatPanel, chatFrame };
}

export function initChatbotControls() {
  initFabControls();
  ensureFabChatTrigger();

  const guard = new ChatbotTinyGuard();
  const chatTriggers = [...document.querySelectorAll('[data-chat-trigger]')];
  if (!chatTriggers.length) return;

  const { chatOverlay, chatPanel, chatFrame } = ensureChatPanelMarkup();
  if (!chatOverlay || !chatPanel || !chatFrame) return;

  const workerTargets = resolveWorkerTargets(window.SITE_METADATA || {}, window.location.origin);
  const configuredGatewayUrl = workerTargets.gatewayUrl;
  const configuredChatbotEmbedUrl = workerTargets.embedUrl;

  chatFrame.dataset.gatewayUrl = configuredGatewayUrl;
  chatFrame.dataset.streamBridge = CHATBOT_STREAM_BRIDGE_NAME;

  let gatewayHealthy = true;
  const chatStatus = document.createElement('p');
  chatStatus.className = 'chat-status';
  chatStatus.id = 'chatStatus';
  chatStatus.hidden = true;
  chatStatus.setAttribute('role', 'status');
  chatStatus.setAttribute('aria-live', 'polite');
  chatPanel.querySelector('.chat-panel-head')?.insertAdjacentElement('afterend', chatStatus);

  probeGatewayAvailability(configuredGatewayUrl).then((healthy) => {
    gatewayHealthy = healthy;
    if (healthy) return;

    chatStatus.hidden = false;
    chatStatus.textContent = 'Chat assistant is temporarily unavailable. Please use contact form instead.';
  });

  const chatbotHoneypot = document.createElement('input');
  chatbotHoneypot.type = 'text';
  chatbotHoneypot.className = 'hp-field';
  chatbotHoneypot.name = 'chatbot_company_website';
  chatbotHoneypot.tabIndex = -1;
  chatbotHoneypot.autocomplete = 'off';
  chatbotHoneypot.setAttribute('aria-hidden', 'true');
  chatbotHoneypot.style.cssText = 'position:absolute;left:-10000px;opacity:0;pointer-events:none;';
  chatPanel.appendChild(chatbotHoneypot);

  const fabToggle = document.getElementById('fabMainToggle');
  const fabMenu = document.getElementById('fabQuickMenu');

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
  };

  const closeChat = () => {
    if (chatOverlay.hidden) return;
    setOpenState(false);
  };

  chatTriggers.forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      const signal = `${trigger.getAttribute('aria-label') || ''} ${trigger.textContent || ''} ${trigger.className || ''}`;
      if (!guard.validateSignal(signal) || chatbotHoneypot.value.trim().length > 0 || event.isTrusted === false) return;
      if (!gatewayHealthy) {
        chatStatus.hidden = false;
        chatStatus.textContent = 'Chat assistant is temporarily unavailable. Please use contact form instead.';
        return;
      }

      if (chatFrame.src === 'about:blank') {
        chatFrame.src = configuredChatbotEmbedUrl;
      }
      setFabOpenState(false);
      setOpenState(true);
    });
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
    if (event.target === chatOverlay) {
      closeChat();
    }
  };

  chatOverlay.addEventListener('click', closeFromOverlay);
  chatOverlay.addEventListener('pointerdown', closeFromOverlay);

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
