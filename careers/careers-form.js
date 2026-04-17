(function () {
  var root = document.querySelector('.contact-hub');
  var formWorkflow = window.GaboFormWorkflow;
  if (!root) return;
  var hasFormWorkflow = !!(formWorkflow && typeof formWorkflow.create === 'function');

  var intakeBase = (window.SITE_METADATA && window.SITE_METADATA.forms && window.SITE_METADATA.forms.intakeBaseUrl) || 'https://solitary-term-4203.rulathemtodos.workers.dev';
  var HONEYPOT_FIELDS = ['portfolio_url'];
  var SUBMIT_ENDPOINT = intakeBase.replace(/\/$/, '') + '/submit/careers';
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

  function formToPlainObject(form) {
    var formData = new FormData(form);
    var out = {};

    formData.forEach(function (value, key) {
      if (Object.prototype.hasOwnProperty.call(out, key)) {
        if (Array.isArray(out[key])) out[key].push(value);
        else out[key] = [out[key], value];
      } else {
        out[key] = value;
      }
    });

    return out;
  }

  function honeypotTriggered(form) {
    return HONEYPOT_FIELDS.some(function (name) {
      var input = form.querySelector('input[name="' + name + '"]');
      return !!(input && String(input.value || '').trim());
    });
  }

  function bindNumericInput(input, allowPlusPrefix) {
    if (!input) return;
    input.addEventListener('input', function () {
      var raw = String(input.value || '');
      var sanitized = allowPlusPrefix
        ? raw.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '')
        : raw.replace(/\D/g, '');
      if (input.value !== sanitized) {
        input.value = sanitized;
      }
    });
  }

  function getOpsAssetId() {
    return String(originAssetMap[window.location.origin] || '').trim();
  }

  async function parseResponsePayload(response) {
    var contentType = String(response.headers.get('content-type') || '').toLowerCase();
    if (contentType.indexOf('application/json') >= 0) {
      return await response.json();
    }

    var text = await response.text();
    return { detail: text };
  }

  function getBackendErrorMessage(payload) {
    if (!payload || typeof payload !== 'object') return '';
    return String(payload.error || payload.message || payload.detail || '').trim();
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

  function setSubmittingState(isSubmitting) {
    submitInFlight = !!isSubmitting;
    if (!submitButton) return;
    submitButton.disabled = !!isSubmitting;

    if (submitButton.hasAttribute('aria-busy')) {
      submitButton.setAttribute('aria-busy', isSubmitting ? 'true' : 'false');
    }

    if (submitButton.tagName === 'INPUT') {
      submitButton.value = isSubmitting
        ? (submitButton.dataset.submittingLabel || originalSubmitLabel || submitButton.value)
        : (originalSubmitLabel || submitButton.value);
      return;
    }

    submitButton.textContent = isSubmitting
      ? (submitButton.dataset.submittingLabel || originalSubmitLabel || submitButton.textContent)
      : (originalSubmitLabel || submitButton.textContent);
  }

  function blockIfHoneypotTriggered() {
    if (!honeypotTriggered(form)) return false;
    setStatus('Submission blocked.', 'blocked');
    return true;
  }

  bindNumericInput(form.querySelector('#careerCountryCode'), true);
  bindNumericInput(form.querySelector('#careerNumber'), false);
  bindNumericInput(form.querySelector('#careerZip'), false);

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

      if (blockIfHoneypotTriggered()) {
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

      var opsAssetId = getOpsAssetId();
      if (!opsAssetId) {
        setStatus('Secure intake is temporarily unavailable. Please try again shortly.', 'blocked');
        return;
      }

      var payload = formToPlainObject(form);

      setSubmittingState(true);
      setStatus('Scanning and sanitizing your application...', 'review');

      var response = await fetch(SUBMIT_ENDPOINT, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-ops-asset-id': opsAssetId
        },
        body: JSON.stringify(payload)
      });
      var responsePayload = await parseResponsePayload(response);

      if (!response.ok) {
        throw new Error(getBackendErrorMessage(responsePayload) || 'Secure career relay failed.');
      }

      if (responsePayload && responsePayload.ok === false) {
        throw new Error(getBackendErrorMessage(responsePayload) || 'Secure career relay failed.');
      }

      setStatus('Career application sent securely to Google Sheets intake.', 'success');
      form.reset();
    } catch (error) {
      setStatus((error && error.message) || 'Submission failed. Please try again shortly.', 'blocked');
    } finally {
      setSubmittingState(false);
    }
  });
})();
