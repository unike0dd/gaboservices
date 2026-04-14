(function () {
  var root = document.querySelector('.contact-hub');
  var formWorkflow = window.GaboFormWorkflow;
  if (!root || !formWorkflow || typeof formWorkflow.create !== 'function') return;

  var intakeBase = (window.SITE_METADATA && window.SITE_METADATA.forms && window.SITE_METADATA.forms.intakeBaseUrl) || 'https://solitary-term-4203.rulathemtodos.workers.dev';
  var turnstileSiteKey = (window.SITE_METADATA && window.SITE_METADATA.forms && window.SITE_METADATA.forms.turnstileSiteKey) || '0x4AAAAAAC8lYODpHPQyGH5K';
  var SUBMIT_ENDPOINT = intakeBase.replace(/\/$/, '') + '/submit/contact';
  var REQUIRED_FIELD_IDS = ['contactFullName', 'contactEmail', 'contactNumber', 'contactMessage'];

  function setStatus(message, state) {
    var status = root.querySelector('#formStatus');
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

  var form = root.querySelector('#contactForm');
  if (!form) return;
  bindNumericInput(form.querySelector('#contactCountryCode'), true);
  bindNumericInput(form.querySelector('#contactNumber'), false);
  bindNumericInput(form.querySelector('#contactZip'), false);
  var turnstileWidget = root.querySelector('.cf-turnstile');
  if (turnstileWidget) {
    turnstileWidget.setAttribute('data-sitekey', turnstileSiteKey);
  }

  form.addEventListener('submit', async function (event) {
    event.preventDefault();

    var turnstileTokenInput = form.querySelector('input[name="cf-turnstile-response"]');
    var turnstileWasRequired = !!(turnstileTokenInput && turnstileTokenInput.hasAttribute('required'));
    if (turnstileWasRequired) {
      turnstileTokenInput.removeAttribute('required');
    }
    var formValidityWithoutTurnstile = form.checkValidity();
    if (turnstileWasRequired) {
      turnstileTokenInput.setAttribute('required', 'required');
    }

    if (!formValidityWithoutTurnstile) {
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

    if (!turnstileTokenInput || !String(turnstileTokenInput.value || '').trim()) {
      setStatus('Please complete the Turnstile challenge to continue.', 'blocked');
      return;
    }

    try {
      setStatus('Scanning and sanitizing your request...', 'review');
      var response = await fetch(SUBMIT_ENDPOINT, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(formToPlainObject(form))
      });

      if (!response.ok) {
        throw new Error('Secure contact relay failed.');
      }

      setStatus('Contact request sent securely to Gmail intake.', 'success');
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
