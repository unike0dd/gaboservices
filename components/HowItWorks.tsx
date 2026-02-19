
import React from 'react';
import { Language } from '../App';

interface HowItWorksProps {
  lang: Language;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ lang }) => {
  const content = {
    en: {
      title: "How It Works",
      subtitle: "Get started in minutes with our simple four-step process",
      steps: [
        { id: '01', title: 'Consultation', desc: 'Discuss your business needs and challenges. We analyze your requirements to create a tailored solution.' },
        { id: '02', title: 'Onboarding', desc: 'Seamless integration with your existing systems. Our team ensures a smooth transition process.' },
        { id: '03', title: 'Implementation', desc: 'Deploy our services with minimal disruption. Custom workflows configured to your specifications.' },
        { id: '04', title: 'Ongoing Support', desc: 'Continuous optimization and support. Regular check-ins to ensure maximum value and satisfaction.' }
      ]
    },
    es: {
      title: "Cómo Funciona",
      subtitle: "Comience en minutos con nuestro sencillo proceso de cuatro pasos",
      steps: [
        { id: '01', title: 'Consulta', desc: 'Discuta sus necesidades y desafíos comerciales. Analizamos sus requisitos para crear una solución a medida.' },
        { id: '02', title: 'Integración', desc: 'Integración perfecta con sus sistemas existentes. Nuestro equipo asegura un proceso de transición suave.' },
        { id: '03', title: 'Implementación', desc: 'Despliegue nuestros servicios con una interrupción mínima. Flujos de trabajo personalizados según sus especificaciones.' },
        { id: '04', title: 'Soporte Continuo', desc: 'Optimización y soporte continuos. Revisiones periódicas para asegurar el máximo valor y satisfacción.' }
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {t.steps.map((s, i) => (
            <div key={i} className="relative p-8 text-center group">
              <div className="w-16 h-16 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mx-auto mb-6 text-xl font-bold group-hover:bg-purple-600 group-hover:text-white transition-all shadow-sm">
                {s.id}
              </div>
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{s.title}</h4>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{s.desc}</p>
              {i < t.steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gray-100 dark:bg-gray-800 z-0 -ml-16"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
