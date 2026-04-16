(function () {
  var root = document.querySelector('.contact-hub');
  var formWorkflow = window.GaboFormWorkflow;
  if (!root) return;
  var hasFormWorkflow = !!(formWorkflow && typeof formWorkflow.create === 'function');

  var intakeBase = (window.SITE_METADATA && window.SITE_METADATA.forms && window.SITE_METADATA.forms.intakeBaseUrl) || 'https://solitary-term-4203.rulathemtodos.workers.dev';
  var HONEYPOT_FIELDS = ['company_website'];
  var SUBMIT_ENDPOINT = intakeBase.replace(/\/$/, '') + '/submit/contact';
  var originAssetMap =
    (window.SITE_METADATA && window.SITE_METADATA.forms && window.SITE_METADATA.forms.originAssetMap) ||
    (window.SITE_METADATA && window.SITE_METADATA.chatbot && window.SITE_METADATA.chatbot.originAssetMap) ||
    {};
  var REQUIRED_FIELD_IDS = ['contactFullName', 'contactEmail', 'contactNumber', 'contactMessage'];
  var turnstileState = {
    widgetId: null,
    settlePending: null
  };

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

  function getTurnstileToken(form) {
    var tokenInput = form.querySelector('input[name="cf-turnstile-response"]');
    return String((tokenInput && tokenInput.value) || '').trim();
  }

  async function parseResponsePayload(response) {
    var contentType = String(response.headers.get('content-type') || '').toLowerCase();
    if (contentType.indexOf('application/json') >= 0) {
      try {
        return await response.json();
      } catch (error) {
        return null;
      }
    }
    try {
      var text = await response.text();
      return { detail: text };
    } catch (error) {
      return null;
    }
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

  function blockIfHoneypotTriggered() {
    if (!honeypotTriggered(form)) return false;
    setStatus('Submission blocked.', 'blocked');
    return true;
  }

  bindNumericInput(form.querySelector('#contactCountryCode'), true);
  bindNumericInput(form.querySelector('#contactNumber'), false);
  bindNumericInput(form.querySelector('#contactZip'), false);
  mountTurnstile(form);

  form.addEventListener('submit', async function (event) {
    event.preventDefault();

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

    if (!root.querySelectorAll('input[name="contact_interest[]"]:checked').length) {
      setStatus('Please select at least one area of interest.', 'blocked');
      return;
    }

    var turnstileToken = getTurnstileToken(form);
    if (!turnstileToken) {
      setStatus('Please complete the Turnstile challenge before submitting.', 'blocked');
      return;
    }

    var opsAssetId = getOpsAssetId();
    if (!opsAssetId) {
      setStatus('Secure intake is temporarily unavailable. Please try again shortly.', 'blocked');
      return;
    }

    try {
      setStatus('Scanning and sanitizing your request...', 'review');
      var payload = formToPlainObject(form);
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
        throw new Error((responsePayload && responsePayload.error) || 'Secure contact relay failed.');
      }

      setStatus('Contact request sent securely to Gmail intake.', 'success');
      form.reset();
    } catch (error) {
      setStatus('Submission failed. Please try again shortly.', 'blocked');
    }
  });
})();
