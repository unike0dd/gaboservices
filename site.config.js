window.SITE_METADATA = {
  forms: {
    intakeBaseUrl: 'https://solitary-term-4203.rulathemtodos.workers.dev',
    // Public asset identifiers must match the values configured in the intake worker
    // (ASSET_C5T / ASSET_C5S / ASSET_PAGE / ASSET_FOUND).
    //
    // Use either origin-specific entries, hostname keys, or a wildcard "*" fallback.
    originAssetMap: {
      // 'https://www.gabo.services': 'replace-with-public-asset-id',
      // 'https://gabo.services': 'replace-with-public-asset-id',
      // '*': 'replace-with-public-asset-id',
    },
    // Optional global fallback if no specific origin key matches.
    defaultAssetId: '',
  },
  chatbot: {}
};
