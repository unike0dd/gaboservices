export const LANGUAGE_CODES = Object.freeze({
  en: 'EN',
  es: 'ES'
});

export const SUPPORTED_LANGUAGES = Object.freeze(Object.keys(LANGUAGE_CODES));

export const DICTIONARY = {
  en: {
    pageTitle: 'Gabriel Services',
    pageTitleHome: 'Gabriel Services | Home',
    pageTitleAbout: 'Gabriel Services | About',
    pageTitleServices: 'Gabriel Services | Services',
    pageTitlePricing: 'Gabriel Services | Pricing',
    pageTitleCareers: 'Gabriel Services | Careers',
    pageTitleContact: 'Gabriel Services | Contact',
    pageTitleServiceLogistics: 'Gabriel Services | Logistics Operations',
    pageTitleServiceAdmin: 'Gabriel Services | Administrative Backoffice',
    pageTitleServiceCustomer: 'Gabriel Services | Customer Relations',
    pageTitleServiceIt: 'Gabriel Services | IT Support',
    pageDescription: 'Business services for logistics, IT, admin, and customer relations.',
    switchToEnglish: 'Switch language to English',
    switchToSpanish: 'Switch language to Spanish',
    home: 'Home',
    services: 'Services',
    about: 'About',
    pricing: 'Pricing',
    pricingFeaturesLabel: 'Features',
    contact: 'Contact',
    careers: 'Careers',
    brandSubtitle: 'Tercerización que entrega',
    editorialTheme: 'Corte estilo revista',
    homeHeroTitle: 'Professional services for logistics, IT, and customer operations.',
    homeHeroLead: 'Scale your operation with expert teams, measurable service levels, and precision execution across logistics, IT, and customer operations.',
    homeHeroPrimaryCta: 'Schedule consultation',
    homeHeroSecondaryCta: 'Explore services',
    homeHeroSupportText: 'Execution-oriented teams aligned with your daily workflows, communication rhythm, and measurable outcomes.',
    homeOpsTitle: 'Operational support for modern businesses',
    homeOpsBody1: 'Gabriel Services is a professional support partner for organizations that need reliable execution in logistics, administrative coordination, customer operations, and IT requests.',
    homeOpsBody2: 'We provide structured coverage, clear communication, measurable follow-up, and process discipline that keeps operations moving without disruption.',
    homeOpsBody3: 'Our teams integrate with existing systems and operating rhythms, creating a practical execution layer that helps leaders reduce friction, improve response quality, and stay focused on growth priorities.',
    homeServiceAreasTitle: 'Service areas designed for day-to-day execution',
    homeCardLogisticsTitle: 'Logistics operations',
    homeCardLogisticsBody: 'Dispatch coordination, movement tracking, and delivery workflow support with reliable updates.',
    homeCardAdminTitle: 'Administrative backoffice',
    homeCardAdminBody: 'Documentation, scheduling, data management, and process administration to keep business systems organized.',
    homeCardCustomerTitle: 'Customer operations',
    homeCardCustomerBody: 'Client communication, issue handling, and continuity support designed for agile and consistent service experiences.',
    homeCardItTitle: 'IT support',
    homeCardItBody: 'Technical request triage, troubleshooting coordination, and practical support for day-to-day platforms.',
    homeWhyTitle: 'Why companies work with Gabriel Services',
    homeWhyBody: 'Companies choose Gabriel Services for reliability under daily pressure, clear and accountable communication, structure that reduces operational drift, and adaptive support that scales as priorities evolve.',
    homeStartTitle: 'Start with the support you need',
    homeStartBody: 'Schedule a consultation to map workflows, define service coverage, and build an execution plan tailored to your operational needs.',
    homeStartPrimaryCta: 'Request consultation',
    homeStartSecondaryCta: 'View hiring options',
    heroTitle: 'Professional services for logistics, IT, and customer operations.',
    heroBody: 'Scale support with expert teams, measurable SLAs, and precision-driven delivery.',
    schedule: 'Schedule Consultation',
    aboutBody: 'Gabriel Services provides multilingual operational support designed for modern digital businesses.',
    aboutBodyP1: 'At Gabriel Services, we understand that business success depends on efficient teams, clear communication, and reliable day-to-day operations.',
    aboutBodyP2: 'Our background as former small business owners and remote business support professionals, combined with experience across customer service, logistics, tech support, administration, and business operations, has taught us that small details can quickly turn into costly problems when they are not handled consistently.',
    aboutBodyP3: 'That is why we help businesses stay organized, responsive, and operationally strong. We bring practical experience, adaptability, and a customer-focused mindset to the everyday challenges companies face, delivering support that is efficient, cost-conscious, and dependable.',
    aboutBodyP4: 'Our purpose is to strengthen daily operations so business owners can focus on planning, leading, and growing with greater confidence.',
    name: 'Name',
    email: 'Email',
    contactNumber: 'Your Contact Number',
    countryCode: 'Country code',
    countryCodePlaceholder: 'Select country code',
    contactTime: 'Most convenient time to contact you',
    message: 'Message',
    send: 'Send',
    sent: 'Message captured. We will contact you shortly.',
    blocked: 'Submission blocked by security checks. Please remove code-like content and retry.',
    review: 'Submission captured with caution. Please avoid HTML/JS snippets unless required.',
    contactIntro: 'Reach our team for support, onboarding, or partnership requests.',
    serviceLearnMore: 'Learn more',
    serviceCardExploreLink: 'Explore service',
    serviceLabel: 'Service',
    serviceCarouselToggles: 'Service carousel toggles',
    serviceShowPrefix: 'Show',
    serviceCardAction: 'View service details',
    serviceLogisticsTitle: 'Logistics Operations',
    serviceLogisticsBody: 'Order workflows, dispatch support, shipment updates, and reporting.',
    serviceItTitle: 'IT Support',
    serviceItBody: 'Tier 1 and Tier 2 onboarding, implementation, troubleshooting, account management, customer relations, and endpoint support.',
    serviceAdminTitle: 'Administrative Backoffice',
    serviceAdminBody: 'Data entry, documentation, invoicing support, accounts payable and receivable, process management, scheduling, and executive assistant services.',
    serviceCustomerTitle: 'Customer Relations',
    serviceCustomerBody: 'Omnichannel support, customer retention, and quality monitoring.',
    serviceDefinitionsTitle: 'Service Definitions',
    serviceDefinitionOperationsTitle: 'Operations',
    serviceDefinitionOperationsBody: 'Operations is the end-to-end execution system that designs, controls, and continuously improves how people, processes, and technology convert inputs into consistent, high-quality outputs—delivering predictable performance across cost, risk, and customer outcomes under real-world constraints.',
    serviceDefinitionLogisticsTitle: 'Logistics',
    serviceDefinitionLogisticsBody: 'Logistics is the end-to-end system that plans, executes, and continuously optimizes transportation, storage, inventory movement, and visibility to move items through a network from origin to destination—delivering on-time, accurate, in-good-condition fulfillment while managing total cost, capacity, risk, and customer experience.',
    serviceDefinitionRemoteVirtualAssistanceTitle: 'Remote virtual assistance',
    serviceDefinitionRemoteVirtualAssistanceBody: 'Remote virtual assistance is an on-demand, remote workforce capability that uses standardized digital workflows and tools to offload administrative, customer, and operational tasks—improving speed, accuracy, service quality, and cost efficiency through measurable outcomes.',
    serviceDefinitionTechConsultantLevelITitle: 'Tech Consultant Level I',
    serviceDefinitionTechConsultantLevelIBody: 'Tech Consultant Level I is a delivery support role that executes well-defined technical tasks to stabilize systems and hit project milestones using standard playbooks, measuring results and escalating complexity when needed, under senior guidance.',
    serviceDefinitionTechConsultantLevelIITitle: 'Tech Consultant Level II',
    serviceDefinitionTechConsultantLevelIIBody: 'Tech Consultant Level II is an independent delivery owner who translates client needs into implemented solutions—leading scoped work end-to-end to improve reliability, security, and cost performance, while coordinating stakeholders and mentoring junior staff.',
    serviceDefinitionRemoteAdministrativeBackOfficeTitle: 'Remote administrative back office',
    serviceDefinitionRemoteAdministrativeBackOfficeBody: 'Remote administrative back office is a scalable, offsite capability that standardizes and runs core internal admin workflows—documentation, data management, coordination, reporting, and routine controls—so the business operates with higher accuracy, faster cycle times, and lower cost and risk.',
    careersTitle: 'Careers',
    careersIntro: 'Join our team and help SMB clients modernize logistics, IT, and support operations.',
    experience: 'Experience',
    education: 'Education',
    certification: 'Certification',
    skills: 'Skills',
    expertise: 'Current Level of Expertise',
    languages: 'Languages',
    controls: 'controls',
    add: '+ Add',
    remove: '- Remove',
    lockSection: 'Lock section',
    unlockSection: 'Unlock section',
    submitApplication: 'Submit Application',
    selectLevel: 'Select level',
    entry: 'Entry',
    junior: 'Junior',
    mid: 'Mid',
    advanced: 'Advanced',
    expert: 'Expert',
    placeholderExperience: 'Describe your experience',
    placeholderEducation: 'Share your education background',
    placeholderCertification: 'List your certifications',
    placeholderSkills: 'Add your skills',
    placeholderExpertise: 'Describe your expertise',
    placeholderLanguages: 'List language(s) and level',
    placeholderContactNumber: '555 123 4567',
    fabOpenQuickActions: 'Open quick actions',
    fabContact: 'Contact',
    fabCareer: 'Careers',
    fabChatbot: 'Chatbot',
    chatPanelLabel: 'Chatbot panel',
    chatClose: 'Close chatbot',
    chatCloseCta: 'Close',
    chatbot: 'Gabo io',
    footerCompany: 'Company',
    footerSupport: 'Support',
    footerLegal: 'Legal',
    footerSitemap: 'Sitemap',
    footerTerms: 'T&C',
    footerCookies: 'Cookies Consent',
    footerGdpr: 'Privacidad y RGPD',
    footerCopyright: 'Gabriel Services',
    opsHeading: 'Integrated delivery framework',
    opsIntro: 'A synchronized model that connects secure delivery, adaptive UX, governance, and observability in one operating rhythm.',
    opsLifecycleTitle: 'Intelligent code lifecycle',
    opsLifecycleBody: 'Coordinate CI/CD, cloud-native automation, and plain-language documentation across the full release path.',
    opsDesignTitle: 'Adaptive UX/UI intelligence',
    opsDesignBody: 'Ship human-centered interfaces with responsive layouts, accessibility, and measurable interaction quality.',
    opsSecurityTitle: 'Security + compliance orchestration',
    opsSecurityBody: 'Align NIST CSF, CISA Cyber Essentials, and PCI controls from identify to recover across operations.',
    opsGovernanceTitle: 'Web governance controls',
    opsGovernanceBody: 'Reinforce governance with secure headers, privacy standards, and policy-aware platform configuration.',
    opsAiTitle: 'AI/ML/LLM integration',
    opsAiBody: 'Connect assistants and tiny models for real-time personalization while preserving security and budget efficiency.',
    opsDataTitle: 'Observability and analytics loops',
    opsDataBody: 'Monitor Core Web Vitals, service health, and behavior data to continuously optimize UX, resilience, and outcomes.'
  },
  es: {
    pageTitle: 'Gabriel Servicios Profesionales para PYMEs',
    pageTitleHome: 'Gabriel Services | Inicio',
    pageTitleAbout: 'Gabriel Services | Nosotros',
    pageTitleServices: 'Gabriel Services | Servicios',
    pageTitlePricing: 'Gabriel Services | Precios',
    pageTitleCareers: 'Gabriel Services | Carreras',
    pageTitleContact: 'Gabriel Services | Contacto',
    pageTitleServiceLogistics: 'Gabriel Services | Operaciones logísticas',
    pageTitleServiceAdmin: 'Gabriel Services | Back office administrativo',
    pageTitleServiceCustomer: 'Gabriel Services | Relación con clientes',
    pageTitleServiceIt: 'Gabriel Services | Soporte de TI',
    pageDescription: 'Servicios empresariales de logística, TI, administración y atención al cliente.',
    switchToEnglish: 'Cambiar idioma a inglés',
    switchToSpanish: 'Cambiar idioma a español',
    home: 'Inicio',
    services: 'Servicios',
    about: 'Nosotros',
    pricing: 'Precios',
    pricingFeaturesLabel: 'Características',
    contact: 'Contacto',
    careers: 'Carreras',
    brandSubtitle: 'Tercerización que entrega',
    editorialTheme: 'Corte estilo revista',
    homeHeroTitle: 'Servicios profesionales para logística, TI y operaciones de atención al cliente.',
    homeHeroLead: 'Amplíe su operación con equipos expertos, niveles de servicio medibles y una ejecución precisa en logística, TI y operaciones de atención al cliente.',
    homeHeroPrimaryCta: 'Programar consulta',
    homeHeroSecondaryCta: 'Explorar servicios',
    homeHeroSupportText: 'Equipos orientados a la ejecución, alineados con sus flujos de trabajo diarios, su ritmo de comunicación y resultados medibles.',
    homeOpsTitle: 'Soporte operativo para empresas modernas',
    homeOpsBody1: 'Gabriel Services es un socio de soporte profesional para organizaciones que necesitan una ejecución confiable en logística, coordinación administrativa, operaciones de atención al cliente y solicitudes de TI.',
    homeOpsBody2: 'Brindamos cobertura estructurada, comunicación clara, seguimiento medible y disciplina de procesos que mantiene las operaciones en movimiento sin interrupciones.',
    homeOpsBody3: 'Nuestros equipos se integran con los sistemas y ritmos existentes, creando una capa operativa práctica que ayuda a los líderes a reducir fricción, mejorar la calidad de respuesta y mantenerse enfocados en las prioridades de crecimiento.',
    homeServiceAreasTitle: 'Áreas de servicio diseñadas para la ejecución diaria',
    homeCardLogisticsTitle: 'Operaciones logísticas',
    homeCardLogisticsBody: 'Coordinación de despacho, seguimiento de movimientos y apoyo al flujo de trabajo de entregas con actualizaciones confiables.',
    homeCardAdminTitle: 'Back office administrativo',
    homeCardAdminBody: 'Documentación, programación, gestión de datos y administración de procesos para mantener organizados los sistemas del negocio.',
    homeCardCustomerTitle: 'Operaciones de atención al cliente',
    homeCardCustomerBody: 'Comunicación con clientes, gestión de incidencias y apoyo de continuidad diseñados para ofrecer experiencias de servicio ágiles y consistentes.',
    homeCardItTitle: 'Soporte de TI',
    homeCardItBody: 'Clasificación de solicitudes técnicas, coordinación de resolución de problemas y soporte práctico para las plataformas del día a día.',
    homeWhyTitle: 'Por qué las empresas trabajan con Gabriel Services',
    homeWhyBody: 'Las empresas eligen Gabriel Services por su confiabilidad bajo la presión diaria, una comunicación clara y responsable, una estructura que reduce la desviación operativa y un soporte adaptable que escala según cambian las prioridades.',
    homeStartTitle: 'Comience con el soporte que necesita',
    homeStartBody: 'Programe una consulta para mapear sus flujos de trabajo, definir la cobertura del servicio y construir un plan de ejecución adaptado a sus necesidades operativas.',
    homeStartPrimaryCta: 'Solicitar consulta',
    homeStartSecondaryCta: 'Ver opciones de contratación',
    heroTitle: 'Servicios profesionales para logística, TI y operaciones de atención al cliente.',
    heroBody: 'Escale su operación de soporte con equipos expertos.',
    schedule: 'Programar consulta',
    aboutBody: 'En Gabriel Services, entendemos que el éxito empresarial depende de equipos eficientes, comunicación clara y operaciones diarias confiables.',
    aboutBodyP1: 'En Gabriel Services, creemos que una empresa crece con mayor fuerza cuando sus operaciones diarias funcionan con precisión, consistencia y claridad.',
    aboutBodyP2: 'Nuestra trayectoria como antiguos dueños de pequeñas empresas y profesionales de soporte empresarial remoto, combinada con experiencia en servicio al cliente, logística, soporte técnico, administración y operaciones empresariales, nos ha enseñado que los pequeños detalles pueden convertirse rápidamente en problemas costosos cuando no se gestionan de manera consistente.',
    aboutBodyP3: 'Por eso ayudamos a las empresas a mantenerse organizadas, receptivas y operativamente sólidas. Aportamos experiencia práctica, adaptabilidad y una mentalidad centrada en el cliente a los desafíos cotidianos que enfrentan las compañías, brindando un soporte eficiente, consciente de costos y confiable.',
    aboutBodyP4: 'Nuestro propósito es fortalecer las operaciones diarias para que los dueños de negocios puedan enfocarse en planificar, liderar y crecer con mayor confianza.',
    name: 'Nombre',
    email: 'Correo electrónico',
    contactNumber: 'Su número de contacto',
    countryCode: 'Código de país',
    countryCodePlaceholder: 'Seleccione código de país',
    contactTime: 'Horario más conveniente para contactarle',
    message: 'Mensaje',
    send: 'Enviar',
    sent: 'Mensaje recibido. Nos pondremos en contacto pronto.',
    blocked: 'Contenido bloqueado por seguridad. Elimine contenido sospechoso e inténtelo de nuevo.',
    review: 'Mensaje recibido con precaución. Evite fragmentos HTML/JS, a menos que sean necesarios.',
    contactIntro: 'Comuníquese con nuestro equipo para solicitudes de soporte, incorporación o alianzas.',
    learnMore: 'Conozca más',
    serviceLearnMore: 'Definiciones de servicios',
    serviceCardExploreLink: 'Explorar servicio',
    serviceLabel: 'Servicio',
    serviceCarouselToggles: 'Controles del carrusel de servicios',
    serviceShowPrefix: 'Mostrar',
    serviceCardAction: 'Ver detalles del servicio',
    serviceLogisticsTitle: 'Operaciones Logísticas',
    serviceLogisticsBody: 'Flujos de pedidos, soporte de despacho, actualizaciones de envíos y reportes.',
    serviceItTitle: 'Soporte de TI',
    serviceItBody: 'Nivel 1 y nivel 2: incorporación, implementación, solución de problemas, gestión de cuentas, relaciones con clientes y soporte de dispositivos finales.',
    serviceAdminTitle: 'Backoffice Administrativo',
    serviceAdminBody: 'Ingreso de datos, documentación, apoyo de facturación, cuentas por pagar y cobrar, gestión de procesos, agenda y asistencia ejecutiva.',
    serviceCustomerTitle: 'Relaciones con Clientes',
    serviceCustomerBody: 'Soporte omnicanal, retención de clientes y monitoreo de calidad.',
    serviceDefinitionsTitle: 'Definiciones de servicios',
    serviceDefinitionOperationsTitle: 'Operaciones',
    serviceDefinitionOperationsBody: 'Operaciones es el sistema integral de ejecución que diseña, controla y mejora de forma continua cómo las personas, los procesos y la tecnología convierten insumos en resultados consistentes y de alta calidad, entregando un desempeño predecible en costos, riesgo y resultados para el cliente bajo condiciones reales.',
    serviceDefinitionLogisticsTitle: 'Logística',
    serviceDefinitionLogisticsBody: 'Logística es el sistema integral que planifica, ejecuta y optimiza continuamente el transporte, el almacenamiento, el movimiento de inventario y la visibilidad para trasladar artículos a través de una red desde el origen hasta el destino, logrando cumplimiento puntual, preciso y en buen estado mientras gestiona costo total, capacidad, riesgo y experiencia del cliente.',
    serviceDefinitionRemoteVirtualAssistanceTitle: 'Asistencia virtual remota',
    serviceDefinitionRemoteVirtualAssistanceBody: 'La asistencia virtual remota es una capacidad de fuerza laboral remota y bajo demanda que utiliza flujos de trabajo y herramientas digitales estandarizadas para descargar tareas administrativas, de atención al cliente y operativas, mejorando velocidad, precisión, calidad de servicio y eficiencia de costos mediante resultados medibles.',
    serviceDefinitionTechConsultantLevelITitle: 'Consultor técnico nivel I',
    serviceDefinitionTechConsultantLevelIBody: 'Consultor técnico nivel I es un rol de apoyo a la ejecución que realiza tareas técnicas bien definidas para estabilizar sistemas y cumplir hitos del proyecto utilizando guías estándar, midiendo resultados y escalando la complejidad cuando sea necesario, bajo supervisión senior.',
    serviceDefinitionTechConsultantLevelIITitle: 'Consultor técnico nivel II',
    serviceDefinitionTechConsultantLevelIIBody: 'Consultor técnico nivel II es un responsable independiente de la ejecución que traduce las necesidades del cliente en soluciones implementadas, liderando trabajo acotado de principio a fin para mejorar confiabilidad, seguridad y desempeño en costos, mientras coordina partes interesadas y orienta a personal junior.',
    serviceDefinitionRemoteAdministrativeBackOfficeTitle: 'Back office administrativo remoto',
    serviceDefinitionRemoteAdministrativeBackOfficeBody: 'El back office administrativo remoto es una capacidad escalable y externa que estandariza y ejecuta flujos internos clave de administración, documentación, gestión de datos, coordinación, reportes y controles rutinarios, para que la empresa opere con mayor precisión, ciclos más rápidos y menor costo y riesgo.',
    careersTitle: 'Carreras',
    careersIntro: 'Únase a nuestro equipo y ayude a clientes PyME a modernizar operaciones de logística, TI y soporte.',
    experience: 'Experiencia',
    education: 'Educación',
    certification: 'Certificación',
    skills: 'Habilidades',
    expertise: 'Nivel actual de experiencia',
    languages: 'Idiomas',
    controls: 'controles',
    add: 'Agregar',
    remove: 'Quitar',
    lockSection: 'Bloquear sección',
    unlockSection: 'Desbloquear sección',
    submitApplication: 'Enviar solicitud',
    selectLevel: 'Seleccione nivel',
    entry: 'Inicial',
    junior: 'Junior',
    mid: 'Intermedio',
    advanced: 'Avanzado',
    expert: 'Experto',
    placeholderExperience: 'Describa su experiencia',
    placeholderEducation: 'Comparta su formación académica',
    placeholderCertification: 'Liste sus certificaciones',
    placeholderSkills: 'Agregue sus habilidades',
    placeholderExpertise: 'Describa su nivel de experiencia',
    placeholderLanguages: 'Indique idioma(s) y nivel',
    placeholderContactNumber: '555 123 4567',
    fabOpenQuickActions: 'Abrir acciones rápidas',
    fabContact: 'Contacto',
    fabCareer: 'Carreras',
    fabChatbot: 'Chatbot',
    chatPanelLabel: 'Panel del chatbot',
    chatClose: 'Cerrar chatbot',
    chatCloseCta: 'Cerrar',
    chatbot: 'Gabo io',
    footerCompany: 'Empresa',
    footerSupport: 'Soporte',
    footerLegal: 'Legal',
    footerSitemap: 'Mapa del sitio',
    footerTerms: 'Términos y condiciones',
    footerCookies: 'Consentimiento de cookies',
    footerGdpr: 'Privacidad y RGPD',
    footerCopyright: 'Gabriel Servicios Profesionales para PYMEs',
    opsHeading: 'Marco de entrega integrado',
    opsIntro: 'Un modelo sincronizado que conecta entrega segura, UX adaptativa, gobernanza y observabilidad bajo un solo ritmo operativo.',
    opsLifecycleTitle: 'Ciclo de vida de código inteligente',
    opsLifecycleBody: 'Coordine CI/CD, automatización cloud-native y documentación en lenguaje claro a lo largo de toda la entrega.',
    opsDesignTitle: 'Inteligencia UX/UI adaptativa',
    opsDesignBody: 'Implemente interfaces centradas en las personas con diseño responsivo, accesibilidad y calidad de interacción medible.',
    opsSecurityTitle: 'Orquestación de seguridad y cumplimiento',
    opsSecurityBody: 'Alinee NIST CSF, CISA Cyber Essentials y controles PCI desde identificar hasta recuperar en toda la operación.',
    opsGovernanceTitle: 'Controles de gobernanza web',
    opsGovernanceBody: 'Refuerce la gobernanza con encabezados seguros, estándares de privacidad y configuración de plataforma orientada a políticas.',
    opsAiTitle: 'Integración de AI/ML/LLM',
    opsAiBody: 'Conecte asistentes y modelos pequeños para personalización en tiempo real preservando seguridad y eficiencia de costos.',
    opsDataTitle: 'Bucles de observabilidad y analítica',
    opsDataBody: 'Monitoree Core Web Vitals, salud de servicios y datos de comportamiento para optimizar continuamente UX, resiliencia y resultados.'
  }
};

