
import React from 'react';
import { Language } from '../App';

interface AdminSupportPageProps {
  setCurrentPage: (page: string) => void;
  lang: Language;
}

export const AdminSupportPage: React.FC<AdminSupportPageProps> = ({ setCurrentPage, lang }) => {
  const content = {
    en: {
      title: "C-Level Admin Support",
      desc: "Empower your executives with dedicated administrative excellence.",
      start: "Get Started",
      learn: "Learn More",
      ready: "Empower Your Leadership Team",
      readyDesc: "Let's discuss how our executive support can free up your time for strategic work.",
      contact: "Contact Us Today"
    },
    es: {
      title: "Soporte Ejecutivo C-Level",
      desc: "Potencie a sus ejecutivos con una excelencia administrativa dedicada.",
      start: "Empezar",
      learn: "Saber Más",
      ready: "Potencie su Equipo de Liderazgo",
      readyDesc: "Hablemos de cómo nuestro apoyo ejecutivo puede liberar su tiempo para el trabajo estratégico.",
      contact: "Contáctenos Hoy"
    }
  };

  const t = content[lang];

  return (
    <div className="animate-fade-in">
      <section className="bg-gradient-to-r from-purple-600 to-pink-700 py-32 text-white text-center px-4">
        <h1 className="text-6xl font-extrabold mb-6">{t.title}</h1>
        <p className="text-xl text-purple-100 max-w-2xl mx-auto">{t.desc}</p>
        <div className="mt-12 flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex items-center space-x-2">
            <input type="text" placeholder="Executive" className="bg-white/10 border border-white/20 rounded-xl px-6 py-4 w-64 text-white focus:outline-none focus:ring-2 focus:ring-white/50" />
            <button className="bg-white text-purple-700 px-8 py-4 rounded-xl font-bold shadow-xl hover:bg-gray-50 transition-all shine-button shine-pink">{t.start}</button>
          </div>
          <button 
            onClick={() => setCurrentPage('contact')}
            className="bg-transparent border-2 border-white/30 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-all shine-button shine-white"
          >
            {t.learn}
          </button>
        </div>
      </section>

      <section className="bg-purple-700 py-20 text-white text-center">
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
