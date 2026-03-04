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
      <div class="fab-carousel-dots" role="tablist" aria-label="Quick actions carousel"></div>
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

function setupFabCarousel(fabMenu) {
  const items = [...fabMenu.querySelectorAll('.fab-item')];
  const dotsContainer = fabMenu.querySelector('.fab-carousel-dots');
  if (!dotsContainer || items.length < 2) return { start() {}, stop() {} };

  let activeIndex = 0;
  let timer = null;

  dotsContainer.innerHTML = items.map((_, index) => `
    <button
      class="fab-carousel-dot"
      type="button"
      role="tab"
      aria-selected="${String(index === 0)}"
      aria-label="Show quick action ${index + 1}"
      data-fab-dot-index="${index}">
    </button>
  `).join('');

  const dots = [...dotsContainer.querySelectorAll('.fab-carousel-dot')];

  const setActiveItem = (index) => {
    activeIndex = index;
    items.forEach((item, itemIndex) => {
      const isCurrent = itemIndex === activeIndex;
      item.classList.toggle('is-fab-carousel-current', isCurrent);
      item.hidden = !isCurrent;
      item.setAttribute('aria-hidden', String(!isCurrent));
    });

    dots.forEach((dot, dotIndex) => {
      const isCurrent = dotIndex === activeIndex;
      dot.classList.toggle('is-current', isCurrent);
      dot.setAttribute('aria-selected', String(isCurrent));
    });
  };

  const step = () => {
    const nextIndex = (activeIndex + 1) % items.length;
    setActiveItem(nextIndex);
  };

  const start = () => {
    if (timer) return;
    timer = window.setInterval(step, 4000);
  };

  const stop = () => {
    if (!timer) return;
    window.clearInterval(timer);
    timer = null;
  };

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const requestedIndex = Number(dot.dataset.fabDotIndex);
      if (Number.isNaN(requestedIndex)) return;
      setActiveItem(requestedIndex);
    });
  });

  fabMenu.addEventListener('mouseenter', stop);
  fabMenu.addEventListener('mouseleave', start);
  fabMenu.addEventListener('focusin', stop);
  fabMenu.addEventListener('focusout', () => {
    if (!fabMenu.contains(document.activeElement)) start();
  });

  setActiveItem(0);
  return { start, stop };
}

export function initFabControls() {
  ensureQuickActionsFab();

  const fabToggle = document.getElementById('fabMainToggle');
  const fabMenu = document.getElementById('fabQuickMenu');
  if (!fabToggle || !fabMenu) return;

  const carousel = setupFabCarousel(fabMenu);

  const setFabOpenState = (isOpen) => {
    fabMenu.hidden = !isOpen;
    fabToggle.setAttribute('aria-expanded', String(isOpen));
    if (isOpen) {
      carousel.start();
    } else {
      carousel.stop();
    }
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
