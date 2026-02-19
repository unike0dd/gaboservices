
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
      terms: "Terms of Service"
    },
    es: {
      services: "Servicios",
      company: "Empresa",
      contact: "Contacto",
      rights: "Todos los derechos reservados.",
      privacy: "Política de Privacidad",
      terms: "Términos de Servicio"
    }
  };

  const t = content[lang];

  return (
    <footer className="bg-gray-900 text-white pt-20 pb-10 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div>
            <div className="flex items-center mb-6 cursor-pointer" onClick={() => setCurrentPage('home')}>
              <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center mr-2">
                <div className="w-4 h-4 bg-white rounded-sm"></div>
              </div>
              <span className="text-2xl font-bold tracking-tight">Gabriel</span>
            </div>
            <p className="text-gray-400 leading-relaxed pr-4">
              Professional business services tailored for your organization's growth.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-6">{t.services}</h4>
            <ul className="space-y-4">
              <li><button onClick={() => setCurrentPage('logistics')} className="text-gray-400 hover:text-white transition-colors">Logistics</button></li>
              <li><button onClick={() => setCurrentPage('it-support')} className="text-gray-400 hover:text-white transition-colors">IT Support</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6">{t.company}</h4>
            <ul className="space-y-4">
              <li><button onClick={() => setCurrentPage('about')} className="text-gray-400 hover:text-white transition-colors">About Us</button></li>
              <li><button onClick={() => setCurrentPage('careers')} className="text-gray-400 hover:text-white transition-colors">Careers</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6">{t.contact}</h4>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li>hello@gabriel.services</li>
              <li>San Francisco, CA</li>
            </ul>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-800">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Gabriel. {t.rights}
          </p>
          <div className="flex space-x-8 text-sm text-gray-500">
            <a href="#" className="hover:text-white">{t.privacy}</a>
            <a href="#" className="hover:text-white">{t.terms}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
