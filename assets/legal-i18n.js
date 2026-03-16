(() => {
  const root = document.documentElement;
  const saved = window.localStorage.getItem('gabrielServices.locale');
  const initialLang = saved === 'es' ? 'es' : 'en';
  root.lang = initialLang;

  document.querySelectorAll('[data-lang-option]').forEach((button) => {
    button.addEventListener('click', () => {
      const next = button.getAttribute('data-lang-option') === 'es' ? 'es' : 'en';
      window.localStorage.setItem('gabrielServices.locale', next);
      root.lang = next;
    });
  });
})();
