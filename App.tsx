
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Services } from './components/Services';
import { AboutPage } from './components/AboutPage';
import { CareersPage } from './components/CareersPage';
import { ContactPage } from './components/ContactPage';
import { WhyChoose } from './components/WhyChoose';
import { HowItWorks } from './components/HowItWorks';
import { Pricing } from './components/Pricing';
import { Testimonials } from './components/Testimonials';
import { Footer } from './components/Footer';
import { GeminiAssistant } from './components/GeminiAssistant';
import { LogisticsPage } from './components/LogisticsPage';
import { ITSupportPage } from './components/ITSupportPage';
import { AdminSupportPage } from './components/AdminSupportPage';
import { CustomerRelationsPage } from './components/CustomerRelationsPage';
import { CookieConsent } from './components/CookieConsent';

export type Language = 'en' | 'es';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [scrolled, setScrolled] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    window.scrollTo(0, 0); 
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentPage]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleDarkMode = () => setIsDark(!isDark);
  const toggleLanguage = () => setLanguage(l => l === 'en' ? 'es' : 'en');

  const t = {
    en: {
      ctaTitle: "Ready to Elevate Your Business Operations?",
      ctaDesc: "Join 4,759+ SMB companies that trust Gabriel for their professional service needs.",
      startFree: "Start Free Trial",
      schedule: "Schedule Consultation"
    },
    es: {
      ctaTitle: "¿Listo para Elevar sus Operaciones Comerciales?",
      ctaDesc: "Únase a más de 4,759 empresas SMB que confían en Gabriel para sus necesidades de servicios profesionales.",
      startFree: "Iniciar Prueba Gratuita",
      schedule: "Programar Consulta"
    }
  };

  const currentT = t[language];

  const renderContent = () => {
    switch (currentPage) {
      case 'about':
        return <AboutPage lang={language} />;
      case 'careers':
        return <CareersPage lang={language} />;
      case 'contact':
        return <ContactPage lang={language} />;
      case 'logistics':
        return <LogisticsPage setCurrentPage={setCurrentPage} lang={language} />;
      case 'it-support':
        return <ITSupportPage setCurrentPage={setCurrentPage} lang={language} />;
      case 'admin-support':
        return <AdminSupportPage setCurrentPage={setCurrentPage} lang={language} />;
      case 'customer-relations':
        return <CustomerRelationsPage setCurrentPage={setCurrentPage} lang={language} />;
      case 'home':
      default:
        return (
          <>
            <Hero setCurrentPage={setCurrentPage} lang={language} />
            <Services lang={language} />
            <WhyChoose lang={language} />
            <HowItWorks lang={language} />
            <Testimonials lang={language} />
            <Pricing lang={language} />
            <section className="bg-gradient-to-r from-purple-600 to-indigo-700 py-20 text-white text-center">
              <div className="max-w-4xl mx-auto px-4">
                <h2 className="text-4xl font-bold mb-6">{currentT.ctaTitle}</h2>
                <p className="text-xl text-purple-100 mb-10">{currentT.ctaDesc}</p>
                <div className="flex justify-center space-x-4">
                  <button onClick={() => setCurrentPage('contact')} className="bg-white text-purple-700 px-8 py-4 rounded-xl font-bold shadow-lg hover:bg-gray-50 transition-all shine-button shine-purple">{currentT.startFree}</button>
                  <button onClick={() => setCurrentPage('contact')} className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-all shine-button shine-white">{currentT.schedule}</button>
                </div>
              </div>
            </section>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors duration-300">
      <Header 
        scrolled={scrolled} 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        isDark={isDark}
        toggleDarkMode={toggleDarkMode}
        language={language}
        toggleLanguage={toggleLanguage}
      />
      <main className="flex-grow pt-20">
        {renderContent()}
      </main>
      <Footer setCurrentPage={setCurrentPage} lang={language} />
      <GeminiAssistant language={language} />
      <CookieConsent lang={language} />
    </div>
  );
};

export default App;
