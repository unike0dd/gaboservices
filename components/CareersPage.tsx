
import React, { useState } from 'react';
import { Language } from '../App';

interface CareersPageProps {
  lang: Language;
}

interface DynamicField {
  id: string;
  value: string;
  isLocked: boolean;
}

type Category = 'experience' | 'skills' | 'achievements' | 'certifications' | 'education';

export const CareersPage: React.FC<CareersPageProps> = ({ lang }) => {
  const [submitted, setSubmitted] = useState(false);
  
  // State for dynamic fields
  const [dynamicFields, setDynamicFields] = useState<Record<Category, DynamicField[]>>({
    experience: [{ id: 'exp-1', value: '', isLocked: false }],
    skills: [{ id: 'skl-1', value: '', isLocked: false }],
    achievements: [{ id: 'ach-1', value: '', isLocked: false }],
    certifications: [{ id: 'crt-1', value: '', isLocked: false }],
    education: [{ id: 'edu-1', value: '', isLocked: false }],
  });

  // State for standard lockable fields
  const [yearsExp, setYearsExp] = useState({ value: '', isLocked: false });
  const [levelExp, setLevelExp] = useState({ value: 'Entry', isLocked: false });
  
  // State for new Location and Salary fields
  const [city, setCity] = useState({ value: '', isLocked: false });
  const [province, setProvince] = useState({ value: '', isLocked: false });
  const [country, setCountry] = useState({ value: '', isLocked: false });
  const [salaryAmount, setSalaryAmount] = useState({ value: '', isLocked: false });
  const [salaryPeriod, setSalaryPeriod] = useState({ value: 'Monthly', isLocked: false });

  const content = {
    en: {
      title: "Join Our Team",
      sub: "Build your career with a company that values excellence, innovation, and professional growth.",
      why: "Why Work at Gabriel?",
      apply: "Apply Now",
      formTitle: "Professional Application",
      formSub: "Complete the form below to start your journey with us.",
      fullName: "Full Name",
      email: "Email Address",
      phone: "Phone Number",
      position: "Desired Position",
      yearsExp: "Years of Experience",
      levelExp: "Level of Experience",
      city: "City",
      province: "Province / State",
      country: "Country",
      salary: "Desirable Salary",
      salaryPeriod: "Salary Period",
      monthly: "Monthly",
      yearly: "Yearly",
      linkedIn: "LinkedIn Profile URL",
      portfolio: "Portfolio / Website",
      coverLetter: "Cover Letter / Additional Info",
      submitBtn: "Submit Application",
      successMsg: "Thank you! Your application has been received.",
      add: "Add",
      remove: "Remove",
      accept: "Accept",
      levels: ["Entry", "Junior", "Mid-Term", "Advance"],
      sections: {
        experience: "My Experience",
        skills: "My Skills",
        achievements: "My Achievements",
        certifications: "My Certifications",
        education: "My Education"
      },
      placeholders: {
        experience: "e.g. Senior Manager at Logistics Inc.",
        skills: "e.g. Advanced Data Analysis",
        achievements: "e.g. 20% growth in quarterly sales",
        certifications: "e.g. PMP Certified Professional",
        education: "e.g. MBA in Business Administration"
      },
      jobs: [
        { title: 'Senior Logistics Coordinator', type: 'Remote | Full-time', category: 'Logistics', desc: 'Lead logistics operations and coordinate with clients.' },
        { title: 'IT Support Specialist', type: 'Hybrid | Full-time', category: 'IT Support', desc: 'Provide Level I & II technical support to clients.' }
      ],
      options: [
        "Logistics Management",
        "IT Support Level I & II",
        "C-Level Admin Support",
        "Customer Relations & Experience",
        "Other"
      ]
    },
    es: {
      title: "Únete a Nuestro Equipo",
      sub: "Construye tu carrera con una empresa que valora la excelencia, la innovación y el crecimiento profesional.",
      why: "¿Por qué trabajar en Gabriel?",
      apply: "Postular Ahora",
      formTitle: "Solicitud Profesional",
      formSub: "Complete el siguiente formulario para comenzar su viaje con nosotros.",
      fullName: "Nombre Completo",
      email: "Correo Electrónico",
      phone: "Número de Teléfono",
      position: "Posición Deseada",
      yearsExp: "Años de Experiencia",
      levelExp: "Nivel de Experiencia",
      city: "Ciudad",
      province: "Provincia / Estado",
      country: "País",
      salary: "Salario Deseado",
      salaryPeriod: "Periodo de Salario",
      monthly: "Mensual",
      yearly: "Anual",
      linkedIn: "URL de Perfil de LinkedIn",
      portfolio: "Portafolio / Sitio Web",
      coverLetter: "Carta de Presentación / Información Adicional",
      submitBtn: "Enviar Solicitud",
      successMsg: "¡Gracias! Su solicitud ha sido recibida.",
      add: "Agregar",
      remove: "Eliminar",
      accept: "Aceptar",
      levels: ["Inicial", "Junior", "Intermedio", "Avanzado"],
      sections: {
        experience: "Mi Experiencia",
        skills: "Mis Habilidades",
        achievements: "Mis Logros",
        certifications: "Mis Certificaciones",
        education: "Mi Educación"
      },
      placeholders: {
        experience: "ej. Gerente Senior en Logística Inc.",
        skills: "ej. Análisis de Datos Avanzado",
        achievements: "ej. Crecimiento del 20% en ventas trimestrales",
        certifications: "ej. Profesional Certificado PMP",
        education: "ej. MBA en Administración de Empresas"
      },
      jobs: [
        { title: 'Coordinador Logístico Senior', type: 'Remoto | Tiempo Completo', category: 'Logística', desc: 'Liderar operaciones logísticas y coordinar con clientes.' },
        { title: 'Especialista en Soporte IT', type: 'Híbrido | Tiempo Completo', category: 'Soporte IT', desc: 'Brindar soporte técnico de Nivel I y II a los clientes.' }
      ],
      options: [
        "Gestión Logística",
        "Soporte IT Nivel I y II",
        "Soporte Administrativo C-Level",
        "Relaciones y Experiencia del Cliente",
        "Otro"
      ]
    }
  };

  const t = content[lang];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  // Dynamic field handlers
  const addField = (category: Category) => {
    const id = `${category}-${Date.now()}`;
    setDynamicFields(prev => ({
      ...prev,
      [category]: [...prev[category], { id, value: '', isLocked: false }]
    }));
  };

  const removeField = (category: Category, id: string) => {
    setDynamicFields(prev => ({
      ...prev,
      [category]: prev[category].filter(field => field.id !== id)
    }));
  };

  const updateField = (category: Category, id: string, value: string) => {
    setDynamicFields(prev => ({
      ...prev,
      [category]: prev[category].map(field => field.id === id ? { ...field, value } : field)
    }));
  };

  const lockField = (category: Category, id: string) => {
    setDynamicFields(prev => ({
      ...prev,
      [category]: prev[category].map(field => field.id === id ? { ...field, isLocked: !field.isLocked } : field)
    }));
  };

  const renderAcceptButton = (isLocked: boolean, onToggle: () => void) => (
    <button
      type="button"
      onClick={onToggle}
      className={`p-4 rounded-xl transition-all flex items-center justify-center shrink-0 ${isLocked ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 hover:text-purple-600'}`}
    >
      {isLocked ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ) : (
        <span className="text-[10px] font-black uppercase tracking-tighter">{t.accept}</span>
      )}
    </button>
  );

  const renderDynamicSection = (category: Category, icon: React.ReactNode) => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center space-x-2">
            {icon}
            <span>{t.sections[category]}</span>
          </label>
          <button 
            type="button"
            onClick={() => addField(category)}
            className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center space-x-1"
          >
            <span>+ {t.add}</span>
          </button>
        </div>
        <div className="space-y-3">
          {dynamicFields[category].map((field) => (
            <div key={field.id} className="flex items-center space-x-2 animate-fade-in-down">
              <input
                type="text"
                readOnly={field.isLocked}
                value={field.value}
                onChange={(e) => updateField(category, field.id, e.target.value)}
                placeholder={t.placeholders[category]}
                className={`flex-grow bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-600 transition-all outline-none ${field.isLocked ? 'opacity-60 cursor-not-allowed italic' : ''}`}
              />
              <button
                type="button"
                onClick={() => lockField(category, field.id)}
                className={`p-3 rounded-xl transition-all flex items-center justify-center ${field.isLocked ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 hover:text-purple-600'}`}
                title={field.isLocked ? "Unlock" : t.accept}
              >
                {field.isLocked ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                ) : (
                  <span className="text-[10px] font-black uppercase tracking-tighter">{t.accept}</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => removeField(category, field.id)}
                className="p-3 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-all"
                title={t.remove}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-in pb-24">
      {/* Hero Section */}
      <section className="py-20 text-center bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(124,58,237,0.3),transparent_70%)]"></div>
        </div>
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <h1 className="text-5xl font-extrabold mb-6 reveal active">{t.title}</h1>
          <p className="text-xl text-gray-400 mb-10 reveal active" style={{ transitionDelay: '100ms' }}>{t.sub}</p>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-24 bg-white dark:bg-gray-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white text-center mb-16 reveal active">{t.why}</h2>
          <div className="space-y-6 max-w-5xl mx-auto reveal active" style={{ transitionDelay: '200ms' }}>
            {t.jobs.map((j, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col md:flex-row justify-between items-center group transition-all hover:shadow-md">
                <div className="flex-grow pr-8 mb-6 md:mb-0">
                  <div className="flex items-center mb-2">
                    <span className="bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-bold px-3 py-1 rounded-full mr-4">{j.category}</span>
                    <span className="text-sm font-semibold text-gray-400">{j.type}</span>
                  </div>
                  <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 transition-colors">{j.title}</h4>
                  <p className="text-gray-500 dark:text-gray-400">{j.desc}</p>
                </div>
                <button 
                  onClick={() => document.getElementById('application-form')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-purple-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 dark:shadow-none"
                >
                  {t.apply}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Professional Application Form */}
      <section id="application-form" className="py-24 bg-gray-50 dark:bg-gray-800/50 transition-colors">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 reveal active">
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">{t.formTitle}</h2>
            <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">{t.formSub}</p>
          </div>

          <div className="max-w-5xl mx-auto bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 reveal active" style={{ transitionDelay: '300ms' }}>
            <div className="flex flex-col lg:flex-row">
              {/* Left Sidebar Info */}
              <div className="lg:w-1/3 bg-gradient-to-br from-indigo-700 to-purple-800 p-12 text-white">
                <h3 className="text-2xl font-bold mb-8">{lang === 'en' ? 'Candidate Portal' : 'Portal del Candidato'}</h3>
                <div className="space-y-8">
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mr-4 shrink-0">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                    <div>
                      <h4 className="font-bold">{lang === 'en' ? 'Global Talent' : 'Talento Global'}</h4>
                      <p className="text-indigo-100 text-sm">{lang === 'en' ? 'We hire the best, regardless of location.' : 'Contratamos a los mejores, sin importar su ubicación.'}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mr-4 shrink-0">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <div>
                      <h4 className="font-bold">{lang === 'en' ? 'Fast Review' : 'Revisión Rápida'}</h4>
                      <p className="text-indigo-100 text-sm">{lang === 'en' ? 'Initial feedback within 48 hours.' : 'Comentarios iniciales en 48 horas.'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-20 p-6 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-xs text-indigo-200 italic">
                    {lang === 'en' 
                      ? "Ensure all dynamic sections are 'Accepted' and locked for verification." 
                      : "Asegúrese de que todas las secciones dinámicas estén 'Aceptadas' y bloqueadas para su verificación."}
                  </p>
                </div>
              </div>

              {/* Right Side Form */}
              <div className="lg:w-2/3 p-10 lg:p-16">
                {submitted ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-6 animate-fade-in">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{t.successMsg}</h3>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-10">
                    <div className="space-y-6">
                      <h4 className="text-lg font-bold text-purple-600 border-b border-gray-100 dark:border-gray-800 pb-2">{lang === 'en' ? 'Basic Information' : 'Información Básica'}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-gray-700 dark:text-gray-300">{t.fullName}</label>
                          <input required type="text" className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-600 transition-all outline-none" placeholder="Jane Doe" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-gray-700 dark:text-gray-300">{t.email}</label>
                          <input required type="email" className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-600 transition-all outline-none" placeholder="jane@example.com" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-gray-700 dark:text-gray-300">{t.phone}</label>
                          <input required type="tel" className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-600 transition-all outline-none" placeholder="+1 (555) 000-0000" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-gray-700 dark:text-gray-300">{t.position}</label>
                          <select required className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-600 transition-all outline-none appearance-none">
                            {t.options.map((opt, i) => (
                              <option key={i} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Location Information with Lock Logic */}
                      <div className="space-y-6 pt-4">
                        <h4 className="text-lg font-bold text-purple-600 border-b border-gray-100 dark:border-gray-800 pb-2">{lang === 'en' ? 'Location & Address' : 'Ubicación y Dirección'}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">{t.city}</label>
                            <div className="flex items-center space-x-2">
                              <input 
                                required 
                                type="text" 
                                readOnly={city.isLocked}
                                value={city.value}
                                onChange={(e) => setCity(prev => ({ ...prev, value: e.target.value }))}
                                className={`flex-grow bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-600 transition-all outline-none ${city.isLocked ? 'opacity-60 italic' : ''}`} 
                                placeholder="San Francisco" 
                              />
                              {renderAcceptButton(city.isLocked, () => setCity(prev => ({ ...prev, isLocked: !prev.isLocked })))}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">{t.province}</label>
                            <div className="flex items-center space-x-2">
                              <input 
                                required 
                                type="text" 
                                readOnly={province.isLocked}
                                value={province.value}
                                onChange={(e) => setProvince(prev => ({ ...prev, value: e.target.value }))}
                                className={`flex-grow bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-600 transition-all outline-none ${province.isLocked ? 'opacity-60 italic' : ''}`} 
                                placeholder="California" 
                              />
                              {renderAcceptButton(province.isLocked, () => setProvince(prev => ({ ...prev, isLocked: !prev.isLocked })))}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-gray-700 dark:text-gray-300">{t.country}</label>
                          <div className="flex items-center space-x-2">
                            <input 
                              required 
                              type="text" 
                              readOnly={country.isLocked}
                              value={country.value}
                              onChange={(e) => setCountry(prev => ({ ...prev, value: e.target.value }))}
                              className={`flex-grow bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-600 transition-all outline-none ${country.isLocked ? 'opacity-60 italic' : ''}`} 
                              placeholder="USA" 
                            />
                            {renderAcceptButton(country.isLocked, () => setCountry(prev => ({ ...prev, isLocked: !prev.isLocked })))}
                          </div>
                        </div>
                      </div>

                      {/* Experience and Compensation with Lock Logic */}
                      <div className="space-y-6 pt-4">
                        <h4 className="text-lg font-bold text-purple-600 border-b border-gray-100 dark:border-gray-800 pb-2">{lang === 'en' ? 'Experience & Compensation' : 'Experiencia y Compensación'}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">{t.yearsExp}</label>
                            <div className="flex items-center space-x-2">
                              <input 
                                required 
                                type="number" 
                                min="0"
                                readOnly={yearsExp.isLocked}
                                value={yearsExp.value}
                                onChange={(e) => setYearsExp(prev => ({ ...prev, value: e.target.value }))}
                                className={`flex-grow bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-600 transition-all outline-none ${yearsExp.isLocked ? 'opacity-60 italic' : ''}`} 
                                placeholder="5" 
                              />
                              {renderAcceptButton(yearsExp.isLocked, () => setYearsExp(prev => ({ ...prev, isLocked: !prev.isLocked })))}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">{t.levelExp}</label>
                            <div className="flex items-center space-x-2">
                              <select 
                                required 
                                disabled={levelExp.isLocked}
                                value={levelExp.value}
                                onChange={(e) => setLevelExp(prev => ({ ...prev, value: e.target.value }))}
                                className={`flex-grow bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-600 transition-all outline-none appearance-none ${levelExp.isLocked ? 'opacity-60 italic' : ''}`}
                              >
                                {t.levels.map((lvl, i) => (
                                  <option key={i} value={lvl}>{lvl}</option>
                                ))}
                              </select>
                              {renderAcceptButton(levelExp.isLocked, () => setLevelExp(prev => ({ ...prev, isLocked: !prev.isLocked })))}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">{t.salary}</label>
                            <div className="flex items-center space-x-2">
                              <input 
                                required 
                                type="number" 
                                min="0"
                                readOnly={salaryAmount.isLocked}
                                value={salaryAmount.value}
                                onChange={(e) => setSalaryAmount(prev => ({ ...prev, value: e.target.value }))}
                                className={`flex-grow bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-600 transition-all outline-none ${salaryAmount.isLocked ? 'opacity-60 italic' : ''}`} 
                                placeholder="5000" 
                              />
                              {renderAcceptButton(salaryAmount.isLocked, () => setSalaryAmount(prev => ({ ...prev, isLocked: !prev.isLocked })))}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">{t.salaryPeriod}</label>
                            <div className="flex items-center space-x-2">
                              <select 
                                required 
                                disabled={salaryPeriod.isLocked}
                                value={salaryPeriod.value}
                                onChange={(e) => setSalaryPeriod(prev => ({ ...prev, value: e.target.value }))}
                                className={`flex-grow bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-600 transition-all outline-none appearance-none ${salaryPeriod.isLocked ? 'opacity-60 italic' : ''}`}
                              >
                                <option value="Monthly">{t.monthly}</option>
                                <option value="Yearly">{t.yearly}</option>
                              </select>
                              {renderAcceptButton(salaryPeriod.isLocked, () => setSalaryPeriod(prev => ({ ...prev, isLocked: !prev.isLocked })))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Dynamic Sections */}
                    <div className="space-y-10">
                      <h4 className="text-lg font-bold text-purple-600 border-b border-gray-100 dark:border-gray-800 pb-2">{lang === 'en' ? 'Professional Portfolio' : 'Portafolio Profesional'}</h4>
                      
                      {renderDynamicSection('experience', (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      ))}

                      {renderDynamicSection('skills', (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      ))}

                      {renderDynamicSection('achievements', (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                      ))}

                      {renderDynamicSection('certifications', (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                      ))}

                      {renderDynamicSection('education', (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>
                      ))}
                    </div>

                    <div className="space-y-6 pt-6">
                      <h4 className="text-lg font-bold text-purple-600 border-b border-gray-100 dark:border-gray-800 pb-2">{lang === 'en' ? 'Final Steps' : 'Pasos Finales'}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-gray-700 dark:text-gray-300">{t.linkedIn}</label>
                          <input type="url" className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-600 transition-all outline-none" placeholder="https://linkedin.com/in/..." />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-gray-700 dark:text-gray-300">{t.portfolio}</label>
                          <input type="url" className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-600 transition-all outline-none" placeholder="https://mywork.com" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">{t.coverLetter}</label>
                        <textarea rows={4} className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-600 transition-all outline-none resize-none" placeholder={lang === 'en' ? "Tell us about yourself..." : "Cuéntanos sobre ti..."}></textarea>
                      </div>
                    </div>

                    <button type="submit" className="w-full bg-purple-600 text-white font-bold py-5 rounded-2xl hover:bg-purple-700 transition-all shadow-xl hover:shadow-purple-200 dark:hover:shadow-none shine-button shine-white text-lg">
                      {t.submitBtn}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
