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

  function setSubmittingState(submitButton, isSubmitting, originalSubmitLabel) {
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

  function getOpsAssetId(originAssetMap) {
    return String((originAssetMap && originAssetMap[window.location.origin]) || '').trim();
  }

  function honeypotTriggered(form, fields) {
    return (fields || []).some(function (name) {
      var input = form.querySelector('input[name="' + name + '"]');
      return !!(input && String(input.value || '').trim());
    });
  }

  async function submitJson(options) {
    var response = await fetch(options.endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-ops-asset-id': options.opsAssetId
      },
      body: JSON.stringify(options.payload)
    });

    var responsePayload = await parseResponsePayload(response);

    if (!response.ok) {
      throw new Error(getBackendErrorMessage(responsePayload) || options.fallbackErrorMessage || 'Secure relay failed.');
    }

    if (responsePayload && responsePayload.ok === false) {
      throw new Error(getBackendErrorMessage(responsePayload) || options.fallbackErrorMessage || 'Secure relay failed.');
    }

    return responsePayload;
  }

  window.GaboFormSubmitCore = {
    formToPlainObject: formToPlainObject,
    parseResponsePayload: parseResponsePayload,
    getBackendErrorMessage: getBackendErrorMessage,
    bindNumericInput: bindNumericInput,
    setSubmittingState: setSubmittingState,
    getOpsAssetId: getOpsAssetId,
    honeypotTriggered: honeypotTriggered,
    submitJson: submitJson
  };
})();
