
import React from 'react';
import { Language } from '../App';

interface CustomerRelationsPageProps {
  setCurrentPage: (page: string) => void;
  lang: Language;
}

export const CustomerRelationsPage: React.FC<CustomerRelationsPageProps> = ({ setCurrentPage, lang }) => {
  const content = {
    en: {
      title: "Customer Relations & Experience",
      desc: "Build lasting customer relationships with professional support services that delight at every touchpoint.",
      start: "Get Started",
      learn: "Learn More",
      metricsTitle: "Performance Metrics",
      ready: "Ready to Elevate Your Customer Experience?",
      readyDesc: "Let's discuss how we can help you build stronger customer relationships.",
      contact: "Contact Us Today"
    },
    es: {
      title: "Relaciones y Experiencia del Cliente",
      desc: "Construya relaciones duraderas con servicios de soporte profesional que deleitan en cada punto de contacto.",
      start: "Empezar",
      learn: "Saber Más",
      metricsTitle: "Métricas de Rendimiento",
      ready: "¿Listo para mejorar la experiencia de sus clientes?",
      readyDesc: "Hablemos de cómo podemos ayudarle a construir relaciones más sólidas.",
      contact: "Contáctenos Hoy"
    }
  };

  const t = content[lang];

  return (
    <div className="animate-fade-in">
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-32 text-white text-center px-4">
        <h1 className="text-6xl font-extrabold mb-6">{t.title}</h1>
        <p className="text-xl text-blue-100 max-w-2xl mx-auto">{t.desc}</p>
        <div className="mt-12 flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex items-center space-x-2">
            <input type="text" placeholder={lang === 'en' ? "Service type" : "Tipo de servicio"} className="bg-white/10 border border-white/20 rounded-xl px-6 py-4 w-64 text-white focus:outline-none focus:ring-2 focus:ring-white/50" />
            <button className="bg-white text-blue-700 px-8 py-4 rounded-xl font-bold shadow-xl hover:bg-gray-50 transition-all shine-button shine-blue">{t.start}</button>
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
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white text-center mb-16">{lang === 'en' ? 'Comprehensive Support' : 'Soporte Integral'}</h2>
          
          <div className="bg-blue-50 dark:bg-blue-900/10 rounded-3xl p-12 border border-blue-100 dark:border-blue-900/20">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">{t.metricsTitle}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { label: lang === 'en' ? 'Satisfaction' : 'Satisfacción', val: '95%+' },
                { label: lang === 'en' ? 'Response Time' : 'Tiempo de Respuesta', val: '<30s' },
                { label: lang === 'en' ? 'Availability' : 'Disponibilidad', val: '24/7' },
                { label: lang === 'en' ? 'Resolution' : 'Resolución', val: '90%+' }
              ].map((m, i) => (
                <div key={i} className="text-center">
                  <div className="text-4xl font-extrabold text-blue-600 dark:text-blue-400 mb-2">{m.val}</div>
                  <div className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tighter">{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-blue-600 py-20 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl font-bold mb-6">{t.ready}</h2>
          <p className="text-xl text-blue-100 mb-10">{t.readyDesc}</p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button onClick={() => setCurrentPage('contact')} className="bg-white text-blue-700 px-10 py-5 rounded-xl font-bold shadow-2xl hover:bg-gray-50 transition-all shine-button shine-white">
              {t.contact}
            </button>
            <button onClick={() => setCurrentPage('contact')} className="bg-transparent border-2 border-white/30 text-white px-10 py-5 rounded-xl font-bold hover:bg-white/10 transition-all shine-button shine-blue">
              {t.learn}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
