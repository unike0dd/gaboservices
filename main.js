const dictionary = {
  en: {
    home: 'Home', services: 'Services', about: 'About', pricing: 'Pricing', contact: 'Contact',
    heroTitle: 'Professional services for logistics, IT, and customer operations.',
    heroBody: 'Scale support with expert teams, measurable SLAs, and human-centered delivery.',
    startTrial: 'Start Free Trial', schedule: 'Schedule Consultation',
    aboutBody: 'Gabriel Services provides multilingual operational support designed for modern digital businesses.',
    name: 'Name', contactNumber: 'Your Contact Number', contactTime: 'Most convenient time to contact you', message: 'Message', send: 'Send', cookie: 'We use cookies to improve your experience.', accept: 'Accept',
    sent: 'Message captured. We will contact you shortly.',
    blocked: 'Submission blocked by security checks. Please remove code-like content and retry.',
    themeDark: 'Dark',
    themeLight: 'Light',
    themeLabelDark: 'Switch to Light theme',
    themeLabelLight: 'Switch to Dark theme'
  },
  es: {
    home: 'Inicio', services: 'Servicios', about: 'Nosotros', pricing: 'Precios', contact: 'Contacto',
    heroTitle: 'Servicios profesionales para logística, TI y operaciones de atención al cliente.',
    heroBody: 'Escale su soporte con equipos expertos, SLA medibles y una entrega centrada en las personas.',
    startTrial: 'Iniciar prueba gratuita', schedule: 'Programar consulta',
    aboutBody: 'Gabriel Services ofrece soporte operativo multilingüe diseñado para negocios digitales modernos.',
    name: 'Nombre', contactNumber: 'Your Contact Number', contactTime: 'Most convenient time to contact you', message: 'Mensaje', send: 'Enviar', cookie: 'Usamos cookies para mejorar su experiencia.', accept: 'Aceptar',
    sent: 'Mensaje recibido. Nos pondremos en contacto pronto.',
    blocked: 'Contenido bloqueado por seguridad. Elimine código malicioso e inténtelo otra vez.',
    themeDark: 'Dark',
    themeLight: 'Light',
    themeLabelDark: 'Cambiar a tema claro',
    themeLabelLight: 'Cambiar a tema oscuro'
  }
};

const services = {
  en: [
    { title: 'Logistics Operations', body: 'Order workflows, dispatch support, shipment updates, and reporting.' },
    { title: 'IT Support', body: 'Tier 1/2 troubleshooting, account management, and endpoint support.' },
    { title: 'Administrative Backoffice', body: 'Data entry, documentation, billing support, and process QA.' },
    { title: 'Customer Relations', body: 'Omnichannel support, customer retention, and quality monitoring.' }
  ],
  es: [
    { title: 'Operaciones Logísticas', body: 'Flujos de pedidos, soporte de despacho, actualizaciones de envíos y reportes.' },
    { title: 'Soporte de TI', body: 'Resolución de incidencias nivel 1/2, gestión de cuentas y soporte de endpoints.' },
    { title: 'Backoffice Administrativo', body: 'Ingreso de datos, documentación, apoyo de facturación y control de procesos.' },
    { title: 'Relaciones con Clientes', body: 'Soporte omnicanal, retención de clientes y monitoreo de calidad.' }
  ]
};

const plans = {
  en: [
    { name: 'Individual', price: '$3,950/mo', points: ['Email support', 'Business hours', 'Monthly report'] },
    { name: 'Small Business', price: '$4,850/mo', points: ['24/7 support', 'Priority SLA', 'Weekly optimization'] },
    { name: 'Medium Business', price: '$5,950/mo', points: ['Dedicated team', 'Custom integrations', 'Compliance alignment'] }
  ],
  es: [
    { name: 'Individual', price: '$3,950 usd/mes', points: ['Soporte por correo', 'Horario laboral', 'Reporte mensual'] },
    { name: 'Small Business', price: '$4,850 usd/mes', points: ['Soporte 24/7', 'SLA prioritario', 'Optimización semanal'] },
    { name: 'Medium Business', price: '$5,950 usd/mes', points: ['Equipo dedicado', 'Integraciones a medida', 'Alineación de cumplimiento'] }
  ]
};

const root = document.documentElement;
const metadata = window.SITE_METADATA || {};
if (metadata.name) document.title = metadata.name;
const metaDescription = document.querySelector('meta[name="description"]');
if (metaDescription && metadata.description) metaDescription.setAttribute('content', metadata.description);
let lang = localStorage.getItem('lang') || 'en';

class TinyGuardML {
  constructor() {
    this.signatures = [
      /<script/gi,
      /on\w+\s*=/gi,
      /javascript:/gi,
      /<iframe/gi,
      /\b(select|union|drop|insert|delete|update)\b/gi,
      /\{\{.*\}\}/g,
      /<\/?[a-z][^>]*>/gi
    ];
  }

