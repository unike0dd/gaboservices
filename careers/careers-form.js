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
    const form = document.getElementById('careersForm');
    const status = document.getElementById('careerFormStatus');
    if (!root || !form || !status) return;

    if (window.GaboFormWorkflow?.create) {
      window.GaboFormWorkflow.create(root, {
        formId: 'careersForm',
        statusId: 'careerFormStatus',
        clearKey: 'career',
        requiredIds: ['careerFullName', 'careerEmail', 'careerCountryCode', 'careerNumber', 'careerCity', 'careerState', 'careerZip', 'careerAvailability'],
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
        extraValidation(context) {
          if (!context.getCheckedValues('input[name="career_interest[]"]').length) {
            return 'Please select at least one career area of interest.';
          }
          return '';
        }
      });
    }

    const config = window.SITE_CAREERS_CONFIG || {};
    const intakeBase = String(config.intakeBaseUrl || '').replace(/\/$/, '');
    const submitPath = String(config.submitPath || '/v1/intake/careers');

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const honeypot = form.querySelector('input[name="portfolio_url"]');
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

      status.textContent = 'Scanning and sanitizing your application...';
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
        status.textContent = 'Career application sent securely to Google Sheets intake.';
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
