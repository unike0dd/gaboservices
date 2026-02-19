
import React from 'react';
import { Language } from '../App';

interface LogisticsPageProps {
  setCurrentPage: (page: string) => void;
  lang: Language;
}

export const LogisticsPage: React.FC<LogisticsPageProps> = ({ setCurrentPage, lang }) => {
  const content = {
    en: {
      title: "Logistics Management",
      desc: "Streamlining your supply chain with precision and excellence.",
      start: "Get Started",
      learn: "Learn More",
      ready: "Ready to Optimize Your Logistics?",
      readyDesc: "Let's discuss how we can streamline your supply chain operations.",
      contact: "Contact Us Today"
    },
    es: {
      title: "Gestión Logística",
      desc: "Optimizando su cadena de suministro con precisión y excelencia.",
      start: "Empezar Ahora",
      learn: "Saber Más",
      ready: "¿Listo para optimizar su logística?",
      readyDesc: "Hablemos de cómo podemos agilizar las operaciones de su cadena de suministro.",
      contact: "Contáctenos hoy"
    }
  };

  const t = content[lang];

  return (
    <div className="animate-fade-in">
      <section className="bg-gradient-to-r from-purple-700 to-indigo-800 py-32 text-white text-center px-4">
        <h1 className="text-6xl font-extrabold mb-6">{t.title}</h1>
        <p className="text-xl text-purple-100 max-w-2xl mx-auto">{t.desc}</p>
        <div className="mt-12 flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex items-center space-x-2">
            <input type="email" placeholder="Email" className="bg-white/10 border border-white/20 rounded-xl px-6 py-4 w-64 text-white focus:outline-none focus:ring-2 focus:ring-white/50" />
            <button className="bg-white text-purple-700 px-8 py-4 rounded-xl font-bold shadow-xl hover:bg-gray-50 transition-all shine-button shine-blue">{t.start}</button>
          </div>
          <button 
            onClick={() => setCurrentPage('contact')}
            className="bg-transparent border-2 border-white/30 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-all shine-button shine-white"
          >
            {t.learn}
          </button>
        </div>
      </section>

      <section className="py-24 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{lang === 'en' ? 'Core Logistics Features' : 'Funciones Logísticas Principales'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                {['📦', '📊', '🌐', '📈', '📍', '🛡️'].map((icon, i) => (
                <div key={i} className="bg-gray-50 dark:bg-gray-800 p-10 rounded-3xl border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all">
                    <div className="text-5xl mb-6">{icon}</div>
                    <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{lang === 'en' ? 'Efficiency' : 'Eficiencia'}</h4>
                    <p className="text-gray-500 dark:text-gray-400">{lang === 'en' ? 'Maximum reliability in transport.' : 'Máxima fiabilidad en el transporte.'}</p>
                </div>
                ))}
            </div>
        </div>
      </section>

      <section className="bg-purple-600 py-20 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl font-bold mb-6">{t.ready}</h2>
          <p className="text-xl text-purple-100 mb-10">{t.readyDesc}</p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button onClick={() => setCurrentPage('contact')} className="bg-white text-purple-700 px-10 py-5 rounded-xl font-bold shadow-2xl hover:bg-gray-50 transition-all shine-button shine-gold">
              {t.contact}
            </button>
            <button onClick={() => setCurrentPage('contact')} className="bg-transparent border-2 border-white/30 text-white px-10 py-5 rounded-xl font-bold hover:bg-white/10 transition-all shine-button shine-white">
              {t.learn}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
