
import React from 'react';
import { Language } from '../App';

interface HeroProps {
  setCurrentPage: (page: string) => void;
  lang: Language;
}

export const Hero: React.FC<HeroProps> = ({ setCurrentPage, lang }) => {
  const t = {
    en: {
      badge: "Trusted by 4,759+ SMB Companies",
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
      badge: "Confiado por más de 4,759 SMB Empresas",
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
    <div className="relative pt-12 pb-24 md:pt-16 md:pb-32 overflow-hidden bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Decorative Blobs */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-purple-100/50 dark:from-purple-900/10 to-transparent pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-[10px] sm:text-xs font-bold shadow-sm border border-gray-100 dark:border-gray-700 mb-8 animate-fade-in-down">
            <span className="flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            {ct.badge}
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white leading-tight tracking-tight mb-6 reveal active">
            {ct.title1} <br /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
              {ct.title2}
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed reveal active" style={{ transitionDelay: '200ms' }}>
            {ct.desc}
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-stretch sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 px-4 sm:px-0 reveal active" style={{ transitionDelay: '400ms' }}>
            <button onClick={() => setCurrentPage('contact')} className="bg-purple-600 text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-purple-700 transition-all shadow-xl hover:shadow-purple-200 dark:hover:shadow-none shine-button shine-purple">
              {ct.cta1}
            </button>
            <button onClick={() => setCurrentPage('contact')} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 px-8 py-4 rounded-xl text-lg font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm shine-button shine-white">
              {ct.cta2}
            </button>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-sm font-semibold text-gray-400 dark:text-gray-500 reveal active" style={{ transitionDelay: '600ms' }}>
            <div className="flex items-center">
              <div className="w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mr-2">
                <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              {ct.check1}
            </div>
            <div className="flex items-center">
              <div className="w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mr-2">
                <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              {ct.check2}
            </div>
            <div className="flex items-center">
              <div className="w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mr-2">
                <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              {ct.check3}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
