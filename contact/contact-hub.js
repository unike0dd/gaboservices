(function () {
  var root = document.querySelector('.contact-hub');
  var formWorkflow = window.GaboFormWorkflow;
  if (!root || !formWorkflow || typeof formWorkflow.create !== 'function') return;

  formWorkflow.create(root, {
    formId: 'contactForm',
    statusId: 'formStatus',
    clearKey: 'contact',
    requiredIds: ['contactFullName', 'contactEmail', 'contactCountryCode', 'contactNumber', 'contactCity', 'contactState', 'contactZip', 'bestTimeToContact', 'contactMessage'],
    emptyMessage: 'Please complete all required contact and inquiry fields.',
    readyMessage: 'Contact inquiry is ready for secure submission.',
    listConfigs: [
      { type: 'simple', inputId: 'contactRemoteSkillInput', addBtnId: 'contactRemoteSkillAdd', listId: 'contactRemoteSkillsList', hiddenId: 'contactRemoteSkillsHidden' },
      { type: 'pair', inputId: 'contactExperienceInput', selectId: 'contactExperienceLevel', addBtnId: 'contactExperienceAdd', listId: 'contactExperienceList', hiddenId: 'contactExperienceHidden' },
      { type: 'pair', inputId: 'contactLanguageInput', selectId: 'contactLanguageLevel', addBtnId: 'contactLanguageAdd', listId: 'contactLanguagesList', hiddenId: 'contactLanguagesHidden' },
      { type: 'pair', inputId: 'contactEducationInput', selectId: 'contactEducationLevel', addBtnId: 'contactEducationAdd', listId: 'contactEducationList', hiddenId: 'contactEducationHidden' }
    ],
    clearPillGroups: [
      { listId: 'contactRemoteSkillsList', hiddenId: 'contactRemoteSkillsHidden' },
      { listId: 'contactExperienceList', hiddenId: 'contactExperienceHidden' },
      { listId: 'contactLanguagesList', hiddenId: 'contactLanguagesHidden' },
      { listId: 'contactEducationList', hiddenId: 'contactEducationHidden' }
    ],
    clearCheckboxSelectors: ['input[name="contact_interest[]"]', 'input[name="remote_interest[]"]'],
    extraValidation: function (context) {
      if (!root.querySelector('#contactExperienceHidden').value.trim()) {
        return 'Please add at least one experience item.';
      }
      if (!root.querySelector('#contactEducationHidden').value.trim()) {
        return 'Please add at least one education item.';
      }
      var interestCount = context.getCheckedValues('input[name="contact_interest[]"]').length + context.getCheckedValues('input[name="remote_interest[]"]').length;
      if (!interestCount) {
        return 'Please select at least one area of interest.';
      }
      return '';
    }
  });

  var accordion = root.querySelector('.contact-details-accordion');
  if (accordion) accordion.open = false;
})();