export const SERVICES = {
  en: [
    {
      key: 'logistics',
      title: 'Logistics Operations',
      body: 'Support for coordination-heavy logistics workflows that require consistency, communication, and follow-through.',
      items: ['Shipment and delivery coordination', 'Dispatch and status follow-up', 'Billing and operational documentation'],
      href: '/services/logistics-operations/'
    },
    {
      key: 'admin',
      title: 'Administrative Backoffice',
      body: 'Remote administrative support that keeps routine business operations organized and moving.',
      items: ['Documentation and records support', 'Scheduling and coordination tasks', 'Reporting and internal follow-up'],
      href: '/services/administrative-backoffice/'
    },
    {
      key: 'customer',
      title: 'Customer Relations',
      body: 'Customer-facing support that helps businesses stay responsive, clear, and professional.',
      items: ['Customer communication support', 'After-sales follow-up', 'Case updates and service continuity'],
      href: '/services/customer-relations/'
    },
    {
      key: 'it',
      title: 'IT Support',
      body: 'Operational IT assistance for routine support needs and internal issue coordination.',
      items: ['Help desk intake', 'Support ticket follow-up', 'User support coordination'],
      href: '/services/it-support/'
    }
  ],
  es: [
    {
      key: 'logistics',
      title: 'Operaciones Logísticas',
      body: 'Soporte para flujos logísticos con alta coordinación que requieren consistencia, comunicación y seguimiento.',
      items: ['Coordinación de envíos y entregas', 'Despacho y seguimiento de estado', 'Facturación y documentación operativa'],
      href: '/services/logistics-operations/'
    },
    {
      key: 'admin',
      title: 'Backoffice Administrativo',
      body: 'Soporte administrativo remoto que mantiene las operaciones rutinarias organizadas y en movimiento.',
      items: ['Soporte documental y de registros', 'Tareas de agenda y coordinación', 'Reportes y seguimiento interno'],
      href: '/services/administrative-backoffice/'
    },
    {
      key: 'customer',
      title: 'Relaciones con Clientes',
      body: 'Soporte de atención al cliente que ayuda a mantener respuestas claras, ágiles y profesionales.',
      items: ['Soporte de comunicación con clientes', 'Seguimiento postventa', 'Actualizaciones de casos y continuidad del servicio'],
      href: '/services/customer-relations/'
    },
    {
      key: 'it',
      title: 'Soporte de TI',
      body: 'Asistencia operativa de TI para necesidades rutinarias y coordinación interna de incidencias.',
      items: ['Recepción de mesa de ayuda', 'Seguimiento de tickets de soporte', 'Coordinación de soporte a usuarios'],
      href: '/services/it-support/'
    }
  ]
};

