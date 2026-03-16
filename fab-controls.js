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
    <button id="fabMainToggle" class="fab-main fab-hamburger" type="button" aria-expanded="false" aria-haspopup="menu" aria-controls="fabQuickMenu" data-i18n-aria-label="fabOpenQuickActions" aria-label="Open quick actions">☰</button>
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
  const wrapper = ensureQuickActionsFab();
  if (!wrapper || wrapper.dataset.fabBound === 'true') return;
  wrapper.dataset.fabBound = 'true';

  const fabToggle = document.getElementById('fabMainToggle');
  const fabMenu = document.getElementById('fabQuickMenu');
  if (!fabToggle || !fabMenu) return;

  const getMenuActions = () => [...fabMenu.querySelectorAll('.fab-item')];

  const focusMenuAction = (targetIndex = 0) => {
    const actions = getMenuActions();
    if (!actions.length) return;
    const index = Math.min(Math.max(targetIndex, 0), actions.length - 1);
    actions[index].focus();
  };

  const setFabOpenState = (isOpen) => {
    fabMenu.hidden = !isOpen;
    fabToggle.setAttribute('aria-expanded', String(isOpen));
    if (isOpen) {
      requestAnimationFrame(() => focusMenuAction(0));
      return;
    }
    fabToggle.focus();
  };

  setFabOpenState(false);

  fabToggle.addEventListener('click', () => {
    const currentlyOpen = fabToggle.getAttribute('aria-expanded') === 'true';
    setFabOpenState(!currentlyOpen);
  });

  fabMenu.addEventListener('click', (event) => {
    const action = event.target.closest('.fab-item');
    if (!action) return;
    setFabOpenState(false);
  });

  fabMenu.addEventListener('keydown', (event) => {
    const actions = getMenuActions();
    if (!actions.length) return;

    const currentIndex = actions.indexOf(document.activeElement);
    if (event.key === 'Escape') {
      event.preventDefault();
      setFabOpenState(false);
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (currentIndex === -1) {
        focusMenuAction(0);
        return;
      }
      const delta = event.key === 'ArrowDown' ? 1 : -1;
      const nextIndex = (currentIndex + delta + actions.length) % actions.length;
      focusMenuAction(nextIndex);
      return;
    }

    if (event.key === 'Home') {
      event.preventDefault();
      focusMenuAction(0);
      return;
    }

    if (event.key === 'End') {
      event.preventDefault();
      focusMenuAction(actions.length - 1);
    }
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

}
