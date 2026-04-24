(function () {
  var root = document.querySelector('.contact-hub');
  var formWorkflow = window.GaboFormWorkflow;
  var submitCore = window.GaboFormSubmitCore;
  if (!root || !submitCore) return;

  var hasFormWorkflow = !!(formWorkflow && typeof formWorkflow.create === 'function');
  var intakeBase = (window.SITE_METADATA && window.SITE_METADATA.forms && window.SITE_METADATA.forms.intakeBaseUrl) || 'https://solitary-term-4203.rulathemtodos.workers.dev';
  var SUBMIT_ENDPOINT = intakeBase.replace(/\/$/, '') + '/submit/careers';
  var HONEYPOT_FIELDS = ['portfolio_url'];
  var originAssetMap =
    (window.SITE_METADATA && window.SITE_METADATA.forms && window.SITE_METADATA.forms.originAssetMap) ||
    (window.SITE_METADATA && window.SITE_METADATA.chatbot && window.SITE_METADATA.chatbot.originAssetMap) ||
    {};
  var REQUIRED_FIELD_IDS = ['careerFullName', 'careerEmail', 'careerCountryCode', 'careerNumber', 'careerCity', 'careerState', 'careerZip', 'careerAvailability'];
  var submitInFlight = false;

  function setStatus(message, state) {
    var status = root.querySelector('#careerFormStatus');
    if (!status) return;
    status.textContent = message;
    status.dataset.state = state || '';
  }

  function getInvalidFieldNames(form) {
    return Array.from(form.querySelectorAll(':invalid')).map(function (field) {
      if (!field.id) return field.name || 'Field';
      var label = form.querySelector('label[for="' + field.id + '"]');
      return (label && label.textContent && label.textContent.trim()) || field.name || field.id;
    });
  }

  if (hasFormWorkflow) {
    formWorkflow.create(root, {
      formId: 'careerForm',
      statusId: 'careerFormStatus',
      clearKey: 'career',
      requiredIds: REQUIRED_FIELD_IDS,
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
  }

  var form = root.querySelector('#careerForm');
  if (!form) return;

  var submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
  var originalSubmitLabel = submitButton
    ? (submitButton.tagName === 'INPUT' ? submitButton.value : submitButton.textContent)
    : '';

  submitCore.bindNumericInput(form.querySelector('#careerCountryCode'), true);
  submitCore.bindNumericInput(form.querySelector('#careerNumber'), false);
  submitCore.bindNumericInput(form.querySelector('#careerZip'), false);

  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    if (submitInFlight) return;

    try {
      if (!form) {
        setStatus('Submission failed. Please refresh and try again.', 'blocked');
        return;
      }

      if (!submitButton) {
        setStatus('Submission failed. Submit control is unavailable.', 'blocked');
        return;
      }

      if (submitCore.honeypotTriggered(form, HONEYPOT_FIELDS)) {
        setStatus('Submission blocked.', 'blocked');
        return;
      }

      if (!form.checkValidity()) {
        var invalidFields = getInvalidFieldNames(form, REQUIRED_FIELD_IDS);
        if (invalidFields.length) {
          setStatus('Please complete all required fields: ' + invalidFields.join(', ') + '.', 'blocked');
          form.querySelector(':invalid').focus();
        } else {
          setStatus('Please complete all required fields.', 'blocked');
        }
        return;
      }

      if (!root.querySelectorAll('input[name="career_interest[]"]:checked').length) {
        setStatus('Please select at least one area of interest.', 'blocked');
        return;
      }

      var opsAssetId = submitCore.getOpsAssetId(originAssetMap);
      if (!opsAssetId) {
        setStatus('Secure intake is temporarily unavailable. Please try again shortly.', 'blocked');
        return;
      }

      var payload = submitCore.formToPlainObject(form);
      submitInFlight = true;
      submitCore.setSubmittingState(submitButton, true, originalSubmitLabel);
      setStatus('Scanning and sanitizing your application...', 'review');

      await submitCore.submitJson({
        endpoint: SUBMIT_ENDPOINT,
        opsAssetId: opsAssetId,
        payload: payload,
        fallbackErrorMessage: 'Secure career relay failed.'
      });

      setStatus('Career application sent securely to Google Sheets intake.', 'success');
      form.reset();
    } catch (error) {
      setStatus((error && error.message) || 'Submission failed. Please try again shortly.', 'blocked');
    } finally {
      submitInFlight = false;
      submitCore.setSubmittingState(submitButton, false, originalSubmitLabel);
    }
  });
})();