export const PLANS = {
  en: [
    { name: 'Individual', price: '$3,950/mo', points: ['Email support', 'Business hours', 'Monthly report'] },
    { name: 'Small Business', price: '$4,850/mo', points: ['24/7 support', 'Priority SLA', 'Weekly optimization'] },
    { name: 'Medium Business', price: '$5,950/mo', points: ['Dedicated team', 'Custom integrations', 'Compliance alignment'] }
  ],
  es: [
    { name: 'Individual', price: '$3,950 usd/mes', points: ['Soporte por correo', 'Horario laboral', 'Reporte mensual'] },
    { name: 'Pequeña Empresa', price: '$4,850 usd/mes', points: ['Soporte 24/7', 'SLA prioritario', 'Optimización semanal'] },
    { name: 'Mediana Empresa', price: '$5,950 usd/mes', points: ['Equipo dedicado', 'Integraciones a medida', 'Alineación de cumplimiento'] }
  ]
};

// ================================================================
// Translation maintenance guide (single-script map by page/route)
// ================================================================
export const TRANSLATION_PAGE_MAP = Object.freeze({
  shared: {
    route: '*',
    description: 'Global UI copy reused across pages (nav, footer, common controls).',
    keyPrefixes: ['switchTo', 'footer', 'fab', 'chat', 'pageTitle', 'pageDescription', 'ogLocale'],
    exactKeys: ['home', 'services', 'about', 'pricing', 'contact', 'careers', 'learning', 'brandSubtitle', 'editorialTheme']
  },
  home: {
    route: '/',
    description: 'Homepage editorial sections and CTAs.',
    keyPrefixes: ['homeHero', 'homeOps', 'homeCard', 'homeWhy', 'homeStart', 'homeServiceAreas']
  },
  about: {
    route: '/about/',
    description: 'About page narrative content.',
    keyPrefixes: ['aboutBody']
  },
  services: {
    route: '/services/',
    description: 'Services overview and service definition entries.',
    keyPrefixes: ['service', 'serviceDefinition']
  },
  logistics: {
    route: '/services/logistics-operations/',
    description: 'Logistics page and logistics-specific copy hooks.',
    keyPrefixes: ['serviceLogistics', 'serviceDefinitionLogistics']
  },
  administrativeBackoffice: {
    route: '/services/administrative-backoffice/',
    description: 'Administrative backoffice service page copy hooks.',
    keyPrefixes: ['serviceAdmin', 'serviceDefinitionRemoteAdministrativeBackOffice']
  },
  customerRelations: {
    route: '/services/customer-relations/',
    description: 'Customer relations service page copy hooks.',
    keyPrefixes: ['serviceCustomer']
  },
  itSupport: {
    route: '/services/it-support/',
    description: 'IT support service page copy hooks.',
    keyPrefixes: ['serviceIt', 'serviceDefinitionTechConsultantLevelI', 'serviceDefinitionTechConsultantLevelII']
  },
  pricing: {
    route: '/pricing/',
    description: 'Pricing page labels and plan related copy.',
    keyPrefixes: ['pricing']
  },
  careers: {
    route: '/careers/',
    description: 'Careers form labels, placeholders, and controls.',
    keyPrefixes: ['careers', 'experience', 'education', 'certification', 'skills', 'expertise', 'placeholder', 'selectLevel', 'entry', 'junior', 'mid', 'advanced', 'expert', 'submitApplication', 'lockSection', 'unlockSection', 'controls', 'add', 'remove']
  },
  contact: {
    route: '/contact/',
    description: 'Contact form labels and security status copy.',
    keyPrefixes: ['name', 'email', 'contact', 'countryCode', 'message', 'send', 'sent', 'blocked', 'review']
  },
  learning: {
    route: '/learning/',
    description: 'Learning and framework explainer copy.',
    keyPrefixes: ['ops']
  },
  legal: {
    route: '/legal/*',
    description: 'Legal page links surfaced in UI/footer.',
    keyPrefixes: ['footerTerms', 'footerCookies', 'footerGdpr']
  }
});

function keyMatchesSection(key, section = {}) {
  const prefixes = section.keyPrefixes || [];
  const exactKeys = section.exactKeys || [];

  if (exactKeys.includes(key)) return true;
  return prefixes.some((prefix) => key.startsWith(prefix));
}

export function getTranslationsBySection(language = 'en', sectionName = 'shared') {
  const langPack = DICTIONARY[language] || DICTIONARY.en;
  const section = TRANSLATION_PAGE_MAP[sectionName];
  if (!section) return {};

  return Object.fromEntries(
    Object.entries(langPack).filter(([key]) => keyMatchesSection(key, section))
  );
}
