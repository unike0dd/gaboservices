(function () {
  function toObject(form) {
    const data = new FormData(form);
    const out = {};
    data.forEach((value, key) => {
      if (Object.prototype.hasOwnProperty.call(out, key)) {
        out[key] = Array.isArray(out[key]) ? out[key].concat(value) : [out[key], value];
        return;
      }
      out[key] = value;
    });
    return out;
  }

  function normalizeOrigin(origin) {
    try {
      return new URL(String(origin || '')).origin.toLowerCase();
    } catch {
      return String(origin || '').trim().replace(/\/$/, '').toLowerCase();
    }
  }

  function resolveAssetId(config) {
    const map = config.originAssetMap && typeof config.originAssetMap === 'object' ? config.originAssetMap : {};
    const key = normalizeOrigin(window.location.origin);
    return String(map[key] || config.defaultAssetId || '').trim();
  }

  function init() {
    const root = document.querySelector('.contact-hub');
    const form = document.getElementById('contactForm');
    const status = document.getElementById('formStatus');
    if (!root || !form || !status) return;

    if (window.GaboFormWorkflow?.create) {
      window.GaboFormWorkflow.create(root, {
        formId: 'contactForm',
        statusId: 'formStatus',
        clearKey: 'contact',
        requiredIds: ['contactFullName', 'contactEmail', 'contactNumber', 'contactMessage'],
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
        extraValidation(context) {
          if (!context.getCheckedValues('input[name="contact_interest[]"]').length) {
            return 'Please select at least one service interest.';
          }
          return '';
        }
      });
    }

    const config = window.SITE_CONTACT_CONFIG || {};
    const intakeBase = String(config.intakeBaseUrl || '').replace(/\/$/, '');
    const submitPath = String(config.submitPath || '/v1/intake/contact');

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const honeypot = form.querySelector('input[name="company_website"]');
      if (honeypot && String(honeypot.value || '').trim()) {
        status.textContent = 'Submission blocked.';
        status.dataset.state = 'blocked';
        return;
      }

      if (!form.checkValidity()) {
        form.reportValidity();
        status.textContent = 'Please complete all required fields before submitting.';
        status.dataset.state = 'blocked';
        return;
      }

      const assetId = resolveAssetId(config);
      if (!assetId) {
        status.textContent = 'Secure form configuration is missing for this origin.';
        status.dataset.state = 'blocked';
        return;
      }

      status.textContent = 'Scanning and sanitizing your request...';
      status.dataset.state = 'review';

      try {
        const response = await fetch(`${intakeBase}${submitPath}`, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-ops-asset-id': assetId,
            'x-gabo-parent-origin': window.location.origin
          },
          body: JSON.stringify(toObject(form))
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || payload?.ok === false) {
          throw new Error(payload?.error || payload?.message || 'Secure form relay failed.');
        }
        form.reset();
        status.textContent = 'Contact request sent securely to Gmail intake.';
        status.dataset.state = 'success';
      } catch (error) {
        status.textContent = error?.message || 'Submission failed. Please try again shortly.';
        status.dataset.state = 'blocked';
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
