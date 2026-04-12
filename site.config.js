window.SITE_METADATA = {
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
  },
  forms: {
    intakeWorkerBase: 'https://solitary-term-4203.rulathemtodos.workers.dev'
  },
  chatbot: {
    originAssetMap: {
      'https://www.gabo.services': 'b91f605b23748de5cf02db0de2dd59117b31c709986a3c72837d0af8756473cf2779c206fc6ef80a57fdeddefa4ea11b972572f3a8edd9ed77900f9385e94bd6',
      'https://gabo.services': '8cdeef86bd180277d5b080d571ad8e6dbad9595f408b58475faaa3161f07448fbf12799ee199e3ee257405b75de555055fd5f43e0ce75e0740c4dc11bf86d132'
      // Add staging/local origins here when Cloudflare Worker asset IDs are provisioned.
      // Example:
      // 'https://preview.gabo.services': '<asset-id>',
      // 'http://localhost:4173': '<asset-id>'
    }
  }
};
