export const SUPPORTED_LANGUAGES = Object.freeze(['en', 'es']);

export const LANGUAGE_CODES = Object.freeze({
  en: 'EN',
  es: 'ES'
});

export const DICTIONARY = {
  en: {
    switchToEnglish: 'Switch language to English',
    switchToSpanish: 'Switch language to Spanish',
    serviceLabel: 'Service',
    serviceLearnMore: 'Learn more',
    sent: 'Message sent successfully.',
    review: 'Message queued for security review.',
    blocked: 'Submission blocked for security reasons.',
    pricing: 'Pricing',
    pricingFeaturesLabel: 'Features',
    serviceShowPrefix: 'Show',
    footerCopyright: 'Gabriel Services'
  },
  es: {
    switchToEnglish: 'Cambiar idioma a inglés',
    switchToSpanish: 'Cambiar idioma a español',
    serviceLabel: 'Servicio',
    serviceLearnMore: 'Conocer más',
    sent: 'Mensaje enviado correctamente.',
    review: 'Mensaje en revisión de seguridad.',
    blocked: 'Envío bloqueado por seguridad.',
    pricing: 'Precios',
    pricingFeaturesLabel: 'Características',
    serviceShowPrefix: 'Ver',
    footerCopyright: 'Gabriel Services'
  }
};

export const SERVICES = {
  en: [
    {
      key: 'logistics',
      title: 'Logistics Operations',
      body: 'Dispatch coordination, route support, and delivery-flow continuity.',
      href: '/services/logistics-operations/',
      items: ['Dispatch tracking', 'Escalation handling', 'Execution reporting']
    },
    {
      key: 'admin',
      title: 'Administrative Backoffice',
      body: 'Documentation, scheduling, and structured process support.',
      href: '/services/administrative-backoffice/',
      items: ['Documentation control', 'Scheduling support', 'Workflow upkeep']
    },
    {
      key: 'customer',
      title: 'Customer Relations',
      body: 'Customer communications and service continuity for daily operations.',
      href: '/services/customer-relations/',
      items: ['Inbound support', 'Follow-up cadence', 'Retention support']
    },
    {
      key: 'it',
      title: 'IT Support',
      body: 'Operational technical support for business continuity.',
      href: '/services/it-support/',
      items: ['Ticket triage', 'Issue coordination', 'Endpoint support']
    }
  ],
  es: [
    {
      key: 'logistics',
      title: 'Operaciones Logísticas',
      body: 'Coordinación de despacho, soporte de rutas y continuidad operativa.',
      href: '/services/logistics-operations/',
      items: ['Seguimiento de despacho', 'Gestión de escalaciones', 'Reportes de ejecución']
    },
    {
      key: 'admin',
      title: 'Backoffice Administrativo',
      body: 'Documentación, programación y soporte estructurado de procesos.',
      href: '/services/administrative-backoffice/',
      items: ['Control documental', 'Apoyo en programación', 'Mantenimiento de flujo']
    },
    {
      key: 'customer',
      title: 'Relaciones con Clientes',
      body: 'Comunicación con clientes y continuidad de atención diaria.',
      href: '/services/customer-relations/',
      items: ['Soporte entrante', 'Seguimiento', 'Retención']
    },
    {
      key: 'it',
      title: 'Soporte de TI',
      body: 'Soporte técnico operativo para continuidad del negocio.',
      href: '/services/it-support/',
      items: ['Triaje de tickets', 'Coordinación de incidentes', 'Soporte de endpoints']
    }
  ]
};

export const PLANS = {
  en: [
    { name: 'Starter', price: '$499/mo', points: ['Email support', 'Monthly reporting', 'Business-hours coverage'] },
    { name: 'Growth', price: '$999/mo', points: ['Priority queue', 'Weekly reviews', 'Extended coverage'] },
    { name: 'Scale', price: '$1,799/mo', points: ['Dedicated pod', 'Daily coordination', 'SLA tracking'] }
  ],
  es: [
    { name: 'Inicial', price: '$499/mes', points: ['Soporte por email', 'Reporte mensual', 'Cobertura en horario laboral'] },
    { name: 'Crecimiento', price: '$999/mes', points: ['Cola prioritaria', 'Revisiones semanales', 'Cobertura extendida'] },
    { name: 'Escala', price: '$1,799/mes', points: ['Equipo dedicado', 'Coordinación diaria', 'Seguimiento de SLA'] }
  ]
};

export const TRANSLATION_PAGE_MAP = Object.freeze({
  home: true,
  about: true,
  services: true,
  pricing: true,
  contact: true,
  careers: true,
  learning: true,
  logistics: true,
  administrativeBackoffice: true,
  customerRelations: true,
  itSupport: true
});

const SECTION_TRANSLATIONS = {
  shared: {
    en: DICTIONARY.en,
    es: DICTIONARY.es
  }
};

export function getTranslationsBySection(lang, sectionName) {
  const normalized = SUPPORTED_LANGUAGES.includes(lang) ? lang : 'en';
  return SECTION_TRANSLATIONS?.[sectionName]?.[normalized] || {};
}
