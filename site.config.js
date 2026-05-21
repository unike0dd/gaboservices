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

  function getPublicServicesContext(lang) {
    const safeLang = lang === "es" ? "es" : "en";
    const ctx = window.GABO_SERVICES_CONTEXT?.[safeLang];

    if (!ctx) return "";

    return JSON.stringify({
      businessName: ctx.businessName,
      assistantName: ctx.assistantName,
      serviceRule: ctx.serviceRule,
      services: ctx.services,
      fallback: ctx.fallback
    });
  }

  window.getPublicServicesContext = getPublicServicesContext;

})();
