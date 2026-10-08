// Política de privacidad en los tres idiomas.
//
// ES (oct/2026) se redactó sobre lo que el sitio hace de verdad: formularios en
// src/pages/api/*, Supabase en la UE, Resend, GTM con GA4, Google Ads, Meta
// Pixel, LinkedIn Insight y Ahrefs. EN y PT (08/oct/2026) son traducciones de
// ese mismo texto; antes leían terms.json, que decía «no compartimos tus datos»
// pese a los píxeles. Si cambia un proveedor, una cookie o un plazo, se cambia
// aquí en los tres idiomas.
//
// Pendiente de validación jurídica, igual que la versión ES.

export type PoliticaLoc = "es" | "en" | "pt";

export const RESPONSABLE = {
  name: "Luiz Fernando Costa Brazao",
  taxId: "Y8219331L",
  city: "Málaga, España",
  email: "info@iaoperators.com",
};

export interface Tratamiento { titulo: string; datos: string; finalidad: string; base: string; plazo: string }
export interface Proveedor { nombre: string; uso: string; ubicacion: string }
export interface CookieItem { nombre: string; uso: string; detalle: string }

const TRATAMIENTOS_ES: Tratamiento[] = [
  {
    titulo: "Formulario de contacto",
    datos: "Nombre, email, empresa, ciudad (opcional), el mensaje que escribas y la dirección IP desde la que se envía.",
    finalidad: "Responder a tu solicitud y, si hay encaje, preparar una propuesta. La IP se usa solo para limitar envíos abusivos.",
    base: "Aplicación de medidas precontractuales a petición tuya (art. 6.1.b RGPD) y, para la IP, interés legítimo en proteger el formulario (art. 6.1.f).",
    plazo: "12 meses desde el último contacto si no se inicia una relación. Si pasas a ser cliente, mientras dure la relación y después durante los plazos legales (6 años para la documentación mercantil).",
  },
  {
    titulo: "Tests de cumplimiento (Ley 10/2025 y Verifactu)",
    datos: "Las respuestas al cuestionario, el resultado, la página de origen, los parámetros de campaña (UTM) y un identificador seudonimizado calculado a partir de la IP, el navegador y el idioma. No se guarda la IP. Si pides el informe: tu email y tus preferencias de contacto.",
    finalidad: "Calcular y mostrarte el resultado, obtener estadísticas agregadas y evitar envíos duplicados o automatizados. Con el email, enviarte el informe y, si lo marcas, contactarte para comentarlo.",
    base: "Interés legítimo en prestar la herramienta y medir su uso (art. 6.1.f RGPD). El envío del informe y el contacto posterior, tu consentimiento (art. 6.1.a).",
    plazo: "Respuestas: 24 meses. Email: hasta que retires el consentimiento o tras 24 meses sin interacción.",
  },
  {
    titulo: "Encuesta «La Segunda Factura de la IA 2026»",
    datos: "Las respuestas, el idioma, datos técnicos del dispositivo (categoría y huella seudonimizada) y, de forma opcional, tu email, que se guarda separado de las respuestas.",
    finalidad: "Elaborar un estudio con resultados agregados. Las respuestas individuales no se publican. El email solo sirve para avisarte de los resultados.",
    base: "Tu consentimiento, que prestas al aceptar las casillas antes de enviar (art. 6.1.a RGPD).",
    plazo: "Datos individuales: hasta 12 meses después de publicar el estudio; después se conservan solo agregados. Email: hasta enviarte los resultados.",
  },
  {
    titulo: "Navegación y seguridad",
    datos: "Registros técnicos del servidor (IP, fecha, página solicitada y navegador).",
    finalidad: "Servir el sitio, detectar errores y prevenir ataques.",
    base: "Interés legítimo en mantener el sitio seguro y operativo (art. 6.1.f RGPD).",
    plazo: "El periodo breve que fija el proveedor de alojamiento para sus registros.",
  },
];

