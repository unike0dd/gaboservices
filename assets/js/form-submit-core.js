(function () {
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

  function parseResponsePayload(response) {
    var contentType = String(response.headers.get('content-type') || '').toLowerCase();
    if (contentType.indexOf('application/json') >= 0) {
      return response.json();
    }

    return response.text().then(function (text) {
      return { detail: text };
    });
  }

  function getBackendErrorMessage(payload) {
    if (!payload || typeof payload !== 'object') return '';
    return String(payload.error || payload.message || payload.detail || '').trim();
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

  function getOpsAssetId(originAssetMap) {
    return String((originAssetMap && originAssetMap[window.location.origin]) || '').trim();
  }

  function honeypotTriggered(form, honeypotFields) {
    return (honeypotFields || []).some(function (name) {
      var input = form.querySelector('input[name="' + name + '"]');
      return !!(input && String(input.value || '').trim());
    });
  }

  function getInvalidFieldNames(form) {
    return Array.from(form.querySelectorAll(':invalid')).map(function (field) {
      if (!field.id) return field.name || 'Field';
      var label = form.querySelector('label[for="' + field.id + '"]');
      return (label && label.textContent && label.textContent.trim()) || field.name || field.id;
    });
  }

  function setSubmittingState(submitButton, state) {
    if (!submitButton) return;

    var isSubmitting = !!state.isSubmitting;
    var originalLabel = state.originalLabel || '';

    submitButton.disabled = isSubmitting;

    if (submitButton.hasAttribute('aria-busy')) {
      submitButton.setAttribute('aria-busy', isSubmitting ? 'true' : 'false');
    }

    if (submitButton.tagName === 'INPUT') {
      submitButton.value = isSubmitting
        ? (submitButton.dataset.submittingLabel || originalLabel || submitButton.value)
        : (originalLabel || submitButton.value);
      return;
    }

    submitButton.textContent = isSubmitting
      ? (submitButton.dataset.submittingLabel || originalLabel || submitButton.textContent)
      : (originalLabel || submitButton.textContent);
  }

  function resolveOriginAssetMap(siteMetadata) {
    var formsMap = siteMetadata && siteMetadata.forms && siteMetadata.forms.originAssetMap;
    if (formsMap && typeof formsMap === 'object') {
      return formsMap;
    }

    // Temporary fallback for compatibility while all environments migrate to SITE_METADATA.forms.originAssetMap.
    var chatbotMap = siteMetadata && siteMetadata.chatbot && siteMetadata.chatbot.originAssetMap;
    return chatbotMap && typeof chatbotMap === 'object' ? chatbotMap : {};
  }

  function createSubmitHandler(options) {
    var root = options.root;
    var form = options.form;
    var submitButton = options.submitButton;
    var submitEndpoint = options.submitEndpoint;
    var honeypotFields = options.honeypotFields || [];
    var originAssetMap = options.originAssetMap || {};
    var onStatus = options.onStatus;
    var onValidate = options.onValidate;
    var onSuccess = options.onSuccess;
    var onBeforeSubmit = options.onBeforeSubmit;
    var onAfterSubmit = options.onAfterSubmit;

    var state = {
      submitInFlight: false,
      originalLabel: submitButton
        ? (submitButton.tagName === 'INPUT' ? submitButton.value : submitButton.textContent)
        : '',
    };

    return async function handleSubmit(event) {
      event.preventDefault();
      if (state.submitInFlight) return;

      try {
        if (!form || !submitButton) {
          onStatus('Submission failed. Please refresh and try again.', 'blocked');
          return;
        }

        if (honeypotTriggered(form, honeypotFields)) {
          onStatus('Submission blocked.', 'blocked');
          return;
        }

        if (!form.checkValidity()) {
          var invalidFields = getInvalidFieldNames(form);
          if (invalidFields.length) {
            onStatus('Please complete all required fields: ' + invalidFields.join(', ') + '.', 'blocked');
            form.querySelector(':invalid').focus();
          } else {
            onStatus('Please complete all required fields.', 'blocked');
          }
          return;
        }

        if (typeof onValidate === 'function') {
          var validationMessage = onValidate({ root: root, form: form });
          if (validationMessage) {
            onStatus(validationMessage, 'blocked');
            return;
          }
        }

        var opsAssetId = getOpsAssetId(originAssetMap);
        if (!opsAssetId) {
          onStatus('Secure intake is temporarily unavailable. Please try again shortly.', 'blocked');
          return;
        }

        var payload = formToPlainObject(form);

        if (typeof onBeforeSubmit === 'function') {
          onBeforeSubmit({ root: root, form: form, payload: payload });
        }

        state.submitInFlight = true;
        setSubmittingState(submitButton, { isSubmitting: true, originalLabel: state.originalLabel });

        var response = await fetch(submitEndpoint, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-ops-asset-id': opsAssetId,
          },
          body: JSON.stringify(payload),
        });

        var responsePayload = await parseResponsePayload(response);

        if (!response.ok || (responsePayload && responsePayload.ok === false)) {
          throw new Error(getBackendErrorMessage(responsePayload) || 'Secure form relay failed.');
        }

        if (typeof onSuccess === 'function') {
          onSuccess({ root: root, form: form, payload: payload, responsePayload: responsePayload });
        }
      } catch (error) {
        onStatus((error && error.message) || 'Submission failed. Please try again shortly.', 'blocked');
      } finally {
        state.submitInFlight = false;
        setSubmittingState(submitButton, { isSubmitting: false, originalLabel: state.originalLabel });
        if (typeof onAfterSubmit === 'function') {
          onAfterSubmit({ root: root, form: form });
        }
      }
    };
  }

  window.GaboFormSubmitCore = {
    bindNumericInput: bindNumericInput,
    createSubmitHandler: createSubmitHandler,
    resolveOriginAssetMap: resolveOriginAssetMap,
    formToPlainObject: formToPlainObject,
    parseResponsePayload: parseResponsePayload,
    getBackendErrorMessage: getBackendErrorMessage,
    getOpsAssetId: getOpsAssetId,
    honeypotTriggered: honeypotTriggered,
    setSubmittingState: setSubmittingState,
  };
})();
