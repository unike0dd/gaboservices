export const SUPPORTED_LANGUAGES = ['en', 'es'];

export const LANGUAGE_CODES = {
  en: 'EN',
  es: 'ES'
};

export const TRANSLATION_PAGE_MAP = Object.freeze({
  home: ['shared', 'home'],
  about: ['shared', 'about'],
  services: ['shared', 'services'],
  pricing: ['shared', 'pricing'],
  careers: ['shared', 'careers'],
  contact: ['shared', 'contact'],
  learning: ['shared', 'learning'],
  logistics: ['shared', 'logistics'],
  administrativeBackoffice: ['shared', 'administrativeBackoffice'],
  customerRelations: ['shared', 'customerRelations'],
  itSupport: ['shared', 'itSupport']
});

const SHARED_TRANSLATIONS = {
  en: {
    brandSubtitle: 'Outsourcing that delivers',
    editorialTheme: 'Magazine-style layout',
    home: 'Home',
    about: 'About',
    services: 'Services',
    pricing: 'Pricing',
    careers: 'Careers',
    learning: 'Learning',
    contact: 'Contact',
    switchToEnglish: 'Switch language to English',
    switchToSpanish: 'Cambiar idioma a español',
    footerCompany: 'Company',
    footerAbout: 'About us',
    footerServices: 'Services',
    footerCareers: 'Careers',
    footerSupport: 'Support',
    footerContact: 'Contact',
    footerKnowledge: 'Knowledge',
    footerSitemap: 'Sitemap',
    footerLegal: 'Legal',
    footerTerms: 'Terms and Conditions',
    footerCookies: 'Cookie Consent',
    footerPrivacy: 'Privacy and GDPR',
    footerCopyright: 'Gabriel Services',
    name: 'Name',
    email: 'Email',
    message: 'Message',
    send: 'Send',
    contactNumber: 'Your contact number',
    countryCode: 'Country code',
    countryCodePlaceholder: 'Country code',
    phoneNumber: 'Phone number',
    lockSection: 'Lock section',
    add: 'Add',
    remove: 'Remove',
    submitApplication: 'Submit application',
    experience: 'Experience',
    education: 'Education',
    certification: 'Certification',
    skills: 'Skills',
    expertise: 'Current expertise level',
    languages: 'Languages',
    selectLevel: 'Select level',
    entry: 'Entry',
    junior: 'Junior',
    mid: 'Mid',
    advanced: 'Advanced',
    expert: 'Expert',
    placeholderExperience: 'Describe your experience',
    placeholderEducation: 'Describe your education',
    placeholderCertification: 'List your certifications',
    placeholderSkills: 'Add your skills',
    placeholderExpertise: 'Describe your expertise',
    placeholderLanguages: 'List language(s) and level',
    pageTitleCareers: 'Careers | Gabriel Services',
    pageTitleContact: 'Contact | Gabriel Services',
    pageDescription: 'Business services for logistics, IT, admin, and customer relations.',
    sent: 'Message sent successfully.',
    blocked: 'We could not submit your message. Please review your input.',
    review: 'Submission received. A manual review is required before processing.',
    applied: 'Application submitted successfully.'
  },
  es: {
    brandSubtitle: 'Tercerización que entrega',
    editorialTheme: 'Corte estilo revista',
    home: 'Inicio',
    about: 'Nosotros',
    services: 'Servicios',
    pricing: 'Precios',
    careers: 'Carreras',
    learning: 'Aprendizaje',
    contact: 'Contacto',
    switchToEnglish: 'Switch language to English',
    switchToSpanish: 'Cambiar idioma a español',
    footerCompany: 'Empresa',
    footerAbout: 'Nosotros',
    footerServices: 'Servicios',
    footerCareers: 'Carreras',
    footerSupport: 'Soporte',
    footerContact: 'Contacto',
    footerKnowledge: 'Conocimiento',
    footerSitemap: 'Mapa del sitio',
    footerLegal: 'Legal',
    footerTerms: 'Términos y condiciones',
    footerCookies: 'Consentimiento de cookies',
    footerPrivacy: 'Privacidad y RGPD',
    footerCopyright: 'Gabriel Services',
    name: 'Nombre',
    email: 'Correo electrónico',
    message: 'Mensaje',
    send: 'Enviar',
    contactNumber: 'Su número de contacto',
    countryCode: 'Código de país',
    countryCodePlaceholder: 'Código de país',
    phoneNumber: 'Número de teléfono',
    lockSection: 'Bloquear sección',
    add: 'Agregar',
    remove: 'Quitar',
    submitApplication: 'Enviar solicitud',
    experience: 'Experiencia',
    education: 'Educación',
    certification: 'Certificación',
    skills: 'Habilidades',
    expertise: 'Nivel actual de experiencia',
    languages: 'Idiomas',
    selectLevel: 'Seleccione nivel',
    entry: 'Inicial',
    junior: 'Junior',
    mid: 'Intermedio',
    advanced: 'Avanzado',
    expert: 'Experto',
    placeholderExperience: 'Describa su experiencia',
    placeholderEducation: 'Describa su educación',
    placeholderCertification: 'Enumere sus certificaciones',
    placeholderSkills: 'Agregue sus habilidades',
    placeholderExpertise: 'Describa su experiencia',
    placeholderLanguages: 'Enumere idiomas y nivel',
    pageTitleCareers: 'Carreras | Gabriel Services',
    pageTitleContact: 'Contacto | Gabriel Services',
    pageDescription: 'Servicios empresariales para logística, TI, administración y relación con clientes.',
    sent: 'Mensaje enviado correctamente.',
    blocked: 'No pudimos enviar su mensaje. Revise los datos e intente de nuevo.',
    review: 'Envío recibido. Requiere revisión manual antes de procesarse.',
    applied: 'Solicitud enviada correctamente.'
  }
};

