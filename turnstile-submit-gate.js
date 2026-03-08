const TURNSTILE_SITE_KEY = '0x4AAAAAACmn2SujEOLKGdSU';
const TURNSTILE_SELECTOR = '#contactForm, #joinForm';
const TURNSTILE_RESPONSE_FIELD = 'cf-turnstile-response';

function getStatusNode(form) {
  return form.querySelector('#formStatus, #joinFormStatus');
}

function setStatus(form, message, state = 'blocked') {
  const status = getStatusNode(form);
  if (!status) return;
  status.textContent = message;
  status.dataset.state = state;
}

function getSubmitAnchor(form) {
  const submitButton = form.querySelector('button[type="submit"]');
  if (!submitButton) return form;
  return submitButton.closest('.secure-actions') || submitButton;
}

function ensureResponseField(form) {
  let tokenField = form.querySelector(`input[name="${TURNSTILE_RESPONSE_FIELD}"]`);
  if (!tokenField) {
    tokenField = document.createElement('input');
    tokenField.type = 'hidden';
    tokenField.name = TURNSTILE_RESPONSE_FIELD;
    form.appendChild(tokenField);
  }
  return tokenField;
}

function mountTurnstileForForm(form) {
  if (!window.turnstile) {
    setStatus(form, 'Human verification is unavailable. Please refresh and try again.');
    return;
  }

  const anchor = getSubmitAnchor(form);
  const mount = document.createElement('div');
  mount.className = 'turnstile-inline-mount';
  mount.setAttribute('aria-label', 'Cloudflare security check');

  anchor.parentNode.insertBefore(mount, anchor);

  const tokenField = ensureResponseField(form);
  const verificationState = { token: '', widgetId: null };

  verificationState.widgetId = window.turnstile.render(mount, {
    sitekey: TURNSTILE_SITE_KEY,
    callback: (token) => {
      verificationState.token = token || '';
      tokenField.value = verificationState.token;
      form.dataset.turnstileVerified = verificationState.token ? 'true' : 'false';
      if (verificationState.token) {
        setStatus(form, 'Human verification complete.', 'ok');
      }
    },
    'expired-callback': () => {
      verificationState.token = '';
      tokenField.value = '';
      form.dataset.turnstileVerified = 'false';
      setStatus(form, 'Verification expired. Please complete the challenge again.');
    },
    'error-callback': () => {
      verificationState.token = '';
      tokenField.value = '';
      form.dataset.turnstileVerified = 'false';
      setStatus(form, 'Verification failed. Please retry the challenge.');
    }
  });

  form.addEventListener('reset', () => {
    verificationState.token = '';
    tokenField.value = '';
    form.dataset.turnstileVerified = 'false';
    if (verificationState.widgetId !== null) {
      window.turnstile.reset(verificationState.widgetId);
    }
  });

  form.addEventListener('submit', (event) => {
    if (verificationState.token) return;

    event.preventDefault();
    event.stopPropagation();
    setStatus(form, 'Please complete the human verification challenge before submitting.');
  }, true);
}

function initSubmitTimeTurnstile() {
  document.querySelectorAll(TURNSTILE_SELECTOR).forEach((form) => {
    mountTurnstileForForm(form);
  });
}

window.addEventListener('DOMContentLoaded', initSubmitTimeTurnstile, { once: true });
