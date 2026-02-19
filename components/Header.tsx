
import React, { useState, useEffect } from 'react';
import { Language } from '../App';

interface HeaderProps {
  scrolled: boolean;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  isDark: boolean;
  toggleDarkMode: () => void;
  language: Language;
  toggleLanguage: () => void;
}

export const Header: React.FC<HeaderProps> = ({ scrolled, currentPage, setCurrentPage, isDark, toggleDarkMode, language, toggleLanguage }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
        setMobileServicesOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [mobileMenuOpen]);

  const t = {
    en: {
      home: 'Home',
      services: 'Services',
      about: 'About Us',
      careers: 'Careers',
      contact: 'Contact',
      getStarted: 'Get Started',
      s1: 'Logistics Management',
      s2: 'IT Support Level I & II',
      s3: 'C-Level Admin Support',
      s4: 'Customer Relations'
    },
    es: {
      home: 'Inicio',
      services: 'Servicios',
      about: 'Sobre Nosotros',
      careers: 'Carreras',
      contact: 'Contacto',
      getStarted: 'Empezar',
      s1: 'Gestión Logística',
      s2: 'Soporte IT Nivel I y II',
      s3: 'Soporte Admin C-Level',
      s4: 'Relaciones con Clientes'
    }
  };

  const ct = t[language];

  const serviceDropdownItems = [
    { label: ct.s1, id: 'logistics' },
    { label: ct.s2, id: 'it-support' },
    { label: ct.s3, id: 'admin-support' },
    { label: ct.s4, id: 'customer-relations' }
  ];

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
    setMobileServicesOpen(false);
    setDropdownOpen(false);
  };

  return (
    <header className={`fixed w-full z-50 transition-all duration-300 ${scrolled || mobileMenuOpen ? 'bg-white/95 dark:bg-gray-900/95 shadow-md py-3' : 'bg-white dark:bg-gray-900 py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div 
          className="flex items-center cursor-pointer group z-50" 
          onClick={() => handlePageChange('home')}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center mr-2 shadow-lg group-hover:scale-110 transition-transform">
            <div className="w-5 h-5 bg-white rounded-sm"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight leading-none">Gabriel</span>
            <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider leading-tight">Outsource, Delivered</span>
          </div>
        </div>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex space-x-6 items-center">
          <button
            onClick={() => handlePageChange('home')}
            className={`text-sm font-semibold transition-colors ${currentPage === 'home' ? 'text-purple-600' : 'text-gray-600 dark:text-gray-300 hover:text-purple-600'}`}
          >
            {ct.home}
          </button>
          
          <div 
            className="relative"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <button
              aria-expanded={dropdownOpen}
              className={`text-sm font-semibold transition-colors flex items-center space-x-1 ${['logistics', 'it-support', 'admin-support', 'customer-relations'].includes(currentPage) ? 'text-purple-600' : 'text-gray-600 dark:text-gray-300 hover:text-purple-600'}`}
            >
              <span>{ct.services}</span>
              <svg className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {dropdownOpen && (
              <div className="absolute top-full left-0 w-64 bg-white dark:bg-gray-800 shadow-2xl rounded-2xl py-2 border border-gray-100 dark:border-gray-700 animate-fade-in-down">
                {serviceDropdownItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handlePageChange(item.id)}
                    className="w-full text-left px-6 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-purple-600 transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => handlePageChange('about')}
            className={`text-sm font-semibold transition-colors ${currentPage === 'about' ? 'text-purple-600' : 'text-gray-600 dark:text-gray-300 hover:text-purple-600'}`}
          >
            {ct.about}
          </button>
          <button
            onClick={() => handlePageChange('careers')}
            className={`text-sm font-semibold transition-colors ${currentPage === 'careers' ? 'text-purple-600' : 'text-gray-600 dark:text-gray-300 hover:text-purple-600'}`}
          >
            {ct.careers}
          </button>
          <button
            onClick={() => handlePageChange('contact')}
            className={`text-sm font-semibold transition-colors ${currentPage === 'contact' ? 'text-purple-600' : 'text-gray-600 dark:text-gray-300 hover:text-purple-600'}`}
          >
            {ct.contact}
          </button>
          
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>

          <div className="flex items-center space-x-1">
            <button 
              onClick={toggleLanguage}
              className="px-2 py-1 rounded text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-all border border-gray-200 dark:border-gray-700"
            >
              {language.toUpperCase()}
            </button>

            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              aria-label="Toggle Dark Mode"
            >
              {isDark ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.243 16.243l.707.707M7.757 7.757l.707-.707M12 7a5 5 0 100 10 5 5 0 000-10z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>

          <button 
            onClick={() => handlePageChange('contact')}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-purple-700 transition-all shadow-md hover:shadow-purple-100 dark:hover:shadow-purple-900/30 shine-button shine-white"
          >
            {ct.getStarted}
          </button>
        </nav>

        {/* Hamburger Button */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle Menu"
          className="md:hidden text-gray-600 dark:text-gray-300 z-50 p-2 focus:outline-none"
        >
          {mobileMenuOpen ? (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        {/* Mobile Menu Overlay */}
        <div 
          className={`fixed inset-0 bg-white dark:bg-gray-900 z-40 transition-transform duration-500 ease-in-out md:hidden ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
          style={{ paddingTop: '80px' }}
        >
          <div className="flex flex-col h-full px-8 overflow-y-auto">
            <div className="space-y-2 mb-8">
              <button
                onClick={() => handlePageChange('home')}
                className={`block w-full text-left text-2xl font-bold py-3 ${currentPage === 'home' ? 'text-purple-600' : 'text-gray-900 dark:text-white'}`}
              >
                {ct.home}
              </button>
              
              <div className="border-b border-gray-100 dark:border-gray-800 pb-2 mb-2">
                <button
                  onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                  aria-expanded={mobileServicesOpen}
                  className={`flex items-center justify-between w-full text-left text-2xl font-bold py-3 transition-colors ${['logistics', 'it-support', 'admin-support', 'customer-relations'].includes(currentPage) ? 'text-purple-600' : 'text-gray-900 dark:text-white'}`}
                >
                  <span>{ct.services}</span>
                  <svg className={`w-6 h-6 transition-transform duration-300 ${mobileServicesOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${mobileServicesOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="pl-4 space-y-1 py-2">
                    {serviceDropdownItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handlePageChange(item.id)}
                        className={`block w-full text-left text-lg font-medium py-3 px-4 rounded-xl transition-colors ${currentPage === item.id ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handlePageChange('about')}
                className={`block w-full text-left text-2xl font-bold py-3 ${currentPage === 'about' ? 'text-purple-600' : 'text-gray-900 dark:text-white'}`}
              >
                {ct.about}
              </button>
              <button
                onClick={() => handlePageChange('careers')}
                className={`block w-full text-left text-2xl font-bold py-3 ${currentPage === 'careers' ? 'text-purple-600' : 'text-gray-900 dark:text-white'}`}
              >
                {ct.careers}
              </button>
              <button
                onClick={() => handlePageChange('contact')}
                className={`block w-full text-left text-2xl font-bold py-3 ${currentPage === 'contact' ? 'text-purple-600' : 'text-gray-900 dark:text-white'}`}
              >
                {ct.contact}
              </button>
            </div>

            <div className="mt-auto pb-12">
              <div className="flex items-center space-x-4 mb-8">
                <button 
                  onClick={toggleLanguage}
                  className="flex-1 px-4 py-4 rounded-xl text-sm font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 flex items-center justify-center space-x-2 border border-gray-200 dark:border-gray-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                  <span>{language === 'en' ? 'Español' : 'English'}</span>
                </button>

                <button 
                  onClick={toggleDarkMode}
                  className="px-4 py-4 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 flex-1 flex items-center justify-center border border-gray-200 dark:border-gray-700"
                >
                  {isDark ? (
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.243 16.243l.707.707M7.757 7.757l.707-.707M12 7a5 5 0 100 10 5 5 0 000-10z" />
                      </svg>
                      <span className="text-sm font-bold">Light</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                      <span className="text-sm font-bold">Dark</span>
                    </div>
                  )}
                </button>
              </div>

              <button 
                onClick={() => handlePageChange('contact')}
                className="w-full bg-purple-600 text-white px-6 py-4 rounded-xl text-lg font-bold shadow-xl hover:bg-purple-700 transition-all"
              >
                {ct.getStarted}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
