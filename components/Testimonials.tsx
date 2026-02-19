
import React from 'react';
import { Language } from '../App';

interface TestimonialsProps {
  lang: Language;
}

export const Testimonials: React.FC<TestimonialsProps> = ({ lang }) => {
  const content = {
    en: {
      title: "Trusted by Industry Leaders",
      subtitle: "See what our clients say about their experience",
      reviews: [
        {
          name: 'Jennifer Martinez',
          role: 'VP of Operations, TechFlow Solutions',
          text: 'Gabriel has transformed our logistics operations. We reduced our delivery times by 35% and improved customer satisfaction significantly.',
          stars: 5,
          logo: 'TechFlow'
        },
        {
          name: 'David Thompson',
          role: 'CTO, Global Enterprises',
          text: 'The level of technical support we receive is outstanding. Their IT team is proactive and always ready to help. Truly a professional service.',
          stars: 5,
          logo: 'GlobalEnt'
        },
        {
          name: 'Amanda Chen',
          role: 'CEO, InnovateNow',
          text: 'Having a dedicated administrative team from Gabriel allows me to focus on strategic initiatives while they handle the details flawlessly.',
          stars: 5,
          logo: 'Innovate'
        }
      ]
    },
    es: {
      title: "Con la Confianza de Líderes de la Industria",
      subtitle: "Vea lo que dicen nuestros clientes sobre su experiencia",
      reviews: [
        {
          name: 'Jennifer Martinez',
          role: 'VP de Operaciones, TechFlow Solutions',
          text: 'Gabriel ha transformado nuestras operaciones logísticas. Redujimos nuestros tiempos de entrega en un 35% y mejoramos significativamente la satisfacción del cliente.',
          stars: 5,
          logo: 'TechFlow'
        },
        {
          name: 'David Thompson',
          role: 'CTO, Global Enterprises',
          text: 'El nivel de soporte técnico que recibimos es excepcional. Su equipo de IT es proactivo y siempre está listo para ayudar. Verdaderamente un servicio profesional.',
          stars: 5,
          logo: 'GlobalEnt'
        },
        {
          name: 'Amanda Chen',
          role: 'CEO, InnovateNow',
          text: 'Tener un equipo administrativo dedicado de Gabriel me permite enfocarme en iniciativas estratégicas mientras ellos manejan los detalles sin fallos.',
          stars: 5,
          logo: 'Innovate'
        }
      ]
    }
  };

  const t = content[lang || 'en'];

  return (
    <div className="py-24 bg-white dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{t.title}</h2>
          <p className="text-xl text-gray-500 dark:text-gray-400">{t.subtitle}</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {t.reviews.map((r, i) => (
            <div key={i} className="bg-gray-50 dark:bg-gray-800 p-10 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
              <div className="flex mb-6">
                {[...Array(r.stars)].map((_, j) => (
                  <svg key={j} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-lg italic mb-8 leading-relaxed">"{r.text}"</p>
              <div>
                <div className="font-bold text-gray-900 dark:text-white text-lg">{r.name}</div>
                <div className="text-purple-600 dark:text-purple-400 font-semibold text-sm mb-4">{r.role}</div>
                <div className="text-xs font-black text-gray-300 dark:text-gray-600 tracking-tighter uppercase">{r.logo}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
