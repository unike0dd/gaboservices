export const LANGUAGE_CODES = Object.freeze({
  en: 'EN',
  es: 'ES'
});

export const SUPPORTED_LANGUAGES = Object.freeze(Object.keys(LANGUAGE_CODES));

export const DICTIONARY = {
  en: {
    home: 'Home', services: 'Services', about: 'About', pricing: 'Pricing', contact: 'Contact',
    heroTitle: 'Professional services for logistics, IT, and customer operations.',
    heroBody: 'Scale support with expert teams, measurable SLAs, and human-centered delivery.',
    startTrial: 'Start Free Trial', schedule: 'Schedule Consultation',
    aboutBody: 'Gabriel Services provides multilingual operational support designed for modern digital businesses.',
    name: 'Name', contactNumber: 'Your Contact Number', countryCode: 'Country code', contactTime: 'Most convenient time to contact you', message: 'Message', send: 'Send',
    sent: 'Message captured. We will contact you shortly.',
    blocked: 'Submission blocked by security checks. Please remove code-like content and retry.',
    serviceLearnMore: 'Learn more',
    serviceLogisticsTitle: 'Logistics Operations',
    serviceLogisticsBody: 'Order workflows, dispatch support, shipment updates, and reporting.',
    serviceItTitle: 'IT Support',
    serviceItBody: 'Tier 1, Tier 2; On - Boarding, Implementation, Troubleshooting, Account Management, Customer Relations and endpoint support.',
    serviceAdminTitle: 'Administrative Backoffice',
    serviceAdminBody: 'Data entry, Documentation, Invoicing billing Support, Accts Payables and Accts Receivable, process, scheduling, Executive assistant services, high level of administrative support.',
    serviceCustomerTitle: 'Customer Relations',
    serviceCustomerBody: 'Omnichannel support, customer retention, and quality monitoring.',
    serviceCardAction: 'View service details'
  },
  es: {
    home: 'Inicio', services: 'Servicios', about: 'Nosotros', pricing: 'Precios', contact: 'Contacto',
    heroTitle: 'Servicios profesionales para logística, TI y operaciones de atención al cliente.',
    heroBody: 'Escale su soporte con equipos expertos, SLA medibles y una entrega centrada en las personas.',
    startTrial: 'Iniciar prueba gratuita', schedule: 'Programar consulta',
    aboutBody: 'Gabriel Services ofrece soporte operativo multilingüe diseñado para negocios digitales modernos.',
    name: 'Nombre', contactNumber: 'Your Contact Number', countryCode: 'Código de país', contactTime: 'Most convenient time to contact you', message: 'Mensaje', send: 'Enviar',
    sent: 'Mensaje recibido. Nos pondremos en contacto pronto.',
    blocked: 'Contenido bloqueado por seguridad. Elimine código malicioso e inténtelo otra vez.',
    serviceLearnMore: 'Más información',
    serviceLogisticsTitle: 'Operaciones Logísticas',
    serviceLogisticsBody: 'Flujos de pedidos, soporte de despacho, actualizaciones de envíos y reportes.',
    serviceItTitle: 'Soporte de TI',
    serviceItBody: 'Resolución de incidencias nivel 1/2, gestión de cuentas y soporte de endpoints.',
    serviceAdminTitle: 'Backoffice Administrativo',
    serviceAdminBody: 'Ingreso de datos, documentación, apoyo de facturación, cuentas por pagar y cobrar, procesos, agenda y asistencia ejecutiva.',
    serviceCustomerTitle: 'Relaciones con Clientes',
    serviceCustomerBody: 'Soporte omnicanal, retención de clientes y monitoreo de calidad.',
    serviceCardAction: 'Ver detalles del servicio'
  }
};

export const SERVICES = {
  en: [
    { key: 'logistics', title: 'Logistics Operations', body: 'Order workflows, dispatch support, shipment updates, and reporting.', href: '/services/logistics-operations/' },
    { key: 'it', title: 'IT Support', body: 'Tier 1, Tier 2; On - Boarding, Implementation, Troubleshooting, Account Management, Customer Relations and endpoint support.', href: '/services/it-support/' },
    { key: 'admin', title: 'Administrative Backoffice', body: 'Data entry, Documentation, Invoicing billing Support, Accts Payables and Accts Receivable, process, scheduling, Executive assistant services, high level of administrative support.', href: '/services/administrative-backoffice/' },
    { key: 'customer', title: 'Customer Relations', body: 'Omnichannel support, customer retention, and quality monitoring.', href: '/services/customer-relations/' }
  ],
  es: [
    { key: 'logistics', title: 'Operaciones Logísticas', body: 'Flujos de pedidos, soporte de despacho, actualizaciones de envíos y reportes.', href: '/services/logistics-operations/' },
    { key: 'it', title: 'Soporte de TI', body: 'Resolución de incidencias nivel 1/2, gestión de cuentas y soporte de endpoints.', href: '/services/it-support/' },
    { key: 'admin', title: 'Backoffice Administrativo', body: 'Ingreso de datos, documentación, apoyo de facturación y control de procesos.', href: '/services/administrative-backoffice/' },
    { key: 'customer', title: 'Relaciones con Clientes', body: 'Soporte omnicanal, retención de clientes y monitoreo de calidad.', href: '/services/customer-relations/' }
  ]
};

export const PLANS = {
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
