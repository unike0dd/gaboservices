(function () {
  var root = document.querySelector('.contact-hub');
  var formWorkflow = window.GaboFormWorkflow;
  if (!root || !formWorkflow || typeof formWorkflow.create !== 'function') return;

  var intakeBase = (window.SITE_METADATA && window.SITE_METADATA.forms && window.SITE_METADATA.forms.intakeBaseUrl) || 'https://solitary-term-4203.rulathemtodos.workers.dev';
  var HONEYPOT_FIELDS = ['portfolio_url'];
  var SUBMIT_ENDPOINT = intakeBase.replace(/\/$/, '') + '/submit/careers';
  var originAssetMap =
    (window.SITE_METADATA && window.SITE_METADATA.forms && window.SITE_METADATA.forms.originAssetMap) ||
    (window.SITE_METADATA && window.SITE_METADATA.chatbot && window.SITE_METADATA.chatbot.originAssetMap) ||
    {};
  var REQUIRED_FIELD_IDS = ['careerFullName', 'careerEmail', 'careerCountryCode', 'careerNumber', 'careerCity', 'careerState', 'careerZip', 'careerAvailability'];

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

  function getOpsAssetId() {
    return String(originAssetMap[window.location.origin] || '').trim();
  }




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

  var form = root.querySelector('#careerForm');
  if (!form) return;
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

    try {
      setStatus('Scanning and sanitizing your application...', 'review');
      var payload = formToPlainObject(form);
      var submitAttempt = async function (activePayload) {
        return fetch(SUBMIT_ENDPOINT, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-ops-asset-id': opsAssetId
          },
          body: JSON.stringify(activePayload)
        });
      };
      var response = await submitAttempt(payload);
      var responsePayload = await parseResponsePayload(response);

      if (!response.ok) {
        throw new Error('Secure career relay failed.');
      }

      setStatus('Career application sent securely to Google Sheets intake.', 'success');
      form.reset();
    } catch (error) {
      setStatus('Submission failed. Please try again shortly.', 'blocked');
    }
  });
})();
