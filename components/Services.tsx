
import React, { useEffect, useRef } from 'react';
import { Language } from '../App';

interface ServicesProps {
  lang: Language;
}

export const Services: React.FC<ServicesProps> = ({ lang }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });

    const items = containerRef.current?.querySelectorAll('.reveal');
    items?.forEach(item => observer.observe(item));

    return () => items?.forEach(item => observer.unobserve(item));
  }, []);

  const content = {
    en: {
      title: "Our Services",
      desc: "Comprehensive business solutions tailored to your needs",
      cta: "Schedule Consultation",
      services: [
        {
          title: "Logistics Management",
          description: "Comprehensive supply chain and logistics solutions. Streamline operations, optimize routes, and ensure timely deliveries.",
          shine: "shine-blue",
          icon: "📦"
        },
        {
          title: "IT Support Level I & II",
          description: "Advanced technical support and infrastructure management. Expert troubleshooting, network administration, and system optimization.",
          shine: "shine-purple",
          icon: "💻"
        },
        {
          title: "C-Level Admin Support",
          description: "Executive support services for top-tier management. Calendar management, correspondence, and strategic administrative assistance.",
          shine: "shine-pink",
          icon: "👔"
        },
        {
          title: "Customer Relations & Experience",
          description: "Build lasting customer relationships with exceptional customer service. Enhance satisfaction, retention, and brand loyalty.",
          shine: "shine-gold",
          icon: "🤝"
        }
      ]
    },
    es: {
      title: "Nuestros Servicios",
      desc: "Soluciones de negocio integrales adaptadas a sus necesidades",
      cta: "Programar Consulta",
      services: [
        {
          title: "Gestión Logística",
          description: "Soluciones integrales de cadena de suministro y logística. Optimice rutas y asegure entregas a tiempo.",
          shine: "shine-blue",
          icon: "📦"
        },
        {
          title: "Soporte IT Nivel I y II",
          description: "Soporte técnico avanzado y gestión de infraestructura. Expertos en redes y optimización de sistemas.",
          shine: "shine-purple",
          icon: "💻"
        },
        {
          title: "Soporte Admin C-Level",
          description: "Servicios de apoyo ejecutivo para alta dirección. Gestión de agendas, correspondencia y asistencia estratégica.",
          shine: "shine-pink",
          icon: "👔"
        },
        {
          title: "Relaciones con Clientes",
          description: "Construya relaciones duraderas con un servicio al cliente excepcional. Mejore la satisfacción y la lealtad.",
          shine: "shine-gold",
          icon: "🤝"
        }
      ]
    }
  };

  const t = content[lang];

  return (
    <div className="py-24 bg-white dark:bg-gray-900 transition-colors duration-300" ref={containerRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 reveal">
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">{t.title}</h2>
          <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">{t.desc}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {t.services.map((service, index) => (
            <div 
              key={index} 
              className={`group bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-2xl transition-all relative overflow-hidden reveal hover:-translate-y-2`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 dark:bg-purple-900/10 rounded-bl-full opacity-50 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/20 transition-colors"></div>
              <div className="w-16 h-16 bg-purple-50 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center text-4xl mb-6 group-hover:bg-purple-600 transition-all">
                {service.icon}
              </div>
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{service.title}</h4>
              <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">{service.description}</p>
              <button className={`flex items-center text-purple-600 dark:text-purple-400 font-bold bg-purple-50 dark:bg-purple-900/30 px-6 py-3 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-all shadow-sm shine-button ${service.shine}`}>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {t.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
