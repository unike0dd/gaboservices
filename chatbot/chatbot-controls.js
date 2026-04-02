import { ensureDesktopFabNav, setDesktopFabOpenState } from '../fab-controls.js';
import { closeMobileMenu } from '../assets/mobile-menu-state.js';
import { resolveWorkerTargets } from './chatbot-worker-stream.js';

const DESKTOP_QUERY = '(min-width: 901px)';

function getChatbotMountRoot() {
  return document.getElementById('chatbot-root') || document.body;
}

function buildChatPanelMarkup() {
  return `
    <div id="chatOverlay" class="chat-overlay" hidden>
      <aside id="chatPanel" class="chat-panel" aria-label="Gabo io chatbot" role="dialog" aria-modal="true">
        <div class="chat-panel-head">
          <h3 class="chat-title">Gabo io</h3>
          <button id="chatClose" class="chat-close" type="button" data-chat-dismiss aria-label="Close chatbot">Close</button>
        </div>
        <iframe
          id="chatFrame"
          class="chat-frame"
          title="Gabo io assistant"
          loading="lazy"
          referrerpolicy="strict-origin"
          allow="clipboard-read; clipboard-write"
          sandbox="allow-scripts allow-same-origin allow-forms"
        ></iframe>
      </aside>
    </div>
  `;
}

function ensureFabChatTrigger() {
  ensureDesktopFabNav();
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
    <span class="fab-item-icon" aria-hidden="true">✨</span>
    <span>Chat</span>
  `;

  fabMenu.appendChild(action);
  return action;
}

function syncChatbotLaunchersForViewport(desktopQuery) {
  const isDesktop = desktopQuery.matches;
  ensureFabChatTrigger();

  const mobileLauncher = ensureMobileChatLauncher();
  if (mobileLauncher) {
    mobileLauncher.hidden = isDesktop;
  }
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
  trigger.innerHTML = '<span class="mobile-chat-launcher__icon" aria-hidden="true">✨</span>';

  getChatbotMountRoot().appendChild(trigger);
  return trigger;
}

function ensureChatPanelMarkup() {
  let chatOverlay = document.getElementById('chatOverlay');
  let chatPanel = document.getElementById('chatPanel');

  if (!chatOverlay || !chatPanel) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = buildChatPanelMarkup();
    getChatbotMountRoot().append(...wrapper.children);

    chatOverlay = document.getElementById('chatOverlay');
    chatPanel = document.getElementById('chatPanel');
  }

  return {
    chatOverlay,
    chatPanel,
    chatFrame: document.getElementById('chatFrame')
  };
}

function safeFrameOrigin(url) {
  try {
    return new URL(url).origin;
  } catch {
    return '';
  }
}

export function initChatbotControls() {
  const desktopQuery = window.matchMedia(DESKTOP_QUERY);
  syncChatbotLaunchersForViewport(desktopQuery);

  if (!document.querySelector('[data-chat-trigger]')) return;

  const { chatOverlay, chatPanel, chatFrame } = ensureChatPanelMarkup();
  if (!chatOverlay || !chatPanel || !chatFrame) return;

  const workerTargets = resolveWorkerTargets(window.SITE_METADATA || {}, window.location.origin);
  if (!chatFrame.src) {
    chatFrame.src = workerTargets.embedUrl;
  }

  const chatFrameOrigin = safeFrameOrigin(workerTargets.embedUrl);

  const fabToggle = document.getElementById('fabMainToggle');
  const fabMenu = document.getElementById('fabQuickMenu');
  let lastTrigger = null;

  const setFabOpenState = (isOpen) => {
    if (!fabMenu || !fabToggle) return;
    setDesktopFabOpenState(isOpen);
  };

  const setOpenState = (isOpen) => {
    chatOverlay.hidden = !isOpen;
    if (isOpen) {
      document.body.classList.add('chat-open');
      requestAnimationFrame(() => {
        if (chatFrame.contentWindow) {
          chatFrame.contentWindow.focus();
        }
      });
      document.dispatchEvent(new CustomEvent('chatbot:open'));
      return;
    }

    document.body.classList.remove('chat-open');
    document.dispatchEvent(new CustomEvent('chatbot:close'));
    if (lastTrigger instanceof HTMLElement) {
      lastTrigger.focus();
    }
  };

  const closeChat = () => {
    if (chatOverlay.hidden) return;
    setOpenState(false);
  };

  const openChatFromTrigger = (trigger) => {
    closeMobileMenu();
    lastTrigger = trigger;
    setFabOpenState(false);
    setOpenState(true);
  };

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const trigger = target.closest('[data-chat-trigger]');
    if (!(trigger instanceof HTMLElement)) return;

    event.preventDefault();
    openChatFromTrigger(trigger);
  });

  chatPanel.querySelectorAll('[data-chat-dismiss]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      closeChat();
    });
  });

  chatOverlay.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Node)) return;
    if (!chatPanel.contains(target)) {
      closeChat();
    }
  });

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

  window.addEventListener('message', (event) => {
    if (!chatFrameOrigin || event.origin !== chatFrameOrigin) return;
    if (event.data === 'gabo-chat-close') {
      closeChat();
    }
  });
}
