(function () {
  const GABO_PUBLIC_SERVICES_CONTEXT = {
    en: {
      businessName: 'Gabo Services',
      assistantName: 'gabo io',
      creatorName: 'Gabriel Anangono',
      creatorDisplay: 'gabo io was created by Gabriel Anangono for Gabo Services.',
      rule: 'Only answer about the services and information listed on this public website.'
    },
    es: {
      businessName: 'Gabo Services',
      assistantName: 'gabo io',
      creatorName: 'Gabriel Anangono',
      creatorDisplay: 'gabo io fue creado por Gabriel Anangono para Gabo Services.',
      rule: 'Responde únicamente sobre los servicios y la información pública listada en este sitio web.'
    }
  };

  const source = window.GABO_PUBLIC_SERVICES_CONTEXT || GABO_PUBLIC_SERVICES_CONTEXT;

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
