const TURNSTILE_SITE_KEY = '0x4AAAAAACmn2SujEOLKGdSU';
const TURNSTILE_SELECTOR = '#contactForm, #joinForm';

function getStatusNode(form) {
  return form.querySelector('#formStatus, #joinFormStatus');
}

function setStatus(form, message, state = 'blocked') {
  const status = getStatusNode(form);
  if (!status) return;
  status.textContent = message;
  status.dataset.state = state;
}

function mountTurnstileForForm(form) {
  if (!window.turnstile) {
    setStatus(form, 'Human verification is unavailable. Please refresh and try again.');
    return;
  }

  const controlsRow = form.querySelector('button[type="submit"]')?.closest('.secure-actions') || form;
  const mount = document.createElement('div');
  mount.className = 'turnstile-inline-mount';
  mount.setAttribute('aria-label', 'Cloudflare security check');

  controlsRow.parentNode.insertBefore(mount, controlsRow);

  const verificationState = { token: '', widgetId: null };

  verificationState.widgetId = window.turnstile.render(mount, {
    sitekey: TURNSTILE_SITE_KEY,
    callback: (token) => {
      verificationState.token = token || '';
      form.dataset.turnstileVerified = verificationState.token ? 'true' : 'false';
      if (verificationState.token) {
        setStatus(form, 'Human verification complete.', 'ok');
      }
    },
    'expired-callback': () => {
      verificationState.token = '';
      form.dataset.turnstileVerified = 'false';
      setStatus(form, 'Verification expired. Please complete the challenge again.');
    },
    'error-callback': () => {
      verificationState.token = '';
      form.dataset.turnstileVerified = 'false';
      setStatus(form, 'Verification failed. Please retry the challenge.');
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
