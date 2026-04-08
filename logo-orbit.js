const LOGO_HOST_ID = 'gabo-orbit-logo-host';

function injectOrbitLogoStyles() {
  if (document.getElementById('gabo-orbit-logo-styles')) return;

  const style = document.createElement('style');
  style.id = 'gabo-orbit-logo-styles';
  style.textContent = `
    #${LOGO_HOST_ID} {
      position: fixed;
      top: 14px;
      right: clamp(10px, 2.2vw, 28px);
      z-index: 1200;
      pointer-events: none;
      width: clamp(100px, 9vw, 138px);
      aspect-ratio: 1 / 1;
      display: grid;
      place-items: center;
      opacity: 0.92;
      filter: drop-shadow(0 8px 20px rgba(0, 8, 24, 0.34));
    }

    #${LOGO_HOST_ID} .gabo-orbit-logo {
      position: relative;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      isolation: isolate;
    }

    #${LOGO_HOST_ID} .gabo-orbit-logo::before,
    #${LOGO_HOST_ID} .gabo-orbit-logo::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 50%;
    }

    #${LOGO_HOST_ID} .gabo-orbit-logo::before {
      background: radial-gradient(circle at center, rgba(9, 16, 41, 0.8) 0 52%, rgba(9, 16, 41, 0.18) 72%, transparent 100%);
      border: 1px solid rgba(177, 205, 255, 0.42);
    }

    #${LOGO_HOST_ID} .gabo-orbit-logo::after {
      inset: 6%;
      border: 2px solid rgba(153, 194, 255, 0.82);
      box-shadow: 0 0 14px rgba(117, 176, 255, 0.44), inset 0 0 12px rgba(117, 176, 255, 0.18);
      animation: gaboOrbitSpin 10s linear infinite;
    }

    #${LOGO_HOST_ID} .gabo-orbit-logo__core {
      position: absolute;
      inset: 24%;
      border-radius: 50%;
      display: grid;
      place-items: center;
      padding: 6px;
      text-align: center;
      background: rgba(8, 17, 45, 0.78);
      border: 1px solid rgba(169, 206, 255, 0.52);
      box-shadow: inset 0 0 22px rgba(95, 146, 255, 0.22);
      color: #f3f8ff;
      font: 600 clamp(9px, 0.72vw, 11px)/1.15 'Inter', 'Segoe UI', Roboto, Arial, sans-serif;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      text-wrap: balance;
    }

    @keyframes gaboOrbitSpin {
      to { transform: rotate(360deg); }
    }

    @media (prefers-reduced-motion: reduce) {
      #${LOGO_HOST_ID} .gabo-orbit-logo::after {
        animation: none;
      }
    }

    @media (max-width: 640px) {
      #${LOGO_HOST_ID} {
        width: clamp(84px, 23vw, 108px);
        top: 10px;
      }

      #${LOGO_HOST_ID} .gabo-orbit-logo__core {
        font-size: clamp(8px, 2.4vw, 10px);
      }
    }
  `;

  document.head.appendChild(style);
}

export function initGaboOrbitLogo() {
  if (!document.body || document.getElementById(LOGO_HOST_ID)) return;

  injectOrbitLogoStyles();

  const host = document.createElement('div');
  host.id = LOGO_HOST_ID;
  host.setAttribute('aria-hidden', 'true');
  host.innerHTML = `
    <div class="gabo-orbit-logo">
      <div class="gabo-orbit-logo__core">Gabo Services</div>
    </div>
  `;

  document.body.appendChild(host);
}