const SECTION_TRANSLATIONS = {
  shared: SHARED_TRANSLATIONS,
  contact: {
    en: {
      contactHeroTitle: 'Contact Gabriel Services',
      contactHeroLead: 'Reach our team for support, onboarding, project discussions, or partnership inquiries.',
      contactReachTitle: 'How to reach us',
      contactReachBody: 'This contact channel is designed for businesses that need operational support, service onboarding guidance, or partnership conversations with Gabriel Services.',
      contactTellTitle: 'Tell us what you need',
      contactTellBody: 'Share your current workflows, priorities, and expected response needs so we can route your request accurately.',
      contactTime: 'Preferred contact window',
      contactNextTitle: 'What happens next',
      contactNextBody: 'Our team reviews submissions, confirms scope details when needed, and follows up with recommended next steps and expected onboarding flow.'
    },
    es: {
      contactHeroTitle: 'Contacte a Gabriel Services',
      contactHeroLead: 'Contacte a nuestro equipo para soporte, incorporación, conversaciones de proyecto o alianzas.',
      contactReachTitle: 'Cómo comunicarse con nosotros',
      contactReachBody: 'Este canal está diseñado para empresas que necesitan soporte operativo, orientación de incorporación o conversaciones de colaboración con Gabriel Services.',
      contactTellTitle: 'Cuéntenos qué necesita',
      contactTellBody: 'Comparta sus flujos actuales, prioridades y necesidades de respuesta esperadas para que podamos canalizar su solicitud correctamente.',
      contactTime: 'Horario de contacto preferido',
      contactNextTitle: 'Qué sucede después',
      contactNextBody: 'Nuestro equipo revisa cada envío, confirma detalles de alcance cuando es necesario y da seguimiento con los siguientes pasos recomendados.'
    }
  },
  careers: {
    en: {
      careersHeroTitle: 'Careers at Gabriel Services',
      careersHeroLead: 'Join a team that helps businesses strengthen logistics, IT, admin, and customer operations with practical, reliable execution.',
      careersWhyTitle: 'Why join Gabriel Services',
      careersWhyBody: 'Our work centers on high-accountability operational support. Every team member is expected to communicate clearly, execute consistently, and deliver practical solutions under real business pressure.',
      careersFormTitle: 'Application form',
      careersFormBody: 'Share clear and relevant details so our recruitment and operations team can assess your profile accurately.',
      careersSkillsTitle: 'Skills, experience, and background',
      careersSkillsBody: 'Applicants can include previous experience, academic background, certifications, key skills, current specialization level, and language capabilities relevant to operational support roles.',
      careersNextTitle: 'What happens after you apply',
      careersNextBody: 'After review, shortlisted candidates are contacted for next steps, role alignment, and interview scheduling based on current hiring priorities.'
    },
    es: {
      careersHeroTitle: 'Carreras en Gabriel Services',
      careersHeroLead: 'Únase a un equipo que ayuda a las empresas a fortalecer sus operaciones de logística, TI, administración y atención al cliente mediante una ejecución práctica y confiable.',
      careersWhyTitle: 'Por qué unirse a Gabriel Services',
      careersWhyBody: 'Nuestro trabajo se centra en el soporte operativo de alta responsabilidad. Se espera que cada integrante del equipo se comunique con claridad, ejecute con constancia y entregue soluciones prácticas bajo la presión real del día a día empresarial.',
      careersFormTitle: 'Formulario de solicitud',
      careersFormBody: 'Comparta información clara y relevante para que nuestro equipo de reclutamiento y operaciones pueda evaluar su perfil con precisión.',
      careersSkillsTitle: 'Habilidades, experiencia y trayectoria',
      careersSkillsBody: 'Las personas candidatas pueden incluir experiencia previa, formación académica, certificaciones, habilidades clave, nivel actual de especialización y capacidades lingüísticas relevantes para funciones de soporte operativo.',
      careersNextTitle: 'Qué sucede después de postularte',
      careersNextBody: 'Tras la revisión, las personas preseleccionadas serán contactadas para los siguientes pasos, la alineación con el puesto y la programación de entrevistas según las prioridades actuales de contratación.'
    }
  }
};

export const DICTIONARY = Object.freeze({
  en: {
    ...SHARED_TRANSLATIONS.en,
    ...SECTION_TRANSLATIONS.contact.en,
    ...SECTION_TRANSLATIONS.careers.en
  },
  es: {
    ...SHARED_TRANSLATIONS.es,
    ...SECTION_TRANSLATIONS.contact.es,
    ...SECTION_TRANSLATIONS.careers.es
  }
});

export const SERVICES = {
  en: [],
  es: []
};

export const PLANS = {
  en: [],
  es: []
};

export function getTranslationsBySection(lang, section) {
  const normalizedLang = SUPPORTED_LANGUAGES.includes(lang) ? lang : 'en';
  const sectionCopy = SECTION_TRANSLATIONS[section];
  if (!sectionCopy) return {};
  return sectionCopy[normalizedLang] || sectionCopy.en || {};
}
