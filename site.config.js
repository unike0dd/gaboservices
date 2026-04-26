(function () {
  const core = window.SITE_CORE_CONFIG || {};
  const contact = window.SITE_CONTACT_CONFIG || {};
  const careers = window.SITE_CAREERS_CONFIG || {};
  const chatbot = window.SITE_CHATBOT_CONFIG || {};

  window.SITE_METADATA = {
    ...core,
    workers: {
      chatbotBaseUrl: chatbot.workerBaseUrl || 'https://drastic-measures.rulathemtodos.workers.dev'
    },
    forms: {
      contactIntakeBaseUrl: contact.intakeBaseUrl || '',
      careersIntakeBaseUrl: careers.intakeBaseUrl || '',
      intakeBaseUrl: contact.intakeBaseUrl || careers.intakeBaseUrl || '',
      originAssetMap: {},
      defaultAssetId: ''
    },
    chatbot: {
      mode: chatbot.mode || 'iframe_service_qa',
      originAssetMap: chatbot.originAssetMap || {}
    }
  };
})();
