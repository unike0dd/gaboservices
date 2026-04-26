import { initSharedVisualBoot } from './boot/shared-visual-boot.js';
import { initHomePageBehavior } from './boot/page-home.js';
import { initServicesPageBehavior } from './boot/page-services.js';
import { initContactPageBehavior } from './boot/page-contact.js';
import { initCareersPageBehavior } from './boot/page-careers.js';
import { initChatbotPageBehavior } from './boot/page-chatbot.js';

function initPageBehavior() {
  const pageKey = document.body?.dataset?.pageKey || '';
  initChatbotPageBehavior();

  if (pageKey === 'home') initHomePageBehavior();
  if (pageKey === 'services') initServicesPageBehavior();
  if (pageKey === 'contact') initContactPageBehavior();
  if (pageKey === 'careers') initCareersPageBehavior();
}

document.addEventListener('DOMContentLoaded', () => {
  initSharedVisualBoot();
  initPageBehavior();
});
