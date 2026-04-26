import { initGaboChatbotEmbed } from './chatbot/embed.js';
import { initSharedVisualBoot } from './boot/shared-visual-boot.js';
import { initHomePageBehavior } from './boot/page-home.js';

function initPageBehavior() {
  const pageKey = document.body?.dataset?.pageKey || '';

  initGaboChatbotEmbed();

  if (pageKey === 'home') {
    initHomePageBehavior();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initSharedVisualBoot();
  initPageBehavior();
});
