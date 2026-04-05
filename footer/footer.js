export function initSiteFooter() {
  const footers = document.querySelectorAll('.site-footer');
  footers.forEach((footer) => {
    if (!footer.dataset.footerModule) {
      footer.dataset.footerModule = 'ready';
    }
  });
}