  sanitize(rawValue) {
    return rawValue.replace(/[<>`]/g, '').replace(/javascript:/gi, '').trim();
  }

  score(value) {
    return this.signatures.reduce((acc, regex) => {
      regex.lastIndex = 0;
      return acc + (regex.test(value) ? 1 : 0);
    }, 0);
  }

  validateForm(form) {
    const honeypots = [...form.querySelectorAll('.hp-field')];
    const honeypotTriggered = honeypots.some((field) => field.value.trim().length > 0);

    const inputs = [...form.querySelectorAll('input:not(.hp-field), textarea')];
    let riskScore = honeypotTriggered ? 10 : 0;

    inputs.forEach((field) => {
      const cleaned = this.sanitize(field.value);
      riskScore += this.score(field.value);
      field.value = cleaned;
    });

    return {
      allowed: riskScore < 2,
      riskScore,
      honeypotTriggered
    };
  }

  monitorGlobalTampering() {
    const observer = new MutationObserver((changes) => {
      const suspicious = changes.some((change) => {
        const node = change.target;
        return node instanceof HTMLElement && /script|iframe/i.test(node.innerHTML || '');
      });
      if (suspicious) {
        console.warn('[TinyGuardML] Potential tampering detected; content inspection recommended.');
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }
}

const tinyGuard = new TinyGuardML();

function renderCards() {
  const localizedServices = services[lang] || services.en;
  const localizedPlans = plans[lang] || plans.en;

  document.getElementById('serviceCards').innerHTML = localizedServices.map((service) => `
    <article class="card">
      <h3>${service.title}</h3>
      <p>${service.body}</p>
    </article>
  `).join('');

  document.getElementById('pricingCards').innerHTML = localizedPlans.map((plan) => `
    <article class="price-card">
      <h3>${plan.name}</h3>
      <p class="price">${plan.price}</p>
      <ul>${plan.points.map((point) => `<li>${point}</li>`).join('')}</ul>
    </article>
  `).join('');
}

function syncThemeButton() {
  const themeBtn = document.getElementById('themeBtn');
  const isDark = root.classList.contains('dark');
  themeBtn.textContent = isDark ? dictionary[lang].themeDark : dictionary[lang].themeLight;
  themeBtn.setAttribute('aria-label', isDark ? dictionary[lang].themeLabelDark : dictionary[lang].themeLabelLight);
}

function translatePage() {
  const copy = dictionary[lang];
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach((node) => {
    const key = node.dataset.i18n;
    if (copy[key]) node.textContent = copy[key];
  });
  document.getElementById('langBtn').textContent = lang === 'en' ? 'ES' : 'EN';
  syncThemeButton();
}

function initTheme() {
  const stored = localStorage.getItem('theme');
  if (stored === 'light') {
    root.classList.remove('dark');
    return;
  }

  root.classList.add('dark');
}

function bindFabControls() {
  const fabMain = document.getElementById('fabMain');
  const fabMenu = document.getElementById('fabMenu');
  const fabChat = document.getElementById('fabChat');
  const chatPanel = document.getElementById('chatPanel');
  const chatClose = document.getElementById('chatClose');
  const chatFrame = document.getElementById('chatFrame');

  fabMain.addEventListener('click', () => {
    const expanded = fabMain.getAttribute('aria-expanded') === 'true';
    fabMain.setAttribute('aria-expanded', String(!expanded));
    fabMenu.hidden = expanded;
  });

  fabChat.addEventListener('click', () => {
    const shieldForm = document.createElement('form');
    shieldForm.innerHTML = '<input class="hp-field" value="" /><textarea></textarea>';
    const guard = tinyGuard.validateForm(shieldForm);
    if (!guard.allowed) return;

    if (chatFrame.src === 'about:blank') {
      chatFrame.src = 'https://gabos.io';
    }
    chatPanel.hidden = false;
  });

  chatClose.addEventListener('click', () => {
    chatPanel.hidden = true;
  });
}

function bindEvents() {
  document.getElementById('themeBtn').addEventListener('click', () => {
    root.classList.toggle('dark');
    localStorage.setItem('theme', root.classList.contains('dark') ? 'dark' : 'light');
    syncThemeButton();
  });

  document.getElementById('langBtn').addEventListener('click', () => {
    lang = lang === 'en' ? 'es' : 'en';
    localStorage.setItem('lang', lang);
    renderCards();
    translatePage();
  });

  const navToggle = document.getElementById('navToggle');
  const nav = document.getElementById('primaryNav');
  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('open');
  });

  const form = document.getElementById('contactForm');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const verdict = tinyGuard.validateForm(form);
    const status = document.getElementById('formStatus');

    if (!verdict.allowed) {
      status.textContent = dictionary[lang].blocked;
      status.dataset.state = 'blocked';
      form.querySelectorAll('.hp-field').forEach((node) => {
        node.value = '';
      });
      return;
    }

    form.reset();
    status.textContent = dictionary[lang].sent;
    status.dataset.state = 'ok';
  });

  document.getElementById('year').textContent = String(new Date().getFullYear());

  const cookieBanner = document.getElementById('cookieBanner');
  if (!localStorage.getItem('cookieAccepted')) cookieBanner.hidden = false;
  document.getElementById('cookieAccept').addEventListener('click', () => {
    localStorage.setItem('cookieAccepted', 'true');
    cookieBanner.hidden = true;
  });

  bindFabControls();
}

initTheme();
renderCards();
translatePage();
bindEvents();
tinyGuard.monitorGlobalTampering();
