import type { SurveyQuestionDefinition, SurveyQuestionId } from "./types";
import { surveyQuestions } from "./questions";

export type SurveyLang = "es" | "en" | "pt";

export function normalizeSurveyLang(input?: string): SurveyLang {
  if (input === "en") return "en";
  if (input === "pt") return "pt";
  return "es";
}

type QuestionTranslation = {
  title: string;
  description?: string;
  options: Record<string, string>;
};

// Solo se traducen los textos visibles (title/description/labels).
// Los `value` de cada opción son códigos estables e independientes del idioma,
// por lo que la validación, el CSV y el panel admin siguen funcionando igual.
const questionTranslations: Record<
  Exclude<SurveyLang, "es">,
  Record<SurveyQuestionId, QuestionTranslation>
> = {
  en: {
    professional_role: {
      title: "Which profile best describes your current role?",
      description: "Pick the option that best represents your main function.",
      options: {
        owner_founder: "Owner or founder",
        executive: "General management or executive committee",
        manager: "Middle management or team lead",
        tech_specialist: "Technology, product or data",
        marketing_sales: "Marketing, sales or customer support",
        operations_security: "Operations, security, innovation or digital transformation",
        consultant_freelance: "Consultant or freelance professional",
        employee_other: "Employee in another area",
        prefer_not: "Prefer not to answer",
      },
    },
    company_size: {
      title: "What is the approximate size of your organization?",
      options: {
        solo: "Just me",
        "2_10": "2 to 10 people",
        "11_50": "11 to 50 people",
        "51_250": "51 to 250 people",
        "251_1000": "251 to 1,000 people",
        "1000_plus": "More than 1,000 people",
        unknown: "I don't know",
        prefer_not: "Prefer not to answer",
      },
    },
    sector: {
      title: "Which sector do you mainly work in?",
      options: {
        technology: "Technology or software",
        professional_services: "Professional services or consulting",
        marketing_media: "Marketing, media or communications",
        retail_ecommerce: "Retail or e-commerce",
        industry_logistics: "Industry, logistics or energy",
        tourism_hospitality: "Tourism, hospitality or food service",
        health_education: "Health, education or public sector",
        finance_legal: "Finance, insurance or legal",
        other: "Another sector",
        prefer_not: "Prefer not to answer",
      },
    },
    country_region: {
      title: "Which country or region are you answering from?",
      description: "The initial focus is Spain, but the survey accepts responses from other markets.",
      options: {
        es_andalucia: "Spain · Andalusia",
        es_cataluna: "Spain · Catalonia",
        es_madrid: "Spain · Community of Madrid",
        es_valencia: "Spain · Valencian Community",
        es_other: "Spain · Another region",
        eu_other: "Another European country",
        latam: "Latin America",
        other_region: "Another region",
        prefer_not: "Prefer not to answer",
      },
    },
    ai_usage_frequency: {
      title: "How often do you use AI tools in your work?",
      options: {
        daily: "Daily",
        weekly: "Several times a week",
        monthly: "Several times a month",
        rarely: "Occasionally",
        never: "I don't use them at work",
        unknown: "I don't know",
      },
    },
    work_account_usage: {
      title: "When you use AI for work tasks, which type of account do you use most often?",
      options: {
        company_only: "Only an approved corporate account",
        personal_only: "Only a personal account",
        mostly_company: "Mostly corporate, with occasional use of personal accounts",
        mostly_personal: "Mostly personal, with limited access to corporate accounts",
        shared_team: "An account shared by the team",
        no_use: "I don't use AI for work",
        unknown: "I don't know",
      },
    },
    shared_information_types: {
      title: "What kind of information have you shared, or seen shared, in AI tools for work tasks?",
      description: "You can select several options. Do not include specific examples or names.",
      options: {
        internal_docs: "Internal documents or drafts",
        personal_data: "Personal data of employees, clients or leads",
        contracts: "Contracts, proposals or legal documents",
        operational_knowledge: "Procedures, internal criteria or operational know-how",
        strategy: "Strategies, plans or sensitive business information",
        source_code: "Code, queries or technical configurations",
        none: "None of the above",
        unknown: "I don't know",
        prefer_not: "Prefer not to answer",
      },
    },
    governance_maturity: {
      title: "Which best describes your organization's situation regarding AI use?",
      options: {
        none: "There is no policy or clear guidance",
        informal: "There are informal recommendations, but no formal policy",
        formal_policy: "There is a formal policy, but no systematic training",
        policy_training: "There is a formal policy and basic training",
        policy_training_audit: "There is a formal policy, training and some monitoring or auditing",
        unknown: "I don't know",
      },
    },
    vendor_and_safeguard_practices: {
      title: "Which practices do you or your organization apply before or during AI use?",
      options: {
        understand_vendor_terms: "We know how the vendor may use the data we enter",
        anonymize_docs: "We anonymize or summarize documents before sending them",
        remove_personal_data: "We remove personal data before sharing it",
        avoid_sensitive_uploads: "We avoid uploading sensitive information unless clearly justified",
        approved_tools_only: "We limit use to company-approved tools",
        none: "We apply none of these practices",
        unknown: "I don't know",
      },
    },
    monitoring_and_shadow_ai: {
      title: "Which of these situations is closest to your organization's reality?",
      options: {
        logs_and_detected: "AI use is logged or audited and Shadow AI cases have already been detected",
        logs_no_detected: "AI use is logged or audited, but no Shadow AI cases have been detected",
        no_logs_detected: "It is not systematically logged, but Shadow AI cases have been detected",
        no_logs_no_detected: "It is not systematically logged and no cases have been detected",
        unknown: "I don't know",
      },
    },
    supplier_dependency_resilience: {
      title: "If your main AI tool or model became unavailable for 30 days, what would happen?",
      options: {
        no_dependency: "Little impact, because we use several alternatives or barely depend on it",
        manageable_switch: "There would be an impact, but we could switch vendor or process without major problems",
        significant_delay: "Important tasks would be delayed for several weeks",
        major_disruption: "Key operations or client deliverables would be affected",
        critical_stop: "Part of the work would be practically blocked",
        not_applicable: "Not applicable, because we don't use AI in a relevant way",
        unknown: "I don't know",
      },
    },
    risk_perception: {
      title: "On a scale of 1 to 5, what level of risk do you perceive in the current use of AI in your work environment?",
      description: "1 means very low risk and 5 means very high risk.",
      options: {
        "1": "1 · Very low",
        "2": "2 · Low",
        "3": "3 · Medium",
        "4": "4 · High",
        "5": "5 · Very high",
        unknown: "I don't know",
      },
    },
  },
  pt: {
    professional_role: {
      title: "Qual perfil descreve melhor o seu trabalho atual?",
      description: "Selecione a opção que melhor representa a sua função principal.",
      options: {
        owner_founder: "Proprietário(a) ou fundador(a)",
        executive: "Direção geral ou comitê executivo",
        manager: "Média gerência ou responsável de equipe",
        tech_specialist: "Tecnologia, produto ou dados",
        marketing_sales: "Marketing, vendas ou atendimento ao cliente",
        operations_security: "Operações, segurança, inovação ou transformação digital",
        consultant_freelance: "Consultor(a) ou profissional autônomo",
        employee_other: "Colaborador(a) de outra área",
        prefer_not: "Prefiro não responder",
      },
    },
    company_size: {
      title: "Qual é o tamanho aproximado da sua organização?",
      options: {
        solo: "Só eu",
        "2_10": "2 a 10 pessoas",
        "11_50": "11 a 50 pessoas",
        "51_250": "51 a 250 pessoas",
        "251_1000": "251 a 1.000 pessoas",
        "1000_plus": "Mais de 1.000 pessoas",
        unknown: "Não sei",
        prefer_not: "Prefiro não responder",
      },
    },
    sector: {
      title: "Em qual setor você trabalha principalmente?",
      options: {
        technology: "Tecnologia ou software",
        professional_services: "Serviços profissionais ou consultoria",
        marketing_media: "Marketing, mídia ou comunicação",
        retail_ecommerce: "Varejo ou comércio eletrônico",
        industry_logistics: "Indústria, logística ou energia",
        tourism_hospitality: "Turismo, hotelaria ou restauração",
        health_education: "Saúde, educação ou setor público",
        finance_legal: "Finanças, seguros ou jurídico",
        other: "Outro setor",
        prefer_not: "Prefiro não responder",
      },
    },
    country_region: {
      title: "De qual país ou região você está respondendo?",
      description: "O foco inicial é a Espanha, mas a pesquisa aceita respostas de outros mercados.",
      options: {
        es_andalucia: "Espanha · Andaluzia",
        es_cataluna: "Espanha · Catalunha",
        es_madrid: "Espanha · Comunidade de Madri",
        es_valencia: "Espanha · Comunidade Valenciana",
        es_other: "Espanha · Outra comunidade",
        eu_other: "Outro país da Europa",
        latam: "América Latina",
        other_region: "Outra região",
        prefer_not: "Prefiro não responder",
      },
    },
    ai_usage_frequency: {
      title: "Com que frequência você utiliza ferramentas de IA no seu trabalho?",
      options: {
        daily: "Diariamente",
        weekly: "Várias vezes por semana",
        monthly: "Várias vezes por mês",
        rarely: "De forma esporádica",
        never: "Não as utilizo no trabalho",
        unknown: "Não sei",
      },
    },
    work_account_usage: {
      title: "Quando usa IA para tarefas profissionais, que tipo de conta utiliza com mais frequência?",
      options: {
        company_only: "Apenas uma conta corporativa aprovada",
        personal_only: "Apenas uma conta pessoal",
        mostly_company: "Principalmente corporativa, com uso ocasional de contas pessoais",
        mostly_personal: "Principalmente pessoal, com acesso limitado a contas corporativas",
        shared_team: "Uma conta compartilhada pela equipe",
        no_use: "Não uso IA para o trabalho",
        unknown: "Não sei",
      },
    },
    shared_information_types: {
      title: "Que tipo de informação você já compartilhou, ou viu compartilhar, em ferramentas de IA para tarefas de trabalho?",
      description: "Pode marcar várias opções. Não inclua exemplos nem nomes concretos.",
      options: {
        internal_docs: "Documentos internos ou rascunhos",
        personal_data: "Dados pessoais de colaboradores, clientes ou leads",
        contracts: "Contratos, propostas ou documentos jurídicos",
        operational_knowledge: "Procedimentos, critérios internos ou know-how operacional",
        strategy: "Estratégias, planos ou informações sensíveis do negócio",
        source_code: "Código, consultas ou configurações técnicas",
        none: "Nenhuma das anteriores",
        unknown: "Não sei",
        prefer_not: "Prefiro não responder",
      },
    },
    governance_maturity: {
      title: "Qual opção descreve melhor a situação da sua organização quanto ao uso de IA?",
      options: {
        none: "Não existe política nem diretrizes claras",
        informal: "Há recomendações informais, mas nenhuma política formal",
        formal_policy: "Existe uma política formal, mas sem formação sistemática",
        policy_training: "Existe política formal e formação básica",
        policy_training_audit: "Existe política formal, formação e algum acompanhamento ou auditoria",
        unknown: "Não sei",
      },
    },
    vendor_and_safeguard_practices: {
      title: "Que práticas você ou a sua organização aplicam antes ou durante o uso de IA?",
      options: {
        understand_vendor_terms: "Sabemos como o fornecedor pode usar os dados inseridos",
        anonymize_docs: "Anonimizamos ou resumimos documentos antes de enviá-los",
        remove_personal_data: "Removemos dados pessoais antes de compartilhá-los",
        avoid_sensitive_uploads: "Evitamos enviar informações sensíveis salvo necessidade justificada",
        approved_tools_only: "Limitamos o uso a ferramentas aprovadas pela empresa",
        none: "Não aplicamos nenhuma dessas práticas",
        unknown: "Não sei",
      },
    },
    monitoring_and_shadow_ai: {
      title: "Qual destas situações está mais próxima da realidade da sua organização?",
      options: {
        logs_and_detected: "O uso de IA é registrado ou auditado e já foram detectados casos de Shadow AI",
        logs_no_detected: "O uso de IA é registrado ou auditado, mas não foram detectados casos de Shadow AI",
        no_logs_detected: "Não é registrado de forma sistemática, mas já foram detectados casos de Shadow AI",
        no_logs_no_detected: "Não é registrado de forma sistemática e não foram detectados casos",
        unknown: "Não sei",
      },
    },
    supplier_dependency_resilience: {
      title: "Se a sua principal ferramenta ou modelo de IA ficasse indisponível por 30 dias, o que aconteceria?",
      options: {
        no_dependency: "Teríamos pouco impacto, porque usamos várias alternativas ou quase não dependemos dela",
        manageable_switch: "Haveria impacto, mas poderíamos trocar de fornecedor ou processo sem grandes problemas",
        significant_delay: "Tarefas importantes seriam atrasadas por várias semanas",
        major_disruption: "Operações essenciais ou entregas ao cliente seriam afetadas",
        critical_stop: "Parte do trabalho ficaria praticamente bloqueada",
        not_applicable: "Não se aplica, porque não usamos IA de forma relevante",
        unknown: "Não sei",
      },
    },
    risk_perception: {
      title: "Numa escala de 1 a 5, que nível de risco você percebe no uso atual de IA no seu ambiente de trabalho?",
      description: "1 significa risco muito baixo e 5 risco muito alto.",
      options: {
        "1": "1 · Muito baixo",
        "2": "2 · Baixo",
        "3": "3 · Médio",
        "4": "4 · Alto",
        "5": "5 · Muito alto",
        unknown: "Não sei",
      },
    },
  },
};

