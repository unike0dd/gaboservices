
import React, { useState, useEffect } from 'react';
import { Language } from '../App';

interface CookieConsentProps {
  lang: Language;
}

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
}

export const CookieConsent: React.FC<CookieConsentProps> = ({ lang }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Always true
    analytics: true,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setTimeout(() => setIsVisible(true), 1500);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = { essential: true, analytics: true, marketing: true };
    localStorage.setItem('cookie-consent', JSON.stringify(allAccepted));
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem('cookie-consent', JSON.stringify(preferences));
    setIsVisible(false);
    setShowSettings(false);
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === 'essential') return; // Cannot disable essential
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (!isVisible) return null;

  const content = {
    en: {
      text: "We use cookies to enhance your experience and analyze site traffic.",
      accept: "Accept All",
      settings: "Cookie Settings",
      save: "Save Preferences",
      back: "Back",
      title: "Manage Cookie Preferences",
      essential: "Essential",
      essentialDesc: "Required for the website to function properly.",
      analytics: "Analytics",
      analyticsDesc: "Helps us understand how visitors interact with the site.",
      marketing: "Marketing",
      marketingDesc: "Used to track visitors across websites for relevant ads.",
    },
    es: {
      text: "Utilizamos cookies para mejorar su experiencia y analizar el tráfico del sitio.",
      accept: "Aceptar Todo",
      settings: "Configuración de Cookies",
      save: "Guardar Preferencias",
      back: "Volver",
      title: "Gestionar Preferencias de Cookies",
      essential: "Esenciales",
      essentialDesc: "Necesarias para que el sitio web funcione correctamente.",
      analytics: "Analíticas",
      analyticsDesc: "Nos ayuda a entender cómo interactúan los visitantes con el sitio.",
      marketing: "Marketing",
      marketingDesc: "Utilizadas para rastrear visitantes y mostrar anuncios relevantes.",
    }
  };

  const t = content[lang];

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 pointer-events-none">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 p-6 md:p-8 pointer-events-auto animate-fade-in-up transition-all duration-300">
        {!showSettings ? (
          <div className="md:flex items-center justify-between">
            <div className="mb-6 md:mb-0 md:mr-12">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{lang === 'en' ? 'Cookie Policy' : 'Política de Cookies'}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{t.text}</p>
            </div>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 shrink-0">
              <button 
                onClick={() => setShowSettings(true)} 
                className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-6 py-3 rounded-xl text-sm font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {t.settings}
              </button>
              <button 
                onClick={handleAcceptAll}
                className="bg-purple-600 text-white px-8 py-3 rounded-xl text-sm font-bold shadow-lg hover:bg-purple-700 transition-all shine-button shine-white"
              >
                {t.accept}
              </button>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">{t.title}</h3>
              <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6 mb-10">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                <div className="pr-4">
                  <div className="font-bold text-gray-900 dark:text-white">{t.essential}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{t.essentialDesc}</div>
                </div>
                <div className="relative inline-flex items-center cursor-not-allowed opacity-50">
                  <div className="w-11 h-6 bg-purple-600 rounded-full"></div>
                  <div className="absolute left-1 w-4 h-4 bg-white rounded-full transition-transform transform translate-x-5"></div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                <div className="pr-4">
                  <div className="font-bold text-gray-900 dark:text-white">{t.analytics}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{t.analyticsDesc}</div>
                </div>
                <button 
                  onClick={() => togglePreference('analytics')}
                  className={`relative inline-flex items-center cursor-pointer transition-colors duration-200 focus:outline-none w-11 h-6 rounded-full ${preferences.analytics ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${preferences.analytics ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                <div className="pr-4">
                  <div className="font-bold text-gray-900 dark:text-white">{t.marketing}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{t.marketingDesc}</div>
                </div>
                <button 
                  onClick={() => togglePreference('marketing')}
                  className={`relative inline-flex items-center cursor-pointer transition-colors duration-200 focus:outline-none w-11 h-6 rounded-full ${preferences.marketing ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${preferences.marketing ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <button 
                onClick={() => setShowSettings(false)} 
                className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-6 py-4 rounded-xl text-sm font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {t.back}
              </button>
              <button 
                onClick={handleSavePreferences}
                className="flex-1 bg-purple-600 text-white px-6 py-4 rounded-xl text-sm font-bold shadow-lg hover:bg-purple-700 transition-all shine-button shine-white"
              >
                {t.save}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
