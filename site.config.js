window.SITE_METADATA = {
  workers: {
    chatbotBaseUrl: 'https://drastic-measures.rulathemtodos.workers.dev',
  },
  forms: {
    // Contact + careers use the same intake worker.
    contactIntakeBaseUrl: 'https://solitary-term-4203.rulathemtodos.workers.dev',
    careersIntakeBaseUrl: 'https://solitary-term-4203.rulathemtodos.workers.dev',
    // Backward-compatible default used when a page-specific endpoint is not set.
    intakeBaseUrl: 'https://solitary-term-4203.rulathemtodos.workers.dev',
    // Legacy fallback map for generic form routes.
    // Prefer route-specific maps below so each workflow uses a separate secret asset ID.
    //
    // Use either origin-specific entries, hostname keys, or a wildcard "*" fallback.
    originAssetMap: {
      'https://www.gabo.services': 'b91f605b23748de5cf02db0de2dd59117b31c709986a3c72837d0af8756473cf2779c206fc6ef80a57fdeddefa4ea11b972572f3a8edd9ed77900f9385e94bd6',
      'https://gabo.services': '8cdeef86bd180277d5b080d571ad8e6dbad9595f408b58475faaa3161f07448fbf12799ee199e3ee257405b75de555055fd5f43e0ce75e0740c4dc11bf86d132',
      // '*': 'replace-with-public-asset-id',
    },
    // Optional global fallback if no specific origin key matches.
    defaultAssetId: '',
    // Route-specific secret asset IDs (must match ASSET_C5T in workers/solitary-term-worker.js).
    contactOriginAssetMap: {
      'https://www.gabo.services': 'b91f605b23748de5cf02db0de2dd59117b31c709986a3c72837d0af8756473cf2779c206fc6ef80a57fdeddefa4ea11b972572f3a8edd9ed77900f9385e94bd6',
      'https://gabo.services': '8cdeef86bd180277d5b080d571ad8e6dbad9595f408b58475faaa3161f07448fbf12799ee199e3ee257405b75de555055fd5f43e0ce75e0740c4dc11bf86d132',
    },
    // Route-specific secret asset IDs (must match ASSET_C5S in workers/solitary-term-worker.js).
    careersOriginAssetMap: {
      'https://www.gabo.services': '8cdeef86bd180277d5b080d571ad8e6dbad9595f408b58475faaa3161f07448fbf12799ee199e3ee257405b75de555055fd5f43e0ce75e0740c4dc11bf86d132',
      'https://gabo.services': 'b91f605b23748de5cf02db0de2dd59117b31c709986a3c72837d0af8756473cf2779c206fc6ef80a57fdeddefa4ea11b972572f3a8edd9ed77900f9385e94bd6',
    },
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
