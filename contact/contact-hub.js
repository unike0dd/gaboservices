(function () {
  var root = document.querySelector('.contact-hub');
  var formWorkflow = window.GaboFormWorkflow;
  var submitCore = window.GaboFormSubmitCore;
  if (!root || !submitCore) return;

  var hasFormWorkflow = !!(formWorkflow && typeof formWorkflow.create === 'function');
  var intakeBase = (window.SITE_METADATA && window.SITE_METADATA.forms && window.SITE_METADATA.forms.intakeBaseUrl) || 'https://solitary-term-4203.rulathemtodos.workers.dev';
  var SUBMIT_ENDPOINT = intakeBase.replace(/\/$/, '') + '/submit/contact';
  var HONEYPOT_FIELDS = ['company_website'];
  var originAssetMap =
    (window.SITE_METADATA && window.SITE_METADATA.forms && window.SITE_METADATA.forms.originAssetMap) ||
    (window.SITE_METADATA && window.SITE_METADATA.chatbot && window.SITE_METADATA.chatbot.originAssetMap) ||
    {};
  var REQUIRED_FIELD_IDS = ['contactFullName', 'contactEmail', 'contactNumber', 'contactMessage'];
  var submitInFlight = false;

  function setStatus(message, state) {
    var status = root.querySelector('#formStatus');
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
      formId: 'contactForm',
      statusId: 'formStatus',
      clearKey: 'contact',
      requiredIds: REQUIRED_FIELD_IDS,
      emptyMessage: 'Please complete the quick inquiry fields before submitting.',
      readyMessage: 'Quick inquiry is ready for secure submission.',
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
        if (!context.getCheckedValues('input[name="contact_interest[]"]').length) {
          return 'Please select at least one service interest.';
        }
        return '';
      }
    });
  }

  var form = root.querySelector('#contactForm');
  if (!form) return;

  var submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
  var originalSubmitLabel = submitButton
    ? (submitButton.tagName === 'INPUT' ? submitButton.value : submitButton.textContent)
    : '';

  submitCore.bindNumericInput(form.querySelector('#contactCountryCode'), true);
  submitCore.bindNumericInput(form.querySelector('#contactNumber'), false);
  submitCore.bindNumericInput(form.querySelector('#contactZip'), false);

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

      if (!root.querySelectorAll('input[name="contact_interest[]"]:checked').length) {
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
      setStatus('Scanning and sanitizing your request...', 'review');

      await submitCore.submitJson({
        endpoint: SUBMIT_ENDPOINT,
        opsAssetId: opsAssetId,
        payload: payload,
        fallbackErrorMessage: 'Secure contact relay failed.'
      });

      setStatus('Contact request sent securely to Gmail intake.', 'success');
      form.reset();
    } catch (error) {
      setStatus((error && error.message) || 'Submission failed. Please try again shortly.', 'blocked');
    } finally {
      submitInFlight = false;
      submitCore.setSubmittingState(submitButton, false, originalSubmitLabel);
    }
  });
})();
