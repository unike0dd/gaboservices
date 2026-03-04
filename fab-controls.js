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

function setupFabCarousel(fabMenu, mobileMedia) {
  const items = [...fabMenu.querySelectorAll('.fab-item')];
  const dotsContainer = fabMenu.querySelector('.fab-carousel-dots');
  if (!dotsContainer || items.length < 2) {
    return { start() {}, stop() {}, refresh() {} };
  }

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

  const showAllItems = () => {
    fabMenu.classList.remove('fab-carousel-active');
    dotsContainer.hidden = true;
    items.forEach((item) => {
      item.hidden = false;
      item.removeAttribute('aria-hidden');
      item.classList.remove('is-fab-carousel-current');
    });
    dots.forEach((dot) => {
      dot.classList.remove('is-current');
      dot.setAttribute('aria-selected', 'false');
    });
  };

  const setActiveItem = (index) => {
    activeIndex = index;
    fabMenu.classList.add('fab-carousel-active');
    dotsContainer.hidden = false;

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
    if (!mobileMedia.matches || timer) return;
    timer = window.setInterval(step, 4000);
  };

  const stop = () => {
    if (!timer) return;
    window.clearInterval(timer);
    timer = null;
  };

  const refresh = () => {
    stop();
    if (!mobileMedia.matches) {
      showAllItems();
      return;
    }

    setActiveItem(activeIndex);
    start();
  };

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      if (!mobileMedia.matches) return;
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

  refresh();
  return { start, stop, refresh };
}

export function initFabControls() {
  ensureQuickActionsFab();

  const fabToggle = document.getElementById('fabMainToggle');
  const fabMenu = document.getElementById('fabQuickMenu');
  if (!fabToggle || !fabMenu) return;

  const desktopMedia = window.matchMedia('(min-width: 781px)');
  const mobileMedia = window.matchMedia('(max-width: 780px)');
  const carousel = setupFabCarousel(fabMenu, mobileMedia);

  const setFabOpenState = (isOpen) => {
    fabMenu.hidden = !isOpen;
    fabToggle.setAttribute('aria-expanded', String(isOpen));

    if (!isOpen) {
      carousel.stop();
      return;
    }

    carousel.refresh();
    carousel.start();
  };

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

  mobileMedia.addEventListener('change', () => {
    if (!fabMenu.hidden) {
      carousel.refresh();
    }
  });
}
