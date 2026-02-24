const BREAKPOINTS = {
  mobile: 600,
  tablet: 900,
  laptop: 1280
};

function getViewportTier(width) {
  if (width <= BREAKPOINTS.mobile) return 'mobile';
  if (width <= BREAKPOINTS.tablet) return 'tablet';
  if (width <= BREAKPOINTS.laptop) return 'laptop';
  return 'pc';
}

function applyViewportTokens(tier) {
  const root = document.documentElement;
  const body = document.body;
  if (!body) return;

  body.dataset.viewportTier = tier;

  const tokens = {
    mobile: {
      containerWidth: '100%',
      containerPadding: '0.9rem',
      fontScale: '0.96',
      chatHeight: '70vh'
    },
    tablet: {
      containerWidth: '1024px',
      containerPadding: '1.2rem',
      fontScale: '0.99',
      chatHeight: '72vh'
    },
    laptop: {
      containerWidth: '1140px',
      containerPadding: '1.4rem',
      fontScale: '1',
      chatHeight: '500px'
    },
    pc: {
      containerWidth: '1240px',
      containerPadding: '1.6rem',
      fontScale: '1.02',
      chatHeight: '520px'
    }
  };

  const activeTokens = tokens[tier] || tokens.laptop;
  root.style.setProperty('--adaptive-container-width', activeTokens.containerWidth);
  root.style.setProperty('--adaptive-container-padding', activeTokens.containerPadding);
  root.style.setProperty('--adaptive-font-scale', activeTokens.fontScale);
  root.style.setProperty('--adaptive-chat-height', activeTokens.chatHeight);
}

export function initAdaptiveLayout() {
  let activeTier = '';

  const syncTier = () => {
    const nextTier = getViewportTier(window.innerWidth);
    if (nextTier === activeTier) return;
    activeTier = nextTier;
    applyViewportTokens(nextTier);
  };

  syncTier();
  window.addEventListener('resize', syncTier, { passive: true });
  window.addEventListener('orientationchange', syncTier, { passive: true });
}
