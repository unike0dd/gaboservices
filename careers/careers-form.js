(function () {
  var root = document.querySelector('.contact-hub');
  if (!root) return;

  var formWorkflow = window.GaboFormWorkflow;
  var formSubmitCore = window.GaboFormSubmitCore;

  if (!formSubmitCore || typeof formSubmitCore.createSubmitHandler !== 'function') {
    return;
  }

  var siteMetadata = window.SITE_METADATA || {};
  var intakeBase = (siteMetadata.forms && siteMetadata.forms.intakeBaseUrl) || 'https://solitary-term-4203.rulathemtodos.workers.dev';
  var originAssetMap = formSubmitCore.resolveOriginAssetMap(siteMetadata);

  var FORM_ID = 'careerForm';
  var STATUS_ID = 'careerFormStatus';
  var SUBMIT_ENDPOINT = intakeBase.replace(/\/$/, '') + '/submit/careers';
  var HONEYPOT_FIELDS = ['portfolio_url'];
  var REQUIRED_FIELD_IDS = ['careerFullName', 'careerEmail', 'careerCountryCode', 'careerNumber', 'careerCity', 'careerState', 'careerZip', 'careerAvailability'];

  function setStatus(message, state) {
    var status = root.querySelector('#' + STATUS_ID);
    if (!status) return;
    status.textContent = message;
    status.dataset.state = state || '';
  }

  if (formWorkflow && typeof formWorkflow.create === 'function') {
    formWorkflow.create(root, {
      formId: FORM_ID,
      statusId: STATUS_ID,
      clearKey: 'career',
      requiredIds: REQUIRED_FIELD_IDS,
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
    });
  }

  var form = root.querySelector('#' + FORM_ID);
  if (!form) return;

  formSubmitCore.bindNumericInput(form.querySelector('#careerCountryCode'), true);
  formSubmitCore.bindNumericInput(form.querySelector('#careerNumber'), false);
  formSubmitCore.bindNumericInput(form.querySelector('#careerZip'), false);

  var submitButton = form.querySelector('button[type="submit"], input[type="submit"]');

  form.addEventListener(
    'submit',
    formSubmitCore.createSubmitHandler({
      root: root,
      form: form,
      submitButton: submitButton,
      submitEndpoint: SUBMIT_ENDPOINT,
      honeypotFields: HONEYPOT_FIELDS,
      originAssetMap: originAssetMap,
      onStatus: setStatus,
      onValidate: function (context) {
        if (!context.root.querySelectorAll('input[name="career_interest[]"]:checked').length) {
          return 'Please select at least one area of interest.';
        }
        return '';
      },
      onBeforeSubmit: function () {
        setStatus('Scanning and sanitizing your application...', 'review');
      },
      onSuccess: function (context) {
        setStatus('Career application sent securely to Google Sheets intake.', 'success');
        context.form.reset();
      },
    })
  );
})();
