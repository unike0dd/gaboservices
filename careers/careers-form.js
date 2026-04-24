(function () {
  function installNativeSubmitBlocker(formId, statusId) {
    var form = document.getElementById(formId);
    if (!form || form.dataset.nativeSubmitBlocked === 'true') return;

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      if (window.GaboFormSubmitCore && typeof window.GaboFormSubmitCore.initFormPage === 'function') {
        return;
      }

      var status = document.getElementById(statusId);
      if (!status) return;
      status.textContent = 'Secure submission is still loading. Please try again in a moment.';
      status.dataset.state = 'blocked';
    }, true);

    form.dataset.nativeSubmitBlocked = 'true';
  }

  function initialize() {
    var formSubmitCore = window.GaboFormSubmitCore;
    if (!formSubmitCore || typeof formSubmitCore.initFormPage !== 'function') return false;

    formSubmitCore.initFormPage({
      rootSelector: '.contact-hub',
      formId: 'careersForm',
      statusId: 'careerFormStatus',
      submitPath: '/submit/careers',
      honeypotFields: ['portfolio_url'],
      numericInputs: [
        { id: '#careerCountryCode', allowPlusPrefix: true },
        { id: '#careerNumber', allowPlusPrefix: false },
        { id: '#careerZip', allowPlusPrefix: false },
      ],
      workflow: {
        formId: 'careersForm',
        statusId: 'careerFormStatus',
        clearKey: 'career',
        requiredIds: ['careerFullName', 'careerEmail', 'careerCountryCode', 'careerNumber', 'careerCity', 'careerState', 'careerZip', 'careerAvailability'],
        emptyMessage: 'Please complete all required application fields.',
        readyMessage: 'Career application is ready for secure submission.',
        listConfigs: [
          { type: 'pair', inputId: 'careerExperienceInput', selectId: 'careerExperienceLevel', addBtnId: 'careerExperienceAdd', listId: 'careerExperienceList', hiddenId: 'careerExperienceHidden' },
          { type: 'pair', inputId: 'careerLanguageInput', selectId: 'careerLanguageLevel', addBtnId: 'careerLanguageAdd', listId: 'careerLanguagesList', hiddenId: 'careerLanguagesHidden' },
          { type: 'pair', inputId: 'careerSkillInput', selectId: 'careerSkillLevel', addBtnId: 'careerSkillAdd', listId: 'careerSkillsList', hiddenId: 'careerSkillsHidden' },
          { type: 'simple', inputId: 'careerProjectInput', addBtnId: 'careerProjectAdd', listId: 'careerProjectsList', hiddenId: 'careerProjectsHidden' },
          { type: 'pair', inputId: 'careerEducationInput', selectId: 'careerEducationLevel', addBtnId: 'careerEducationAdd', listId: 'careerEducationList', hiddenId: 'careerEducationHidden' },
        ],
        clearPillGroups: [
          { listId: 'careerExperienceList', hiddenId: 'careerExperienceHidden' },
          { listId: 'careerLanguagesList', hiddenId: 'careerLanguagesHidden' },
          { listId: 'careerSkillsList', hiddenId: 'careerSkillsHidden' },
          { listId: 'careerProjectsList', hiddenId: 'careerProjectsHidden' },
          { listId: 'careerEducationList', hiddenId: 'careerEducationHidden' },
        ],
        clearCheckboxSelectors: ['input[name="career_interest[]"]'],
        extraValidation: function (context) {
          if (!context.getCheckedValues('input[name="career_interest[]"]').length) {
            return 'Please select at least one career area of interest.';
          }
          return '';
        },
      },
      onValidate: function (context) {
        if (!context.root.querySelectorAll('input[name="career_interest[]"]:checked').length) {
          return 'Please select at least one area of interest.';
        }
        return '';
      },
      beforeMessage: 'Scanning and sanitizing your application...',
      successMessage: 'Career application sent securely to Google Sheets intake.',
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
      installNativeSubmitBlocker('careersForm', 'careerFormStatus');
      initWhenReady(0);
    });
  } else {
    installNativeSubmitBlocker('careersForm', 'careerFormStatus');
    initWhenReady(0);
  }
})();
