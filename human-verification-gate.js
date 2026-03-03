const TURNSTILE_SITE_KEY = '0x4AAAAAAClznmpo7ljP9CE1';
const CHALLENGE_TIMEOUT_MS = 45000;
const HUMAN_VERIFIED_KEY = 'gs_human_verified_v1';
const NEXT_PARAM = 'next';

const state = {
  readyAt: Date.now(),
  blocked: false,
  verified: false,
  widgetId: null,
  overlay: null,
  status: null,
  honeypotFields: []
};

function blockAndToss(reason) {
  if (state.blocked) return;
  state.blocked = true;
  document.body.classList.add('human-check-blocked');
  if (state.status) {
    state.status.dataset.state = 'blocked';
    state.status.textContent = 'Verification blocked due to suspicious activity. Interaction has been rejected.';
  }
  console.warn('[HumanGate] Blocked interaction:', reason);
}

function createOverlay() {
  const overlay = document.createElement('section');
  overlay.className = 'human-gate-overlay';
  overlay.setAttribute('aria-live', 'polite');
  overlay.innerHTML = `
    <div class="human-gate-card" role="dialog" aria-modal="true" aria-labelledby="humanGateTitle">
      <h1 id="humanGateTitle">Welcome to Gabriel Services</h1>
      <p>Please verify that you are human to continue to the landing page.</p>
      <form id="humanGateForm" novalidate>
        <div class="hp-container" aria-hidden="true">
          <label>Leave this empty <input class="hp-field" type="text" name="middle_name" autocomplete="off" tabindex="-1"></label>
          <label>Leave this empty <input class="hp-field" type="text" name="website_url" autocomplete="off" tabindex="-1"></label>
          <label>Leave this empty <input class="hp-field" type="text" name="campaign_ref" autocomplete="off" tabindex="-1"></label>
        </div>
        <div id="turnstileMount" class="cf-turnstile" data-sitekey="${TURNSTILE_SITE_KEY}" data-theme="light"></div>
      </form>
      <p id="humanGateStatus" class="human-gate-status">Running security checks…</p>
    </div>
  `;

  document.body.prepend(overlay);
  state.overlay = overlay;
  state.status = overlay.querySelector('#humanGateStatus');
  state.honeypotFields = [...overlay.querySelectorAll('.hp-field')];
}

function monitorHoneypots() {
  state.honeypotFields.forEach((field) => {
    field.addEventListener('input', () => {
      if (field.value.trim().length > 0) {
        blockAndToss('honeypot_filled');
      }
    });
  });

}

function releasePage() {
  state.verified = true;
  sessionStorage.setItem(HUMAN_VERIFIED_KEY, 'ok');
  document.body.classList.remove('human-check-required');
  if (state.status) {
    state.status.dataset.state = 'ok';
    state.status.textContent = 'Verification complete. Loading site…';
  }

  const nextValue = new URLSearchParams(window.location.search).get(NEXT_PARAM);
  const safeNext = nextValue && nextValue.startsWith('/') ? nextValue : '/';

  window.setTimeout(() => {
    window.location.replace(safeNext);
  }, 350);
}

function mountTurnstile() {
  if (!window.turnstile || state.blocked) {
    blockAndToss('turnstile_unavailable');
    return;
  }

  state.status.textContent = 'Complete the human check to continue.';

  state.widgetId = window.turnstile.render('#turnstileMount', {
    sitekey: TURNSTILE_SITE_KEY,
    callback: () => {
      if (!state.blocked) {
        releasePage();
      }
    },
    'error-callback': () => {
      blockAndToss('turnstile_error');
    },
    'expired-callback': () => {
      if (state.status && !state.verified) {
        state.status.dataset.state = 'blocked';
        state.status.textContent = 'Verification expired. Reload and try again.';
      }
    }
  });

  window.setTimeout(() => {
    if (!state.verified && !state.blocked) {
      blockAndToss('turnstile_timeout');
    }
  }, CHALLENGE_TIMEOUT_MS);
}

function initHumanGate() {
  document.body.classList.add('human-check-required');
  createOverlay();
  monitorHoneypots();
  mountTurnstile();
}

window.addEventListener('DOMContentLoaded', initHumanGate, { once: true });
