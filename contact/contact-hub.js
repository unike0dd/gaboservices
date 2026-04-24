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

  var FORM_ID = 'contactForm';
  var STATUS_ID = 'formStatus';
  var SUBMIT_ENDPOINT = intakeBase.replace(/\/$/, '') + '/submit/contact';
  var HONEYPOT_FIELDS = ['company_website'];
  var REQUIRED_FIELD_IDS = ['contactFullName', 'contactEmail', 'contactNumber', 'contactMessage'];

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
      clearKey: 'contact',
      requiredIds: REQUIRED_FIELD_IDS,
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
    });
  }

  var form = root.querySelector('#' + FORM_ID);
  if (!form) return;

  formSubmitCore.bindNumericInput(form.querySelector('#contactCountryCode'), true);
  formSubmitCore.bindNumericInput(form.querySelector('#contactNumber'), false);
  formSubmitCore.bindNumericInput(form.querySelector('#contactZip'), false);

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
        if (!context.root.querySelectorAll('input[name="contact_interest[]"]:checked').length) {
          return 'Please select at least one area of interest.';
        }
        return '';
      },
      onBeforeSubmit: function () {
        setStatus('Scanning and sanitizing your request...', 'review');
      },
      onSuccess: function (context) {
        setStatus('Contact request sent securely to Gmail intake.', 'success');
        context.form.reset();
      },
    })
  );
})();
