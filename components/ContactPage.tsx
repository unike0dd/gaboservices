
import React from 'react';
import { Language } from '../App';

interface ContactPageProps {
  lang: Language;
}

export const ContactPage: React.FC<ContactPageProps> = ({ lang }) => {
  const content = {
    en: {
      title: "Get in Touch",
      sub: "Have questions? We'd love to hear from you. Send us a message.",
      name: "Full Name",
      email: "Email Address",
      company: "Company Name",
      serviceInterest: "Service Interest",
      msg: "Message",
      send: "Send Message",
      info: "Contact Information",
      visit: "Visit Us",
      options: [
        { value: "logistics", label: "Logistics Management" },
        { value: "it-support", label: "IT Support Level I & II" },
        { value: "admin-support", label: "C-Level Admin Support" },
        { value: "customer-relations", label: "Customer Relations & Experience" }
      ]
    },
    es: {
      title: "Ponte en Contacto",
      sub: "¿Tienes preguntas? Nos encantaría saber de ti. Envíanos un mensaje.",
      name: "Nombre Completo",
      email: "Correo Electrónico",
      company: "Nombre de la Empresa",
      serviceInterest: "Servicio de Interés",
      msg: "Mensaje",
      send: "Enviar Mensaje",
      info: "Información de Contacto",
      visit: "Visítanos",
      options: [
        { value: "logistics", label: "Gestión Logística" },
        { value: "it-support", label: "Soporte IT Nivel I y II" },
        { value: "admin-support", label: "Soporte Administrativo C-Level" },
        { value: "customer-relations", label: "Relaciones con Clientes" }
      ]
    }
  };

  const t = content[lang];

  return (
    <div className="animate-fade-in">
      <section className="py-20 bg-gray-50 dark:bg-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-6">{t.title}</h1>
            <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">{t.sub}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-12 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t.name}</label>
                    <input type="text" className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-600 transition-all outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t.email}</label>
                    <input type="email" className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-600 transition-all outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t.company}</label>
                    <input type="text" className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-600 transition-all outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t.serviceInterest}</label>
                    <select className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-600 transition-all outline-none appearance-none">
                      {t.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t.msg}</label>
                  <textarea rows={5} className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-600 transition-all outline-none"></textarea>
                </div>
                
                <button type="submit" className="w-full bg-purple-600 text-white font-bold py-5 rounded-xl hover:bg-purple-700 transition-all shadow-lg hover:shadow-purple-200 dark:hover:shadow-none shine-button shine-white">
                  {t.send}
                </button>
              </form>
            </div>
            
            <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t.info}</h4>
                <div className="space-y-6 text-gray-500 dark:text-gray-400">
                    <div>
                        <div className="font-bold text-gray-900 dark:text-white mb-1">{t.visit}</div>
                        <div>123 Business Avenue, New York, NY</div>
                    </div>
                    <div>
                        <div className="font-bold text-gray-900 dark:text-white mb-1">Email</div>
                        <div>hello@gabriel.services</div>
                    </div>
                    <div className="pt-4 flex space-x-4">
                      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center cursor-pointer hover:bg-purple-600 hover:text-white transition-all">in</div>
                      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center cursor-pointer hover:bg-purple-600 hover:text-white transition-all">t</div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
