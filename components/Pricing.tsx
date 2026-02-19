
import React from 'react';
import { Language } from '../App';

interface PricingProps {
  lang: Language;
}

export const Pricing: React.FC<PricingProps> = ({ lang }) => {
  const content = {
    en: {
      title: "Simple, Transparent Pricing",
      subtitle: "Choose the plan that fits your business needs",
      plans: [
        {
          name: 'Starter',
          price: '$3,760',
          desc: 'Perfect for small businesses starting their journey',
          features: ['Single service category', 'Admin and C-Level Support', 'Email & phone support', 'Monthly reporting', 'Basic SLA coverage', 'Standard response times'],
          button: 'Get Started',
          popular: false,
          shine: 'shine-white'
        },
        {
          name: 'SMBs',
          price: '$4,800',
          desc: 'Comprehensive support for growing small and medium businesses',
          features: ['Two service categories', 'IT Support Level I & II', 'Priority email support', 'Bi-weekly reporting', 'Enhanced SLA coverage', 'Dedicated account coordinator'],
          button: 'Get Started',
          popular: true,
          shine: 'shine-purple'
        },
        {
          name: 'Professional',
          price: '$5,990',
          desc: 'Advanced operational excellence for scaling organizations',
          features: ['All service categories', 'Full IT Infrastructure Support', 'Priority 24/7 support', 'Weekly reporting & analytics', 'Premium SLA coverage', 'Dedicated account manager', 'Custom integrations'],
          button: 'Get Started',
          popular: false,
          shine: 'shine-gold'
        }
      ]
    },
    es: {
      title: "Precios Simples y Trasparentes",
      subtitle: "Elija el plan que se adapte a las necesidades de su negocio",
      plans: [
        {
          name: 'Inicial',
          price: '$3,760',
          desc: 'Perfecto para pequeñas empresas que comienzan su camino',
          features: ['Categoría de servicio único', 'Soporte Admin y C-Level', 'Soporte por email y teléfono', 'Informes mensuales', 'Cobertura básica de SLA', 'Tiempos de respuesta estándar'],
          button: 'Empezar',
          popular: false,
          shine: 'shine-white'
        },
        {
          name: 'SMBs',
          price: '$4,800',
          desc: 'Soporte integral para pequeñas y medianas empresas en crecimiento',
          features: ['Dos categorías de servicio', 'Soporte IT Nivel I y II', 'Soporte por email prioritario', 'Informes quincenales', 'Cobertura de SLA mejorada', 'Coordinador de cuenta dedicado'],
          button: 'Empezar',
          popular: true,
          shine: 'shine-purple'
        },
        {
          name: 'Profesional',
          price: '$5,990',
          desc: 'Excelencia operativa avanzada para organizaciones en escala',
          features: ['Todas las categorías de servicio', 'Soporte de infraestructura IT completo', 'Soporte prioritario 24/7', 'Informes y analítica semanales', 'Cobertura de SLA Premium', 'Gerente de cuenta dedicado', 'Integraciones personalizadas'],
          button: 'Empezar',
          popular: false,
          shine: 'shine-gold'
        }
      ]
    }
  };

  const t = content[lang || 'en'];

  return (
    <div className="py-24 bg-gray-50 dark:bg-gray-800/30 transition-colors">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{t.title}</h2>
          <p className="text-xl text-gray-500 dark:text-gray-400">{t.subtitle}</p>
        </div>
        <div className="flex flex-col space-y-8 max-w-5xl mx-auto">
          {t.plans.map((p, i) => (
            <div key={i} className={`bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-10 border shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center ${p.popular ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-gray-100 dark:border-gray-700'}`}>
              {p.popular && (
                <div className="absolute top-0 left-0 bg-purple-600 text-white px-4 py-1 text-[10px] font-bold rounded-br-lg uppercase tracking-wider">
                  {lang === 'es' ? 'Más Popular' : 'Most Popular'}
                </div>
              )}
              
              <div className="flex-grow md:pr-12">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8">
                  <div>
                    <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{p.name}</h4>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 md:mb-0">{p.desc}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-extrabold text-gray-900 dark:text-white leading-none">{p.price}</div>
                    <div className="text-gray-400 text-xs mt-1 uppercase font-bold tracking-widest">{lang === 'es' ? 'por mes' : 'per month'}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 md:mb-0">
                  {p.features.map((f, j) => (
                    <div key={j} className="flex items-start text-sm font-semibold text-gray-600 dark:text-gray-300">
                      <svg className="w-5 h-5 text-purple-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex-shrink-0 w-full md:w-auto mt-8 md:mt-0 pt-8 md:pt-0 border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-700 md:pl-12 flex items-center justify-center">
                <button className={`w-full md:w-48 py-5 rounded-2xl font-bold transition-all shine-button ${p.shine} ${p.popular ? 'bg-purple-600 text-white shadow-xl hover:bg-purple-700' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                  {p.button}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
