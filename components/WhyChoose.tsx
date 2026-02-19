
import React from 'react';
import { Language } from '../App';

interface WhyChooseProps {
  lang: Language;
}

export const WhyChoose: React.FC<WhyChooseProps> = ({ lang }) => {
  const t = {
    en: {
      title: "Why Choose Gabriel",
      desc: "Powerful features that streamline your business operations",
      f1: { t: "Rapid Response Time", d: "Get immediate support when you need it. Our team is available 24/7." },
      f2: { t: "Enterprise Security", d: "Bank-level encryption and compliance standards. Your data is secure." },
      f3: { t: "Scalable Solutions", d: "Grow your business without limitations. Our services scale seamlessly." },
      f4: { t: "Industry Expertise", d: "Benefit from years of experience across multiple industries." }
    },
    es: {
      title: "¿Por qué elegir Gabriel?",
      desc: "Funciones potentes que agilizan sus operaciones comerciales",
      f1: { t: "Respuesta Rápida", d: "Obtenga soporte inmediato cuando lo necesite. Disponible 24/7." },
      f2: { t: "Seguridad Empresarial", d: "Cifrado de nivel bancario y estándares de cumplimiento." },
      f3: { t: "Soluciones Escalables", d: "Haga crecer su negocio sin limitaciones. Nos adaptamos a usted." },
      f4: { t: "Experiencia en la Industria", d: "Benefíciese de años de experiencia en múltiples sectores." }
    }
  };

  const ct = t[lang || 'en'];

  const FEATURES = [
    { title: ct.f1.t, description: ct.f1.d, icon: "⚡" },
    { title: ct.f2.t, description: ct.f2.d, icon: "🛡️" },
    { title: ct.f3.t, description: ct.f3.d, icon: "📈" },
    { title: ct.f4.t, description: ct.f4.d, icon: "🏢" }
  ];

  return (
    <div className="py-24 bg-gray-50 dark:bg-gray-800/50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{ct.title}</h2>
          <p className="text-xl text-gray-500 dark:text-gray-400">{ct.desc}</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {FEATURES.map((f, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-start">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-3xl mr-8 flex-shrink-0">
                {f.icon}
              </div>
              <div>
                <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{f.title}</h4>
                <p className="text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
