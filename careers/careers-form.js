(function () {
  var root = document.querySelector('.contact-hub');
  var formWorkflow = window.GaboFormWorkflow;
  if (!root || !formWorkflow || typeof formWorkflow.create !== 'function') return;

  var intakeBase = (window.SITE_METADATA && window.SITE_METADATA.forms && window.SITE_METADATA.forms.intakeBaseUrl) || 'https://solitary-term-4203.rulathemtodos.workers.dev';
  var turnstileSiteKey = (window.SITE_METADATA && window.SITE_METADATA.forms && window.SITE_METADATA.forms.turnstileSiteKey) || '0x4AAAAAAC8lYODpHPQyGH5K';
  var SUBMIT_ENDPOINT = intakeBase.replace(/\/$/, '') + '/submit/careers';
  var REQUIRED_FIELD_IDS = ['careerFullName', 'careerEmail', 'careerCountryCode', 'careerNumber', 'careerCity', 'careerState', 'careerZip', 'careerAvailability'];

  function setStatus(message, state) {
    var status = root.querySelector('#careerFormStatus');
    if (!status) return;
    status.textContent = message;
    status.dataset.state = state || '';
  }

  function getInvalidFieldNames(form, fieldIds) {
    return (fieldIds || []).map(function (fieldId) {
      var field = form.querySelector('#' + fieldId);
      if (!field || typeof field.checkValidity !== 'function' || field.checkValidity()) return '';
      var label = form.querySelector('label[for="' + field.id + '"]');
      return (label && label.textContent && label.textContent.trim()) || field.name || field.id || 'Field';
    }).filter(Boolean);
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
  bindNumericInput(form.querySelector('#careerCountryCode'), true);
  bindNumericInput(form.querySelector('#careerNumber'), false);
  bindNumericInput(form.querySelector('#careerZip'), false);
  var turnstileWidget = root.querySelector('.cf-turnstile');
  if (turnstileWidget) {
    turnstileWidget.setAttribute('data-sitekey', turnstileSiteKey);
  }

  form.addEventListener('submit', async function (event) {
    event.preventDefault();

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

    var turnstileTokenInput = form.querySelector('input[name="cf-turnstile-response"]');
    if (!turnstileTokenInput || !String(turnstileTokenInput.value || '').trim()) {
      setStatus('Please complete the Turnstile challenge to continue.', 'blocked');
      return;
    }

    try {
      setStatus('Scanning and sanitizing your application...', 'review');
      var response = await fetch(SUBMIT_ENDPOINT, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(formToPlainObject(form))
      });

      if (!response.ok) {
        throw new Error('Secure career relay failed.');
      }

      setStatus('Career application sent securely to Google Sheets intake.', 'success');
      form.reset();
      if (window.turnstile && turnstileWidget) {
        window.turnstile.reset(turnstileWidget);
      }
    } catch (error) {
      setStatus('Submission failed. Please try again shortly.', 'blocked');
      if (window.turnstile && turnstileWidget) {
        window.turnstile.reset(turnstileWidget);
      }
    }
  });
})();
