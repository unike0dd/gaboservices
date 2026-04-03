const MOBILE_QUERY = '(max-width: 900px)';

const ROUTES = {
  primary: [
    { key: 'home', label: 'Home', href: '/' },
    { key: 'about', label: 'About', href: '/about/' },
    { key: 'services', label: 'Services', href: null },
    { key: 'careers', label: 'Careers', href: '/careers/' },
    { key: 'contact', label: 'Contact', href: '/contact/' }
  ],
  services: [
    { key: 'logistics', label: 'Logistics', href: '/services/logistics-operations/' },
    { key: 'admin', label: 'Admin BackOffice', href: '/services/administrative-backoffice/' },
    { key: 'it', label: 'IT Support', href: '/services/it-support/' },
    { key: 'customerRelations', label: 'Customer Relations', href: '/services/customer-relations/' },
    { key: 'learning', label: 'Learning', href: '/learning/' }
  ]
};

const ICONS = {
  home: '<path d="M3 10.5 12 3l9 7.5V21H3z"></path><path d="M9 21v-6h6v6"></path>',
  about: '<circle cx="12" cy="12" r="9"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path>',
  services: '<rect x="4" y="5" width="16" height="4" rx="1.5"></rect><rect x="4" y="10" width="16" height="4" rx="1.5"></rect><rect x="4" y="15" width="16" height="4" rx="1.5"></rect>',
  careers: '<path d="M3 8h18v11H3z"></path><path d="M8 8V6h8v2"></path><path d="M3 13h18"></path>',
  contact: '<path d="M4 7h16v10H4z"></path><path d="m4 8 8 6 8-6"></path>'
};

function iconMarkup(key) {
  return `<svg class="mobile-nav__icon" viewBox="0 0 24 24" aria-hidden="true">${ICONS[key]}</svg>`;
}

function resolveActivePage() {
  if (document.body.dataset.servicePage === 'true') return 'services';
  const dataPage = document.body.dataset.page;
  if (dataPage) return dataPage;
  const pageKey = document.body.dataset.pageKey;
  if (pageKey === 'learning') return 'services';
  return pageKey || 'home';
}

function buildMarkup(activePage) {
  return `
    <div class="mobile-nav-layer" data-mobile-nav-layer>
      <nav class="mobile-nav" aria-label="Mobile navigation" data-mobile-nav>
        ${ROUTES.primary
          .map((item) => {
            if (item.key === 'services') {
              return `
                <div class="mobile-nav__services" data-mobile-services>
                  <button
                    class="mobile-nav__trigger${activePage === 'services' ? ' is-active' : ''}"
                    type="button"
                    data-mobile-services-toggle
                    aria-expanded="false"
                    aria-controls="mobile-services-menu"
                  >
                    ${iconMarkup(item.key)}
                    <span class="mobile-nav__label">${item.label}</span>
                  </button>
                  <div id="mobile-services-menu" class="mobile-nav__submenu" data-mobile-services-menu>
                    ${ROUTES.services
                      .map(
                        (service) =>
                          `<a class="mobile-nav__submenu-link" href="${service.href}" data-service-link="${service.key}">${service.label}</a>`
                      )
                      .join('')}
                  </div>
                </div>
              `;
            }

            const activeClass = activePage === item.key ? ' is-active' : '';
            return `<a class="mobile-nav__item${activeClass}" href="${item.href}" data-mobile-item="${item.key}">${iconMarkup(item.key)}<span class="mobile-nav__label">${item.label}</span></a>`;
          })
          .join('')}
      </nav>
    </div>
  `;
}

export function initMobileNav() {
  const mobileQuery = window.matchMedia(MOBILE_QUERY);
  const root = document.getElementById('mobile-nav-root') || document.body.appendChild(document.createElement('div'));
  if (!root.id) root.id = 'mobile-nav-root';

  const activePage = resolveActivePage();
  root.innerHTML = buildMarkup(activePage);

  const layer = root.querySelector('[data-mobile-nav-layer]');
  const servicesContainer = root.querySelector('[data-mobile-services]');
  const servicesToggle = root.querySelector('[data-mobile-services-toggle]');
  const servicesMenu = root.querySelector('[data-mobile-services-menu]');

  if (!layer || !servicesContainer || !servicesToggle || !servicesMenu) return;

  const setOpen = (open) => {
    servicesToggle.setAttribute('aria-expanded', String(open));
    servicesMenu.classList.toggle('is-open', open);
  };

  const closeMenu = () => {
    setOpen(false);
  };

  document.body.classList.add('has-mobile-nav');
  setOpen(false);

  servicesToggle.addEventListener('click', (event) => {
    event.stopPropagation();
    const isOpen = servicesToggle.getAttribute('aria-expanded') === 'true';
    setOpen(!isOpen);
  });

  servicesMenu.addEventListener('click', (event) => {
    if (event.target instanceof Element && event.target.closest('.mobile-nav__submenu-link')) {
      closeMenu();
    }
  });

  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    if (!servicesContainer.contains(event.target)) closeMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMenu();
      servicesToggle.focus();
    }
  });

  window.addEventListener('resize', closeMenu);
  window.addEventListener('orientationchange', closeMenu);
  window.addEventListener('pagehide', closeMenu);

  mobileQuery.addEventListener('change', (event) => {
    if (!event.matches) closeMenu();
  });
}
