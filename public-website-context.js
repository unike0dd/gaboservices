(function () {
  const DEFAULT_PUBLIC_CONTEXT = {
    en: {
      businessName: '',
      assistantName: '',
      creatorName: '',
      creatorDisplay: '',
      rule: '',
      services: [],
      fallback: ''
    },
    es: {
      businessName: '',
      assistantName: '',
      creatorName: '',
      creatorDisplay: '',
      rule: '',
      services: [],
      fallback: ''
    }
  };

  const source = window.GABO_PUBLIC_SERVICES_CONTEXT || DEFAULT_PUBLIC_CONTEXT;

  window.buildPublicWebsiteContext = function buildPublicWebsiteContext(lang) {
    const safeLang = lang === 'es' ? 'es' : 'en';
    const ctx = source[safeLang] || {};

    return JSON.stringify({
      businessName: ctx.businessName,
      assistantName: ctx.assistantName,
      creatorName: ctx.creatorName,
      creatorDisplay: ctx.creatorDisplay,
      rule: ctx.rule,
      services: ctx.services || [],
      fallback: ctx.fallback || ''
    });
  };
})();
