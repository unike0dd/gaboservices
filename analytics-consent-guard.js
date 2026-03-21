const COOKIE_CONSENT_STORAGE_KEY = 'gs_cookie_consent_v1';
const CLOUDFLARE_BEACON_HOST_FRAGMENT = 'static.cloudflareinsights.com/beacon.min.js';

function readCookieConsent() {
  try {
    const raw = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function hasAnalyticsConsent() {
  return Boolean(readCookieConsent()?.analytics);
}

function isCloudflareBeaconScript(node) {
  return node instanceof HTMLScriptElement
    && typeof node.src === 'string'
    && node.src.includes(CLOUDFLARE_BEACON_HOST_FRAGMENT);
}

function removeCloudflareBeaconScripts(root = document) {
  const beaconScripts = root.querySelectorAll(`script[src*="${CLOUDFLARE_BEACON_HOST_FRAGMENT}"]`);
  beaconScripts.forEach((script) => script.remove());
  if ('__cfBeacon' in window) {
    window.__cfBeacon = undefined;
  }
}

export function initAnalyticsConsentGuard() {
  if (hasAnalyticsConsent()) return;

  removeCloudflareBeaconScripts();

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (isCloudflareBeaconScript(node)) {
          node.remove();
          if ('__cfBeacon' in window) {
            window.__cfBeacon = undefined;
          }
          return;
        }

        if (node instanceof Element) {
          removeCloudflareBeaconScripts(node);
        }
      });
    });
  });

  const startObserver = () => {
    observer.observe(document.documentElement, { childList: true, subtree: true });
  };

  if (document.documentElement) {
    startObserver();
  } else {
    document.addEventListener('DOMContentLoaded', startObserver, { once: true });
  }
}
