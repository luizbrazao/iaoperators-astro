// Os cinco casos do silo de integração, em português. Público: Brasil e Portugal.
//
// Este ficheiro espelha a ESTRUTURA de `es.ts` —as mesmas chaves, o mesmo número
// de itens em `patrones`, `entregables`, `puentes` e `faq`— mas NÃO é uma
// tradução literal. O argumento, a especificidade técnica e o tom pouco
// glamouroso são os mesmos; a redação é reescrita para soar como texto escrito
// em português, não como texto vertido do espanhol.
//
// CONTEÚDO DE NORMA ESPANHOLA: o silo espanhol vende conformidade com o
// Verifactu e com a Ley 10/2025. São obrigações legais de Espanha e não valem
// para este público, por isso estão deliberadamente ausentes daqui. O padrão de
// faturamento do caso `erp` foi reescrito como faturamento e conciliação de
// cobrança em geral, e as pontes que apontavam para `/es/cumplimiento/...`
// foram substituídas por destinos que existem em português.
//
// PONTES: todo `href` de `puentes` tem de existir em `/pt/`. A lista é fechada
// —é a única parte deste ficheiro capaz de quebrar o build de links—. Os slugs
// `/pt/auditoria-de-sistemas/`, `/pt/implementacion/` e `/pt/servicios/...`
// mantêm a forma espanhola de propósito: são as rotas reais do site em PT.
//
// FONTES VERIFICADAS (2026-08-10):
// - WhatsApp Business Platform: a cobrança é POR MENSAGEM (o modelo por
//   conversa ficou obsoleto). Categorias de template: marketing, utility e
//   authentication. As mensagens livres dentro da janela de atendimento de 24 h
//   aberta pelo utilizador não são cobradas, nem as recebidas do utilizador, nem
//   as enviadas dentro da janela de free entry point de 72 h.
//   https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing

import type { CasoIntegracion, CasoKey, SharedIntegracion } from "./types";

export const SHARED_PT: SharedIntegracion = {
  proceso: {
    title: "Como abordamos o problema",
    subtitle: "Quem diagnostica é quem constrói, sem hand-offs pelo caminho.",
    phases: [
      {
        code: "01",
        title: "Diagnóstico",
        plazo: "3–5 dias",
        body: "Mapeamos sistemas, fluxos de dados e dependências reais, inclusive as que ninguém documentou. Saída: escopo fechado e a lista do que hoje está quebrado.",
      },
      {
        code: "02",
        title: "Desenho da integração",
        plazo: "1 semana",
        body: "Contratos de dados, direção da sincronização, política de retentativas e quem é dono de cada campo. Decide-se antes de escrever código porque é o caro de mudar depois.",
      },
      {
        code: "03",
        title: "Implementação e testes",
        plazo: "2–6 semanas",
        body: "Construção com a casuística real, não com o caminho feliz. Testes contra os sistemas de verdade e implantação em fases.",
      },
      {
        code: "04",
        title: "Produção e observabilidade",
        plazo: "contínuo",
        body: "Painel de estado, alarmes quando algo passa tempo demais sem confirmação e manutenção das integrações quando as APIs de terceiros mudam.",
      },
    ],
  },

  principios: [
    {
      title: "Idempotência por padrão",
      body: "Toda operação pode ser repetida sem duplicar nada. É o que permite reprocessar sem medo, e sem isso nenhuma integração sobrevive à primeira queda de rede.",
    },
    {
      title: "Estado observável",
      body: "Cada mensagem tem estado consultável: pendente, enviada, confirmada, falhada. Uma integração que só aparece quando falha já tinha falhado antes.",
    },
    {
      title: "Um único dono por dado",
      body: "Para cada campo há um sistema que manda e os outros obedecem. Sincronização bidirecional sem essa regra termina em loops e em dados que mudam sozinhos.",
    },
    {
      title: "IA onde se decide, não onde se calcula",
      body: "Classificar, extrair e redigir são tarefas de modelo. Somar, validar e encaminhar são tarefas de código. Trocar isso de lugar sai caro e fica impossível de auditar.",
    },
  ],

  tech: [
    "Node / TypeScript",
    "Filas com retentativa",
    "Supabase / PostgreSQL",
    "n8n",
    "Webhooks assinados",
    "LangChain",
    "Docker",
    "Vercel",
  ],
};

