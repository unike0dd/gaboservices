const TURNSTILE_SITE_KEY = '0x4AAAAAACmn2SujEOLKGdSU';
const CHALLENGE_TIMEOUT_MS = 45000;
const TURNSTILE_BOOT_TIMEOUT_MS = 8000;
const TURNSTILE_RETRY_INTERVAL_MS = 200;

const state = {
  readyAt: Date.now(),
  blocked: false,
  verified: false,
  widgetId: null,
  overlay: null,
  status: null,
  honeypotFields: [],
  turnstileBootTimer: null,
  turnstilePollTimer: null
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

  const fastInteraction = Date.now() - state.readyAt;
  if (fastInteraction < 700) {
    blockAndToss('interaction_too_fast');
  }
}

function releasePage() {
  state.verified = true;
  document.body.classList.remove('human-check-required');
  if (state.status) {
    state.status.dataset.state = 'ok';
    state.status.textContent = 'Verification complete. Loading site…';
  }

  if (state.turnstilePollTimer) window.clearInterval(state.turnstilePollTimer);
  if (state.turnstileBootTimer) window.clearTimeout(state.turnstileBootTimer);

  window.setTimeout(() => {
    state.overlay?.remove();
  }, 350);
}

function mountTurnstile() {
  if (!window.turnstile || state.blocked) {
    return false;
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

  return true;
}

function bootTurnstileWhenReady() {
  state.status.textContent = 'Loading human verification challenge…';

  state.turnstileBootTimer = window.setTimeout(() => {
    if (!state.verified && !state.blocked && !window.turnstile) {
      blockAndToss('turnstile_unavailable');
    }
  }, TURNSTILE_BOOT_TIMEOUT_MS);

  state.turnstilePollTimer = window.setInterval(() => {
    if (state.verified || state.blocked) {
      window.clearInterval(state.turnstilePollTimer);
      return;
    }

    if (mountTurnstile()) {
      window.clearInterval(state.turnstilePollTimer);
      if (state.turnstileBootTimer) window.clearTimeout(state.turnstileBootTimer);
    }
  }, TURNSTILE_RETRY_INTERVAL_MS);
}

function initHumanGate() {
  document.body.classList.add('human-check-required');
  createOverlay();
  monitorHoneypots();
  bootTurnstileWhenReady();
}

window.addEventListener('DOMContentLoaded', initHumanGate, { once: true });