const PROVEEDORES_ES: Proveedor[] = [
  { nombre: "Vercel Inc.", uso: "Alojamiento del sitio y ejecución de los formularios.", ubicacion: "Estados Unidos · encargado del tratamiento" },
  { nombre: "Supabase Inc.", uso: "Base de datos de los tests y de la encuesta.", ubicacion: "Servidores en la Unión Europea · encargado del tratamiento" },
  { nombre: "Resend (Plus Five Five, Inc.)", uso: "Envío de los correos del formulario de contacto y de los informes de los tests.", ubicacion: "Estados Unidos · encargado del tratamiento" },
  { nombre: "Google (Gmail)", uso: "Bandeja en la que se reciben y gestionan los mensajes enviados a info@iaoperators.com.", ubicacion: "Estados Unidos y UE" },
  { nombre: "Google, Meta, LinkedIn y Ahrefs", uso: "Medición y publicidad, solo si aceptas las cookies. Detalle en el apartado 7.", ubicacion: "UE y Estados Unidos · ver apartado 7" },
];

const COOKIES_ES: CookieItem[] = [
  { nombre: "Preferencia de cookies (propia)", uso: "Recuerda si aceptaste o rechazaste el aviso. Se guarda en el almacenamiento local del navegador. Técnica, no requiere consentimiento.", detalle: "Clave iaoperators_cookie_consent · hasta que la borres" },
  { nombre: "Google Tag Manager (Google Ireland Ltd.)", uso: "Gestor que carga el resto de etiquetas tras tu consentimiento. No instala cookies propias.", detalle: "Solo tras aceptar" },
  { nombre: "Google Analytics 4 (Google Ireland Ltd.)", uso: "Medición de audiencia: páginas vistas, origen de las visitas y conversiones.", detalle: "Analítica · _ga, _ga_* · hasta 2 años" },
  { nombre: "Google Ads (Google Ireland Ltd.)", uso: "Medición de conversiones de anuncios y listas de remarketing.", detalle: "Publicidad · _gcl_au · 90 días" },
  { nombre: "Píxel de Meta (Meta Platforms Ireland Ltd.)", uso: "Medición de conversiones y públicos para anuncios en Facebook e Instagram.", detalle: "Publicidad · _fbp, _fbc · 90 días" },
  { nombre: "LinkedIn Insight Tag (LinkedIn Ireland U.C.)", uso: "Medición de conversiones y públicos para anuncios en LinkedIn.", detalle: "Publicidad · li_sugr, bcookie, lidc, UserMatchHistory y otras · entre 1 día y 1 año" },
  { nombre: "Ahrefs Web Analytics (Ahrefs Pte. Ltd.)", uso: "Medición de audiencia agregada.", detalle: "Analítica · Singapur · según el proveedor, sin cookies" },
];

