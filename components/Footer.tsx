
import React from 'react';
import { Language } from '../App';

interface FooterProps {
  setCurrentPage: (page: string) => void;
  lang: Language;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentPage, lang }) => {
  const content = {
    en: {
      services: "Services",
      company: "Company",
      contact: "Contact",
      rights: "All rights reserved.",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
      s1: 'Logistics Management',
      s2: 'IT Support Level I & II',
      s3: 'C-Level Admin Support',
      s4: 'Customer Relations'
    },
    es: {
      services: "Servicios",
      company: "Empresa",
      contact: "Contacto",
      rights: "Todos los derechos reservados.",
      privacy: "Política de Privacidad",
      terms: "Términos de Servicio",
      s1: 'Gestión Logística',
      s2: 'Soporte IT Nivel I y II',
      s3: 'Soporte Admin C-Level',
      s4: 'Relaciones con Clientes'
    }
  };

  const t = content[lang];

  const serviceLinks = [
    { label: t.s1, id: 'logistics' },
    { label: t.s2, id: 'it-support' },
    { label: t.s3, id: 'admin-support' },
    { label: t.s4, id: 'customer-relations' }
  ];

  return (
    <footer className="bg-gray-900 text-white pt-20 pb-10 border-t border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="reveal">
            <div className="flex items-center mb-6 cursor-pointer" onClick={() => setCurrentPage('home')}>
              <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center mr-2">
                <div className="w-4 h-4 bg-white rounded-sm"></div>
              </div>
              <span className="text-2xl font-bold tracking-tight">Gabriel</span>
            </div>
            <p className="text-gray-400 leading-relaxed pr-4">
              Professional business services tailored for your organization's growth. Outsource, Delivered.
            </p>
          </div>
          
          <div className="reveal" style={{ transitionDelay: '100ms' }}>
            <h4 className="text-lg font-bold mb-6">{t.services}</h4>
            <ul className="space-y-4">
              {serviceLinks.map((service) => (
                <li key={service.id}>
                  <button 
                    onClick={() => setCurrentPage(service.id)} 
                    className="text-gray-400 hover:text-white transition-colors text-left"
                  >
                    {service.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="reveal" style={{ transitionDelay: '200ms' }}>
            <h4 className="text-lg font-bold mb-6">{t.company}</h4>
            <ul className="space-y-4">
              <li><button onClick={() => setCurrentPage('about')} className="text-gray-400 hover:text-white transition-colors">About Us</button></li>
              <li><button onClick={() => setCurrentPage('careers')} className="text-gray-400 hover:text-white transition-colors">Careers</button></li>
              <li><button onClick={() => setCurrentPage('contact')} className="text-gray-400 hover:text-white transition-colors">Get Started</button></li>
            </ul>
          </div>

          <div className="reveal" style={{ transitionDelay: '300ms' }}>
            <h4 className="text-lg font-bold mb-6">{t.contact}</h4>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-3 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                hello@gabriel.services
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-3 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                San Francisco, CA
              </li>
            </ul>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-800">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Gabriel. {t.rights}
          </p>
          <div className="flex space-x-8 text-sm text-gray-500">
            <a href="#" className="hover:text-white transition-colors">{t.privacy}</a>
            <a href="#" className="hover:text-white transition-colors">{t.terms}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
