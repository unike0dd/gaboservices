(function () {
  var root = document.querySelector('.contact-hub');
  var formWorkflow = window.GaboFormWorkflow;
  if (!root || !formWorkflow || typeof formWorkflow.create !== 'function') return;

  var intakeBase = (window.SITE_METADATA && window.SITE_METADATA.forms && window.SITE_METADATA.forms.intakeBaseUrl) || 'https://solitary-term-4203.rulathemtodos.workers.dev';
  var turnstileSiteKey = (window.SITE_METADATA && window.SITE_METADATA.forms && window.SITE_METADATA.forms.turnstileSiteKey) || '0x4AAAAAAC8lYODpHPQyGH5K';
  var TURNSTILE_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
  var HONEYPOT_FIELDS = ['company_website'];
  var turnstileLoaderPromise = null;
  var SUBMIT_ENDPOINT = intakeBase.replace(/\/$/, '') + '/submit/contact';
  var REQUIRED_FIELD_IDS = ['contactFullName', 'contactEmail', 'contactNumber', 'contactMessage'];

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

  function isStrictPrivacyModeEnabled() {
    return (
      navigator.globalPrivacyControl === true ||
      navigator.doNotTrack === '1' ||
      window.doNotTrack === '1' ||
      navigator.msDoNotTrack === '1'
    );
  }

  function getTurnstileBlockedMessage() {
    return 'Turnstile verification is blocked by browser tracking prevention. Allow challenges.cloudflare.com for this page, then refresh.';
  }

  function ensureTurnstileLoaded() {
    if (window.turnstile) return Promise.resolve(window.turnstile);
    if (turnstileLoaderPromise) return turnstileLoaderPromise;

    turnstileLoaderPromise = new Promise(function (resolve, reject) {
      var existingScript = document.querySelector('script[src="' + TURNSTILE_SRC + '"]');
      if (existingScript) {
        existingScript.addEventListener('load', function () { resolve(window.turnstile); }, { once: true });
        existingScript.addEventListener('error', function () { reject(new Error('Unable to load Turnstile challenge script.')); }, { once: true });
        return;
      }

      var script = document.createElement('script');
      script.src = TURNSTILE_SRC;
      script.async = true;
      script.defer = true;
      script.onload = function () { resolve(window.turnstile); };
      script.onerror = function () { reject(new Error('Unable to load Turnstile challenge script.')); };
      document.head.appendChild(script);
    }).catch(function (error) {
      turnstileLoaderPromise = null;
      throw error;
    });

    return turnstileLoaderPromise;
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
    if (isStrictPrivacyModeEnabled()) {
      setStatus(getTurnstileBlockedMessage(), 'blocked');
      return;
    }
    var lazyLoadTurnstile = function () {
      ensureTurnstileLoaded().catch(function () {
        setStatus(getTurnstileBlockedMessage(), 'blocked');
      });
    };
    form.addEventListener('focusin', lazyLoadTurnstile, { once: true });
    form.addEventListener('pointerdown', lazyLoadTurnstile, { once: true });
    window.setTimeout(function () {
      if (!window.turnstile && !form.querySelector('input[name="cf-turnstile-response"]')) {
        setStatus(
          getTurnstileBlockedMessage(),
          'blocked'
        );
      }
    }, 3500);
  }

  form.addEventListener('submit', async function (event) {
    event.preventDefault();

    if (honeypotTriggered(form)) {
      setStatus('Submission blocked.', 'blocked');
      return;
    }

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
      if (!window.turnstile) {
        setStatus(getTurnstileBlockedMessage(), 'blocked');
        return;
      }
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
