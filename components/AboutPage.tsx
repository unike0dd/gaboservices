
import React from 'react';
import { Language } from '../App';

interface AboutPageProps {
  lang: Language;
}

export const AboutPage: React.FC<AboutPageProps> = ({ lang }) => {
  const content = {
    en: {
      title: "About Gabriel",
      sub: "Delivering world-class professional services to help businesses scale and succeed.",
      mission: "Our Mission",
      missionText: "To empower businesses with exceptional operational support, enabling them to focus on core competencies.",
      vision: "Our Vision",
      visionText: "To be the most trusted partner for businesses seeking comprehensive professional services.",
      story: "Our Story",
      storyP1: "Gabriel was founded with a simple yet powerful vision: to provide businesses with the professional support services they need to thrive.",
      storyP2: "What started as a small team has grown into a comprehensive provider trusted by businesses across various industries."
    },
    es: {
      title: "Sobre Gabriel",
      sub: "Entregando servicios profesionales de clase mundial para ayudar a las empresas a escalar y tener éxito.",
      mission: "Nuestra Misión",
      missionText: "Potenciar a las empresas con un apoyo operativo excepcional, permitiéndoles centrarse en sus competencias principales.",
      vision: "Nuestra Visión",
      visionText: "Ser el socio más confiable para las empresas que buscan servicios profesionales integrales.",
      story: "Nuestra Historia",
      storyP1: "Gabriel fue fundada con una visión simple pero poderosa: proporcionar a las empresas los servicios de apoyo profesional que necesitan para prosperar.",
      storyP2: "Lo que comenzó como un pequeño equipo se ha convertido en un proveedor integral en el que confían empresas de diversas industrias."
    }
  };

  const t = content[lang];

  return (
    <div className="animate-fade-in">
      <section className="py-20 text-center bg-gray-50 dark:bg-gray-800 transition-colors">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-6">{t.title}</h1>
          <p className="text-xl text-gray-500 dark:text-gray-400 leading-relaxed">{t.sub}</p>
        </div>
      </section>

      <section className="py-24 bg-white dark:bg-gray-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="bg-purple-50 dark:bg-purple-900/20 p-12 rounded-3xl">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{t.mission}</h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">{t.missionText}</p>
          </div>
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-12 rounded-3xl">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{t.vision}</h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">{t.visionText}</p>
          </div>
        </div>
      </section>

      <section className="py-24 bg-gray-50 dark:bg-gray-800 transition-colors">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-12">{t.story}</h2>
          <div className="space-y-8 text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            <p>{t.storyP1}</p>
            <p>{t.storyP2}</p>
          </div>
        </div>
      </section>
    </div>
  );
};