export function getLocalizedQuestions(lang: SurveyLang): SurveyQuestionDefinition[] {
  if (lang === "es") return surveyQuestions;
  const dict = questionTranslations[lang];
  return surveyQuestions.map((question) => {
    const translated = dict[question.id];
    if (!translated) return question;
    return {
      ...question,
      title: translated.title || question.title,
      description: translated.description ?? question.description,
      options: question.options.map((option) => ({
        ...option,
        label: translated.options[option.value] ?? option.label,
      })),
    };
  });
}

export type SurveyConsentKey =
  | "accepted"
  | "aggregateUseAccepted"
  | "confidentialityNoticeAccepted"
  | "deletionRightsRead"
  | "emailMarketingAccepted";

export interface SurveyUiStrings {
  aside: {
    badge: string;
    title: string;
    description: string;
    progress: string;
    counterOf: string;
    whatAnswerLabel: string;
    whatAnswerValue: string;
    whatNotShareLabel: string;
    whatNotShareValue: string;
    howDataLabel: string;
    howDataValue: string;
    startButton: string;
    preparing: string;
  };
  intro: {
    eyebrow: string;
    title: string;
    text: string;
    bullets: string[];
  };
  steps: {
    questionLabel: (index: number) => string;
    privacyLabel: string;
  };
  consent: {
    title: string;
    intro: string;
    purpose: string;
    resultsUse: string;
    deletionPre: string;
    deletionPost: string;
    emailStorage: string;
    emailLabel: string;
    emailPlaceholder: string;
    emailHint: string;
    items: Array<{ key: SurveyConsentKey; label: string }>;
  };
  nav: {
    back: string;
    next: string;
    saving: string;
    submit: string;
    sending: string;
  };
  validation: {
    consent: string;
    multi: string;
    single: string;
  };
  errors: {
    start: string;
    save: string;
    sessionNotReady: string;
    submit: string;
  };
}

