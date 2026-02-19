
import React from 'react';
import { Language } from '../App';

interface CareersPageProps {
  lang: Language;
}

export const CareersPage: React.FC<CareersPageProps> = ({ lang }) => {
  const content = {
    en: {
      title: "Join Our Team",
      sub: "Build your career with a company that values excellence, innovation, and professional growth.",
      why: "Why Work at Gabriel?",
      apply: "Apply Now",
      general: "Submit General Application",
      jobs: [
        { title: 'Senior Logistics Coordinator', type: 'Remote | Full-time', category: 'Logistics', desc: 'Lead logistics operations and coordinate with clients.' },
        { title: 'IT Support Specialist', type: 'Hybrid | Full-time', category: 'IT Support', desc: 'Provide Level I & II technical support to clients.' }
      ]
    },
    es: {
      title: "Únete a Nuestro Equipo",
      sub: "Construye tu carrera con una empresa que valora la excelencia, la innovación y el crecimiento profesional.",
      why: "¿Por qué trabajar en Gabriel?",
      apply: "Postular Ahora",
      general: "Enviar Postulación General",
      jobs: [
        { title: 'Coordinador Logístico Senior', type: 'Remoto | Tiempo Completo', category: 'Logística', desc: 'Liderar operaciones logísticas y coordinar con clientes.' },
        { title: 'Especialista en Soporte IT', type: 'Híbrido | Tiempo Completo', category: 'Soporte IT', desc: 'Brindar soporte técnico de Nivel I y II a los clientes.' }
      ]
    }
  };

  const t = content[lang];

  return (
    <div className="animate-fade-in">
      <section className="py-20 text-center bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-5xl font-extrabold mb-6">{t.title}</h1>
          <p className="text-xl text-gray-400 mb-10">{t.sub}</p>
        </div>
      </section>

      <section className="py-24 bg-white dark:bg-gray-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white text-center mb-16">{t.why}</h2>
          <div className="space-y-6 max-w-5xl mx-auto">
            {t.jobs.map((j, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col md:flex-row justify-between items-center group">
                <div className="flex-grow pr-8 mb-6 md:mb-0">
                  <div className="flex items-center mb-2">
                    <span className="bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-bold px-3 py-1 rounded-full mr-4">{j.category}</span>
                    <span className="text-sm font-semibold text-gray-400">{j.type}</span>
                  </div>
                  <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 transition-colors">{j.title}</h4>
                  <p className="text-gray-500 dark:text-gray-400">{j.desc}</p>
                </div>
                <button className="bg-purple-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-purple-700 transition-all">{t.apply}</button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
