import { EN_MESSAGES } from './en/messages.js';
import { ES_MESSAGES } from './es/messages.js';

export const DEFAULT_LOCALE = 'en';
export const SUPPORTED_LOCALES = Object.freeze(['en', 'es']);
export const LOCALE_STORAGE_KEY = 'gs_locale';

const LOCALE_MESSAGES = Object.freeze({
  en: EN_MESSAGES,
  es: ES_MESSAGES
});

export function resolveLocale(candidate) {
  const normalized = String(candidate || '')
    .trim()
    .toLowerCase()
    .split('-')[0];

  return SUPPORTED_LOCALES.includes(normalized) ? normalized : DEFAULT_LOCALE;
}

function readStoredLocale() {
  try {
    return localStorage.getItem(LOCALE_STORAGE_KEY);
  } catch {
    return '';
  }
}

export function getActiveLocale() {
  const rawStoredLocale = readStoredLocale();
  if (rawStoredLocale) {
    return resolveLocale(rawStoredLocale);
  }

  const documentLocale = resolveLocale(document.documentElement.lang);
  if (documentLocale !== DEFAULT_LOCALE || document.documentElement.lang) {
    return documentLocale;
  }

  return resolveLocale(navigator.language);
}

export function getLocaleMessages(locale = getActiveLocale()) {
  return LOCALE_MESSAGES[resolveLocale(locale)] || EN_MESSAGES;
}
