export const SITE_METADATA_DEFAULTS = Object.freeze({
  name: {
    en: 'Gabriel Services',
    es: 'Gabriel Services'
  },
  description: {
    en: 'Providing Remote Professional Assistance and Business Services to Logistics, IT Support, C Suite Executive, and Customer Relations Management.',
    es: 'Asistencia profesional remota y servicios empresariales para logística, soporte TI, dirección ejecutiva y gestión de relaciones con clientes.'
  },
  framePermissions: [],
  seo: {
    title: 'Gabriel Services',
    description: 'Business services for logistics, IT, admin, and customer relations.',
    canonicalUrl: 'https://www.gabo.services/',
    previewImage: 'https://www.gabo.services/assets/og-cover.svg',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Gabriel Services',
      url: 'https://www.gabo.services/',
      logo: 'https://www.gabo.services/assets/og-cover.svg',
      sameAs: []
    }
  },
  security: {
    cspProfile: 'strict-static-site-v1',
    controlFamilies: ['SEO', 'CSP', 'CISA', 'CIS Controls', 'NIST CSF', 'OWASP ASVS', 'PCI DSS 4.0'],
    allowlistedFrameHosts: [
      'https://challenges.cloudflare.com',
      'https://www.youtube-nocookie.com'
    ]
  },
  media: {
    acceptedUploads: ['audio/mpeg', 'video/mp4'],
    allowedEmbeds: {
      html5Video: true,
      youtube: true
    }
  }
});