export const surveyUi: Record<SurveyLang, SurveyUiStrings> = {
  es: {
    aside: {
      badge: "Investigación propietaria",
      title: "Encuesta de 3 minutos",
      description:
        "Diseñada para medir adopción, gobernanza, prácticas de control y dependencia de proveedores de IA en equipos reales.",
      progress: "Progreso",
      counterOf: "de",
      whatAnswerLabel: "Qué vas a responder",
      whatAnswerValue: "12 preguntas cerradas, sin respuestas abiertas obligatorias.",
      whatNotShareLabel: "Qué no debes compartir",
      whatNotShareValue: "Nombres de clientes, contratos completos, credenciales o secretos internos.",
      howDataLabel: "Cómo se usarán los datos",
      howDataValue: "Solo para análisis agregado, control de calidad y futura publicación del estudio.",
      startButton: "Empezar encuesta",
      preparing: "Preparando encuesta...",
    },
    intro: {
      eyebrow: "Antes de empezar",
      title: "Queremos medir la segunda factura de la IA: la exposición invisible.",
      text: "Esta encuesta exploratoria analiza cómo se usa la IA en el trabajo, qué información circula por esas herramientas y hasta qué punto existen controles reales. No hace falta registrarse.",
      bullets: [
        "Acepta respuestas de empresas, autónomos, consultores y equipos internos.",
        "Está pensada para España, pero admite respuestas de otros mercados para comparación.",
        "Permite segmentar por perfil, tamaño de organización, sector, región y madurez de gobernanza.",
      ],
    },
    steps: {
      questionLabel: (index) => `Pregunta ${index + 1}`,
      privacyLabel: "Privacidad y envío",
    },
    consent: {
      title: "Revisión final, privacidad y envío",
      intro:
        "Las respuestas se analizarán de forma agregada. No publiques ni pegues datos confidenciales, nombres de clientes, contratos completos ni documentos internos identificables.",
      purpose:
        "Finalidad: entender cómo empresas y profesionales usan IA en el trabajo y qué prácticas de gobernanza, control y dependencia tecnológica existen hoy.",
      resultsUse:
        "Uso de resultados: los resultados podrán publicarse únicamente de forma agregada. Ninguna respuesta individual se publicará como tal.",
      deletionPre: "Eliminación de datos: si decides dejar un email, podrás solicitar la eliminación escribiendo a ",
      deletionPost: ".",
      emailStorage:
        "Email opcional: si lo facilitas, se almacenará por separado de las respuestas comportamentales siempre que el backend de producción esté configurado con el driver recomendado.",
      emailLabel: "Email opcional para recibir el estudio cuando esté listo",
      emailPlaceholder: "tu@empresa.com",
      emailHint: "Este campo no es obligatorio. Puedes responder sin identificarte.",
      items: [
        { key: "accepted", label: "Acepto enviar esta respuesta para fines de investigación exploratoria." },
        { key: "aggregateUseAccepted", label: "Entiendo que los resultados se utilizarán solo de forma agregada." },
        { key: "confidentialityNoticeAccepted", label: "Confirmo que no he incluido ni incluiré datos confidenciales o secretos empresariales." },
        { key: "deletionRightsRead", label: "He leído cómo solicitar la eliminación de mis datos en caso de haber facilitado un identificador." },
        { key: "emailMarketingAccepted", label: "Acepto recibir por email novedades relacionadas con este estudio (opcional)." },
      ],
    },
    nav: {
      back: "Volver",
      next: "Siguiente",
      saving: "Guardando...",
      submit: "Enviar encuesta",
      sending: "Enviando...",
    },
    validation: {
      consent: "Debes revisar y aceptar las condiciones obligatorias antes de enviar.",
      multi: "Selecciona al menos una opción para continuar.",
      single: "Selecciona una opción para continuar.",
    },
    errors: {
      start: "No se pudo iniciar la encuesta.",
      save: "No se pudo guardar tu avance.",
      sessionNotReady: "La sesión no está preparada. Vuelve a intentarlo.",
      submit: "No se pudo enviar la encuesta.",
    },
  },
  en: {
    aside: {
      badge: "Proprietary research",
      title: "3-minute survey",
      description:
        "Designed to measure AI adoption, governance, control practices and vendor dependency in real teams.",
      progress: "Progress",
      counterOf: "of",
      whatAnswerLabel: "What you'll answer",
      whatAnswerValue: "12 closed questions, with no mandatory open-ended answers.",
      whatNotShareLabel: "What you must not share",
      whatNotShareValue: "Client names, full contracts, credentials or internal secrets.",
      howDataLabel: "How the data will be used",
      howDataValue: "Only for aggregate analysis, quality control and the future publication of the study.",
      startButton: "Start survey",
      preparing: "Preparing survey...",
    },
    intro: {
      eyebrow: "Before you start",
      title: "We want to measure the second bill of AI: the invisible exposure.",
      text: "This exploratory survey looks at how AI is used at work, what information flows through these tools and to what extent real controls exist. No sign-up required.",
      bullets: [
        "Open to companies, freelancers, consultants and in-house teams.",
        "Focused on Spain, but it accepts responses from other markets for comparison.",
        "Lets us segment by profile, organization size, sector, region and governance maturity.",
      ],
    },
    steps: {
      questionLabel: (index) => `Question ${index + 1}`,
      privacyLabel: "Privacy & submit",
    },
    consent: {
      title: "Final review, privacy & submit",
      intro:
        "Responses will be analyzed in aggregate. Do not publish or paste confidential data, client names, full contracts or identifiable internal documents.",
      purpose:
        "Purpose: to understand how companies and professionals use AI at work and what governance, control and technology-dependency practices exist today.",
      resultsUse:
        "Use of results: results may only be published in aggregate. No individual response will be published as such.",
      deletionPre: "Data deletion: if you choose to leave an email, you can request deletion by writing to ",
      deletionPost: ".",
      emailStorage:
        "Optional email: if you provide it, it is stored separately from the behavioral responses, provided the production backend is configured with the recommended driver.",
      emailLabel: "Optional email to receive the study when it's ready",
      emailPlaceholder: "you@company.com",
      emailHint: "This field is optional. You can answer without identifying yourself.",
      items: [
        { key: "accepted", label: "I agree to submit this response for exploratory research purposes." },
        { key: "aggregateUseAccepted", label: "I understand that results will be used only in aggregate." },
        { key: "confidentialityNoticeAccepted", label: "I confirm that I have not included and will not include confidential data or trade secrets." },
        { key: "deletionRightsRead", label: "I have read how to request deletion of my data if I have provided an identifier." },
        { key: "emailMarketingAccepted", label: "I agree to receive email updates related to this study (optional)." },
      ],
    },
    nav: {
      back: "Back",
      next: "Next",
      saving: "Saving...",
      submit: "Submit survey",
      sending: "Sending...",
    },
    validation: {
      consent: "You must review and accept the required conditions before submitting.",
      multi: "Select at least one option to continue.",
      single: "Select an option to continue.",
    },
    errors: {
      start: "The survey could not be started.",
      save: "Your progress could not be saved.",
      sessionNotReady: "The session is not ready. Please try again.",
      submit: "The survey could not be submitted.",
    },
  },
  pt: {
    aside: {
      badge: "Pesquisa proprietária",
      title: "Pesquisa de 3 minutos",
      description:
        "Desenhada para medir adoção, governança, práticas de controle e dependência de fornecedores de IA em equipes reais.",
      progress: "Progresso",
      counterOf: "de",
      whatAnswerLabel: "O que você vai responder",
      whatAnswerValue: "12 perguntas fechadas, sem respostas abertas obrigatórias.",
      whatNotShareLabel: "O que você não deve compartilhar",
      whatNotShareValue: "Nomes de clientes, contratos completos, credenciais ou segredos internos.",
      howDataLabel: "Como os dados serão usados",
      howDataValue: "Apenas para análise agregada, controle de qualidade e futura publicação do estudo.",
      startButton: "Começar pesquisa",
      preparing: "Preparando pesquisa...",
    },
    intro: {
      eyebrow: "Antes de começar",
      title: "Queremos medir a segunda fatura da IA: a exposição invisível.",
      text: "Esta pesquisa exploratória analisa como a IA é usada no trabalho, que informação circula por essas ferramentas e até que ponto existem controles reais. Não é preciso se cadastrar.",
      bullets: [
        "Aceita respostas de empresas, autônomos, consultores e equipes internas.",
        "É voltada para a Espanha, mas aceita respostas de outros mercados para comparação.",
        "Permite segmentar por perfil, tamanho da organização, setor, região e maturidade de governança.",
      ],
    },
    steps: {
      questionLabel: (index) => `Pergunta ${index + 1}`,
      privacyLabel: "Privacidade e envio",
    },
    consent: {
      title: "Revisão final, privacidade e envio",
      intro:
        "As respostas serão analisadas de forma agregada. Não publique nem cole dados confidenciais, nomes de clientes, contratos completos ou documentos internos identificáveis.",
      purpose:
        "Finalidade: entender como empresas e profissionais usam IA no trabalho e que práticas de governança, controle e dependência tecnológica existem hoje.",
      resultsUse:
        "Uso dos resultados: os resultados poderão ser publicados apenas de forma agregada. Nenhuma resposta individual será publicada como tal.",
      deletionPre: "Exclusão de dados: se decidir deixar um e-mail, poderá solicitar a exclusão escrevendo para ",
      deletionPost: ".",
      emailStorage:
        "E-mail opcional: se você o fornecer, será armazenado separadamente das respostas comportamentais, desde que o backend de produção esteja configurado com o driver recomendado.",
      emailLabel: "E-mail opcional para receber o estudo quando estiver pronto",
      emailPlaceholder: "voce@empresa.com",
      emailHint: "Este campo não é obrigatório. Você pode responder sem se identificar.",
      items: [
        { key: "accepted", label: "Concordo em enviar esta resposta para fins de pesquisa exploratória." },
        { key: "aggregateUseAccepted", label: "Entendo que os resultados serão usados apenas de forma agregada." },
        { key: "confidentialityNoticeAccepted", label: "Confirmo que não incluí nem incluirei dados confidenciais ou segredos empresariais." },
        { key: "deletionRightsRead", label: "Li como solicitar a exclusão dos meus dados caso tenha fornecido um identificador." },
        { key: "emailMarketingAccepted", label: "Concordo em receber por e-mail novidades relacionadas a este estudo (opcional)." },
      ],
    },
    nav: {
      back: "Voltar",
      next: "Avançar",
      saving: "Salvando...",
      submit: "Enviar pesquisa",
      sending: "Enviando...",
    },
    validation: {
      consent: "Você precisa revisar e aceitar as condições obrigatórias antes de enviar.",
      multi: "Selecione pelo menos uma opção para continuar.",
      single: "Selecione uma opção para continuar.",
    },
    errors: {
      start: "Não foi possível iniciar a pesquisa.",
      save: "Não foi possível salvar o seu progresso.",
      sessionNotReady: "A sessão não está pronta. Tente novamente.",
      submit: "Não foi possível enviar a pesquisa.",
    },
  },
};
