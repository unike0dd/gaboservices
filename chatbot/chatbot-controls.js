import { initFabControls } from '../fab-controls.js';
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
      <aside id="chatPanel" class="chat-panel" data-i18n-aria-label="chatPanelLabel" aria-label="Chatbot panel" role="dialog" aria-modal="true">
        <div class="chat-panel-head">
          <strong data-i18n="chatbot">Chatbot</strong>
          <button id="chatClose" class="ghost" type="button" data-chat-dismiss data-i18n-aria-label="chatClose" aria-label="Close chatbot">✕</button>
        </div>
        <iframe id="chatFrame" data-i18n-title="chatFrameTitle" title="Gabriel chatbot" src="about:blank"></iframe>
        <div class="chat-panel-actions">
          <button id="chatCloseAction" class="ghost" type="button" data-chat-dismiss>Close</button>
        </div>
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
    <span data-i18n="fabChatbot">Chatbot</span>
  `;

  fabMenu.appendChild(action);
}


function withGatewayParam(embedUrl, gatewayUrl) {
  const safeEmbedUrl = typeof embedUrl === 'string' ? embedUrl.trim() : '';
  const safeGatewayUrl = typeof gatewayUrl === 'string' ? gatewayUrl.trim() : '';
  if (!safeEmbedUrl || !safeGatewayUrl) return safeEmbedUrl;

  try {
    const url = new URL(safeEmbedUrl);
    if (!url.searchParams.get('gateway')) {
      url.searchParams.set('gateway', safeGatewayUrl);
    }
    return url.toString();
  } catch {
    return safeEmbedUrl;
  }
}

function ensureChatPanelMarkup() {
  let chatOverlay = document.getElementById('chatOverlay');
  let chatPanel = document.getElementById('chatPanel');
  let chatClose = document.getElementById('chatClose');
  let chatFrame = document.getElementById('chatFrame');

  if (!chatOverlay || !chatPanel || !chatClose || !chatFrame) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = buildChatPanelMarkup();
    document.body.append(...wrapper.children);

    chatOverlay = document.getElementById('chatOverlay');
    chatPanel = document.getElementById('chatPanel');
    chatClose = document.getElementById('chatClose');
    chatFrame = document.getElementById('chatFrame');
  }

  return { chatOverlay, chatPanel, chatClose, chatFrame };
}

export function initChatbotControls() {
  initFabControls();
  ensureFabChatTrigger();

  const guard = new ChatbotTinyGuard();
  const chatTriggers = [...document.querySelectorAll('[data-chat-trigger]')];
  if (!chatTriggers.length) return;

  const { chatOverlay, chatPanel, chatClose, chatFrame } = ensureChatPanelMarkup();
  if (!chatOverlay || !chatPanel || !chatClose || !chatFrame) return;

  const defaultChatbotEmbedUrl =
    window.SITE_METADATA?.chatbotEmbedUrl ||
    'https://con-artist.rulathemtodos.workers.dev/embed?parent=https%3A%2F%2Fwww.gabos.io';

  const configuredGatewayUrl =
    window.SITE_METADATA?.chatbotGatewayUrl ||
    'https://con-artist.rulathemtodos.workers.dev/';

  const configuredChatbotEmbedUrl = withGatewayParam(
    chatFrame.dataset.chatSrc ||
      (chatFrame.getAttribute('src') && chatFrame.getAttribute('src') !== 'about:blank'
        ? chatFrame.getAttribute('src')
        : defaultChatbotEmbedUrl),
    configuredGatewayUrl
  );

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

  chatTriggers.forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      const signal = `${trigger.getAttribute('aria-label') || ''} ${trigger.textContent || ''} ${trigger.className || ''}`;
      if (!guard.validateSignal(signal) || chatbotHoneypot.value.trim().length > 0 || event.isTrusted === false) return;

      if (chatFrame.src === 'about:blank') {
        chatFrame.src = configuredChatbotEmbedUrl;
      }
      setFabOpenState(false);
      setOpenState(true);
    });
  });

  chatPanel.querySelectorAll('[data-chat-dismiss]').forEach((button) => {
    button.addEventListener('click', () => {
      setOpenState(false);
    });
  });

  chatOverlay.addEventListener('click', (event) => {
    if (event.target === chatOverlay) {
      setOpenState(false);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !chatOverlay.hidden) {
      setOpenState(false);
    }
    if (event.key === 'Escape') {
      setFabOpenState(false);
    }
  });
}