export const CASOS_PT: Record<CasoKey, CasoIntegracion> = {
  erp: {
    nombre: "Empresas com um ERP próprio ou muito adaptado",
    nombreCorto: "ERP",
    // O H1 pode ser longo; o <title> não, porque leva o sufixo de marca e o
    // Google trunca. Por isso os dois não coincidem.
    metaTitle: "Integração de ERP: conectar com o resto do negócio",
    metaDescription:
      "Conectamos seu ERP — próprio, sob medida ou de mercado — com e-commerce, PDV, CRM e faturamento. Sem migrar de sistema e sem tocar no banco de produção.",
    h1: "Integração de ERP: conectar o ERP com o resto do negócio",
    intro:
      "O ERP costuma ser o sistema com mais verdade da empresa e com menos conexões. Todo mundo consulta, quase ninguém pode escrever nele, e por isso cresce à volta dele uma camada de planilhas que funciona como cola.",
    sintoma:
      "O sinal é sempre o mesmo: alguém exporta um CSV do ERP toda manhã. Às vezes são duas pessoas e dois CSV diferentes. Esse arquivo é uma integração — só que quem executa é um humano, nunca falha de forma visível e ninguém sabe o que acontece no dia em que essa pessoa entra de licença.",
    porQue: {
      title: "Por que trocar de ERP não resolve",
      body: "A proposta habitual do mercado é migrar para um ERP moderno que “já vem integrado”. O problema é que um ERP com anos de uso não é um programa: é a lógica real do negócio, com suas exceções, seus descontos estranhos e seus fluxos que ninguém documentou. Migrar significa redescobrir tudo isso sob pressão e com a operação rodando. Quando o ERP funciona e o que falta é apenas que ele converse com os demais sistemas, construir essa camada de conexão custa uma fração e não coloca em risco o faturamento do mês que vem.",
    },
    patrones: [
      {
        title: "Pedido de entrada rumo ao ERP",
        body: "O pedido nasce fora — loja online, PDV, marketplace, vendedor com o celular — e precisa chegar ao ERP uma única vez, com suas linhas, seus impostos e seu cliente corretamente resolvido.",
        riesgo:
          "Sem uma chave de idempotência baseada na referência externa, uma retentativa cria o pedido duas vezes. É a falha mais comum e a mais cara de desfazer.",
      },
      {
        title: "Estoque do ERP rumo aos canais de venda",
        body: "O dado de existências vive no ERP e é necessário no site, no marketplace e na loja. A pergunta de desenho não é como copiá-lo, é com quanto atraso isso é aceitável e o que fazer com o estoque reservado e não confirmado.",
        riesgo:
          "Publicar o estoque real sem reserva provoca sobrevenda em campanha. Publicar um estoque conservador deixa dinheiro em cima da mesa. É uma decisão de negócio disfarçada de decisão técnica.",
      },
      {
        title: "Faturamento e conciliação de cobrança",
        body: "Do pedido à nota fiscal e do recebimento à conciliação. É aqui que o ERP toca o gateway de pagamento, o extrato bancário e as baixas de título. O desenho tem de dizer qual sistema declara um pagamento como recebido e com que identificador — o do gateway, o da nota ou o do lançamento bancário.",
        riesgo:
          "Sem um identificador estável por transação, o mesmo pagamento entra duas vezes e o cliente aparece com crédito que não existe. A variante silenciosa é pior: a conciliação vai desviando poucos reais por dia, ninguém percebe durante meses e o fechamento só bate depois de um ajuste manual que já virou rotina.",
      },
      {
        title: "Relatórios sem tocar em produção",
        body: "Os relatórios são construídos contra uma réplica de banco ou um armazém analítico, nunca contra a base de dados que atende a operação.",
        riesgo:
          "Uma consulta pesada disparada contra o banco de produção às onze da manhã trava o faturamento. Acontece mais do que se conta.",
      },
    ],
    entregables: [
      "Mapa de fluxos de dados entre o ERP e cada sistema conectado",
      "Conectores com fila, retentativa e idempotência por operação",
      "Contrato de dados por fluxo: que campos, quem manda, o que acontece em conflito",
      "Painel de estado com alarme por antiguidade de pendentes",
      "Documentação da integração e passagem para a equipe interna",
    ],
    puentes: [
      {
        href: "/pt/auditoria-de-sistemas/",
        label: "Radiografia Digital",
        body: "Quando não está claro quantos sistemas existem nem quais conversam entre si, o diagnóstico vem antes do conector.",
      },
      {
        href: "/pt/integracao/sistemas-legados/",
        label: "Sistemas legados",
        body: "Se o ERP não expõe API e só há acesso ao banco de dados, o padrão muda.",
      },
      {
        href: "/pt/integracao/api-e-webhooks/",
        label: "APIs e webhooks",
        body: "A mecânica de como o ERP se conecta: fila, retentativa, idempotência e assinatura. É o que fica por baixo de qualquer conector.",
      },
      {
        href: "/pt/arquitetura-tecnologica/",
        label: "Arquitetura tecnológica",
        body: "Se além do ERP há três sistemas mais discutindo os mesmos dados, a decisão é de arquitetura antes de ser de integração.",
      },
    ],
    faq: [
      {
        q: "É preciso ter API no ERP para integrá-lo?",
        a: "Ajuda muito, mas não é indispensável. Por ordem de preferência: API documentada, eventos ou webhooks, acesso somente leitura ao banco de dados e arquivos de intercâmbio. Cada degrau acrescenta trabalho e fragilidade, e o último exige combinar uma janela de processamento. Indispensável mesmo é existir alguma via de escrita controlada: se o ERP é uma caixa fechada sem ponto de entrada, a integração vira um projeto com o fornecedor, não conosco.",
      },
      {
        q: "Vocês vão mexer no banco de dados do ERP?",
        a: "Somente leitura, e de preferência sobre uma réplica. Escrever direto nas tabelas de um ERP pula suas validações internas e produz dados que a própria aplicação não sabe interpretar. Quando não há API de escrita, a conversa correta é com o fornecedor do ERP, e não um INSERT na mão.",
      },
      {
        q: "Quanto tempo leva uma integração de ERP?",
        a: "Entre três e oito semanas contando o diagnóstico, conforme quantos fluxos entram no escopo e o quanto o ERP é acessível. O que alonga os projetos quase nunca é o conector: são as exceções de negócio que aparecem ao olhar os dados reais — o cliente que fatura para outra razão social, o desconto aplicado na mão, o pedido que se divide em duas notas de entrega.",
      },
      {
        q: "E se no ano que vem trocarmos de ERP?",
        a: "Então convém desenhar a integração com essa hipótese em cima da mesa. Uma camada de conectores com contratos de dados explícitos sobrevive muito melhor a uma troca de ERP do que um monte de automações acopladas aos nomes das tabelas atuais. Não sai de graça, mas é a diferença entre refazer uma peça e refazer tudo.",
      },
    ],
  },

  crm: {
    nombre: "Equipes comerciais com CRM",
    nombreCorto: "CRM",
    // O título não fala em "CRM para empresas": essa busca é servida por
    // comparativos de produto e pertence a quem vai comprar um CRM, não a quem
    // quer integrar o que já tem. Ver src/data/keywords-primarias.ts.
    metaTitle: "Integrar CRM com ERP: integração e automação",
    metaDescription:
      "Leads que entram sozinhos e sem duplicados, atividade registrada sem digitar e sincronização com o ERP sem loops. Automatizamos o CRM que já está em uso.",
    h1: "Integração e automação de CRM: integrar o CRM com o ERP",
    intro:
      "Um CRM não falha por falta de funcionalidades. Falha porque mantê-lo em dia é trabalho manual, e trabalho manual só é feito quando alguém está olhando. Integrar é tirar do meio a pessoa que digita.",
    sintoma:
      "O CRM está impecável na véspera da reunião de vendas. Nos dois meses anteriores, não. Quando a qualidade do dado depende do calendário de reuniões, o que existe ali não é um CRM: é um relatório preenchido depois do fato.",
    porQue: {
      title: "Por que trocar de CRM também não resolve",
      body: "A migração de CRM é vendida como a solução do problema de adoção, e às vezes é — durante três meses. Depois volta o mesmo padrão, porque a causa não estava na ferramenta: estava no fato de que inserir a informação continuava sendo trabalho de quem menos ganha inserindo. Um vendedor não deixa de atualizar o CRM por rebeldia; deixa porque há trinta segundos de atrito entre ele e a próxima ligação. O que muda o comportamento é o registro acontecer sozinho.",
    },
    patrones: [
      {
        title: "Captura de leads multicanal com deduplicação",
        body: "Formulário do site, WhatsApp, telefone, campanha paga, feira. O mesmo lead entra por dois ou três lugares com dados ligeiramente diferentes e precisa acabar em uma única ficha.",
        riesgo:
          "Sem uma regra de identidade explícita — que campo manda, que tolerância há no nome, o que fazer com duas pessoas da mesma empresa —, o CRM enche de duplicados e a equipe deixa de confiar nele.",
      },
      {
        title: "Qualificação e roteamento com modelo",
        body: "Classificar um lead por setor, intenção e urgência a partir de texto livre é exatamente o que um modelo faz bem e o que uma árvore de regras faz mal. Já a decisão de para quem o lead é atribuído é regra de negócio e deve continuar sendo código legível.",
        riesgo:
          "Colocar o modelo para decidir atribuições ou descontos transforma um erro pontual em um erro que ninguém consegue explicar ao cliente.",
      },
      {
        title: "Atividade registrada sem digitar",
        body: "Ligações, mensagens de WhatsApp e e-mails aparecem na ficha com o respectivo resumo, sem ninguém copiar nada. O vendedor corrige, não transcreve.",
        riesgo:
          "Registrar automaticamente sem controle de acesso nem política de retenção coloca conversas de clientes dentro de um sistema que não foi pensado para elas. É uma decisão a revisar antes, não depois.",
      },
      {
        title: "Sincronização CRM ↔ ERP",
        body: "O cliente existe nos dois sistemas e nos dois pode ser editado. A pergunta é quem manda em cada campo: o nome comercial costuma ser do CRM, os dados fiscais e o limite de crédito são do ERP.",
        riesgo:
          "Uma sincronização bidirecional sem dono por campo produz loops: A escreve, B detecta a mudança e reescreve, A detecta de novo. Aparece rápido e dá muito trabalho para limpar.",
      },
    ],
    entregables: [
      "Regra de identidade de contatos e processo de deduplicação",
      "Captura automatizada a partir de todos os canais ativos",
      "Classificação e roteamento com critérios auditáveis",
      "Sincronização com o ERP, com dono declarado por campo",
      "Painel de qualidade do dado: duplicados, fichas incompletas, leads sem contato",
    ],
    puentes: [
      {
        href: "/pt/integracao/whatsapp-business-api/",
        label: "WhatsApp Business API",
        body: "Se boa parte da conversa comercial passa pelo WhatsApp, o canal faz parte do CRM.",
      },
      {
        href: "/pt/servicios/automatizacion-ia/",
        label: "Automação com IA",
        body: "A classificação e o resumo de conversas são o trabalho do modelo dentro deste fluxo.",
      },
      {
        href: "/pt/integracao/erp/",
        label: "Integração de ERP",
        body: "O outro extremo da ficha de cliente, e quem manda nos dados fiscais.",
      },
      {
        href: "/pt/blog/n8n-vs-zapier-vs-make-empresas/",
        label: "Com que ferramenta automatizar",
        body: "Não fala de adoção de CRM: compara as plataformas onde estes fluxos de captura e registro costumam ser construídos, e onde cada uma para de servir.",
      },
    ],
    faq: [
      {
        q: "Funciona com qualquer CRM?",
        a: "Com qualquer um que exponha API ou webhooks, o que hoje é praticamente todo o mercado. A diferença real não está na marca, e sim em duas coisas: se permite criar campos personalizados para guardar o rastro da integração, e se os limites de chamadas por minuto aguentam o volume. Ambas são verificadas no diagnóstico, antes de comprometer qualquer escopo.",
      },
      {
        q: "A IA decide para qual vendedor vai cada lead?",
        a: "Não, e isso é deliberado. O modelo classifica — setor, intenção, urgência — porque isso exige entender texto livre. A atribuição é resolvida com regras explícitas sobre essa classificação, porque tem consequências sobre pessoas e comissões, e precisa poder ser explicada e auditada. É a separação que aplicamos em todos os fluxos: o modelo interpreta, o código decide.",
      },
      {
        q: "E os duplicados que já temos?",
        a: "São tratados à parte, e normalmente antes de conectar qualquer coisa. Um CRM que já arrasta duplicados e passa a receber captura automática multiplica o problema. A limpeza inicial é um trabalho delimitado: define-se a regra de identidade, agrupam-se os candidatos, e as fusões ambíguas são revisadas à mão uma única vez.",
      },
      {
        q: "Isso substitui a equipe comercial?",
        a: "Substitui a parte do dia que consiste em copiar informação de um lugar para outro. Nos projetos que fizemos, o efeito mensurável não é reduzir quadro: é o acompanhamento deixar de depender da memória de cada pessoa e os leads não esfriarem enquanto alguém se lembra de ligar.",
      },
    ],
  },

  "whatsapp-business-api": {
    nombre: "Empresas que atendem e vendem por WhatsApp",
    nombreCorto: "WhatsApp Business API",
    metaTitle: "API do WhatsApp Business: integração e automação",
    metaDescription:
      "Integramos a API do WhatsApp Business com o CRM e o ERP: templates, janela de 24 horas, agentes com estado e rastreabilidade. Não é o app WhatsApp Business.",
    h1: "API do WhatsApp Business: integração e automação",
    intro:
      "O WhatsApp é o canal onde os clientes já estão e, quase sempre, o pior documentado da empresa. A API muda isso: transforma uma conversa que vivia no celular de alguém em um fluxo com estado, histórico e regras.",
    sintoma:
      "O número da empresa está instalado no telefone de uma pessoa. Se essa pessoa folga, ninguém responde; se sai, o histórico sai junto. E não há como responder com um número à pergunta “quanto tempo levamos para responder?”.",
    porQue: {
      title: "A API não é o app, e a diferença importa",
      body: "Existem três produtos com nomes parecidos: o WhatsApp comum, o app WhatsApp Business e a WhatsApp Business Platform — a API. Só o terceiro permite vários atendentes sobre o mesmo número, integração com outros sistemas, envios em massa aprovados e rastreabilidade. É também o único com custo por mensagem e com processo de verificação do negócio. Começar pelo app e migrar depois é possível, mas implica refazer o cadastro e perder parte do histórico: se o plano é integrar, convém entrar direto pela API.",
    },
    patrones: [
      {
        title: "Templates e janela de atendimento",
        body: "A Meta cobra por mensagem enviada, e apenas nas categorias de template: marketing, utility e authentication. Quando o cliente escreve primeiro, abre-se uma janela de atendimento de 24 horas na qual é possível responder com mensagens livres sem custo. Desenhar o fluxo em torno dessa janela é a diferença entre uma fatura razoável e uma desagradável.",
        riesgo:
          "Resolver com template de marketing o que cabia dentro da janela de atendimento multiplica o custo sem melhorar nada. E os templates exigem aprovação prévia, então não se improvisam numa sexta-feira.",
      },
      {
        title: "Agente com estado, não árvore de botões",
        body: "O menu numerado envelhece mal: assim que o cliente escreve algo que não está na lista, o fluxo quebra. Um agente com modelo mantém o contexto da conversa, entende a reformulação e sabe quando não sabe.",
        riesgo:
          "Um agente sem estado persistente perde o fio entre mensagens e repete perguntas. Um agente sem saída para humano frustra exatamente nos casos que mais importam.",
      },
      {
        title: "Escalonamento para pessoa, com contexto",
        body: "Quando a conversa passa para um humano, tem de chegar com o resumo e o histórico, e não com um “olá, em que posso ajudar?” que obriga o cliente a repetir tudo.",
        riesgo:
          "É o ponto onde se perde a confiança conquistada. Um hand-off malfeito faz o cliente preferir o telefone da próxima vez.",
      },
      {
        title: "Conexão com o sistema que tem a resposta",
        body: "Consultar um pedido, marcar um horário ou verificar disponibilidade exige chegar ao ERP, ao CRM ou ao motor de reservas em tempo real. Sem isso, o agente só consegue falar de generalidades.",
        riesgo:
          "Um agente que responde com informação desatualizada porque consulta uma cópia noturna gera mais chamados do que resolve.",
      },
    ],
    entregables: [
      "Cadastro e verificação do número na plataforma, com o provedor adequado",
      "Catálogo de templates aprovados por categoria e caso de uso",
      "Agente conversacional com estado persistente e saída para humano",
      "Conexão em tempo real com o sistema que tem o dado",
      "Métricas de canal: tempo de primeira resposta, resolução e custo por conversa",
    ],
    puentes: [
      {
        href: "/pt/servicios/chatbots/",
        label: "Chatbots para empresas",
        body: "O mesmo agente, visto do lado do serviço em vez do lado do canal.",
      },
      {
        href: "/pt/integracao/crm/",
        label: "Integração de CRM",
        body: "Para que a conversa termine na ficha do cliente e não num celular.",
      },
      {
        href: "/pt/portfolio/chatplug-whatsapp-altegio/",
        label: "ChatPlug: WhatsApp ligado à agenda",
        body: "Um caso real com a API em produção: não traz tabela de preços, mas mostra o que a integração com o sistema de agendamento resolve de fato.",
      },
      {
        href: "/pt/portfolio/chatbot-reservas-turisticas-whatsapp/",
        label: "Chatbot de reservas turísticas",
        body: "O padrão de agente com estado e escalonamento para pessoa, aplicado a um fluxo de reservas com disponibilidade em tempo real.",
      },
    ],
    faq: [
      {
        q: "Quanto custa a API do WhatsApp Business?",
        a: "Há dois custos separados. O da Meta é cobrado por mensagem enviada nas categorias de template — marketing, utility e authentication —, com tarifas que dependem do país de destino; as mensagens recebidas e as enviadas dentro de uma janela de atendimento aberta não são cobradas, assim como as enviadas dentro da janela de free entry point de 72 horas. O segundo custo é o do provedor pelo qual se acessa a plataforma, e varia bastante conforme o modelo comercial. As tarifas concretas mudam com frequência, então são verificadas no momento de dimensionar o projeto, em vez de citadas de memória.",
      },
      {
        q: "Dá para continuar usando o número atual?",
        a: "Em geral sim, mas esse número deixa de funcionar no app do WhatsApp: passa para a plataforma e é operado a partir do sistema que integrarmos. Não é possível usar os dois ao mesmo tempo. Se o número é o celular pessoal de alguém, convém planejar a troca antes de começar, e não durante.",
      },
      {
        q: "Posso enviar campanhas em massa?",
        a: "Com templates previamente aprovados na categoria correspondente e com consentimento do destinatário. Enviar sem opt-in não é apenas um problema de proteção de dados: é o caminho rápido para os usuários marcarem o número como spam e a plataforma degradar a qualidade da conta, o que reduz o volume que se pode enviar.",
      },
      {
        q: "O agente resolve sem intervenção humana?",
        a: "Uma parte, e convém medir qual em vez de prometê-la. Consultas de status, disponibilidade e dados concretos são resolvidas bem de ponta a ponta quando o agente tem acesso ao sistema que guarda a resposta. Negociações, reclamações e tudo o que tenha carga emocional são desenhados para escalar cedo. A métrica que acompanhamos não é “percentual automatizado”, é quantas conversas terminam resolvidas sem que o cliente precise repetir o que já disse.",
      },
    ],
  },

  "api-y-webhooks": {
    nombre: "Equipes técnicas que conectam aplicações",
    nombreCorto: "APIs e webhooks",
    metaTitle: "Integração de API e webhooks sob medida",
    metaDescription:
      "Conectamos aplicações por API e webhooks com idempotência, retentativas, assinatura e estado observável. O que não tem API se resolve por outra via.",
    h1: "Integração de API e webhooks sob medida",
    intro:
      "Quase qualquer pessoa monta hoje uma integração que funciona no primeiro dia. Difícil é continuar funcionando no dia em que o outro extremo demora dez segundos para responder, devolve erro no meio de um lote ou reenvia o mesmo evento três vezes.",
    sintoma:
      "A integração “vai bem”, mas a cada duas semanas alguém pergunta por um pedido que não chegou. Ninguém sabe responder sem abrir o banco de dados, porque não existe um lugar onde olhar o que aconteceu com aquela mensagem específica.",
    porQue: {
      title: "Por que uma ferramenta no-code nem sempre basta",
      body: "As plataformas de automação visual resolvem muito bem 80 % dos casos, e são usadas aqui todo dia. Deixam de bastar em três situações concretas: quando o volume faz o preço por execução perder o sentido, quando é preciso uma transação de verdade entre dois passos, e quando a lógica de erro é mais complexa que a lógica de negócio. Este último caso é mais frequente do que parece — o que demora a construir não é o caminho feliz, é todo o resto. A decisão correta raramente é “tudo sob medida”: costuma ser deixar na ferramenta o que lhe cabe e tirar para código as duas ou três peças que a extrapolam.",
    },
    patrones: [
      {
        title: "Entrega ao menos uma vez, processamento exatamente uma vez",
        body: "Praticamente nenhum emissor de webhooks garante entrega única. O que se constrói no receptor é a capacidade de reconhecer o evento repetido e descartá-lo, gravando a chave do evento junto com a operação na mesma transação.",
        riesgo:
          "Sem isso, uma retentativa do emissor gera uma cobrança duplicada, um pedido duplicado ou um e-mail enviado duas vezes. E o emissor retenta mais vezes do que se espera.",
      },
      {
        title: "Receber rápido, processar depois",
        body: "O endpoint que recebe o webhook valida a assinatura, persiste o evento e responde. O trabalho real acontece numa fila à parte, com retentativas de espaçamento crescente e uma fila de falhados onde termina o que não pode ser processado.",
        riesgo:
          "Processar dentro da requisição faz com que um terceiro lento provoque timeouts, e muitos emissores desativam um webhook que falha de forma repetida. Perde-se a integração por uma lentidão pontual.",
      },
      {
        title: "Assinatura, não confiança",
        body: "Toda entrada verifica sua assinatura com comparação em tempo constante e rejeita marcas de tempo antigas. Toda saída se autentica com credenciais rotacionáveis e de escopo mínimo.",
        riesgo:
          "Um endpoint público sem verificação é um formulário de escrita aberto à internet contra o seu sistema de gestão.",
      },
      {
        title: "Ordem e limites de chamada",
        body: "Os eventos não chegam necessariamente em ordem e o outro extremo tem um limite de chamadas por minuto. As duas coisas se resolvem no desenho: número de versão por entidade para descartar o que é velho, e controle de ritmo com espera respeitando o cabeçalho de retentativa.",
        riesgo:
          "Ignorar a ordem faz um estado antigo sobrescrever o novo. Ignorar o limite provoca bloqueios que se manifestam justamente nos picos de volume.",
      },
    ],
    entregables: [
      "Endpoints de entrada com verificação de assinatura e registro de eventos",
      "Fila com retentativa exponencial e fila de falhados revisável",
      "Chave de idempotência por operação, persistida junto ao efeito",
      "Painel de estado por mensagem: recebida, processada, falhada, em retentativa",
      "Alarme por antiguidade de pendentes e por crescimento da fila de falhados",
    ],
    puentes: [
      {
        href: "/pt/integracao/sistemas-legados/",
        label: "Sistemas legados",
        body: "Quando o outro extremo não tem API, o padrão deixa de ser este e passa a ser outro.",
      },
      {
        href: "/pt/integracao/erp/",
        label: "Integração de ERP",
        body: "O destino mais habitual destes conectores.",
      },
      {
        href: "/pt/blog/n8n-vs-zapier-vs-make-empresas/",
        label: "n8n, Zapier ou Make",
        body: "A comparação entre as plataformas visuais e o ponto em que cada uma para de servir. É a decisão anterior a escrever qualquer conector.",
      },
      {
        href: "/pt/implementacion/",
        label: "Implementação",
        body: "Como estes conectores chegam a produção: ambientes, implantação em fases e quem fica responsável pela manutenção depois.",
      },
    ],
    faq: [
      {
        q: "Qual a diferença entre integrar por API e por webhook?",
        a: "A direção da iniciativa. Com API você pergunta quando quiser: é previsível e o ritmo é seu, mas você chega tarde e gasta chamadas perguntando por coisas que não mudaram. Com webhook o outro sistema avisa quando algo acontece: é imediato e eficiente, mas obriga a estar sempre disponível e a tolerar repetições. A maioria das integrações sérias usa as duas: webhook para saber e API para confirmar o detalhe.",
      },
      {
        q: "O que acontece se o outro sistema cair?",
        a: "As mensagens se acumulam na fila e são retentadas com espaçamento crescente até o serviço voltar. O que nunca se deve fazer é deixar que a queda de um terceiro pare a sua operação: o fluxo próprio continua e a sincronização se põe em dia depois. É exatamente para isso que a fila existe.",
      },
      {
        q: "Vocês usam n8n ou constroem tudo sob medida?",
        a: "As duas coisas, e a escolha é argumentada caso a caso. O n8n cobre muito bem a orquestração e os fluxos que mudam com frequência, com a vantagem de a sua equipe poder editá-los sem depender de nós. O que vai para código são as peças com requisitos duros: alto volume, transações, lógica de erro complexa ou algo que precise ser auditável. Misturar os dois mundos costuma sair mais barato do que escolher um por dogma.",
      },
      {
        q: "Quem mantém a integração quando a API de um terceiro muda?",
        a: "Faz parte do contrato de manutenção, e convém que seja explícito. As APIs de terceiros mudam sem avisar ninguém em particular: aposentam versões, endurecem limites, alteram campos. Uma integração sem ninguém vigiando essas mudanças funciona até o dia em que deixa de funcionar, e normalmente se descobre por uma reclamação de cliente.",
      },
    ],
  },

  "sistemas-legados": {
    nombre: "Empresas com software antigo em produção",
    nombreCorto: "Sistemas legados",
    metaTitle: "Modernizar sistema legado sem substituí-lo",
    metaDescription:
      "Modernizamos em torno do sistema que funciona: camada de tradução, captura de mudanças e substituição por partes. Sem reescritas que duram dois anos.",
    h1: "Modernizar sistema legado sem substituí-lo",
    intro:
      "“Legado” não significa ruim. Significa que funciona, que acumulou durante anos regras que ninguém voltou a escrever em lugar nenhum, e que substituí-lo inteiro é um projeto com mais risco do que a empresa consegue absorver de uma vez.",
    sintoma:
      "Existe uma pessoa que sabe como aquilo funciona. Às vezes já nem trabalha mais aqui e é chamada quando algo quebra. O sistema não tem ambiente de testes, a documentação é um manual de oito anos atrás, e cada mudança é testada direto em produção às sete da manhã.",
    porQue: {
      title: "Por que a reescrita completa quase sempre dá errado",
      body: "A proposta de refazer tudo é atraente porque promete acabar com o problema. Na prática exige manter dois sistemas em paralelo durante meses, redescobrir regras de negócio que só existem dentro do código velho e aguentar a pressão de um projeto longo sem entregas visíveis. A alternativa que funciona é chata: envolve-se o sistema antigo, coloca-se à frente dele uma camada que traduz, e vão-se retirando funções uma a uma. Cada passo entrega valor e é reversível. O sistema velho se apaga quando já não faz nada, não numa data marcada num plano.",
    },
    patrones: [
      {
        title: "Camada de tradução à frente",
        body: "Constrói-se uma interface moderna que funciona como fachada. Os sistemas novos falam com ela e nunca com o legado, de modo que as esquisitices dele — códigos numéricos, campos com duplo significado, datas em formatos próprios — ficam encapsuladas num único lugar.",
        riesgo:
          "Sem essa camada, cada nova integração aprende as esquisitices do legado e as herda. Na terceira, já não dá para substituí-lo sem mexer em tudo.",
      },
      {
        title: "Captura de mudanças em vez de consultas periódicas",
        body: "Quando o legado não emite eventos, as mudanças são detectadas no banco de dados dele — por marca de tempo, por tabela de auditoria ou lendo o log de transações — e publicadas para fora como eventos.",
        riesgo:
          "Consultar a cada minuto um banco de produção castiga os usuários e descobre as mudanças tarde. E só com marca de tempo perdem-se as exclusões, que é justamente o que ninguém testa.",
      },
      {
        title: "Substituição por partes",
        body: "As funções saem do legado uma a uma, começando pelas que têm menos dependências e mais dor. A fachada decide a cada momento se uma requisição vai para o sistema novo ou para o velho.",
        riesgo:
          "Começar pelo módulo central porque “é o importante” é a forma mais rápida de o projeto parar na metade. Começa-se pelas bordas.",
      },
      {
        title: "Quando não há nenhuma via de dados",
        body: "Restam sistemas que só se deixam usar por tela. Aí cabem arquivos de intercâmbio numa pasta combinada, ou automação de interface como último recurso.",
        riesgo:
          "A automação de tela quebra com qualquer mudança visual e não dá garantia de transação. É uma solução-ponte com prazo de validade, e tem de ser tratada assim desde o primeiro dia.",
      },
    ],
    entregables: [
      "Documentação das regras de negócio recuperadas do sistema antigo",
      "Camada de tradução com contrato de dados estável",
      "Publicação de mudanças para o resto do ecossistema",
      "Plano de substituição por fases, com ordem justificada e pontos de retorno",
      "Redução medida da dependência de pessoas específicas",
    ],
    puentes: [
      {
        href: "/pt/auditoria-de-sistemas/",
        label: "Radiografia Digital",
        body: "O passo prévio obrigatório: sem saber o que o legado faz, qualquer plano de substituição é uma aposta.",
      },
      {
        href: "/pt/integracao/api-e-webhooks/",
        label: "APIs e webhooks",
        body: "O que se constrói à frente do legado, uma vez que a camada de tradução existe.",
      },
      {
        href: "/pt/roadmap-tecnologico/",
        label: "Roadmap tecnológico",
        body: "Para ordenar o que sai primeiro do sistema antigo e com que critério.",
      },
      {
        href: "/pt/portfolio/radiografia-rede-hoteleira-menorca/",
        label: "Radiografia de uma rede hoteleira",
        body: "Um caso real de mapeamento de sistemas antigos e desconectados: mostra como se levanta o que existe, não como se reescreve.",
      },
    ],
    faq: [
      {
        q: "Quando convém integrar e quando convém substituir?",
        a: "Integrar quando o sistema cumpre sua função e o problema é estar isolado, quando ele contém regras de negócio que ninguém documentou, ou quando a operação não pode se dar ao luxo de uma parada. Substituir quando o fornecedor desapareceu e não há quem mantenha, quando a tecnologia impede cumprir uma obrigação que não dá para resolver por fora, ou quando o custo de manter já supera o de refazer. A maioria dos casos reais é o primeiro, embora a conversa comece sempre pelo segundo.",
      },
      {
        q: "Dá para integrar um sistema sem API nem documentação?",
        a: "Quase sempre sim, ainda que com mais trabalho e por caminhos menos elegantes: acesso de leitura ao banco de dados, detecção de mudanças, arquivos de intercâmbio ou — quando não sobra alternativa — automação de tela. O que decide a viabilidade não é a idade do sistema, é se existe alguma forma controlada de ler e de escrever. Isso é verificado no diagnóstico, e é a primeira pergunta que fazemos.",
      },
      {
        q: "Quanto tempo leva?",
        a: "A camada de tradução e a primeira integração costumam estar em produção em quatro a oito semanas. A substituição completa, se a decisão for fazê-la, mede-se em trimestres e por desenho não tem uma data única de corte: cada função que sai é uma entrega em si mesma. Essa é justamente a vantagem frente à reescrita, não um efeito colateral.",
      },
      {
        q: "E se a pessoa que conhece o sistema já não estiver?",
        a: "Então a primeira fase deixa de ser técnica e passa a ser arqueológica: as regras são reconstruídas a partir dos dados e do comportamento observado, não do código. É mais lento e convém dizer isso de antemão. É também a razão pela qual documentar o que se descobre é um entregável do projeto e não uma cortesia.",
      },
    ],
  },
};
