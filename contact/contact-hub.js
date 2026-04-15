(function () {
  var root = document.querySelector('.contact-hub');
  var formWorkflow = window.GaboFormWorkflow;
  if (!root || !formWorkflow || typeof formWorkflow.create !== 'function') return;

  var intakeBase = (window.SITE_METADATA && window.SITE_METADATA.forms && window.SITE_METADATA.forms.intakeBaseUrl) || 'https://solitary-term-4203.rulathemtodos.workers.dev';
  var turnstileSiteKey = (window.SITE_METADATA && window.SITE_METADATA.forms && window.SITE_METADATA.forms.turnstileSiteKey) || '0x4AAAAAAC8lYODpHPQyGH5K';
  var TURNSTILE_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
  var HONEYPOT_FIELDS = ['company_website'];
  var SUBMIT_ENDPOINT = intakeBase.replace(/\/$/, '') + '/submit/contact';
  var originAssetMap =
    (window.SITE_METADATA && window.SITE_METADATA.forms && window.SITE_METADATA.forms.originAssetMap) ||
    (window.SITE_METADATA && window.SITE_METADATA.chatbot && window.SITE_METADATA.chatbot.originAssetMap) ||
    {};
  var REQUIRED_FIELD_IDS = ['contactFullName', 'contactEmail', 'contactNumber', 'contactMessage'];
  var TURNSTILE_BASE_WAIT_MS = 12000;
  var TURNSTILE_ACTIVE_INTERACTION_GRACE_MS = 4000;
  var lastInteractionAt = 0;
  var turnstileReadinessPoller = null;

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

  function getTurnstileBlockedMessage() {
    return 'Turnstile verification is blocked by browser tracking prevention. Allow challenges.cloudflare.com for this page, then refresh.';
  }

  function isStrictPrivacyModeEnabled() {
    return (
      navigator.globalPrivacyControl === true ||
      navigator.doNotTrack === '1' ||
      window.doNotTrack === '1'
    );
  }

  function trackInteraction() {
    lastInteractionAt = Date.now();
  }

  function isTurnstileReady(form) {
    return !!(
      window.turnstile ||
      form.querySelector('input[name="cf-turnstile-response"]') ||
      form.querySelector('.cf-turnstile iframe')
    );
  }

  function readTurnstileToken(form, callbackToken) {
    var callbackValue = String(callbackToken || '').trim();
    if (callbackValue) return callbackValue;
    var tokenInput =
      form.querySelector('input[name="cf-turnstile-response"]') ||
      form.querySelector('input[name="cf_turnstile_response"]');
    return String((tokenInput && tokenInput.value) || '').trim();
  }

  function shouldResetAndRetry(responseStatus, responsePayload) {
    if (responseStatus === 403) return true;
    var message = String(
      (responsePayload && responsePayload.error) ||
      (responsePayload && responsePayload.detail) ||
      ''
    ).toLowerCase();
    return /(timeout-or-duplicate|expired|invalid input response|token|turnstile)/.test(message);
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

  async function refreshTurnstileToken(form, turnstileWidget) {
    if (!window.turnstile || !turnstileWidget) return '';
    window.turnstile.reset(turnstileWidget);
    if (typeof window.turnstile.execute === 'function') {
      try {
        window.turnstile.execute(turnstileWidget);
      } catch (error) {
        return '';
      }
    }
    var maxChecks = 12;
    for (var i = 0; i < maxChecks; i += 1) {
      var refreshed = readTurnstileToken(form, '');
      if (refreshed) return refreshed;
      await new Promise(function (resolve) { window.setTimeout(resolve, 350); });
    }
    return '';
  }

  function monitorTurnstileReadiness(form) {
    if (isTurnstileReady(form)) return;

    if (isStrictPrivacyModeEnabled()) {
      setStatus('We are checking interaction. Please wait for the green check confirmation.', 'review');
    }

    var startedAt = Date.now();
    var pollIntervalMs = 500;
    if (turnstileReadinessPoller) {
      window.clearInterval(turnstileReadinessPoller);
    }

    turnstileReadinessPoller = window.setInterval(function () {
      if (isTurnstileReady(form)) {
        window.clearInterval(turnstileReadinessPoller);
        turnstileReadinessPoller = null;
        return;
      }

      var elapsed = Date.now() - startedAt;
      var recentInteraction = lastInteractionAt && (Date.now() - lastInteractionAt) < TURNSTILE_ACTIVE_INTERACTION_GRACE_MS;
      if (recentInteraction) {
        startedAt = Date.now();
        return;
      }

      if (elapsed >= TURNSTILE_BASE_WAIT_MS) {
        window.clearInterval(turnstileReadinessPoller);
        turnstileReadinessPoller = null;
        setStatus(
          isStrictPrivacyModeEnabled()
            ? 'We are checking interaction. Please wait for the green check confirmation.'
            : getTurnstileBlockedMessage(),
          'blocked'
        );
      }
    }, pollIntervalMs);
  }

  function ensureTurnstileLoaded() {
    if (window.turnstile) return Promise.resolve(window.turnstile);
    return new Promise(function (resolve, reject) {
      var existingScript = document.querySelector('script[src="' + TURNSTILE_SRC + '"]');
      if (!existingScript) {
        reject(new Error('Unable to load Turnstile challenge script.'));
        return;
      }
      existingScript.addEventListener('load', function () { resolve(window.turnstile); }, { once: true });
      existingScript.addEventListener('error', function () { reject(new Error('Unable to load Turnstile challenge script.')); }, { once: true });
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
  function blockIfHoneypotTriggered() {
    if (!honeypotTriggered(form)) return false;
    setStatus('Submission blocked.', 'blocked');
    return true;
  }
  bindNumericInput(form.querySelector('#contactCountryCode'), true);
  bindNumericInput(form.querySelector('#contactNumber'), false);
  bindNumericInput(form.querySelector('#contactZip'), false);
  ['focusin', 'pointerdown', 'keydown', 'input', 'change'].forEach(function (eventName) {
    form.addEventListener(eventName, trackInteraction, { passive: true });
  });
  var turnstileWidget = root.querySelector('.cf-turnstile');
  var callbackToken = '';
  var turnstileUnavailable = false;
  if (turnstileWidget) {
    turnstileWidget.setAttribute('data-sitekey', turnstileSiteKey);
    turnstileWidget.setAttribute('data-callback', 'onContactTurnstileComplete');
    turnstileWidget.setAttribute('data-expired-callback', 'onContactTurnstileExpired');
    turnstileWidget.setAttribute('data-timeout-callback', 'onContactTurnstileExpired');
    window.onContactTurnstileComplete = function (token) {
      callbackToken = String(token || '').trim();
    };
    window.onContactTurnstileExpired = function () {
      callbackToken = '';
      if (window.turnstile && turnstileWidget) {
        window.turnstile.reset(turnstileWidget);
      }
      setStatus('Turnstile check expired. Please complete it again.', 'blocked');
    };
    if (isStrictPrivacyModeEnabled()) {
      turnstileUnavailable = true;
      setStatus(getTurnstileBlockedMessage(), 'blocked');
      turnstileWidget.setAttribute('aria-hidden', 'true');
    }
    var lazyLoadTurnstile = function () {
      if (turnstileUnavailable) return;
      ensureTurnstileLoaded().catch(function () {
        turnstileUnavailable = true;
        setStatus(getTurnstileBlockedMessage(), 'blocked');
      });
    };
    form.addEventListener('focusin', lazyLoadTurnstile, { once: true });
    form.addEventListener('pointerdown', lazyLoadTurnstile, { once: true });
    form.addEventListener('submit', lazyLoadTurnstile, { once: true });
    window.setTimeout(function () {
      if (turnstileUnavailable && !window.turnstile && !form.querySelector('input[name="cf-turnstile-response"]')) {
        setStatus(
          getTurnstileBlockedMessage(),
          'blocked'
        );
      }
    }, 3500);
  }

  form.addEventListener('submit', async function (event) {
    event.preventDefault();

    if (blockIfHoneypotTriggered()) {
      return;
    }

    var turnstileTokenInput =
      form.querySelector('input[name="cf-turnstile-response"]') ||
      form.querySelector('input[name="cf_turnstile_response"]');
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

    var token = readTurnstileToken(form, callbackToken);
    if (!token) {
      if (!window.turnstile) {
        monitorTurnstileReadiness(form);
        return;
      }
      setStatus('Please complete the Turnstile challenge to continue.', 'blocked');
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
      payload.turnstileToken = token;
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
      if (!response.ok && shouldResetAndRetry(response.status, responsePayload) && window.turnstile && turnstileWidget) {
        callbackToken = '';
        var refreshedToken = await refreshTurnstileToken(form, turnstileWidget);
        if (refreshedToken) {
          payload.turnstileToken = refreshedToken;
          response = await submitAttempt(payload);
          responsePayload = await parseResponsePayload(response);
        }
      }
      if (!response.ok) {
        throw new Error('Secure contact relay failed.');
      }

      setStatus('Contact request sent securely to Gmail intake.', 'success');
      form.reset();
      callbackToken = '';
      if (window.turnstile && turnstileWidget) {
        window.turnstile.reset(turnstileWidget);
      }
    } catch (error) {
      setStatus('Submission failed. Please try again shortly.', 'blocked');
      callbackToken = '';
      if (window.turnstile && turnstileWidget) {
        window.turnstile.reset(turnstileWidget);
      }
    }
  });

})();
