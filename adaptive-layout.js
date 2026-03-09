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
      chatHeight: '70vh',
      sectionPaddingY: '2.2rem',
      gridGap: '0.85rem',
      ctaGap: '0.65rem',
      navGap: '0.6rem',
      navWrapPaddingY: '0.55rem'
    },
    tablet: {
      containerWidth: '1024px',
      containerPadding: '1.2rem',
      fontScale: '0.99',
      chatHeight: '72vh',
      sectionPaddingY: '2.5rem',
      gridGap: '0.95rem',
      ctaGap: '0.7rem',
      navGap: '0.85rem',
      navWrapPaddingY: '0.68rem'
    },
    laptop: {
      containerWidth: '1140px',
      containerPadding: '1.4rem',
      fontScale: '1',
      chatHeight: '500px',
      sectionPaddingY: '2.8rem',
      gridGap: '1rem',
      ctaGap: '0.75rem',
      navGap: '1rem',
      navWrapPaddingY: '0.8rem'
    },
    pc: {
      containerWidth: '1240px',
      containerPadding: '1.6rem',
      fontScale: '1.02',
      chatHeight: '520px',
      sectionPaddingY: '3rem',
      gridGap: '1.05rem',
      ctaGap: '0.8rem',
      navGap: '1rem',
      navWrapPaddingY: '0.82rem'
    }
  };

  const activeTokens = tokens[tier] || tokens.laptop;
  root.style.setProperty('--adaptive-container-width', activeTokens.containerWidth);
  root.style.setProperty('--adaptive-container-padding', activeTokens.containerPadding);
  root.style.setProperty('--adaptive-font-scale', activeTokens.fontScale);
  root.style.setProperty('--adaptive-chat-height', activeTokens.chatHeight);
  root.style.setProperty('--adaptive-section-padding-y', activeTokens.sectionPaddingY);
  root.style.setProperty('--adaptive-grid-gap', activeTokens.gridGap);
  root.style.setProperty('--adaptive-cta-gap', activeTokens.ctaGap);
  root.style.setProperty('--adaptive-nav-gap', activeTokens.navGap);
  root.style.setProperty('--adaptive-nav-wrap-padding-y', activeTokens.navWrapPaddingY);
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
