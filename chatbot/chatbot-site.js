import { getSiteMetadata } from '../site-metadata.js';
import { initChatbotControls } from './chatbot-controls.js';

function ensureChatbotStylesheet() {
  if (document.querySelector('link[data-chatbot-style="true"]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '/chatbot/chatbot-site.css';
  link.dataset.chatbotStyle = 'true';
  document.head.appendChild(link);
}

function ensureSharedChatbotRoot() {
  let root = document.getElementById('chatbot-root');
  if (root) {
    if (root.parentElement !== document.body) document.body.appendChild(root);
    return root;
  }

  root = document.createElement('div');
  root.id = 'chatbot-root';
  document.body.appendChild(root);
  return root;
}

function isChatbotEnabled(metadata = getSiteMetadata()) {
  return Boolean(metadata?.chatbot?.enabled);
}

export function mountSitewideChatbot() {
  if (!isChatbotEnabled()) return;
  if (document.body?.dataset.chatbotMounted === 'true') return;

  ensureChatbotStylesheet();
  ensureSharedChatbotRoot();
  initChatbotControls(getSiteMetadata());
  document.body.dataset.chatbotMounted = 'true';
}
