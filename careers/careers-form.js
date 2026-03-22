(function () {
  var root = document.querySelector('.contact-hub');
  var formWorkflow = window.GaboFormWorkflow;
  if (!root || !formWorkflow || typeof formWorkflow.create !== 'function') return;

  formWorkflow.create(root, {
    formId: 'careerForm',
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
      { type: 'pair', inputId: 'careerEducationInput', selectId: 'careerEducationLevel', addBtnId: 'careerEducationAdd', listId: 'careerEducationList', hiddenId: 'careerEducationHidden' }
    ],
    clearPillGroups: [
      { listId: 'careerExperienceList', hiddenId: 'careerExperienceHidden' },
      { listId: 'careerLanguagesList', hiddenId: 'careerLanguagesHidden' },
      { listId: 'careerSkillsList', hiddenId: 'careerSkillsHidden' },
      { listId: 'careerProjectsList', hiddenId: 'careerProjectsHidden' },
      { listId: 'careerEducationList', hiddenId: 'careerEducationHidden' }
    ],
    clearCheckboxSelectors: ['input[name="career_interest[]"]'],
    extraValidation: function (context) {
      if (!context.getCheckedValues('input[name="career_interest[]"]').length) {
        return 'Please select at least one career area of interest.';
      }
      return '';
    }
  });
})();
