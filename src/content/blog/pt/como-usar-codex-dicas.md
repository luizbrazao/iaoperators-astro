---
title: "Como usar o Codex: 15 dicas para resultados reais"
description: "Aprenda como usar o Codex da OpenAI com 15 dicas práticas para programar, automatizar tarefas, trabalhar com arquivos e executar com segurança e controle."
category: tools
articleSection: "Ferramentas de IA"
date: 2026-08-05T19:18:00+02:00
image: https://scribos.s3.us-east-1.amazonaws.com/workspaces/2/articles/7/cover/1785958349-938e0c31c666.png
cover: https://scribos.s3.us-east-1.amazonaws.com/workspaces/2/articles/7/cover/1785958349-938e0c31c666.png
imageSchema:
  - https://scribos.s3.us-east-1.amazonaws.com/workspaces/2/articles/7/cover/1785958349-938e0c31c666.png
imageAlt: "Desenvolvedor revisando as mudanças propostas pelo Codex antes de aprovar"
optimizeImage: true
ogImage: /og/pt/como-usar-codex-dicas.png
ogImageWidth: 1200
ogImageHeight: 630
about:
  - type: SoftwareApplication
    name: Codex
  - type: Organization
    name: OpenAI
  - type: Thing
    name: Agentes de programação
tags:
  - como usar o Codex
  - Codex da OpenAI
  - dicas para usar o Codex
  - como funciona o Codex
  - automatizar tarefas com Codex
  - agentes de programação
  - Codex Computer Use
  - Skills do Codex
  - Goal mode do Codex
  - vibe coding
locale: pt
related:
  - 9-herramientas-inteligencia-artificial-desarrollo
  - aprender-a-programar-en-la-era-de-la-ia
  - fin-desarrollo-software-ia
translationKey: como-usar-codex
author: "Luiz Fernando Brazão"
authorTitle: "Fundador da IA Operators"
authorUrl: "https://iaoperators.com/pt/autores/luiz-fernando-brazao/"
authorSameAs:
  - "https://www.linkedin.com/in/ferbrazao/"
authorBio: "Luiz Fernando Brazão é fundador da IA Operators e trabalha com arquitetura de agentes, automação empresarial, integração de sistemas e implementação de inteligência artificial em produção."
faqSchema: true
draft: false
ctaTitle: "Quer implementar agentes de IA sem perder controle sobre dados, permissões e resultados?"
ctaText: "Analisamos seus processos, sistemas e riscos, desenhamos o fluxo e construímos a automação dentro do seu ambiente atual."
ctaPrimaryLabel: "Solicitar uma auditoria de automação"
ctaPrimaryHref: "/pt/auditoria-de-sistemas/"
faq:
  - q: "O que é o Codex da OpenAI?"
    a: "Codex é o agente da OpenAI especializado em programação e trabalho técnico. Ele escreve e depura código, executa comandos e testes, revisa modificações, trabalha com repositórios e usa ferramentas adicionais conforme o ambiente e as permissões disponíveis."
  - q: "Qual é a diferença entre Codex e ChatGPT Work?"
    a: "O Codex é voltado principalmente para desenvolvimento de software, terminal, repositórios e tarefas técnicas. O ChatGPT Work foi feito para pesquisas, análises e criação de entregáveis como documentos, planilhas, apresentações, relatórios e Sites."
  - q: "Qual modelo eu devo usar no Codex?"
    a: "Sol é a melhor escolha para problemas complexos ou ambíguos. Terra funciona bem no trabalho do dia a dia que exige raciocínio e uso de ferramentas. Luna serve para tarefas claras, repetíveis e de alto volume. Quando você não souber qual escolher, a OpenAI recomenda começar pelo Sol."
  - q: "O Codex pode controlar meu computador?"
    a: "Em ambientes compatíveis e com as permissões correspondentes, o Codex pode usar Computer Use para observar e operar aplicativos. Limite o acesso, exija confirmação para ações sensíveis e evite conceder permissões desnecessárias."
  - q: "O que é o Goal mode no Codex?"
    a: "O Goal mode permite definir um objetivo duradouro e critérios de sucesso para trabalhos que precisam de várias iterações. Funciona melhor quando a meta pode ser medida por testes, métricas, estados ou entregáveis verificáveis."
  - q: "Como evitar que o Codex apague arquivos ou faça ações erradas?"
    a: "Limite o acesso a pastas específicas, peça uma prévia antes de ações destrutivas, use backups ou controle de versão e exija confirmação explícita antes de apagar, publicar, fazer deploy ou sobrescrever informação."
  - q: "O Codex consegue trabalhar enquanto eu não estou no computador?"
    a: "O Codex pode executar automações e determinados trabalhos de longa duração. O funcionamento exato depende de a tarefa ser local, remota ou cloud. No acesso remoto a uma sessão local, o computador host precisa ficar ligado, conectado e com o Codex rodando."
  - q: "O Codex serve só para programadores?"
    a: "O Codex continua especializado em software e trabalho técnico, mas pode usar código, Skills, plugins e Computer Use para completar tarefas em outras áreas. Para entregáveis gerais sem componente técnico relevante, o ChatGPT Work costuma ser a alternativa mais direta."
