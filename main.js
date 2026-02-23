const dictionary = {
  en: {
    home: 'Home', services: 'Services', about: 'About', pricing: 'Pricing', contact: 'Contact',
    trustedBy: 'Trusted by 4,759+ SMB teams',
    heroTitle: 'Professional services for logistics, IT, and customer operations.',
    heroBody: 'Scale support with expert teams, measurable SLAs, and human-centered delivery.',
    startTrial: 'Start Free Trial', schedule: 'Schedule Consultation',
    aboutBody: 'Gabriel Services provides multilingual operational support designed for modern digital businesses.',
    name: 'Name', message: 'Message', send: 'Send', cookie: 'We use cookies to improve your experience.', accept: 'Accept',
    sent: 'Message captured. We will contact you shortly.'
  },
  es: {
    home: 'Inicio', services: 'Servicios', about: 'Nosotros', pricing: 'Precios', contact: 'Contacto',
    trustedBy: 'Con la confianza de más de 4,759 equipos PyME',
    heroTitle: 'Servicios profesionales para logística, TI y operaciones de atención al cliente.',
    heroBody: 'Escale su soporte con equipos expertos, SLA medibles y una entrega centrada en las personas.',
    startTrial: 'Iniciar prueba gratuita', schedule: 'Programar consulta',
    aboutBody: 'Gabriel Services ofrece soporte operativo multilingüe diseñado para negocios digitales modernos.',
    name: 'Nombre', message: 'Mensaje', send: 'Enviar', cookie: 'Usamos cookies para mejorar su experiencia.', accept: 'Aceptar',
    sent: 'Mensaje recibido. Nos pondremos en contacto pronto.'
  }
};

const services = [
  { title: 'Logistics Operations', body: 'Order workflows, dispatch support, shipment updates, and reporting.' },
  { title: 'IT Support', body: 'Tier 1/2 troubleshooting, account management, and endpoint support.' },
  { title: 'Administrative Backoffice', body: 'Data entry, documentation, billing support, and process QA.' },
  { title: 'Customer Relations', body: 'Omnichannel support, customer retention, and quality monitoring.' }
];

const plans = [
  { name: 'Starter', price: '$299/mo', points: ['Email support', 'Business hours', 'Monthly report'] },
  { name: 'Growth', price: '$899/mo', points: ['24/7 support', 'Priority SLA', 'Weekly optimization'] },
  { name: 'Enterprise', price: 'Custom', points: ['Dedicated team', 'Custom integrations', 'Compliance alignment'] }
];

const root = document.documentElement;
let lang = localStorage.getItem('lang') || 'en';

function renderCards() {
  document.getElementById('serviceCards').innerHTML = services.map((service) => `
    <article class="card">
      <h3>${service.title}</h3>
      <p>${service.body}</p>
    </article>
  `).join('');

  document.getElementById('pricingCards').innerHTML = plans.map((plan) => `
    <article class="price-card">
      <h3>${plan.name}</h3>
      <p class="price">${plan.price}</p>
      <ul>${plan.points.map((point) => `<li>${point}</li>`).join('')}</ul>
    </article>
  `).join('');
}

function translatePage() {
  const copy = dictionary[lang];
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach((node) => {
    const key = node.dataset.i18n;
    if (copy[key]) node.textContent = copy[key];
  });
  document.getElementById('langBtn').textContent = lang === 'en' ? 'ES' : 'EN';
}

function initTheme() {
  const stored = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (stored === 'dark' || (!stored && prefersDark)) root.classList.add('dark');
}

function bindEvents() {
  document.getElementById('themeBtn').addEventListener('click', () => {
    root.classList.toggle('dark');
    localStorage.setItem('theme', root.classList.contains('dark') ? 'dark' : 'light');
  });

  document.getElementById('langBtn').addEventListener('click', () => {
    lang = lang === 'en' ? 'es' : 'en';
    localStorage.setItem('lang', lang);
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
    form.reset();
    document.getElementById('formStatus').textContent = dictionary[lang].sent;
  });

  document.getElementById('year').textContent = String(new Date().getFullYear());

  const cookieBanner = document.getElementById('cookieBanner');
  if (!localStorage.getItem('cookieAccepted')) cookieBanner.hidden = false;
  document.getElementById('cookieAccept').addEventListener('click', () => {
    localStorage.setItem('cookieAccepted', 'true');
    cookieBanner.hidden = true;
  });
}

initTheme();
renderCards();
translatePage();
bindEvents();
