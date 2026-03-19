export const SITE_METADATA_DEFAULTS = Object.freeze({
  name: {
    en: 'Gabriel Services'
  },
  description: {
    en: 'Providing Remote Professional Assistance and Business Services to Logistics, IT Support, C Suite Executive, and Customer Relations Management.'
  },
  framePermissions: [],
  chatbotGatewayUrl: 'https://con-artist.rulathemtodos.workers.dev/',
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
    controlFamilies: ['SEO', 'CSP', 'CISA', 'NIST CSF', 'OWASP ASVS', 'PCI DSS 4.0'],
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
  voiceSearch: {
    enabled: true,
    lang: 'en-US',
    requiresConsent: true,
    browserApi: 'webkitSpeechRecognition|SpeechRecognition'
  }
});