const ES = {
  "updated": "Última actualización · 8 de octubre de 2026",
  "lead": "Qué datos personales tratamos en iaoperators.com, para qué, con qué base legal, durante cuánto tiempo, con quién se comparten y cómo puedes ejercer tus derechos. Esta política cumple el deber de información del Reglamento (UE) 2016/679 (RGPD) y de la Ley Orgánica 3/2018 (LOPDGDD).",
  "labels": {
    "holder": "Titular",
    "taxId": "NIF",
    "address": "Domicilio",
    "contact": "Contacto",
    "data": "Datos",
    "purpose": "Finalidad",
    "basis": "Base jurídica",
    "retention": "Conservación"
  },
  "city": "Málaga, España",
  "s1": {
    "title": "1. Responsable del tratamiento",
    "holderSuffix": "(nombre comercial: IA Operators)",
    "dpo": "No hemos designado delegado de protección de datos porque nuestra actividad no está entre los supuestos que lo exigen (art. 37 RGPD y art. 34 LOPDGDD). Para cualquier cuestión sobre privacidad, escribe al correo anterior."
  },
  "s2": {
    "title": "2. Qué datos tratamos y para qué",
    "noSale": "No vendemos datos personales ni los cedemos a terceros para sus propios fines, salvo obligación legal. Los datos de los formularios no se usan para publicidad."
  },
  "s3": {
    "title": "3. Proveedores con acceso a los datos",
    "intro": "Para prestar el servicio usamos los siguientes proveedores. Los que actúan como encargados del tratamiento solo tratan los datos siguiendo nuestras instrucciones."
  },
  "s4": {
    "title": "4. Transferencias internacionales",
    "p1": "Varios de estos proveedores son empresas de Estados Unidos o pueden acceder a los datos desde allí. En esos casos la transferencia se ampara en la Decisión de adecuación del Marco de Privacidad de Datos UE-EE. UU., cuando el proveedor está adherido, o en las cláusulas contractuales tipo aprobadas por la Comisión Europea, que los proveedores incluyen en sus acuerdos de tratamiento de datos.",
    "p2": "Las respuestas de los tests y de la encuesta se almacenan en servidores de la Unión Europea."
  },
  "s5": {
    "title": "5. Decisiones automatizadas",
    "p": "El resultado de los tests de cumplimiento se calcula con reglas fijas a partir de tus respuestas. Es orientativo, no produce efectos jurídicos sobre ti y no condiciona ninguna decisión que te afecte. No tomamos decisiones basadas únicamente en tratamientos automatizados en el sentido del art. 22 RGPD."
  },
  "s6": {
    "title": "6. Tus derechos",
    "rights": [
      "Acceder a tus datos y saber cómo los tratamos.",
      "Rectificar los datos inexactos y suprimirlos cuando ya no sean necesarios.",
      "Oponerte al tratamiento basado en interés legítimo y pedir su limitación.",
      "Recibir tus datos en un formato estructurado (portabilidad).",
      "Retirar tu consentimiento en cualquier momento, sin que afecte a lo tratado antes."
    ],
    "exerciseBefore": "Para ejercerlos, escribe a",
    "exerciseAfter": "con el asunto «Protección de datos», indicando qué derecho ejerces. Solo te pediremos datos para verificar tu identidad si hay dudas razonables sobre ella. Respondemos en el plazo de un mes.",
    "complaintBefore": "Si consideras que no hemos atendido bien tu solicitud, puedes reclamar ante la Agencia Española de Protección de Datos en"
  },
  "s7": {
    "title": "7. Cookies y tecnologías similares",
    "p1": "Solo usamos sin tu consentimiento lo estrictamente necesario para que el sitio funcione y para recordar tu elección sobre cookies. La medición y la publicidad se cargan únicamente si pulsas «Aceptar» en el aviso; si pulsas «Rechazar», no se carga ninguna.",
    "p2": "Las cookies de publicidad permiten mostrarte anuncios de IA Operators en esas plataformas después de visitar el sitio y medir si un anuncio terminó en una solicitud de contacto. En el caso del píxel de Meta, Meta Platforms Ireland actúa como corresponsable de la recogida y transmisión de esos datos.",
    "p3": "Puedes cambiar tu elección en cualquier momento desde el enlace «Cookies» del pie de página, y borrar las cookies ya instaladas desde la configuración de tu navegador."
  },
  "s8": {
    "title": "8. Menores",
    "p": "El sitio está dirigido a empresas y profesionales. No recogemos de forma consciente datos de menores de 14 años."
  },
  "s9": {
    "title": "9. Seguridad",
    "p": "Aplicamos medidas técnicas y organizativas proporcionadas al riesgo: conexiones cifradas, acceso restringido a las bases de datos, separación del email respecto de las respuestas en la encuesta y seudonimización del origen de las respuestas de los tests."
  },
  "s10": {
    "title": "10. Cambios en esta política",
    "p": "Si cambiamos la forma de tratar tus datos, actualizaremos esta página y su fecha. Si el cambio afecta a un tratamiento basado en tu consentimiento, te lo pediremos de nuevo cuando sea necesario."
  }
};

export type PoliticaCopy = typeof ES & { tratamientos: Tratamiento[]; proveedores: Proveedor[]; cookies: CookieItem[] };

