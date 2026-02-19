
import React from 'react';
import { Language } from '../App';

interface ITSupportPageProps {
  setCurrentPage: (page: string) => void;
  lang: Language;
}

export const ITSupportPage: React.FC<ITSupportPageProps> = ({ setCurrentPage, lang }) => {
  const content = {
    en: {
      title: "IT Support Level I & II",
      desc: "Expert technical support and infrastructure management to keep your business running smoothly.",
      start: "Get Started",
      learn: "Learn More",
      ready: "Need Reliable IT Support?",
      readyDesc: "Let our experts handle your IT infrastructure so you can focus on growth.",
      contact: "Contact IT Team"
    },
    es: {
      title: "Soporte IT Nivel I y II",
      desc: "Soporte técnico experto y gestión de infraestructura para que su negocio funcione sin problemas.",
      start: "Empezar",
      learn: "Saber Más",
      ready: "¿Necesita Soporte IT Confiable?",
      readyDesc: "Deje que nuestros expertos manejen su infraestructura para que pueda enfocarse en crecer.",
      contact: "Contactar Equipo IT"
    }
  };

  const t = content[lang];

  return (
    <div className="animate-fade-in">
      <section className="bg-gradient-to-r from-indigo-700 to-purple-800 py-32 text-white text-center px-4">
        <h1 className="text-6xl font-extrabold mb-6">{t.title}</h1>
        <p className="text-xl text-indigo-100 max-w-2xl mx-auto">{t.desc}</p>
        <div className="mt-12 flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex items-center space-x-2">
            <input type="text" placeholder="Domain" className="bg-white/10 border border-white/20 rounded-xl px-6 py-4 w-64 text-white focus:outline-none focus:ring-2 focus:ring-white/50" />
            <button className="bg-white text-indigo-700 px-8 py-4 rounded-xl font-bold shadow-xl hover:bg-gray-50 transition-all shine-button shine-blue">{t.start}</button>
          </div>
          <button 
            onClick={() => setCurrentPage('contact')}
            className="bg-transparent border-2 border-white/30 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-all shine-button shine-white"
          >
            {t.learn}
          </button>
        </div>
      </section>

      <section className="bg-indigo-600 py-20 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl font-bold mb-6">{t.ready}</h2>
          <p className="text-xl text-indigo-100 mb-10">{t.readyDesc}</p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button onClick={() => setCurrentPage('contact')} className="bg-white text-indigo-700 px-10 py-5 rounded-xl font-bold shadow-2xl hover:bg-gray-50 transition-all shine-button shine-white">
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
