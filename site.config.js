(function () {
  const core = window.SITE_CORE_CONFIG || {};
  const contact = window.SITE_CONTACT_CONFIG || {};
  const careers = window.SITE_CAREERS_CONFIG || {};

  window.SITE_METADATA = {
    ...core,
    forms: {
      contactIntakeBaseUrl: contact.intakeBaseUrl || '',
      careersIntakeBaseUrl: careers.intakeBaseUrl || '',
      intakeBaseUrl: contact.intakeBaseUrl || careers.intakeBaseUrl || '',
      originAssetMap: {},
      defaultAssetId: ''
    }
  };
})();