---

Acontece com você de pedir algo para uma inteligência artificial, receber uma resposta aparentemente correta e o trabalho real continuar sem ser feito?

O Codex muda essa dinâmica. Em vez de apenas sugerir código ou explicar o que você deveria fazer, ele trabalha sobre um projeto, altera arquivos, executa comandos, confere resultados e entrega mudanças que você pode revisar.

Só que aprender **como usar o Codex** não é escrever prompts mais longos. A diferença entre uma demo impressionante e um resultado útil está em como você define a tarefa, que contexto fornece, que permissões concede e como confere o resultado.

Neste guia você encontra 15 dicas práticas para sair do *vibe coding* — pedir mudanças no feeling e torcer para funcionar — e chegar a uma forma de trabalho mais controlada, verificável e segura.

> **Nota de atualização — agosto de 2026:** os recursos disponíveis podem variar conforme o plano, o sistema operacional, a região, as permissões do workspace e a versão do aplicativo.

## Nesta guia

- [O que é o Codex e para que serve](#o-que-é-o-codex-e-para-que-serve)
- [Antes de começar: escolha onde usar o Codex](#antes-de-começar-escolha-onde-usar-o-codex)
- [Como começar com o Codex em 5 minutos](#como-começar-com-o-codex-em-5-minutos)
- [As 15 dicas](#como-usar-o-codex-para-executar-trabalho-real)
- [Exemplo prático](#exemplo-prático)
- [Segurança](#segurança-as-regras-que-deveriam-acompanhar-todos-os-seus-prompts)
- [Erros frequentes](#erros-comuns-ao-usar-o-codex)
- [Template de prompt](#template-de-prompt-para-usar-o-codex)
- [Checklist](#checklist-para-começar-hoje)
- [Perguntas frequentes](#preguntas-frecuentes)
- [Fontes oficiais](#fontes-oficiais)

## O que é o Codex e para que serve

Codex é o agente da OpenAI especializado em desenvolvimento de software e trabalho técnico. Ele escreve e depura código, executa testes e comandos, revisa mudanças, trabalha com repositórios e opera sobre pastas locais quando você dá permissão.

Hoje a OpenAI [separa três experiências principais](https://help.openai.com/en/articles/20001275-chatgpt-work-and-codex):

- **Chat:** para perguntas, buscas, ideias e apoio conversacional.
- **Work:** para pesquisas, análises e criação de entregáveis como documentos, planilhas, apresentações, relatórios ou Sites.
- **Codex:** para programação, terminal, repositórios, testes, mudanças técnicas e automações ligadas a projetos.

O Codex nasceu como agente de programação, mas as capacidades cresceram. No aplicativo de desktop ele pode usar Skills, plugins, navegador, Computer Use, voz e outras ferramentas para operar aplicativos e fechar fluxos que vão além de escrever código. Ainda assim, para produzir um relatório, uma apresentação ou uma planilha sem componente técnico relevante, o ChatGPT Work costuma ser a experiência mais natural.

Se você está comparando com outras [ferramentas de IA para desenvolvimento](/pt/blog/9-herramientas-inteligencia-artificial-desarrollo/), a diferença do Codex é essa: ele recebe um objetivo, decide os passos e age sobre as suas ferramentas, em vez de devolver texto para você executar depois.

## Antes de começar: escolha onde usar o Codex

O Codex pode ser usado a partir de superfícies diferentes:

- [Aplicativo de desktop do ChatGPT para macOS ou Windows](https://openai.com/index/introducing-the-codex-app/).
- Extensão para ambientes de desenvolvimento.
- Codex CLI, pelo terminal.
- Ambientes cloud compatíveis.
- Acesso remoto a determinadas sessões pelo aplicativo de celular.

A melhor opção depende do trabalho. Use o **aplicativo de desktop** quando precisar combinar código, arquivos locais, terminal, navegador e aplicativos. Use a **extensão do IDE** quando quiser revisar mudanças dentro do seu editor. Escolha a **CLI** se preferir trabalhar pelo terminal ou integrar o Codex a um fluxo técnico que já existe.

## Como começar com o Codex em 5 minutos

Se você ainda não usou o Codex, este é o caminho mais curto para ter um primeiro resultado revisável:

1. **Abra o Codex no ambiente que você tiver disponível:** aplicativo de desktop, extensão do IDE, CLI ou cloud.
2. **Selecione uma pasta ou conecte o repositório** em que você vai trabalhar, e só ele.
3. **Explique o contexto do projeto e a fonte de verdade:** o que ele faz, qual arquivo manda quando há contradição e qual documentação está vigente.
4. **Envie uma primeira tarefa pequena e verificável**, com uma condição de sucesso que você consiga conferir.
5. **Revise o plano, o diff e os testes antes de aprovar** qualquer mudança.

Um primeiro prompt que funciona bem:

> Estamos trabalhando em uma aplicação React e Node.js. Corrija o erro que permite criar duas reservas quando o usuário clica duas vezes. Não mude o design nem o esquema do banco de dados. Primeiro analise a causa e apresente um plano. Não modifique nada até eu aprovar o plano.

Escolha uma primeira tarefa pequena, reversível e objetivamente verificável: assim você confere o resultado em minutos e, se der errado, desfaz sem consequências.

Com essa distinção clara, vamos às 15 dicas.

## Como usar o Codex para executar trabalho real

### 1. Decida primeiro se a tarefa é do Codex ou do Work

Um dos erros mais comuns é usar o Codex para qualquer tarefa que envolva inteligência artificial.

O Codex é forte quando o resultado exige uma ação técnica:

- alterar um repositório;
- criar ou corrigir uma funcionalidade;
- rodar testes;
- analisar logs;
- migrar código;
- configurar uma integração;
- trabalhar com arquivos e ferramentas de desenvolvimento;
- automatizar um processo via scripts.

Já se você quer pesquisar câmeras e receber uma planilha comparativa, montar uma apresentação comercial ou transformar vários documentos em um relatório, o começo provavelmente é o ChatGPT Work.

Regra prática:

- Se o resultado principal é **código, configuração técnica ou ação sobre um sistema**, use o Codex.
- Se o resultado principal é **um documento, análise, planilha, apresentação ou relatório**, comece no Work.
- Se você só precisa **entender algo ou explorar uma ideia**, use o Chat.

Escolher bem a superfície reduz consumo, erro e troca de contexto.

### 2. Defina um entregável, não uma intenção vaga

Uma instrução assim deixa espaço demais para interpretação:

> Melhore este aplicativo.

O Codex não sabe se "melhorar" é deixar mais rápido, mudar o design, eliminar bugs ou reescrever a arquitetura.

Uma instrução executável precisa de quatro elementos:

1. **Contexto:** que projeto é e em que estado ele está.
2. **Objetivo:** que resultado você quer.
3. **Restrições:** o que não pode mudar.
4. **Definição de sucesso:** como o resultado será conferido.

Por exemplo:

> Este aplicativo React permite agendar consultas. Corrija o problema que duplica agendamentos quando o usuário dá duplo clique. Não mude o design nem a estrutura do banco de dados. Considere a tarefa concluída quando existir proteção contra envio duplicado e os testes correspondentes passarem.

Agora o Codex tem um problema delimitado e uma condição de vitória. Quanto mais verificável for o resultado, menos você depende de julgar se "parece que funciona".

### 3. Dê o contexto certo e declare a fonte de verdade

O Codex analisa pastas, repositórios, documentação e arquivos ligados a um projeto. Mas ter acesso a mais informação não significa entender automaticamente qual delas é a correta.

Explique para ele:

- qual pasta contém o projeto ativo;
- qual branch deve usar;
- onde estão os requisitos;
- qual arquivo tem as regras de negócio;
- qual documentação está atualizada;
- quais arquivos são históricos ou estão obsoletos;
- quais serviços externos entram no fluxo.

Um bom prompt seria:

> Use `/docs/booking-rules.md` como fonte de verdade para as regras de agendamento. O arquivo `/docs/old-flow.md` é histórico e não deve influenciar a solução. Antes de alterar o código, aponte qualquer contradição que encontrar entre os requisitos e a implementação atual.

Isso evita que o agente tente reconciliar em silêncio documentos incompatíveis.

Em projetos grandes, vale manter um arquivo permanente com arquitetura, convenções, comandos de desenvolvimento, critérios de qualidade, regras de segurança e definição de pronto. Não obrigue o agente a reconstruir o projeto do zero a cada conversa.

### 4. Peça um plano antes de liberar mudanças grandes

Para uma correção pequena, o Codex pode agir direto. Para migrações, refactors, mudanças de infraestrutura ou tarefas que atingem várias partes do sistema, peça um plano antes.

Use uma instrução como:

> Analise o problema e apresente um plano de execução. Inclua arquivos afetados, riscos, dependências, estratégia de rollback e forma de validar o resultado. Não altere nada ainda.

Revise principalmente:

- se a ordem de execução faz sentido;
- se o agente identificou dependências ocultas;
- se existe uma forma objetiva de validar;
- se ele propõe backups ou pontos de restauração;
- se a mudança atinge mais componentes do que o necessário.

Pedir um plano não é colocar burocracia em toda tarefa. É aumentar o nível de supervisão quando o custo de errar é alto.

### 5. Libere navegação só quando ela trouxer informação necessária

Navegar é útil para consultar documentação atualizada, mudanças recentes de uma API, versões de bibliotecas, especificações técnicas, problemas conhecidos ou preços e limites vigentes.

Mas abrir o navegador para tudo adiciona tempo, consumo e risco de usar fontes ruins. Você pode fixar esta regra:

> Use primeiro os arquivos e a documentação que estão no projeto. Navegue apenas se faltar informação que possa ter mudado ou se precisar consultar a documentação oficial. Se navegar, diga o que procurou, por que era necessário e quais fontes usou.

Também dá para limitar as fontes:

> Para esta integração, use apenas a documentação oficial do fornecedor. Não baseie a implementação em tutoriais, fóruns ou respostas antigas sem verificar.

Navegação não substitui raciocinar sobre o contexto que você já forneceu.

### 6. Use Computer Use com permissão mínima

O Codex opera aplicativos via [Computer Use](https://openai.com/index/codex-for-almost-everything/): observa interfaces, clica, digita e trabalha com ferramentas que não têm uma API decente.

Isso ajuda a testar uma interface, executar ações em um sistema interno, conferir um fluxo de cadastro, comparar o comportamento visual antes e depois de uma mudança, mexer em sistemas legados ou automatizar tarefas em ferramentas sem integração.

Só que controlar uma interface também traz risco. Identificar o botão errado, uma janela inesperada ou uma mudança de layout podem gerar ações indesejadas.

Defina limites explícitos:

> Você pode usar o navegador e o aplicativo de testes. Não acesse o gerenciador de senhas, o faturamento nem contas pessoais. Não confirme compras, publicações, envios ou exclusões sem a minha autorização.

Para trabalhar com arquivos:

> Trabalhe apenas dentro da pasta `/projeto-demo`. Não mova, renomeie nem apague arquivos fora dela. Antes de apagar qualquer arquivo, mostre uma prévia e espere confirmação.

A OpenAI descreve Computer Use como a capacidade de operar aplicativos com o próprio cursor. Essa liberdade precisa vir com permissões restritas e supervisão proporcional ao risco.

### 7. Revise as mudanças, rode os testes e exija evidência

Uma resposta convincente não prova que o trabalho está bem feito.

Quando o Codex alterar um projeto, peça resumo das mudanças, lista de arquivos modificados, diff relevante, testes executados, resultado dos testes, erros pendentes, decisões ou premissas assumidas e instruções para reproduzir a validação.

Por exemplo:

> Ao terminar, entregue um resumo de no máximo dez pontos, liste os arquivos modificados, rode os testes relevantes e explique como eu reproduzo o resultado localmente.

Para um problema de performance:

> Reduza o LCP mobile de 4,0 segundos para no máximo 2,5 segundos. Meça antes e depois nas mesmas condições e anexe os resultados do Lighthouse.

Aqui vale uma correção conceitual: melhorar o LCP significa **reduzir** o tempo, não aumentar.

Em código, as melhores evidências costumam ser testes automatizados, build passando, linters, type checks, benchmarks, capturas de tela, logs e comparação antes/depois.

Sem evidência, você continua dependendo de confiança. Com evidência, você consegue revisar.

### 8. Use a voz para coordenar, não para definir detalhe crítico

O ChatGPT Voice permite falar com o Work e com o Codex no aplicativo de desktop compatível. Dá para iniciar tarefas, perguntar o andamento, interromper e coordenar trabalho conversando.

A voz é boa para explicar contexto rápido, capturar uma ideia enquanto você revisa outra coisa, pedir um diagnóstico inicial, perguntar o que está travando uma tarefa, coordenar várias frentes ou pedir um resumo do progresso.

Só que detalhe sensível deve ser confirmado por escrito: caminhos, nomes de variáveis, quantidades, domínios, comandos, critérios de aceite, exclusões, credenciais e ações destrutivas.

Uma boa dinâmica é: **fale para preparar e direcionar; escreva para autorizar e fechar.** Assim você aproveita a velocidade da fala sem perder precisão nas decisões que importam.

### 9. Escolha entre Sol, Terra e Luna conforme a tarefa

O Codex oferece hoje [três modelos principais da família GPT-5.6](https://help.openai.com/en/articles/20001325-a-preview-of-gpt-56-sol-terra-and-luna):

- **Sol:** para trabalho complexo, ambíguo ou de alto valor.
- **Terra:** para tarefas do dia a dia que pedem bom raciocínio e uso de ferramentas.
- **Luna:** para trabalho claro, repetível, estruturado ou de alto volume.

A recomendação oficial é começar pelo Sol quando você não sabe qual escolher. A configuração Power usa Sol com raciocínio médio. Mas isso não quer dizer usar sempre a capacidade máxima.

**Quando usar Sol:** arquitetura complexa, bugs difíceis de reproduzir, migrações, investigação técnica profunda, mudanças com várias dependências, decisões com trade-offs relevantes.

**Quando usar Terra:** funcionalidades bem especificadas, refactors moderados, análise de código, testes, documentação técnica, automações de complexidade média.

**Quando usar Luna:** classificação, extração, transformações repetitivas, mudanças mecânicas, resumos estruturados, tarefas de grande volume com formato estável.

Use o menor nível de raciocínio que ainda produz resultado confiável. Mais raciocínio pode ajudar em tarefas difíceis, mas também significa mais consumo e mais latência.

### 10. Transforme processo repetitivo em Skill

As [Skills](https://help.openai.com/en/articles/20001066-skills-in-chatgpt) são fluxos reutilizáveis que ensinam o ChatGPT ou o Codex a executar uma tarefa de forma consistente. Uma Skill pode conter instruções, exemplos, scripts, templates, critérios de qualidade, materiais de referência e uma sequência fixa de passos.

Depois de instalada, o sistema pode selecioná-la sozinho quando ela for relevante, ou você pede explicitamente para usá-la.

Exemplos de Skills úteis:

- revisar um pull request com o padrão da sua empresa;
- preparar uma release;
- checar acessibilidade;
- transformar uma reunião técnica em tarefas;
- revisar uma integração de [n8n](/pt/blog/n8n-vs-zapier-vs-make-empresas/);
- gerar documentação seguindo um template;
- analisar logs de produção;
- criar uma landing page com o seu design system.

Não transforme qualquer prompt em Skill. Crie uma quando você repete o fluxo com frequência, existe um padrão reconhecível, várias pessoas precisam chegar ao mesmo resultado ou pular um passo custa caro.

Uma Skill bem desenhada transforma conhecimento tácito em processo reutilizável.

### 11. Use plugins e integrações antes de automatizar a interface

Antes de pedir para o Codex abrir um aplicativo e clicar repetidamente, verifique se existe um plugin, uma integração oficial, uma API, um servidor MCP, uma Skill específica ou uma ferramenta de linha de comando.

Os [plugins podem agrupar Skills, aplicativos, templates e integrações](https://help.openai.com/en/articles/20001256) para que o Codex obtenha contexto e execute ações dentro de ferramentas compatíveis. A OpenAI ampliou o catálogo de plugins disponíveis para trabalhar com serviços de desenvolvimento e produtividade.

Ordem recomendada:

1. API ou integração oficial.
2. Plugin ou servidor MCP confiável.
3. CLI.
4. Computer Use como alternativa.

Integração estruturada costuma ser mais confiável do que automatizar uma interface visual, principalmente quando o processo vai rodar muitas vezes. É o mesmo critério que usamos ao escolher entre [ferramentas de automação](/pt/blog/n8n-vs-zapier-vs-make-empresas/): o que roda mil vezes precisa de um contrato estável, não de uma tela que pode mudar.

Quando não existir integração adequada, use Computer Use com validações intermediárias e confirmação antes de ações irreversíveis.

### 12. Agende automações que entreguem resultado auditável

O Codex [executa trabalho recorrente por meio de Automations](https://openai.com/codex/): revisar issues sem classificação, analisar erros de CI, preparar um resumo de pull requests, checar documentação desatualizada, revisar dependências, analisar logs, continuar uma tarefa longa ou acompanhar conversas ligadas a um projeto.

As automações podem reaproveitar threads existentes, manter contexto e retomar trabalho ao longo do tempo.

Não agende só uma ação. Defina também o que ela precisa entregar:

> Toda manhã, revise os erros de produção das últimas 24 horas. Agrupe por causa provável, informe frequência e impacto, linke a evidência e proponha uma prioridade. Não altere produção.

Inclua sempre escopo, frequência, limite de tempo, fontes, condições de parada, formato do resultado, ações permitidas e ações proibidas.

Uma automação que executa trabalho sem produzir registro verificável vira caixa-preta rápido.

### 13. Use o Goal mode para objetivos duradouros e verificáveis

O [Goal mode](https://developers.openai.com/cookbook/examples/codex/using_goals_in_codex) existe para trabalhos que não se resolvem com uma única ação. Ele permite estabelecer um objetivo duradouro e definir critérios de sucesso para o Codex seguir avançando sobre o resultado.

Serve para metas como aumentar a cobertura de testes, reduzir erros de compilação, concluir uma migração, manter documentação sincronizada, melhorar uma métrica aos poucos ou fechar uma lista definida de chamados.

O objetivo precisa incluir uma condição observável.

Objetivo ruim:

> Deixe o projeto melhor.

Objetivo útil:

> Reduza os erros de TypeScript do projeto de 86 para zero, sem desativar regras nem usar `any` como solução geral. Rode o type check depois de cada bloco de mudanças e mantenha um registro dos erros resolvidos.

Outro exemplo:

> Suba a cobertura de testes dos módulos de faturamento de 54% para 80%, priorizando os caminhos críticos. Não escreva testes que só aumentem cobertura sem validar comportamento.

O Goal mode não elimina a supervisão. Quanto mais tempo o agente pode trabalhar sozinho, mais importante é definir limites, checkpoints e critérios de aceite.

### 14. Entenda a diferença entre trabalho local, remoto e cloud

Essa distinção evita muito problema de permissão e de expectativa, e depende de [qual cliente do Codex você está usando](https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan).

**Trabalho local.** O Codex acessa uma pasta ou ambiente do seu computador. Serve quando ele precisa de arquivos locais, ferramentas instaladas, um ambiente de desenvolvimento específico, serviços que só funcionam na sua rede ou aplicativos de desktop. Conceda acesso só às pastas necessárias.

**Trabalho remoto.** Pelo aplicativo de celular você acessa determinadas sessões do Codex que rodam em um computador compatível. A máquina host precisa ficar ligada, conectada e com o Codex rodando para o acesso remoto continuar. É útil para acompanhar o progresso, responder perguntas, aprovar ações ou continuar uma tarefa iniciada no computador. Não é o mesmo que rodar o Codex inteiro dentro do celular.

**Trabalho cloud.** Nos fluxos cloud, a tarefa roda em um ambiente gerenciado e isolado. Esse modelo cai bem para trabalhar sobre repositórios, executar tarefas em paralelo ou delegar processos que não dependem diretamente do seu desktop.

Antes de escolher, pergunte:

- Precisa de arquivos ou programas do meu computador? **Local.**
- Preciso supervisionar de outro dispositivo uma sessão do computador? **Remoto.**
- Pode rodar em um ambiente isolado conectado ao repositório? **Cloud.**

Onde a execução acontece determina a que dados e ferramentas o agente tem acesso.

### 15. Feche cada tarefa com um entregável, não com um "pronto"

A última mensagem do Codex precisa permitir que outra pessoa entenda o que aconteceu sem reler a conversa inteira.

Peça sempre um fechamento com objetivo inicial, estado final, arquivos modificados, testes realizados, evidência, riscos pendentes, decisões tomadas, passos para deploy ou continuidade e instruções de rollback quando fizer sentido.

Você pode usar este prompt:

> Feche a tarefa com um relatório curto. Inclua o que você mudou, o que não mudou, como validou o resultado, riscos pendentes e os passos exatos para outra pessoa continuar.

Quando o resultado precisar ser compartilhado de forma visual, dá para usar o [ChatGPT Sites](https://help.openai.com/en/articles/20001339-creating-and-managing-chatgpt-sites) e criar uma página, um aplicativo leve, um painel ou um protótipo. O Sites pode ser usado pelo Work na web e pelo Work ou Codex no aplicativo de desktop, quando estiver disponível para o plano, a região e o workspace.

Não publique automaticamente um resultado sensível. Revise arquivos incluídos, dados pessoais, chaves ou segredos, permissões de acesso, visibilidade, domínio e versão publicada.

Entregar não é apenas terminar de executar. É deixar o resultado pronto para revisão, aprovação ou uso.

## Exemplo prático

> Este bloco é um **cenário demonstrativo**, não um caso real de cliente. Não inclui métricas, tempos nem resultados medidos: serve para mostrar como as peças anteriores se encaixam em uma única tarefa.

**Contexto.** Uma aplicação de reservas em React e Node.js. As regras de negócio vivem em `/docs/booking-rules.md`. Um usuário impaciente aperta duas vezes o botão de confirmar e são criadas duas reservas.

**Tarefa.** Corrigir a duplicação sem mexer no esquema do banco de dados nem no design.

**Prompt.**

> Use `/docs/booking-rules.md` como fonte de verdade. Corrija o problema que permite criar duas reservas quando o usuário aperta duas vezes o botão de confirmação. Você pode alterar o frontend, a API e os testes relacionados; não mude o esquema do banco de dados nem o design visual. Antes de editar, apresente um plano com a causa provável, os arquivos afetados e a estratégia de validação.

**Escopo esperado.** O componente do botão de confirmação, o handler de criação de reservas na API e os testes associados.

**Validação.** Proteção no frontend e no backend, testes no verde e uma checagem explícita: duas requisições com o mesmo identificador de idempotência não podem gerar uma segunda reserva.

**Limite que convém antecipar.** Bloquear o botão no frontend parece suficiente até chegar uma requisição repetida de outro cliente. A proteção que vale é a do servidor; a do navegador só melhora a experiência.

## Segurança: as regras que deveriam acompanhar todos os seus prompts

Quanto mais capaz é um agente, maior é o custo potencial de uma instrução ambígua. Estas regras reduzem a superfície de risco:

- **Permissão mínima.** Trabalhe apenas dentro da pasta autorizada.
- **Prévia antes de ação destrutiva.** Mostre quais arquivos seriam apagados ou sobrescritos. Não execute ainda.
- **Confirmação explícita.** Não publique, compre, envie, apague nem faça deploy sem confirmação por escrito.
- **Limite de consumo.** Pare se ultrapassar o limite definido de tempo, chamadas externas ou custo.
- **Credencial fora do prompt.** Não cole senhas ou tokens direto na conversa quando existir um mecanismo de secrets, variáveis de ambiente ou credenciais gerenciadas.
- **Registro de mudanças.** Gere um log com data, ações, arquivos afetados e resultado.
- **Rollback.** Antes de mexer em produção, explique como voltar ao estado anterior.

Segurança não é uma revisão que se coloca no final. Faz parte da definição inicial da tarefa.

## Erros comuns ao usar o Codex

**Pedir uma solução sem definir sucesso.** Se não dá para medir, o agente vai ter que adivinhar quando parar.

**Dar acesso ao computador inteiro.** Um agente não precisa de permissão global para alterar a pasta de um projeto.

**Usar Computer Use quando existe uma API.** Automatizar cliques costuma ser mais frágil do que usar uma integração estruturada.

**Escolher o modelo mais potente para qualquer tarefa.** Potência desnecessária aumenta consumo e latência sem garantir melhora proporcional.

**Não revisar o diff.** Teste passando não significa que a mudança está correta, sustentável ou compatível com o negócio.

**Liberar navegação sem controlar as fontes.** Uma resposta recente não é necessariamente uma resposta confiável.

**Agendar tarefas sem pedir relatório.** Automação precisa produzir evidência e manter rastreabilidade.

**Confundir Codex com ChatGPT Work.** As duas experiências compartilham capacidades, mas foram desenhadas para resultados diferentes.

**Dar instruções contraditórias.** Se você pede "aja de forma autônoma" e também "consulte antes de qualquer decisão", o agente não sabe qual critério priorizar.

**Achar que "funciona na minha máquina" é validação.** Defina ambientes, testes e condições reproduzíveis.

## Template de prompt para usar o Codex

Você pode reaproveitar esta estrutura:

- **Contexto.** Descreva o projeto, o estado atual e a fonte de verdade.
- **Objetivo.** Diga o resultado concreto que você precisa.
- **Escopo.** Explique quais arquivos, sistemas ou componentes ele pode alterar.
- **Exclusões.** Deixe claro no que ele não deve encostar.
- **Restrições.** Inclua segurança, compatibilidade, custo e tecnologias permitidas.
- **Plano.** Indique se ele deve apresentar um plano antes de executar.
- **Validação.** Defina testes, métricas ou evidências.
- **Entrega.** Especifique o formato do resultado final.

### Exemplo completo

> Estamos trabalhando em um aplicativo React e Node.js para gerenciar agendamentos. As regras atualizadas estão em `/docs/booking-rules.md`.
>
> Corrija o problema que permite criar dois agendamentos quando o usuário aperta duas vezes o botão de confirmação.
>
> Você pode alterar o frontend, a API e os testes relacionados à criação de agendamentos. Não mude o schema do banco de dados nem o design visual.
>
> Antes de editar, apresente um plano curto com a causa provável, arquivos afetados e estratégia de validação.
>
> Considere a tarefa concluída quando existir proteção no frontend e no backend, os testes passarem e uma requisição repetida com o mesmo identificador não gerar um segundo agendamento.
>
> Ao finalizar, entregue o resumo, os arquivos modificados, os testes executados e qualquer risco pendente.

## Checklist para começar hoje

- Escolha uma tarefa real e delimitada.
- Decida se ela é de Chat, Work ou Codex.
- Defina o entregável.
- Aponte a fonte de verdade.
- Limite as permissões.
- Peça um plano quando o risco for relevante.
- Defina como conferir o resultado.
- Selecione o modelo adequado.
- Revise mudanças e evidências.
- Documente o fechamento.

Você não precisa começar por uma migração completa nem por uma automação que controla a empresa inteira. Comece por uma tarefa que hoje toma de 30 a 60 minutos, tem resultado verificável e pode rodar dentro de um ambiente controlado.

## Conclusão

Aprender como usar o Codex não é achar a frase mágica.

É sair de instruções vagas para objetivos conferíveis; de permissões globais para acessos mínimos; de aceitar respostas para revisar evidências; e de usar inteligência artificial como assistente para dirigi-la como um operador técnico.

O *vibe coding* funciona para explorar ideias e montar protótipos. Mas quando o resultado afeta cliente, dado, produção ou dinheiro, você precisa de mais: contexto, limites, testes e rastreabilidade.

O Codex programa, executa comandos, trabalha com repositórios, opera ferramentas e mantém tarefas ao longo do tempo. Sua vantagem não vem só de ter acesso ao agente. Vem de saber desenhar o sistema de trabalho em volta dele.

Comece por um resultado pequeno. Defina o que significa terminar. Libere só o necessário. Exija provas. E só então aumente a autonomia.

---

Quer aplicar agentes de IA em processos reais da sua empresa? Na **IA Operators** analisamos processos, ferramentas, dados e riscos antes de automatizar. Desenhamos sistemas que não só respondem: executam, se integram ao ambiente existente e produzem resultados mensuráveis. Comece por uma [auditoria de sistemas e automação](/pt/auditoria-de-sistemas/) ou conheça nosso serviço de [automação com IA](/pt/servicios/automatizacion-ia/).

## Fontes oficiais

- [OpenAI — Codex in ChatGPT](https://openai.com/codex/)
- [OpenAI Help Center — ChatGPT Work and Codex](https://help.openai.com/en/articles/20001275-chatgpt-work-and-codex)
- [OpenAI Developers — Modelos recomendados para Codex](https://developers.openai.com/codex/models)
- [OpenAI Help Center — Skills in ChatGPT](https://help.openai.com/en/articles/20001066-skills-in-chatgpt)
- [OpenAI — Introducing the Codex app](https://openai.com/index/introducing-the-codex-app/)
- [OpenAI — Codex for (almost) everything](https://openai.com/index/codex-for-almost-everything/)
- [OpenAI Help Center — Creating and managing ChatGPT Sites](https://help.openai.com/en/articles/20001339-creating-and-managing-chatgpt-sites)