export const POLITICA: Record<PoliticaLoc, PoliticaCopy> = {
  es: { ...ES, tratamientos: TRATAMIENTOS_ES, proveedores: PROVEEDORES_ES, cookies: COOKIES_ES },
  en: {
    "updated": "Last updated · 8 October 2026",
    "lead": "What personal data we process on iaoperators.com, why, on what legal basis, for how long, who it is shared with and how you can exercise your rights. This policy meets the information duty under Regulation (EU) 2016/679 (GDPR) and Spanish Organic Law 3/2018 (LOPDGDD).",
    "labels": {
      "holder": "Owner",
      "taxId": "Tax ID (NIF)",
      "address": "Address",
      "contact": "Contact",
      "data": "Data",
      "purpose": "Purpose",
      "basis": "Legal basis",
      "retention": "Retention"
    },
    "city": "Málaga, Spain",
    "s1": {
      "title": "1. Data controller",
      "holderSuffix": "(trade name: IA Operators)",
      "dpo": "We have not appointed a data protection officer because our activity is not among the cases that require one (art. 37 GDPR and art. 34 LOPDGDD). For any privacy question, write to the address above."
    },
    "s2": {
      "title": "2. What data we process and why",
      "noSale": "We do not sell personal data or pass it to third parties for their own purposes, unless required by law. Form data is not used for advertising."
    },
    "s3": {
      "title": "3. Providers with access to the data",
      "intro": "To provide the service we use the following providers. Those acting as processors only handle the data on our instructions."
    },
    "s4": {
      "title": "4. International transfers",
      "p1": "Several of these providers are US companies or may access the data from there. In those cases the transfer relies on the EU-US Data Privacy Framework adequacy decision, where the provider is certified, or on the standard contractual clauses approved by the European Commission, which the providers include in their data processing agreements.",
      "p2": "Answers to the tests and the survey are stored on servers in the European Union."
    },
    "s5": {
      "title": "5. Automated decisions",
      "p": "The result of the compliance tests is calculated with fixed rules from your answers. It is indicative, has no legal effect on you and does not determine any decision that affects you. We do not take decisions based solely on automated processing within the meaning of art. 22 GDPR."
    },
    "s6": {
      "title": "6. Your rights",
      "rights": [
        "Access your data and find out how we process it.",
        "Rectify inaccurate data and have it erased when it is no longer needed.",
        "Object to processing based on legitimate interest and ask for it to be restricted.",
        "Receive your data in a structured format (portability).",
        "Withdraw your consent at any time, without affecting the processing carried out before."
      ],
      "exerciseBefore": "To exercise them, write to",
      "exerciseAfter": "with the subject “Data protection”, stating which right you are exercising. We will only ask for information to verify your identity if there are reasonable doubts about it. We reply within one month.",
      "complaintBefore": "If you think we have not handled your request properly, you can lodge a complaint with the Spanish Data Protection Agency (AEPD) at"
    },
    "s7": {
      "title": "7. Cookies and similar technologies",
      "p1": "Without your consent we only use what is strictly necessary for the site to work and to remember your cookie choice. Measurement and advertising load only if you click “Accept” in the notice; if you click “Reject”, none of them load.",
      "p2": "Advertising cookies let us show you IA Operators ads on those platforms after you visit the site and measure whether an ad led to a contact request. For the Meta pixel, Meta Platforms Ireland acts as joint controller for the collection and transmission of that data.",
      "p3": "You can change your choice at any time from the “Cookies” link in the footer, and delete cookies already set from your browser settings."
    },
    "s8": {
      "title": "8. Minors",
      "p": "The site is aimed at businesses and professionals. We do not knowingly collect data from children under 14."
    },
    "s9": {
      "title": "9. Security",
      "p": "We apply technical and organizational measures proportionate to the risk: encrypted connections, restricted access to the databases, separation of the email from the answers in the survey and pseudonymization of the origin of the test answers."
    },
    "s10": {
      "title": "10. Changes to this policy",
      "p": "If we change how we process your data, we will update this page and its date. If the change affects processing based on your consent, we will ask for it again when necessary."
    },
    "tratamientos": [
      {
        "titulo": "Contact form",
        "datos": "Name, email, company, city (optional), the message you write and the IP address it is sent from.",
        "finalidad": "To answer your request and, if there is a fit, prepare a proposal. The IP is used only to limit abusive submissions.",
        "base": "Steps taken at your request before entering into a contract (art. 6.1.b GDPR) and, for the IP, our legitimate interest in protecting the form (art. 6.1.f).",
        "plazo": "12 months from the last contact if no relationship begins. If you become a client, for the duration of the relationship and then for the legal retention periods (6 years for commercial records)."
      },
      {
        "titulo": "Compliance tests (Ley 10/2025 and Verifactu)",
        "datos": "Your answers to the questionnaire, the result, the page you came from, campaign parameters (UTM) and a pseudonymized identifier calculated from your IP, browser and language. The IP itself is not stored. If you request the report: your email and your contact preferences.",
        "finalidad": "To calculate and show you the result, produce aggregate statistics and prevent duplicate or automated submissions. With your email, to send you the report and, if you tick the box, to contact you to discuss it.",
        "base": "Legitimate interest in providing the tool and measuring its use (art. 6.1.f GDPR). Sending the report and any follow-up contact: your consent (art. 6.1.a).",
        "plazo": "Answers: 24 months. Email: until you withdraw consent or after 24 months without interaction."
      },
      {
        "titulo": "“The Second Bill of AI 2026” survey",
        "datos": "Your answers, language, technical device data (category and a pseudonymized fingerprint) and, optionally, your email, which is stored separately from the answers.",
        "finalidad": "To produce a study with aggregate results. Individual answers are not published. The email is only used to let you know about the results.",
        "base": "Your consent, given when you tick the boxes before submitting (art. 6.1.a GDPR).",
        "plazo": "Individual data: up to 12 months after the study is published; after that only aggregates are kept. Email: until we send you the results."
      },
      {
        "titulo": "Browsing and security",
        "datos": "Technical server logs (IP, date, requested page and browser).",
        "finalidad": "To serve the site, detect errors and prevent attacks.",
        "base": "Legitimate interest in keeping the site secure and running (art. 6.1.f GDPR).",
        "plazo": "The short period set by the hosting provider for its logs."
      }
    ],
    "proveedores": [
      {
        "nombre": "Vercel Inc.",
        "uso": "Site hosting and form processing.",
        "ubicacion": "United States · processor"
      },
      {
        "nombre": "Supabase Inc.",
        "uso": "Database for the tests and the survey.",
        "ubicacion": "Servers in the European Union · processor"
      },
      {
        "nombre": "Resend (Plus Five Five, Inc.)",
        "uso": "Sending the contact form emails and the test reports.",
        "ubicacion": "United States · processor"
      },
      {
        "nombre": "Google (Gmail)",
        "uso": "Inbox where messages sent to info@iaoperators.com are received and handled.",
        "ubicacion": "United States and EU"
      },
      {
        "nombre": "Google, Meta, LinkedIn and Ahrefs",
        "uso": "Measurement and advertising, only if you accept cookies. Details in section 7.",
        "ubicacion": "EU and United States · see section 7"
      }
    ],
    "cookies": [
      {
        "nombre": "Cookie preference (first-party)",
        "uso": "Remembers whether you accepted or rejected the notice. Stored in the browser's local storage. Technical, does not require consent.",
        "detalle": "Key iaoperators_cookie_consent · until you delete it"
      },
      {
        "nombre": "Google Tag Manager (Google Ireland Ltd.)",
        "uso": "Manager that loads the other tags after your consent. Does not set cookies of its own.",
        "detalle": "Only after accepting"
      },
      {
        "nombre": "Google Analytics 4 (Google Ireland Ltd.)",
        "uso": "Audience measurement: page views, traffic sources and conversions.",
        "detalle": "Analytics · _ga, _ga_* · up to 2 years"
      },
      {
        "nombre": "Google Ads (Google Ireland Ltd.)",
        "uso": "Ad conversion measurement and remarketing lists.",
        "detalle": "Advertising · _gcl_au · 90 days"
      },
      {
        "nombre": "Meta Pixel (Meta Platforms Ireland Ltd.)",
        "uso": "Conversion and audience measurement for Facebook and Instagram ads.",
        "detalle": "Advertising · _fbp, _fbc · 90 days"
      },
      {
        "nombre": "LinkedIn Insight Tag (LinkedIn Ireland U.C.)",
        "uso": "Conversion and audience measurement for LinkedIn ads.",
        "detalle": "Advertising · li_sugr, bcookie, lidc, UserMatchHistory and others · between 1 day and 1 year"
      },
      {
        "nombre": "Ahrefs Web Analytics (Ahrefs Pte. Ltd.)",
        "uso": "Aggregate audience measurement.",
        "detalle": "Analytics · Singapore · cookieless, according to the provider"
      }
    ]
  },
  pt: {
    "updated": "Última atualização · 8 de outubro de 2026",
    "lead": "Quais dados pessoais tratamos em iaoperators.com, para quê, com que base legal, por quanto tempo, com quem são compartilhados e como você pode exercer seus direitos. Esta política cumpre o dever de informação do Regulamento (UE) 2016/679 (RGPD) e da Lei Orgânica espanhola 3/2018 (LOPDGDD).",
    "labels": {
      "holder": "Titular",
      "taxId": "NIF",
      "address": "Endereço",
      "contact": "Contato",
      "data": "Dados",
      "purpose": "Finalidade",
      "basis": "Base legal",
      "retention": "Conservação"
    },
    "city": "Málaga, Espanha",
    "s1": {
      "title": "1. Responsável pelo tratamento",
      "holderSuffix": "(nome comercial: IA Operators)",
      "dpo": "Não designamos um encarregado de proteção de dados porque nossa atividade não está entre os casos que o exigem (art. 37 do RGPD e art. 34 da LOPDGDD). Para qualquer questão sobre privacidade, escreva para o e-mail acima."
    },
    "s2": {
      "title": "2. Quais dados tratamos e para quê",
      "noSale": "Não vendemos dados pessoais nem os cedemos a terceiros para fins próprios, salvo obrigação legal. Os dados dos formulários não são usados para publicidade."
    },
    "s3": {
      "title": "3. Fornecedores com acesso aos dados",
      "intro": "Para prestar o serviço usamos os fornecedores abaixo. Os que atuam como operadores só tratam os dados seguindo nossas instruções."
    },
    "s4": {
      "title": "4. Transferências internacionais",
      "p1": "Vários desses fornecedores são empresas dos Estados Unidos ou podem acessar os dados a partir de lá. Nesses casos a transferência se apoia na decisão de adequação do Quadro de Privacidade de Dados UE-EUA, quando o fornecedor é aderente, ou nas cláusulas contratuais-tipo aprovadas pela Comissão Europeia, que os fornecedores incluem em seus acordos de tratamento de dados.",
      "p2": "As respostas dos testes e da pesquisa ficam armazenadas em servidores da União Europeia."
    },
    "s5": {
      "title": "5. Decisões automatizadas",
      "p": "O resultado dos testes de cumprimento é calculado com regras fixas a partir das suas respostas. É orientativo, não produz efeitos jurídicos sobre você e não condiciona nenhuma decisão que o afete. Não tomamos decisões baseadas exclusivamente em tratamento automatizado no sentido do art. 22 do RGPD."
    },
    "s6": {
      "title": "6. Seus direitos",
      "rights": [
        "Acessar seus dados e saber como os tratamos.",
        "Retificar dados inexatos e apagá-los quando não forem mais necessários.",
        "Opor-se ao tratamento baseado em interesse legítimo e pedir sua limitação.",
        "Receber seus dados em formato estruturado (portabilidade).",
        "Retirar seu consentimento a qualquer momento, sem afetar o que foi tratado antes."
      ],
      "exerciseBefore": "Para exercê-los, escreva para",
      "exerciseAfter": "com o assunto “Proteção de dados”, indicando qual direito você está exercendo. Só pediremos dados para verificar sua identidade se houver dúvidas razoáveis sobre ela. Respondemos no prazo de um mês.",
      "complaintBefore": "Se considerar que não atendemos bem sua solicitação, você pode apresentar reclamação à Agência Espanhola de Proteção de Dados (AEPD) em"
    },
    "s7": {
      "title": "7. Cookies e tecnologias semelhantes",
      "p1": "Sem o seu consentimento usamos apenas o estritamente necessário para o site funcionar e para lembrar sua escolha sobre cookies. A medição e a publicidade só são carregadas se você clicar em “Aceitar” no aviso; se clicar em “Rejeitar”, nada disso é carregado.",
      "p2": "Os cookies de publicidade permitem mostrar anúncios da IA Operators nessas plataformas depois que você visita o site e medir se um anúncio terminou em um pedido de contato. No caso do pixel da Meta, a Meta Platforms Ireland atua como corresponsável pela coleta e transmissão desses dados.",
      "p3": "Você pode mudar sua escolha a qualquer momento pelo link “Cookies” do rodapé e apagar os cookies já instalados nas configurações do navegador."
    },
    "s8": {
      "title": "8. Menores",
      "p": "O site é dirigido a empresas e profissionais. Não coletamos conscientemente dados de menores de 14 anos."
    },
    "s9": {
      "title": "9. Segurança",
      "p": "Aplicamos medidas técnicas e organizacionais proporcionais ao risco: conexões criptografadas, acesso restrito aos bancos de dados, separação do e-mail em relação às respostas na pesquisa e pseudonimização da origem das respostas dos testes."
    },
    "s10": {
      "title": "10. Mudanças nesta política",
      "p": "Se mudarmos a forma de tratar seus dados, atualizaremos esta página e a data. Se a mudança afetar um tratamento baseado no seu consentimento, pediremos de novo quando for necessário."
    },
    "tratamientos": [
      {
        "titulo": "Formulário de contato",
        "datos": "Nome, e-mail, empresa, cidade (opcional), a mensagem que você escrever e o endereço IP de onde ela é enviada.",
        "finalidad": "Responder à sua solicitação e, se fizer sentido, preparar uma proposta. O IP é usado apenas para limitar envios abusivos.",
        "base": "Diligências pré-contratuais a seu pedido (art. 6.1.b do RGPD) e, para o IP, interesse legítimo em proteger o formulário (art. 6.1.f).",
        "plazo": "12 meses desde o último contato, se não houver início de relação. Se você se tornar cliente, enquanto durar a relação e depois pelos prazos legais (6 anos para a documentação mercantil)."
      },
      {
        "titulo": "Testes de cumprimento (Ley 10/2025 e Verifactu)",
        "datos": "As respostas ao questionário, o resultado, a página de origem, os parâmetros de campanha (UTM) e um identificador pseudonimizado calculado a partir do IP, do navegador e do idioma. O IP não é guardado. Se você pedir o relatório: seu e-mail e suas preferências de contato.",
        "finalidad": "Calcular e mostrar o resultado, obter estatísticas agregadas e evitar envios duplicados ou automatizados. Com o e-mail, enviar o relatório e, se você marcar a opção, entrar em contato para comentá-lo.",
        "base": "Interesse legítimo em oferecer a ferramenta e medir seu uso (art. 6.1.f do RGPD). O envio do relatório e o contato posterior: seu consentimento (art. 6.1.a).",
        "plazo": "Respostas: 24 meses. E-mail: até você retirar o consentimento ou após 24 meses sem interação."
      },
      {
        "titulo": "Pesquisa “A Segunda Fatura da IA 2026”",
        "datos": "As respostas, o idioma, dados técnicos do dispositivo (categoria e impressão digital pseudonimizada) e, opcionalmente, seu e-mail, que é guardado separado das respostas.",
        "finalidad": "Elaborar um estudo com resultados agregados. As respostas individuais não são publicadas. O e-mail serve apenas para avisar você sobre os resultados.",
        "base": "Seu consentimento, dado ao marcar as caixas antes de enviar (art. 6.1.a do RGPD).",
        "plazo": "Dados individuais: até 12 meses após a publicação do estudo; depois, só são mantidos dados agregados. E-mail: até enviarmos os resultados."
      },
      {
        "titulo": "Navegação e segurança",
        "datos": "Registros técnicos do servidor (IP, data, página solicitada e navegador).",
        "finalidad": "Servir o site, detectar erros e prevenir ataques.",
        "base": "Interesse legítimo em manter o site seguro e funcionando (art. 6.1.f do RGPD).",
        "plazo": "O prazo curto definido pelo provedor de hospedagem para seus registros."
      }
    ],
    "proveedores": [
      {
        "nombre": "Vercel Inc.",
        "uso": "Hospedagem do site e execução dos formulários.",
        "ubicacion": "Estados Unidos · operador"
      },
      {
        "nombre": "Supabase Inc.",
        "uso": "Banco de dados dos testes e da pesquisa.",
        "ubicacion": "Servidores na União Europeia · operador"
      },
      {
        "nombre": "Resend (Plus Five Five, Inc.)",
        "uso": "Envio dos e-mails do formulário de contato e dos relatórios dos testes.",
        "ubicacion": "Estados Unidos · operador"
      },
      {
        "nombre": "Google (Gmail)",
        "uso": "Caixa de entrada onde são recebidas e geridas as mensagens enviadas para info@iaoperators.com.",
        "ubicacion": "Estados Unidos e UE"
      },
      {
        "nombre": "Google, Meta, LinkedIn e Ahrefs",
        "uso": "Medição e publicidade, só se você aceitar os cookies. Detalhes na seção 7.",
        "ubicacion": "UE e Estados Unidos · ver seção 7"
      }
    ],
    "cookies": [
      {
        "nombre": "Preferência de cookies (própria)",
        "uso": "Lembra se você aceitou ou rejeitou o aviso. Fica guardada no armazenamento local do navegador. Técnica, não requer consentimento.",
        "detalle": "Chave iaoperators_cookie_consent · até você apagá-la"
      },
      {
        "nombre": "Google Tag Manager (Google Ireland Ltd.)",
        "uso": "Gerenciador que carrega as demais tags após o seu consentimento. Não instala cookies próprios.",
        "detalle": "Só após aceitar"
      },
      {
        "nombre": "Google Analytics 4 (Google Ireland Ltd.)",
        "uso": "Medição de audiência: páginas vistas, origem das visitas e conversões.",
        "detalle": "Analítica · _ga, _ga_* · até 2 anos"
      },
      {
        "nombre": "Google Ads (Google Ireland Ltd.)",
        "uso": "Medição de conversões de anúncios e listas de remarketing.",
        "detalle": "Publicidade · _gcl_au · 90 dias"
      },
      {
        "nombre": "Pixel da Meta (Meta Platforms Ireland Ltd.)",
        "uso": "Medição de conversões e públicos para anúncios no Facebook e no Instagram.",
        "detalle": "Publicidade · _fbp, _fbc · 90 dias"
      },
      {
        "nombre": "LinkedIn Insight Tag (LinkedIn Ireland U.C.)",
        "uso": "Medição de conversões e públicos para anúncios no LinkedIn.",
        "detalle": "Publicidade · li_sugr, bcookie, lidc, UserMatchHistory e outras · entre 1 dia e 1 ano"
      },
      {
        "nombre": "Ahrefs Web Analytics (Ahrefs Pte. Ltd.)",
        "uso": "Medição de audiência agregada.",
        "detalle": "Analítica · Singapura · segundo o fornecedor, sem cookies"
      }
    ]
  },
};
