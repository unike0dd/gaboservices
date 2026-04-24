(function () {
  function initialize() {
    var formSubmitCore = window.GaboFormSubmitCore;
    if (!formSubmitCore || typeof formSubmitCore.initFormPage !== 'function') return false;

    formSubmitCore.initFormPage({
      rootSelector: '.contact-hub',
      formId: 'contactForm',
      statusId: 'formStatus',
      submitPath: '/submit/contact',
      honeypotFields: ['company_website'],
      numericInputs: [
        { id: '#contactCountryCode', allowPlusPrefix: true },
        { id: '#contactNumber', allowPlusPrefix: false },
        { id: '#contactZip', allowPlusPrefix: false },
      ],
      workflow: {
        formId: 'contactForm',
        statusId: 'formStatus',
        clearKey: 'contact',
        requiredIds: ['contactFullName', 'contactEmail', 'contactNumber', 'contactMessage'],
        emptyMessage: 'Please complete the quick inquiry fields before submitting.',
        readyMessage: 'Quick inquiry is ready for secure submission.',
        listConfigs: [
          { type: 'simple', inputId: 'contactRemoteSkillInput', addBtnId: 'contactRemoteSkillAdd', listId: 'contactRemoteSkillsList', hiddenId: 'contactRemoteSkillsHidden' },
          { type: 'pair', inputId: 'contactExperienceInput', selectId: 'contactExperienceLevel', addBtnId: 'contactExperienceAdd', listId: 'contactExperienceList', hiddenId: 'contactExperienceHidden' },
          { type: 'pair', inputId: 'contactLanguageInput', selectId: 'contactLanguageLevel', addBtnId: 'contactLanguageAdd', listId: 'contactLanguagesList', hiddenId: 'contactLanguagesHidden' },
          { type: 'pair', inputId: 'contactEducationInput', selectId: 'contactEducationLevel', addBtnId: 'contactEducationAdd', listId: 'contactEducationList', hiddenId: 'contactEducationHidden' },
        ],
        clearPillGroups: [
          { listId: 'contactRemoteSkillsList', hiddenId: 'contactRemoteSkillsHidden' },
          { listId: 'contactExperienceList', hiddenId: 'contactExperienceHidden' },
          { listId: 'contactLanguagesList', hiddenId: 'contactLanguagesHidden' },
          { listId: 'contactEducationList', hiddenId: 'contactEducationHidden' },
        ],
        clearCheckboxSelectors: ['input[name="contact_interest[]"]', 'input[name="remote_interest[]"]'],
        extraValidation: function (context) {
          if (!context.getCheckedValues('input[name="contact_interest[]"]').length) {
            return 'Please select at least one service interest.';
          }
          return '';
        },
      },
      onValidate: function (context) {
        if (!context.root.querySelectorAll('input[name="contact_interest[]"]:checked').length) {
          return 'Please select at least one area of interest.';
        }
        return '';
      },
      beforeMessage: 'Scanning and sanitizing your request...',
      successMessage: 'Contact request sent securely to Gmail intake.',
    });

    return true;
  }

  function initWhenReady(attempt) {
    if (initialize()) return;
    if (attempt >= 30) return;
    setTimeout(function () {
      initWhenReady(attempt + 1);
    }, 100);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initWhenReady(0);
    });
  } else {
    initWhenReady(0);
  }
})();
