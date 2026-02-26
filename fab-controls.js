class FabTinyGuard {
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

function getRoutePrefix() {
  const segments = window.location.pathname.split('/').filter(Boolean);
  if (segments.length === 0) return './';
  return `${'../'.repeat(segments.length)}`;
}

function buildFabMarkup(routePrefix) {
  return `
    <div class="fab-wrapper" data-fab-root>
      <button id="fabMain" class="fab-main fab-hamburger" type="button" data-i18n-aria-label="fabOpenQuickActions" aria-label="Open quick actions" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
      <div id="fabMenu" class="fab-menu" hidden>
        <a class="fab-item" href="${routePrefix}contact" data-i18n-aria-label="fabContact" aria-label="Contact"><span class="fab-item-icon" aria-hidden="true">☎</span><span data-i18n="fabContact">Contact</span></a>
        <a class="fab-item" href="${routePrefix}careers" data-i18n-aria-label="careers" aria-label="Careers"><span class="fab-item-icon" aria-hidden="true">💼</span><span data-i18n="fabCareer">Career</span></a>
        <button id="fabChat" class="fab-item" type="button" data-i18n-aria-label="fabChatbot" aria-label="Chatbot"><span class="fab-item-icon" aria-hidden="true">🤖</span><span data-i18n="chatbot">Chatbot</span></button>
      </div>
    </div>

    <aside id="chatPanel" class="chat-panel" hidden data-i18n-aria-label="chatPanelLabel" aria-label="Chatbot panel">
      <div class="chat-panel-head">
        <strong data-i18n="chatbot">Chatbot</strong>
        <button id="chatClose" class="ghost" type="button" data-i18n-aria-label="chatClose" aria-label="Close chatbot">✕</button>
      </div>
      <iframe id="chatFrame" data-i18n-title="chatFrameTitle" title="Gabriel chatbot" src="about:blank"></iframe>
    </aside>
  `;
}

function ensureFabMarkup() {
  let fabMain = document.getElementById('fabMain');
  let fabMenu = document.getElementById('fabMenu');
  let fabChat = document.getElementById('fabChat');
  let chatPanel = document.getElementById('chatPanel');
  let chatClose = document.getElementById('chatClose');
  let chatFrame = document.getElementById('chatFrame');

  if (!fabMain || !fabMenu || !fabChat || !chatPanel || !chatClose || !chatFrame) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = buildFabMarkup(getRoutePrefix());
    document.body.append(...wrapper.children);

    fabMain = document.getElementById('fabMain');
    fabMenu = document.getElementById('fabMenu');
    fabChat = document.getElementById('fabChat');
    chatPanel = document.getElementById('chatPanel');
    chatClose = document.getElementById('chatClose');
    chatFrame = document.getElementById('chatFrame');
  }

  return { fabMain, fabMenu, fabChat, chatPanel, chatClose, chatFrame };
}

export function initFabControls() {
  const guard = new FabTinyGuard();
  const { fabMain, fabMenu, fabChat, chatPanel, chatClose, chatFrame } = ensureFabMarkup();
  if (!fabMain || !fabMenu || !fabChat || !chatPanel || !chatClose || !chatFrame) return;

  const defaultChatbotEmbedUrl =
    window.SITE_METADATA?.chatbotEmbedUrl ||
    'https://con-artist.rulathemtodos.workers.dev/embed?parent=https%3A%2F%2Fwww.gabos.io';

  const configuredChatbotEmbedUrl =
    chatFrame.dataset.chatSrc ||
    (chatFrame.getAttribute('src') && chatFrame.getAttribute('src') !== 'about:blank'
      ? chatFrame.getAttribute('src')
      : defaultChatbotEmbedUrl);

  const chatbotHoneypot = document.createElement('input');
  chatbotHoneypot.type = 'text';
  chatbotHoneypot.className = 'hp-field';
  chatbotHoneypot.name = 'chatbot_company_website';
  chatbotHoneypot.tabIndex = -1;
  chatbotHoneypot.autocomplete = 'off';
  chatbotHoneypot.setAttribute('aria-hidden', 'true');
  chatbotHoneypot.style.cssText = 'position:absolute;left:-10000px;opacity:0;pointer-events:none;';
  fabMenu.appendChild(chatbotHoneypot);

  fabMain.addEventListener('click', () => {
    const expanded = fabMain.getAttribute('aria-expanded') === 'true';
    fabMain.setAttribute('aria-expanded', String(!expanded));
    fabMenu.hidden = expanded;
  });

  fabChat.addEventListener('click', (event) => {
    const signal = `${fabChat.getAttribute('aria-label') || ''} ${fabChat.id || ''} ${fabChat.className || ''}`;
    if (!guard.validateSignal(signal) || chatbotHoneypot.value.trim().length > 0 || event.isTrusted === false) return;

    if (chatFrame.src === 'about:blank') {
      chatFrame.src = configuredChatbotEmbedUrl;
    }
    chatPanel.hidden = false;
  });

  chatClose.addEventListener('click', () => {
    chatPanel.hidden = true;
  });
}
