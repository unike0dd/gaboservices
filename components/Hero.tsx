
import React from 'react';
import { Language } from '../App';

interface HeroProps {
  setCurrentPage: (page: string) => void;
  lang: Language;
}

export const Hero: React.FC<HeroProps> = ({ setCurrentPage, lang }) => {
  const t = {
    en: {
      badge: "Trusted by 500+ Companies",
      title1: "Professional Business Services",
      title2: "Delivered with Excellence",
      desc: "Expert logistics, IT support, C-level assistance, and customer relations services designed to elevate your business operations.",
      cta1: "Start Free Trial →",
      cta2: "Schedule Consultation",
      check1: "No credit card required",
      check2: "14-day free trial",
      check3: "Cancel anytime"
    },
    es: {
      badge: "Confiado por más de 500 Empresas",
      title1: "Servicios Profesionales de Negocios",
      title2: "Entregados con Excelencia",
      desc: "Servicios expertos en logística, soporte IT, asistencia C-level y relaciones con clientes diseñados para elevar sus operaciones.",
      cta1: "Prueba Gratuita →",
      cta2: "Programar Consulta",
      check1: "Sin tarjeta de crédito",
      check2: "Prueba de 14 días",
      check3: "Cancele en cualquier momento"
    }
  };

  const ct = t[lang];

  return (
    <div className="relative pt-16 pb-24 overflow-hidden bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-purple-50 dark:from-purple-900/10 to-transparent opacity-50"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-bold shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
            {ct.badge}
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white leading-tight tracking-tight mb-6">
            {ct.title1} <br /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
              {ct.title2}
            </span>
          </h1>
          <p className="text-xl text-gray-500 dark:text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            {ct.desc}
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button onClick={() => setCurrentPage('contact')} className="bg-purple-600 text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-purple-700 transition-all shadow-xl hover:shadow-purple-200 shine-button shine-purple">
              {ct.cta1}
            </button>
            <button onClick={() => setCurrentPage('contact')} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 px-8 py-4 rounded-xl text-lg font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm shine-button shine-white">
              {ct.cta2}
            </button>
          </div>

          <div className="mt-8 flex items-center justify-center space-x-6 text-sm font-semibold text-gray-400 dark:text-gray-500">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {ct.check1}
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {ct.check2}
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {ct.check3}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
