/**
 * Centralized breakpoint configuration
 * Ensures consistent viewport breakpoints across the application
 */

export const BREAKPOINTS = {
  mobile: 600,
  tablet: 900,
  laptop: 1280
};

export const BREAKPOINT_QUERIES = {
  mobileQuery: `(max-width: ${BREAKPOINTS.tablet}px)`,
  desktopQuery: `(min-width: ${BREAKPOINTS.tablet + 1}px)`
};
