(function () {
  "use strict";

  var STORAGE_KEY = "gs_cookie_consent_v1";

  function nowISO() {
    try { return new Date().toISOString(); } catch (e) { return ""; }
  }

  function readConsent() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function writeConsent(consent) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
      return true;
    } catch (e) {
      return false;
    }
  }

  var MESSAGES = {
    es: {
      saved: "Guardado. Sus preferencias fueron actualizadas.",
      saveError: "No se pudieron guardar las preferencias (almacenamiento bloqueado). Aún puede gestionar las cookies en su navegador.",
      accepted: "Todas las cookies opcionales fueron aceptadas.",
      rejected: "Todas las cookies opcionales fueron rechazadas.",
      loaded: "Sus preferencias actuales están cargadas.",
      empty: "Aún no hay preferencias guardadas. Elija su configuración y guarde."
    },
    en: {
      saved: "Saved. Your preferences were updated.",
      saveError: "Preferences could not be saved (storage blocked). You can still manage cookies in your browser.",
      accepted: "All optional cookies were accepted.",
      rejected: "All optional cookies were rejected.",
      loaded: "Your current preferences are loaded.",
      empty: "No saved preferences yet. Choose your settings and save."
    }
  };

  function getLang() {
    var lang = (document.documentElement.getAttribute("lang") || "es").toLowerCase();
    return lang === "en" ? "en" : "es";
  }

  function t(key) {
    var lang = getLang();
    return (MESSAGES[lang] && MESSAGES[lang][key]) || MESSAGES.es[key] || "";
  }

  function setStatus(msg) {
    var el = document.getElementById("cookie-status");
    if (el) el.textContent = msg;
  }

  function formEl() {
    return document.getElementById("cookie-prefs-form");
  }

  function setFormFromConsent(consent) {
    var form = formEl();
    if (!form || !consent) return;
    var prefs = form.elements["preferences"];
    var analytics = form.elements["analytics"];
    var marketing = form.elements["marketing"];

    if (prefs) prefs.checked = !!consent.preferences;
    if (analytics) analytics.checked = !!consent.analytics;
    if (marketing) marketing.checked = !!consent.marketing;
  }

  // OPTIONAL: load analytics only if consent.analytics === true
  // Put your analytics loader here. Example shows how to load a script dynamically.
  function applyConsent(consent) {
    if (!consent) return;

    // Example: conditionally load analytics script
    // IMPORTANT: Your CSP must allow that script domain in script-src.
    // Replace with your actual analytics, or remove this block entirely.
    if (consent.analytics) {
      // Avoid loading twice
      if (!document.querySelector('script[data-gs-analytics="1"]')) {
        var s = document.createElement("script");
        s.src = "[https://example-analytics.com/script.js]";
        s.async = true;
        s.setAttribute("data-gs-analytics", "1");
        document.head.appendChild(s);
      }
    }

    // Marketing example placeholder
    if (consent.marketing) {
      // Load marketing pixels/scripts here (only if you truly use them).
    }
  }

  function saveFromForm() {
    var form = formEl();
    if (!form) return;

    var consent = {
      necessary: true,
      preferences: !!(form.elements["preferences"] && form.elements["preferences"].checked),
      analytics: !!(form.elements["analytics"] && form.elements["analytics"].checked),
      marketing: !!(form.elements["marketing"] && form.elements["marketing"].checked),
      updatedAt: nowISO()
    };

    var ok = writeConsent(consent);
    if (ok) {
      applyConsent(consent);
      setStatus(t("saved"));
    } else {
      setStatus(t("saveError"));
    }
  }

  function acceptAll() {
    var consent = { necessary: true, preferences: true, analytics: true, marketing: true, updatedAt: nowISO() };
    writeConsent(consent);
    setFormFromConsent(consent);
    applyConsent(consent);
    setStatus(t("accepted"));
  }

  function rejectAll() {
    var consent = { necessary: true, preferences: false, analytics: false, marketing: false, updatedAt: nowISO() };
    writeConsent(consent);
    setFormFromConsent(consent);
    applyConsent(consent);
    setStatus(t("rejected"));
  }

  function wireUI() {
    var form = formEl();
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      saveFromForm();
    });

    var btnAll = document.getElementById("btn-accept-all");
    var btnNone = document.getElementById("btn-reject-all");

    if (btnAll) btnAll.addEventListener("click", acceptAll);
    if (btnNone) btnNone.addEventListener("click", rejectAll);
  }

  function init() {
    wireUI();

    var consent = readConsent();
    if (consent) {
      setFormFromConsent(consent);
      applyConsent(consent);
      setStatus(t("loaded"));
    } else {
      setStatus(t("empty"));
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
