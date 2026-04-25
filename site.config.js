window.SITE_METADATA = {
  workers: {
    chatbotBaseUrl: 'https://drastic-measures.rulathemtodos.workers.dev',
  },
  forms: {
    // Keep contact/careers intake workers explicitly split so each channel can be
    // managed independently.
    contactIntakeBaseUrl: 'https://solitary-term-4203.rulathemtodos.workers.dev',
    careersIntakeBaseUrl: 'https://con-artist.rulathemtodos.workers.dev',
    // Backward-compatible default used when a page-specific endpoint is not set.
    intakeBaseUrl: 'https://solitary-term-4203.rulathemtodos.workers.dev',
    // Public asset identifiers must match the values configured in the intake worker
    // (ASSET_C5T / ASSET_C5S / ASSET_PAGE / ASSET_FOUND).
    //
    // Use either origin-specific entries, hostname keys, or a wildcard "*" fallback.
    originAssetMap: {
      'https://www.gabo.services': 'b91f605b23748de5cf02db0de2dd59117b31c709986a3c72837d0af8756473cf2779c206fc6ef80a57fdeddefa4ea11b972572f3a8edd9ed77900f9385e94bd6',
      'https://gabo.services': '8cdeef86bd180277d5b080d571ad8e6dbad9595f408b58475faaa3161f07448fbf12799ee199e3ee257405b75de555055fd5f43e0ce75e0740c4dc11bf86d132',
      // '*': 'replace-with-public-asset-id',
    },
    // Optional global fallback if no specific origin key matches.
    defaultAssetId: '',
  },
  chatbot: {
    originAssetMap: {
      'https://www.gabo.services': 'b91f605b23748de5cf02db0de2dd59117b31c709986a3c72837d0af8756473cf2779c206fc6ef80a57fdeddefa4ea11b972572f3a8edd9ed77900f9385e94bd6',
      'https://gabo.services': '8cdeef86bd180277d5b080d571ad8e6dbad9595f408b58475faaa3161f07448fbf12799ee199e3ee257405b75de555055fd5f43e0ce75e0740c4dc11bf86d132'
      // Add staging/local origins here when chatbot worker asset IDs are provisioned.
      // Example:
      // 'https://preview.gabo.services': '<asset-id>',
      // 'http://localhost:4173': '<asset-id>'
    }
  }
};
