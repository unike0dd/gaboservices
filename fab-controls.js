function ensureQuickActionsFab() {
  let wrapper = document.getElementById('quickActionsFab');
  if (wrapper) return wrapper;

  wrapper = document.createElement('div');
  wrapper.id = 'quickActionsFab';
  wrapper.className = 'fab-wrapper';
  wrapper.innerHTML = `
    <div id="fabQuickMenu" class="fab-menu" hidden>
      <a class="fab-item" href="/careers" data-fab-link="careers">
        <span class="fab-item-icon" aria-hidden="true">💼</span>
        <span data-i18n="fabCareer">Careers</span>
      </a>
      <a class="fab-item" href="/contact" data-fab-link="contact">
        <span class="fab-item-icon" aria-hidden="true">☎️</span>
        <span data-i18n="fabContact">Contact</span>
      </a>
      <button class="fab-item" type="button" data-chat-trigger>
        <span class="fab-item-icon" aria-hidden="true">🤖</span>
        <span data-i18n="fabChatbot">Chatbot</span>
      </button>
    </div>
    <button id="fabMainToggle" class="fab-main fab-hamburger" type="button" aria-expanded="false" data-i18n-aria-label="fabOpenQuickActions" aria-label="Open quick actions">☰</button>
  `;

  document.body.appendChild(wrapper);

  const navCareers = document.querySelector('#primaryNav a[href*="careers"]');
  const navContact = document.querySelector('#primaryNav a[href*="contact"]');
  const fabCareers = wrapper.querySelector('[data-fab-link="careers"]');
  const fabContact = wrapper.querySelector('[data-fab-link="contact"]');
  if (navCareers && fabCareers) fabCareers.setAttribute('href', navCareers.getAttribute('href'));
  if (navContact && fabContact) fabContact.setAttribute('href', navContact.getAttribute('href'));

  return wrapper;
}

export function initFabControls() {
  ensureQuickActionsFab();

  const fabToggle = document.getElementById('fabMainToggle');
  const fabMenu = document.getElementById('fabQuickMenu');
  if (!fabToggle || !fabMenu) return;

  const setFabOpenState = (isOpen) => {
    fabMenu.hidden = !isOpen;
    fabToggle.setAttribute('aria-expanded', String(isOpen));
  };

  const desktopMedia = window.matchMedia('(min-width: 781px)');
  setFabOpenState(desktopMedia.matches);

  fabToggle.addEventListener('click', () => {
    const currentlyOpen = fabToggle.getAttribute('aria-expanded') === 'true';
    setFabOpenState(!currentlyOpen);
  });

  document.addEventListener('click', (event) => {
    const fabWrapper = document.getElementById('quickActionsFab');
    if (!fabWrapper || fabMenu.hidden) return;
    if (!fabWrapper.contains(event.target)) setFabOpenState(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setFabOpenState(false);
    }
  });

  desktopMedia.addEventListener('change', (event) => {
    setFabOpenState(event.matches);
  });
}
