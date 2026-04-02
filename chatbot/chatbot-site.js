import { initChatbotControls } from './chatbot-controls.js';

function ensureSharedChatbotRoot() {
  let root = document.getElementById('chatbot-root');
  if (root) {
    if (root.parentElement !== document.body) {
      document.body.appendChild(root);
    }
    return root;
  }

  root = document.createElement('div');
  root.id = 'chatbot-root';
  document.body.appendChild(root);
  return root;
}

function mountSitewideChatbot() {
  if (document.body?.dataset.chatbotMounted === 'true') return;
  ensureSharedChatbotRoot();
  initChatbotControls();
  document.body.dataset.chatbotMounted = 'true';
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountSitewideChatbot, { once: true });
} else {
  mountSitewideChatbot();
}

export { mountSitewideChatbot };
