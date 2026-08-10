# Plano de arquitetura do site — IA Operators

**Base:** estudo de palavras-chave no Google Ads Keyword Planner (09/ago/2026), conta España, período jul/2025–jun/2026.
**Escopo:** ES prioritário, EN e PT secundários. Inclui o silo `/es/cumplimiento/` já construído.
**Substitui:** a direção estratégica proposta na auditoria SEO anexa (ver §1.3 — a auditoria acerta o diagnóstico e erra o eixo).
**Revisão 2 (09/ago/2026):** incorpora a contra-auditoria e os dados reais do Search Console. Mudanças materiais em §0.2 (cumplimiento vira *wedge*, não núcleo), §5.1 (redirects), §7 (regras de linking e de conteúdo único), §10 (Sprint 0 obrigatório) e §11 (baseline real). O que mudou e por quê está listado em §13.

---

## 0. Sumário executivo

Três decisões, nesta ordem de importância:

**1. O eixo semântico do site é *integração e cumprimento normativo*, não "agencia de IA" nem "auditoría tecnológica".**
Verifactu sozinho tem **10.000–100.000 buscas/mês** em Espanha. Todo o vocabulário de "auditoría tecnológica / roadmap tecnológico" que hoje ocupa a home, o menu e quatro páginas do site (`auditoria-de-sistemas`, `roadmap-tecnologico`, `implementacion`, `metodologia`) tem demanda **residual** (a auditoria SEMrush de julho mediu ~20 buscas/mês). O site está gastando sua área mais valiosa numa intenção de busca que quase ninguém procura.

**2. O silo `/es/cumplimiento/` deixa de ser um anexo e passa a ser o *wedge* de aquisição — não o núcleo permanente da marca.**
Hoje ele está enterrado abaixo de dez landings de serviço. Os dois pilares regulatórios (Verifactu e Ley 10/2025) são as únicas páginas do site que combinam demanda mensurável, prazo legal com sanção, e uma SERP onde **ninguém vende a implementação técnica**. É a única vantagem assimétrica defensável com 36 domínios de referência.

Mas a força deles — a urgência — vem com uma data de validade. Verifactu obriga em 1/1/2027 e 1/7/2027; a Ley 10/2025 em 28/12/2026. Depois do pico, a demanda migra de "como me adapto" para manutenção. Por isso a hierarquia correta é:

- **Core evergreen da marca:** integración + automatización de sistemas.
- **Wedge de aquisição 2026–2027:** cumplimiento.
- **Catálogo de cobertura:** agencia/servicios.

A diferença é sutil e importante: em 2028 ninguém — nem o Google, nem um cliente — deve interpretar a IA Operators como um portal de legislação empresarial.

**3. `/pt/` não recebe o catálogo de serviços.**
Medido no Planner com localização Portugal: das 100 ideias extraídas (de 213 retornadas), **4 linhas — 3 termos distintos** — chegam a 100 buscas/mês. `automação de processos`, `chatbot para empresas`, `integração de sistemas`, `consultoria de inteligência artificial` estão todas na faixa 10–100. Traduzir dez landings para PT é criar dez páginas *thin* que competem entre si por zero tráfego.

E uma correção estrutural: existem **dois destinos distintos** para a mesma keyword `agencia de ia` (`/[locale]/agencia-de-ia/` e `/[locale]/servicios/agencia-ia/`). Isso é canibalização literal, não teórica.

---

## 1. Metodologia, dados e limitações

### 1.1 O que foi feito

Oito lotes de sementes rodados no **Planificador de palabras clave** do Google Ads (conta `792-831-2549 España`), localização Espanha / idioma Espanhol, mais um lote em Portugal/Português e um em EUA+Reino Unido/Inglês. Para cada lote foram extraídas as 100 primeiras ideias ordenadas por volume, com **faixa de volume, variação trimestral, variação YoY, nível de concorrência e faixa de lance de topo de página**. Também foi usada a *Visualização agrupada* do Planner (o agrupamento semântico do próprio Google) sobre o universo de 1.274 ideias do lote de facturación.

Sementes por lote:

| Lote | Sementes | Ideias retornadas |
|---|---|---|
| ES-1 | agencia de inteligencia artificial · automatización de procesos · consultoría inteligencia artificial · chatbot para empresas · integración de sistemas · agente de ia | 326 |
| ES-2 | whatsapp business api · atención al cliente automatizada · crm para empresas · automatizar whatsapp · software de atención al cliente · centralita virtual | 575 |
| ES-3 | ley de atención al cliente · normativa atención al cliente · gestión de reclamaciones · sla atención al cliente · call center para empresas | 130 |
| ES-4 | verifactu · factura electrónica · software de facturación · ticketbai · facturación electrónica obligatoria · programa de facturacion | 1.274 |
| ES-5 | integrar verifactu · api verifactu · verifactu erp · homologacion verifactu · adaptar software verifactu · software a medida facturacion | 6 |
| ES-6 | agencia seo · diseño web · marketing digital · posicionamiento web · desarrollo web a medida · agencia de marketing | 2.670 |
| ES-7 | consultoría tecnológica · transformación digital · software a medida · integración de api · erp para empresas · auditoría informática | 846 |
| ES-8 | n8n · zapier · agentes de ia · asistente virtual con ia · automatizar tareas con ia · ia para empresas | 108 |
| PT-1 | automação de processos · agência de inteligência artificial · chatbot para empresas · integração de sistemas · agentes de ia · consultoria de inteligência artificial | 213 |
| EN-1 | ai automation agency · n8n consultant · workflow automation consultant · ai agent development · custom ai solutions · system integration services | 1.100 |

### 1.2 Limitações que precisam ficar registradas

- **A conta Google Ads está cancelada / sem forma de pagamento válida.** Nesse estado o Planner devolve **faixas** (`100 – 1 mil`), não números exatos. Todos os volumes abaixo são faixas. Para números exatos é preciso reativar a conta com uma campanha ativa — mesmo com orçamento mínimo.
- **Ahrefs devolveu `Insufficient plan`** em Keywords Explorer, Site Explorer e nos endpoints de Search Console. **Semrush está sem API units.** Portanto **não há KD (dificuldade) nem volume exato neste estudo**. A priorização abaixo usa como *proxy* de dificuldade comercial o **nível de concorrência paga** e a **faixa de lance de topo de página**, mais os achados de SERP já verificados em sessões anteriores.
- Volume de busca **não é demanda de compra**. O caso mais claro está no §2.1: `verifactu` tem volume enorme, mas o miolo do cluster é gente procurando *programa de facturación gratis*. O dinheiro está na cauda.
- **`Competition` e `Top of page bid` do Keyword Planner medem o leilão de anúncios, não o SEO.** `Competition` é o número relativo de anunciantes disputando a keyword; o lance de topo é o que anunciantes historicamente pagaram para aparecer entre os anúncios. Nada disso mede dificuldade orgânica, ticket médio ou taxa de conversão. Neste documento CPC alto é lido como **indício de intenção comercial e de disposição a pagar pelo clique** — uma hipótese comercial, não uma premissa arquitetônica. Onde o plano diz "motor de ticket", leia "hipótese de maior valor por lead, a validar em vendas reais".
- **Somar variantes próximas superestima a demanda.** O Planner reporta a média mensal da keyword **e de suas close variants**; portanto `ley atención al cliente` e `ley atencion al cliente` quase certamente reportam a mesma demanda duas vezes. Nenhum agregado de cluster neste documento deve ser somado.
- **`+∞` e `+900%` não são medidas de precisão.** Onde o Planner devolve `+∞`, leia **"demanda emergente sem base comparável no período anterior"**. `+900%` é o teto da escala do Planner, não uma taxa exata.

Notação de faixas usada nas tabelas:

| Código | Faixa mensal |
|---|---|
| **b** | 10 – 100 |
| **c** | 100 – 1 mil |
| **d** | 1 mil – 10 mil |
| **e** | 10 mil – 100 mil |

Concorrência: **B**aixa · **M**édia · **A**lta (concorrência *paga*, do Google Ads). CPC = faixa de lance de topo de página, em euros.

### 1.3 Onde este plano discorda da auditoria anexa

A auditoria acerta o diagnóstico: a home tenta ser oito coisas e não responde "em que a IA Operators é especialista". Acerta também os pontos técnicos (logo 32×32 no `Organization`, `SearchAction` obsoleto, `<main>` aninhado, H1 duplicado no DOM, `alt="Logo 1"`).

Mas a direção proposta — mover a home para **`auditoría tecnológica + implementación con IA`** — **não tem demanda**. É um vocabulário interno, não uma consulta de mercado. Trocar "agencia de IA y marketing digital" (genérico, mas com volume) por "auditoría tecnológica" (diferenciado, mas com ~20 buscas/mês) troca um problema de foco por um problema de tráfego.

A leitura correta é: o *conteúdo* que a auditoria identificou como mais diferenciado ("tu empresa tiene más tecnología de la que realmente controla", "diagnóstico → roadmap → implementación") está certo como **narrativa de venda**. Ele só não pode ser o **alvo de busca**. Narrativa e keyword são coisas diferentes. A narrativa fica; o alvo passa a ser integração e cumprimento.

---

## 2. Mapa de demanda (dados do Keyword Planner)

### 2.1 Cluster REGULATÓRIO A — Verifactu / facturación electrónica

O cluster com maior volume **e** maior alinhamento com o que a IA Operators vende. (Em volume bruto, `verifactu` e `marketing digital` estão ambos na faixa **e**; a diferença é que aqui existe cauda transacional própria.)

| Keyword | Faixa | YoY | Conc. | CPC topo (min–max) |
|---|---|---|---|---|
| `verifactu` | **e** (10K–100K) | 0% | M | €1,20 – €5,08 |
| `factura electrónica` | **e** | −90% | M | €1,68 – €7,37 |
| `ticketbai` / `ticket bai` | **d** | 0% | B | €0,70 – €5,84 |
| `facturación electrónica obligatoria` | **d** | −90% | B | €0,69 – €3,17 |
| `facturacion online` | **d** | −90% | **A** | €2,08 – €9,31 |
| `programas de facturacion gratis` | **d** | −90% | **A** | €1,75 – €8,17 |
| `software de facturación` | **c** | — | M | — |
| `sistema de facturacion electronica` | **c** | — | — | — |
| **`api verifactu`** | **c** | 0% | **A** | **€3,15 – €12,06** |
| **`verifactu erp`** | **b** | **+∞** | **A** | €2,50 – €15,81 |
| **`integrar verifactu`** | **b** | **+∞** | M | €1,87 – €12,83 |
| **`homologacion verifactu`** | **b** | **+∞** | B | — |

**Leitura.** O agrupamento semântico do próprio Google sobre as 1.274 ideias devolve grupos como *Programa Gratuito*, *Online Gratis*, *Para Pymes*, *Nube*, *Erp*, *Software De Gestion*, *Obligatoriedad Factura*, *Facturacion Hacienda*. Ou seja: o head é **compra de software**, um mercado onde a IA Operators não compete. Mas as quatro linhas em negrito — `api verifactu`, `verifactu erp`, `integrar verifactu`, `homologacion verifactu` — são **exatamente** o posicionamento "no puedo migrar" já travado em memória, têm concorrência paga Alta (alguém está pagando €12–15 por clique nisso) e crescimento YoY infinito, isto é, demanda que **não existia** há doze meses.

Isso valida o timing registrado nas instruções do projeto: estamos no vale, o ramp reinicia no T4/2026, e o conteúdo precisa estar indexado e maduro **antes** disso.

### 2.2 Cluster REGULATÓRIO B — Ley 10/2025 de atención a la clientela

| Keyword | Faixa | YoY | Conc. | CPC topo |
|---|---|---|---|---|
| `ley de atención al cliente` | **c** | **+900%** | B | €3,38 – €11,10 |
| `ley atencion al cliente` | **c** | **+900%** | B | €1,34 – €8,93 |
| `ley atención al cliente` | **c** | **+900%** | B | €1,34 – €8,93 |
| `ley atencion cliente` | **c** | **+900%** | B | €2,79 – €10,66 |
| `ley de atención a la clientela` | **c** | **+900%** | B | €3,01 – €15,60 |
| `nueva ley de atención al cliente` | **c** | 0% | B | €2,69 – €8,27 |
| `nueva ley de atencion al cliente` | **c** | 0% | B | €2,69 – €8,27 |
| `nueva ley de servicios de atención al cliente` | **b** | — | — | — |
| `ley de servicios de atención al cliente` | **b** | — | — | — |

**Leitura.** Sete variantes na faixa 100–1K cada, todas com crescimento no teto da escala. **Não somo essas faixas:** o Planner agrupa close variants, então as grafias equivalentes provavelmente reportam a mesma demanda repetida. O que se pode afirmar é: *várias formas de consulta desse cluster estão na faixa 100–1K/mês e a demanda cresceu fortemente em doze meses*. O tamanho agregado não é determinável a partir destas faixas. Concorrência paga baixa: os escritórios de advocacia que dominam a SERP não anunciam. A cauda adjacente (`call center para empresas`, `contact center empresas`, `call center omnicanal`, `call center automatizado`, `telemarketing empresas`) está toda na faixa **b**, mas é o vocabulário de quem já entendeu que precisa resolver o problema.

### 2.3 Cluster INTEGRAÇÃO / ERP / sistemas — o melhor CPC do mercado ES

| Keyword | Faixa | Conc. | CPC topo |
|---|---|---|---|
| `auditoria ciberseguridad` | **c** | M | **€48,07** |
| `erp pymes` / `pymes erp` | **c** | M | €25,07 |
| `erp en la nube` | **c** | B | €25,17 |
| `erp construccion` | **c** | M | €24,33 |
| `erp para pymes` | **c** | M | €19,75 |
| `soluciones erp` | **c** | B | €17,01 |
| `software erp` / `erp empresas` / `erp logistica` | **c** | M | €15,81 |
| `integracion erp` | **c** | B | €15,81 |
| `sistema de gestion erp` | **c** | M | €15,57 |
| `auditoria de ciberseguridad` | **c** | M | €21,51 |
| `auditoria seguridad informatica` | **c** | B | €10,41 |
| `software a medida` | **c** | M | €8,31 |
| `desarrollo de software a medida` | **c** | M | €8,04 |
| `transformación digital` | **d** | B | €9,84 |
| `consultoría tecnológica` | **c** | M | €4,11 |
| `integración de sistemas` | **c** | B | €5,93 |
| `sistema integral de gestion` | **c** | B | €9,22 |
| `consultoria it` | **c** | B | €4,59 |
| `digitalizacion de empresa` | **c** | B | €7,34 |

**Leitura.** É aqui que está o dinheiro por clique em Espanha. `transformación digital` tem o maior volume mas é informacional (quem busca isso quer entender o conceito). Os termos com CPC de €15–25 são todos **comerciais e de sistema**, e todos adjacentes ao que a IA Operators de fato faz. `consultoría tecnológica` a €4,11 é o termo genérico e barato — sintoma de que o mercado não valoriza o rótulo, valoriza o objeto (ERP, integração, ciberseguridad).

### 2.4 Cluster IA / automação / canais

| Keyword | Faixa | YoY | Conc. | CPC topo |
|---|---|---|---|---|
| `n8n` | **e** | 0% | M | €3,47 |
| `zapier` | **e** | 0% | M | €5,02 |
| `automatización` | **d** | 0% | B | €5,32 |
| `agente de ia` | **d** | **+900%** | M | €8,23 |
| `agentes de ia` | **d** | **+900%** | M | €8,23 |
| `whatsapp business api` | **d** | 0% | M | €15,28 |
| `centralita virtual` | **d** | 0% | M | **€29,01** |
| `ia para empresas` | **c** | 0% | **A** | **€17,70** |
| `inteligencia artificial para empresas` | **c** | −90% | M | €14,04 |
| `crm para empresas` | **c** | — | M | **€28,67** |
| `crm pymes` | **c** | — | B | €34,54 |
| `chatbot para empresas` | **c** | −90% | M | €17,29 |
| `agencia de inteligencia artificial` | **c** | 0% | B | €4,50 |
| `agencia inteligencia artificial` | **c** | 0% | B | €4,50 |
| `agencia de ia` | **c** | 0% | M | €4,26 |
| `consultoría inteligencia artificial` | **c** | 0% | B | €6,08 |
| `automatización de procesos` | **c** | 0% | B | €5,02 |
| `automatización inteligente` | **c** | 0% | B | €4,07 |
| `robotica rpa` | **c** | −90% | B | €2,56 |

**Leitura.** Dois padrões importantes. Primeiro: `n8n` e `zapier` têm volume de 10K–100K em Espanha, mas a cauda é `zapier whatsapp`, `zapier wordpress`, `zapier precios`, `zapier odoo` — intenção de **tutorial e comparação de ferramenta**, não de contratação. É combustível de blog e de autoridade, não de landing comercial. Segundo: `agencia de …` tem CPC de €4–6, enquanto `ia para empresas` e `crm para empresas` têm CPC de €17–29. O mercado paga 4× mais por quem descreve o **problema** do que por quem descreve o **fornecedor**. Isso é um argumento direto contra fazer da home uma página de "agencia".

### 2.5 Cluster AGÊNCIA (SEO / web / marketing) — confirma a auditoria SEMrush de julho

| Keyword | Faixa | Conc. | CPC topo |
|---|---|---|---|
| `marketing digital` | **e** | M | €8,65 |
| `agencia seo` | **d** | M | €8,28 |
| `diseño web` | **d** | M | €4,99 |
| `posicionamiento web` | **d** | B | €8,45 |
| `agencia de marketing digital` | **d** | M | €8,65 |
| `agencia google ads` | **d** | M | **€14,99** |
| `diseño de paginas web` | **d** | M | €7,82 |
| `posicionamiento seo` | **d** | M | €7,55 |
| `agencia de diseño web` | **d** | B | €4,80 |
| `consultor seo` | **d** | B | €4,52 |
| `agencia de publicidad` | **d** | B | €5,35 |

**Leitura.** Volume real, comparável ao de Verifactu em faixa bruta (`marketing digital` também é **e**). Mas: a auditoria SEMrush de julho mediu que a SERP desses termos exige da ordem de **115 domínios de referência** e a IA Operators tem 36. Estes termos não são um plano de crescimento a 6 meses; são um catálogo que sustenta a proposta comercial e captura marca + long tail local. Mantê-los, não apostar neles.

### 2.6 PT (Portugal) — decisão de não investir

Localização Portugal, idioma Português, mesmas sementes traduzidas. Das 100 ideias extraídas (de 213 retornadas), **apenas 4 linhas** atingem 100 buscas/mês — e duas delas são a mesma expressão com e sem acento (`automação robotica` / `automacao robotica`), ou seja **3 termos distintos**:

| Keyword | Faixa | Conc. | CPC topo |
|---|---|---|---|
| `agentes de ia` | **c** | M | €2,66 |
| `automação robotica` | **c** | B | €2,07 |
| `automatizacao` | **c** | B | €4,00 |

E as sementes principais:

| Keyword | Faixa |
|---|---|
| `automação de processos` | **b** (10–100) |
| `chatbot para empresas` | **b** |
| `integração de sistemas` | **b** |
| `consultoria de inteligência artificial` | **b** |

O mercado português para estes serviços é, em termos de busca, praticamente inexistente. (O Brasil é outra história — a auditoria SEMrush de julho mediu `n8n` em 165K/mês no BR — mas o BR é mercado de **conteúdo e autoridade**, não de venda primária para um autónomo em Málaga.)

### 2.7 EN (EUA + Reino Unido) — volume e CPC altos, barreira alta

| Keyword | Faixa | Conc. | CPC topo |
|---|---|---|---|
| `ai call center` | **d** | M | **€716,43** |
| `integrated data platform` | **d** | B | €76,23 |
| `zendesk ticketing system` | **d** | B | €67,48 |
| `data integration software` | **d** | B | €55,19 |
| `custom ai development` | **c** | B | €42,88 |
| `freshdesk ticketing system` | **d** | M | €38,10 |
| `crm integration` | **d** | B | €32,32 |
| `microsoft erp` | **d** | M | €30,13 |
| `interactive voice response` | **e** | B | €25,95 |
| `custom ai solutions` | **c** | B | €25,95 |
| `system integration` | **d** | B | €20,75 |
| `ai automation agency` | **d** | M | €14,59 |

`n8n consultant` e `workflow automation consultant` não retornaram volume ≥100 — são nichos reais mas pequenos demais para o Planner medir nesta conta.

**Leitura.** O mercado anglófono paga 3–10× mais por clique. `ai automation agency` (1K–10K, CPC €14,59) é o alvo natural e coincide com o que a auditoria SEMrush já tinha apontado (KD 32, o "flanco IA-nativo de baixa KD"). Mas é um mercado onde a IA Operators compete sem prova social local, sem fuso horário favorável e sem a alavanca regulatória. **EN é uma aposta, não um pilar.** Uma página, não um silo.

---

## 3. Diagnóstico da arquitetura atual

Inventário real do repositório (`src/pages`), 74 arquivos de rota. O que importa:

### 3.1 Canibalização confirmada

| Conflito | URLs | Keyword disputada | Severidade |
|---|---|---|---|
| **Duplo destino para "agencia de ia"** | `/[locale]/agencia-de-ia/` **e** `/[locale]/servicios/agencia-ia/` | `agencia de ia`, `agencia de inteligencia artificial` | 🔴 Alta — mesma intenção, dois URLs, ambos linkados no menu |
| ~~Consultoría vs agencia de IA~~ | `/servicios/consultoria-ia/` vs `/servicios/agencia-ia/` | `consultoría inteligencia artificial` (c) vs `agencia de ia` (c) | ✅ **Descartado (09/ago/2026).** Comparei os dois top-10 no google.es: só `consultoresia.com` aparece em ambos — **1 de 10**, muito abaixo do limiar de 6 da regra §7.2. A SERP de `consultoría` é corporativa (Telefónica Tech, IBM, in2ai); a de `agencia` é de agências. São páginas diferentes. **Não fundir.** |
| SEO vs marketing digital | `/servicios/agencia-seo/` vs `/servicios/marketing-digital/` | `posicionamiento web`, `posicionamiento seo` | 🟠 Média |
| Trio de baixa demanda | `/auditoria-de-sistemas/`, `/roadmap-tecnologico/`, `/implementacion/`, `+ /metodologia/` | vocabulário sem demanda mensurável | 🟠 Média — quatro páginas competindo por ~20 buscas/mês somadas |
| Automatización IA vs consultoría IA | `/servicios/automatizacion-ia/` vs `/servicios/consultoria-ia/` | `automatización de procesos` | 🟡 Baixa |

### 3.2 Desproporção entre demanda e superfície

| Cluster | Demanda medida | Páginas dedicadas hoje |
|---|---|---|
| Verifactu / facturación | **10K–100K/mês** | 1 pilar + 4 casos (`/es/cumplimiento/verifactu/`) |
| Ley 10/2025 | várias variantes em 100–1K, crescimento no teto da escala | 1 pilar + 5 setoriais + 1 teste |
| Agência (SEO/web/marketing) | 1K–10K por termo; 10K–100K em `marketing digital` | 3 landings + hub |
| IA / automação | 100–1K nos termos comerciais (`agencia de ia`, `ia para empresas`); 1K–10K em `agente(s) de ia`, `whatsapp business api`, `centralita virtual`; 10K–100K em `n8n`/`zapier` (intenção de ferramenta) | 4 landings + 3 programáticas de cidade |
| **Auditoría / roadmap / implementación** | **~20/mês** | **4 páginas + a home inteira + item de menu próprio** |

O último item é o desequilíbrio central. A home, o H1, a meta description e o `description` do `Organization` schema estão todos ancorados no cluster com **menos** demanda do site.

### 3.3 O que a arquitetura atual acerta

- O silo `/es/cumplimiento/` já está correto: pilar → setoriais/casos → teste interativo, ES-only, com disclaimer jurídico. Não mexer na forma, só na hierarquia e no volume de conteúdo.
- `src/data/servicios.ts` como fonte única dos destinos + hub `/servicios/` é a decisão certa e escala.
- `src/data/verifactu.ts` já tem os 4 casos (`erp-a-medida`, `tpv-multitienda`, `ecommerce-propio`, `software-vertical`) e `src/data/sectores-sac.ts` os 5 setores do art. 2.1. A estrutura de dados está pronta para o que vem abaixo.
- Blog com 49 posts ES / 44 EN / 44 PT — base de autoridade já existente.

---

## 4. Arquitetura-alvo

### 4.1 Princípio organizador

O site passa a ter **três silos com funções distintas**, não dez ofertas equivalentes:

```
                     ┌──────────────────────────────┐
                     │   HOME  (entidade + ponte)   │
                     └───────────────┬──────────────┘
        ┌────────────────────────────┼────────────────────────────┐
        ▼                            ▼                            ▼
┌───────────────────┐    ┌───────────────────────┐   ┌──────────────────────┐
│ SILO 1            │    │ SILO 2                │   │ SILO 3               │
│ CUMPLIMIENTO      │    │ INTEGRACIÓN Y         │   │ AGENCIA              │
│ (motor de captação│    │ AUTOMATIZACIÓN        │   │ (catálogo /          │
│  e de autoridade) │    │ (motor de ticket)     │   │  cobertura)          │
│ ES-only           │    │ ES + EN               │   │ ES (+EN parcial)     │
└───────────────────┘    └───────────────────────┘   └──────────────────────┘
        │                            │                            │
        └────────────────► BLOG (informacional, alimenta os três) ◄┘
```

**Silo 1 — Cumplimiento.** Captura demanda com prazo legal. Alta intenção, baixa concorrência editorial, ciclo de venda curto. É o que traz o lead.
**Silo 2 — Integración y automatización.** Captura a demanda de sistema (ERP, API, integração, agentes de IA). CPC alto = valor comercial alto. É o que sustenta o ticket.
**Silo 3 — Agencia.** Captura o vocabulário genérico de serviços. Volume alto, conversão baixa, autoridade insuficiente hoje. É cobertura, não aposta.

### 4.2 Árvore de URLs completa — ES

```
/es/
│
├── (home)                                    ← entidade + ponte para os 3 silos
│
├── cumplimiento/                             ← SILO 1  ★ prioridade máxima
│   ├── (hub)                                 ← já existe
│   │
│   ├── verifactu/                            ← PILAR ★★★  (10K–100K/mês)
│   │   ├── (index)                           ← já existe
│   │   ├── erp-a-medida/                     ← já existe
│   │   ├── tpv-multitienda/                  ← já existe
│   │   ├── ecommerce-propio/                 ← já existe
│   │   ├── software-vertical/                ← já existe
│   │   ├── api/                              ← NOVO  ★★★ (`api verifactu`, conc. Alta)
│   │   ├── integracion/                      ← NOVO  ★★  (`integrar verifactu`)
│   │   ├── homologacion/                     ← NOVO  ★   (`homologacion verifactu`)
│   │   ├── plazos/                           ← NOVO  ★★  (`verifactu obligatorio`, `cuándo`)
│   │   ├── sanciones/                        ← NOVO  ★   (art. 201 bis LGT)
│   │   └── test/                             ← NOVO  ★★  (teste "¿te aplica Verifactu?")
│   │
│   ├── ley-atencion-al-cliente/              ← PILAR ★★  (variantes em 100–1K, crescimento no teto)
│   │   ├── (index)                           ← já existe
│   │   ├── energia-agua-gas/                 ← já existe
│   │   ├── transporte-viajeros/              ← já existe
│   │   ├── servicios-postales/               ← já existe
│   │   ├── telecomunicaciones/               ← já existe
│   │   ├── servicios-financieros/            ← já existe
│   │   ├── test/                             ← já existe
│   │   ├── plazos-y-sla/                     ← NOVO  ★★ (3 min, 15 días, 2h, 5 días)
│   │   └── auditoria-acreditada/             ← NOVO  ★  (auditoria por entidade acreditada pela ENAC)
│   │
│   └── factura-electronica-b2b/              ← NOVO  ★★ PILAR 3 (RD 238/2026, prazo aberto)
│       ├── (index)
│       └── formatos/                         ← Facturae / UBL / conversão
│
├── integracion/                              ← SILO 2  ★★ (hub MVP antecipado ao Sprint A; filhos e 301 no Sprint C)
│   ├── (hub)                                 ← NOVO
│   ├── erp/                                  ← NOVO ★★ (`integracion erp` c, CPC €15,81)
│   ├── api-y-webhooks/                       ← NOVO ★  (`integración de api`)
│   ├── sistemas-legados/                     ← NOVO ★  (`integración de sistemas` c)
│   ├── whatsapp-business-api/                ← NOVO ★★ (d, CPC €15,28)
│   ├── crm/                                  ← NOVO ★★ (`crm para empresas` c, CPC €28,67)
│   └── auditoria-de-sistemas/                ← MOVER de /[locale]/auditoria-de-sistemas/
│
├── servicios/                                ← SILO 3 (catálogo, já existe)
│   ├── (hub)                                 ← já existe
│   ├── automatizacion-ia/                    ← já existe
│   ├── agentes-de-ia/                        ← NOVO ★★ (`agentes de ia` d, +900% YoY)
│   ├── chatbots/                             ← já existe
│   ├── agencia-ia/                           ← já existe (consolidação com /agencia-de-ia/: PENDENTE, §5.1-bis)
│   ├── consultoria-ia/                       ← já existe — MANTER (fusão cancelada pela SERP, §3.1)
│   ├── agencia-seo/                          ← já existe
│   ├── diseno-web/                           ← já existe
│   └── marketing-digital/                    ← já existe
│
├── agencia-de-ia/{madrid,barcelona,valencia}/ ← MANTER (local, regra ≥30% único)
│
├── sobre/ · autores/ · portfolio/ · contact/ · blog/   ← institucional (inalterado)
│
└── metodologia/ · roadmap-tecnologico/ · implementacion/  ← DESINDEXAR + fundir (ver §5)
```

### 4.3 Árvore EN — enxuta e deliberada

```
/en/
├── (home)                                   ← reposicionar: "AI automation & systems integration"
├── services/
│   ├── ai-automation-agency/                ← NOVO ★★ (`ai automation agency` d, CPC €14,59)
│   ├── custom-ai-development/               ← NOVO ★  (`custom ai development` c, CPC €42,88)
│   └── system-integration/                  ← NOVO ★  (`system integration` d, CPC €20,75)
├── about/ · blog/ · contact/                ← manter
└── (todo o resto do catálogo ES: NÃO traduzir)
```

Regra: EN recebe **três** landings comerciais no total (duas do silo de serviços, uma do de integração), não dez. O silo de cumplimiento **não existe em EN** (é obrigação espanhola — traduzi-la seria criar páginas sem público).

### 4.4 Árvore PT — só autoridade

```
/pt/
├── (home)                                   ← manter, como cartão de entidade
├── sobre/ · blog/ · contact/                ← manter
└── (nenhuma landing de serviço nova; as existentes: ver §5.4)
```

---

## 5. Decisões de consolidação, redirect e desindexação

### 5.1 Fundir e redirecionar

| Origem | Destino | Tipo | Motivo |
|---|---|---|---|
| `/es/agencia-de-ia/` (index) | — | **REVERTIDO** | O 301 chegou a ser implementado e foi **desfeito em 09/ago/2026** depois do Sprint 0. O Search Console mostra que quem serve o cluster é `/es/agencia-de-ia/` (**505 impressões/90 dias**), não `/es/servicios/agencia-ia/` (**7**). O diagnóstico de canibalização continua correto — as duas páginas disputam as mesmas queries —, mas a **direção** do redirect estava invertida. Decisão adiada para o Sprint 0.1 (ver §5.1-bis). |
| ~~`/{locale}/servicios/consultoria-ia/`~~ | — | **cancelado** | A hipótese de canibalização **não se confirmou na SERP** (ver §3.1). As duas páginas ficam. O que fazer em vez de fundir: **acentuar a diferença** — `consultoria-ia` fala a linguagem corporativa que a SERP dela mostra (governança, riscos, arquitetura-alvo), `agencia-ia` fala a linguagem de execução. |
| `/es/roadmap-tecnologico/` | `/es/integracion/` (hub) | **301, após Sprint 0** | Demanda de mercado residual, mas o GSC mostra **23 impressões/90d** e, sobretudo, o post `/es/blog/que-es-un-roadmap-tecnologico/` tem **1.124 impressões** — a 3ª página mais visível do site. O redirect só se faz se o hub absorver o conteúdo **e** o post-âncora passar a apontar para ele. |
| `/es/implementacion/` | `/es/integracion/` (hub) | **301, após Sprint 0** | Idem. |
| `/es/metodologia/` | `/es/sobre/` | **301, após Sprint 0** | ~22 impressões somando es/en/pt. Conteúdo de processo. |
| `/es/auditoria-de-sistemas/` | `/es/integracion/auditoria-de-sistemas/` | **301, após Sprint 0** | Mantém a página (é a "Radiografía Digital", ativo de outbound), mas dentro do silo certo. Atenção: o post `/es/blog/auditoria-de-sistemas-tecnologicos/` tem **512 impressões** e precisa continuar apontando para o destino certo. |
| `/en/…` e `/pt/…` das rotas acima | **decidir uma a uma** | — | **Não redirecionar em bloco para a home.** O Google trata redirect em massa para um destino irrelevante como *soft 404*. Para cada URL: (A) redirecionar para a página semanticamente mais próxima — p. ex. `/en/roadmap-tecnologico/` → `/en/services/system-integration/` quando esta existir; (B) **410** se o conteúdo deixou de existir sem substituto; ou (C) manter uma versão consolidada. Enquanto `/en/services/` não existir, **manter as páginas EN/PT como estão**. |

> ⚠️ **Não apagar conteúdo.** Todo o texto de auditoría/roadmap/implementación é bom material de venda; ele migra para dentro do hub `/integracion/` e das páginas de destino. O que muda é que deixa de ocupar URL e menu próprios.

### 5.1-bis Decisão pendente: qual URL fica com o cluster "agencia de IA"

Evidência do Sprint 0 (GSC, 90 dias, 09/ago/2026):

| URL | Impressões | Cliques | Posição média |
|---|---|---|---|
| `/es/agencia-de-ia/` | **505** | 0 | **77,9** |
| `/es/agencia-de-ia/valencia/` | 114 | 0 | — |
| `/es/agencia-de-ia/barcelona/` | 15 | 0 | — |
| `/es/servicios/agencia-ia/` | **7** | 0 | — |
| `/pt/servicios/agencia-ia/` | 10 | 0 | — |

Queries servidas por `/es/agencia-de-ia/`: `agencia de ia` (146) · `agencia de inteligencia artificial` (119) · `agencia ia` (51) · `agencia con ia` (43) · `agencias ia` (39) · `agencia de asistentes de inteligencia artificial` (35) · `agencia de ia en españa` (20).

Queries de `/es/servicios/agencia-ia/`: `agencia con ia` (4) · `agencia ia` (2) · `consultoría agentes ia` (1).

**A canibalização está confirmada no nível da query, não por inferência:** `agencia con ia` e `agencia ia` aparecem nas *duas* URLs. O Google está dividindo as mesmas consultas entre elas. Isso é evidência mais forte do que a heurística de sobreposição de SERP.

**O que os dados NÃO dizem.** Não sabemos *por que* o Google prefere `/es/agencia-de-ia/`. Pode ser idade da URL, conteúdo, links internos, backlinks ou histórico — o slug de correspondência exata é só uma hipótese entre várias. Registrar a preferência é legítimo; explicá-la, não.

**O que os dados dizem com clareza:** posição 77,9 e **zero cliques nas duas**. Não existe ativo de SEO a preservar aqui. Existe um candidato que o Google está testando.

**Decisão e critério.** Nenhum redirect agora. E quando a decisão chegar, o critério **não** é "qual das duas ganhou 505 impressões" — é:

> **Qual das duas páginas conseguimos transformar na melhor resposta para "agencia de IA / agencia de inteligencia artificial"?**

A preferência atual do Google é um desempate, não o critério. A ordem correta é: escolher qual fica → reescrever para valer → medir 60 dias → então redirecionar a outra. Consolidar duas páginas fracas produz uma página fraca.

### 5.2 Desindexar (manter no ar, tirar do índice e do menu)

- Páginas de proposta privada (`marfa-fase-2`, `propuesta-kpmg`, `propuesta-automatizacion-ia`, `proposta-technical-partner`, `pablo-tovar`, `sandra-g-design`, `rapiplaga`, `salao-malaga`, `salones-lume`, `roadmap-datadicoco`, `agencia-lanza-ghl`, `desafio-de-60-dias`) — já estão `noindex,nofollow` segundo a memória do projeto; **verificar** que continuam após o redeploy, dado o code smell conhecido em `BaseLayout.astro` L45-49 que inverte `noindex→index` em produção.
- `/es/admin/segunda-factura-ia/` — confirmar `noindex`.

### 5.3 Home — nova definição

| Elemento | Hoje | Proposto |
|---|---|---|
| **Intenção primária** | "agencia de IA y marketing digital" (genérico) + "auditoría tecnológica" (sem demanda) | **Categoria ampla + entidade.** A home sinaliza uma categoria comercial — *integración y automatización de sistemas para empresas* — sem disputar nenhuma keyword que já seja primária de uma página filha. Não é "sem alvo"; é um alvo de categoria, um nível acima dos filhos. |
| **Keyword de apoio** | — | `ia para empresas` (c, CPC €17,70) e `inteligencia artificial para empresas` (c). **Não** `integración de sistemas` nem `automatización de procesos` — essas são primárias de páginas filhas (regra 1 do §7). |
| **Title** | `IA Operators \| Agencia de IA y marketing digital` | `IA Operators \| Integración y automatización de sistemas con IA` — **sem cumplimiento**: o title diz o que a marca é de forma permanente (core evergreen); a cláusula regulatória vive no H1, que é trocável quando a onda passar. Decisão aprovada em 10/ago/2026; detalhe em `docs/home-propuesta-2026-08.md`. |
| **H1** | `Automatizamos, posicionamos y hacemos crecer tu empresa con IA.` (duplicado no DOM) | `Conectamos y automatizamos los sistemas que tu empresa ya tiene — y los ponemos en regla.` (**texto único**, quebra visual só por CSS) |
| **Meta description** | genérica | `Integramos ERP, TPV, e-commerce y CRM con IA, y adaptamos tus sistemas a Verifactu y a la Ley 10/2025. Implementación técnica, no asesoría.` |
| **Ordem das seções** | hero → Ley 10/2025 → parque tecnológico → auditoría → servicios → implementación | hero → problema (parque tecnológico) → **os 3 silos como três portas** → metodología → casos → especialista → FAQ → CTA |
| **Bloco Ley 10/2025** | logo abaixo do hero | vira **um dos três cards de silo**, não uma seção própria acima da proposta |

Isto atende à crítica central da auditoria (a home é temáticamente dispersa) **sem** apostar num alvo de busca inexistente.

### 5.4 Política de idiomas

| Tipo de página | ES | EN | PT |
|---|---|---|---|
| Home | ✅ | ✅ | ✅ |
| Silo cumplimiento | ✅ | ❌ | ❌ |
| Silo integración | ✅ | parcial — 1 página (`/en/services/system-integration/`) | ❌ |
| Silo servicios (catálogo) | ✅ | parcial — 2 páginas (`ai-automation-agency`, `custom-ai-development`); o resto do catálogo **não** se traduz | **congelar** — não criar novas. Revisão em 6 meses pela pergunta **"esta página tem função real para quem chega de PT/BR?"**, não por contagem de impressões (ver §11) |
| Programáticas de cidade | ✅ | ❌ | ❌ |
| Blog | ✅ | ✅ | ✅ (mantém — é o ativo de autoridade PT/BR) |
| Institucional | ✅ | ✅ | ✅ |

**Armadilha técnica a respeitar** (já verificada em produção): `BaseLayout.astro` gera `hreflang` para os três locales por padrão. Toda página ES-only **precisa** passar `alternates={[{lang:"es",href:pageUrl}]}` **e** `xDefaultUrl={pageUrl}`.

---

## 6. Mapa completo intenção → URL

Legenda de prioridade: **P0** = fazer antes de tudo · **P1** = próximo trimestre · **P2** = quando houver folga.

> **Quais faixas foram medidas e quais são estimativa.** Foram **medidas no Planner** as faixas de: `verifactu`, `factura electrónica`, `ticketbai`, `facturación electrónica obligatoria`, `api verifactu`, `verifactu erp`, `integrar verifactu`, `homologacion verifactu`, todas as variantes de `ley … atención al cliente`, `normativa atención al cliente`, `gestión de reclamaciones`, `call center para empresas`, `integración de sistemas`, `integracion erp`, `erp para pymes`, `crm para empresas`, `whatsapp business api`, `centralita virtual`, `chatbot para empresas`, `agente(s) de ia`, `ia para empresas`, `n8n`, `zapier`, `automatización`, `automatización de procesos`, `agencia de inteligencia artificial`, `agencia de ia`, `consultoría inteligencia artificial`, `software a medida`, `consultoría tecnológica`, `transformación digital`, `auditoria seguridad informatica`, e todo o cluster de agência.
> São **estimativa por analogia com a cauda do mesmo cluster** (não medidas isoladamente): `sanciones verifactu`, `verifactu cuando entra en vigor`, `verifactu tpv`, `verifactu ecommerce`, `verifactu software vertical`, `sla atención al cliente`, `auditoría atención al cliente`, `auditoría informática`, `integración de api`, `facturae`.
> Nas tabelas do §6, **ᵉ** ao lado da faixa marca estimativa não medida. As estrelas ★ da árvore do §4 correspondem a: ★★★ = P0 crítico · ★★ = P0/P1 · ★ = P1/P2; **a coluna "Prio" do §6 é a que vale** em caso de divergência.
> `ley 10/2025` **não é mensurável no Planner** — a barra é caractere inválido no campo de sementes. Tratá-la como termo de conteúdo, não como alvo verificável.

### 6.1 Silo 1 — Cumplimiento (ES-only)

| URL | KW primária | Faixa | KWs secundárias | Intenção | Tipo | Title proposto | H1 proposto | Prio |
|---|---|---|---|---|---|---|---|---|
| `/es/cumplimiento/` (hub) | `cumplimiento normativo` | **b** ᵉ | `normativa digital empresas`, `obligaciones tecnológicas 2027` | Navegacional | Hub | `Cumplimiento normativo técnico: Verifactu y Ley 10/2025` | `Las obligaciones que se cumplen construyendo, no redactando` | **P0** |
| `/es/cumplimiento/verifactu/` | `verifactu` | **e** | `qué es verifactu`, `reglamento verifactu`, `verifactu que es` | Informacional→Comercial | Pilar | `Verifactu: qué exige y cómo adaptar tu sistema \| IA Operators` | `Verifactu sin migrar de software` | **P0** |
| `/es/cumplimiento/verifactu/api/` | `api verifactu` | **c** (Alta) | `api aeat verifactu`, `web service verifactu` | Transacional | Técnica | `API Verifactu: integración con la AEAT paso a paso` | `Conectar tu sistema a la API de Verifactu` | **P0** |
| `/es/cumplimiento/verifactu/integracion/` | `integrar verifactu` | **b** (+∞) | `adaptar software a verifactu`, `conector verifactu` | Transacional | Serviço | `Integrar Verifactu en tu ERP, TPV o e-commerce` | `Integramos Verifactu en el sistema que ya usas` | **P0** |
| `/es/cumplimiento/verifactu/plazos/` | `verifactu obligatorio` | **b** ᵉ | `verifactu cuando entra en vigor`, `verifactu 2027`, `verifactu autónomos` | Informacional | Referência | `Plazos de Verifactu: 1/1/2027 y 1/7/2027` | `Cuándo te obliga Verifactu` | **P0** |
| `/es/cumplimiento/verifactu/homologacion/` | `homologacion verifactu` | **b** (emergente) | `declaración responsable verifactu`, `software homologado verifactu` | Informacional→Comercial | Referência **que corrige a premissa** | `¿Existe homologación Verifactu? Certificación y declaración responsable` | `Verifactu no se "homologa" ante la AEAT: así funciona la declaración responsable` | P1 |
| `/es/cumplimiento/verifactu/sanciones/` | `sanciones verifactu` | **b** ᵉ | `multa verifactu`, `art 201 bis` | Informacional | Referência | `Sanciones de Verifactu: 50.000 € y 150.000 €` | `El régimen sancionador, en concreto` | P1 |
| `/es/cumplimiento/verifactu/test/` | — | — | — | Conversão | Ferramenta | `Test: ¿te obliga Verifactu y qué te falta?` | `Comprueba en 2 minutos si tu sistema cumple` | **P0** |
| `…/verifactu/erp-a-medida/` | `verifactu erp` | **b** (Alta) | `erp a medida verifactu` | Transacional | Caso | *(existe — revisar title para incluir `verifactu erp`)* | — | **P0** |
| `…/verifactu/tpv-multitienda/` | `verifactu tpv` | **b** ᵉ | `tpv verifactu` | Transacional | Caso | *(existe)* | — | P1 |
| `…/verifactu/ecommerce-propio/` | `verifactu ecommerce` | **b** ᵉ | `prestashop verifactu`, `woocommerce verifactu` | Transacional | Caso | *(existe)* | — | P1 |
| `…/verifactu/software-vertical/` | `verifactu software vertical` | **b** ᵉ | — | Transacional | Caso | *(existe)* | — | P2 |
| `/es/cumplimiento/ley-atencion-al-cliente/` | `ley de atención al cliente` | **c** (+900%) | `ley atención al cliente`, `nueva ley de atención al cliente`, `ley 10/2025`, `ley de atención a la clientela` | Informacional→Comercial | Pilar | `Ley 10/2025 de atención al cliente: qué exige y cómo cumplirla` | `La ley de atención al cliente, traducida a sistemas` | **P0** |
| `…/ley-atencion-al-cliente/plazos-y-sla/` | `sla atención al cliente` | **b** ᵉ | `3 minutos atención al cliente`, `15 días reclamaciones` | Informacional | Referência | `Los SLA de la Ley 10/2025: 3 min, 15 días, 2 h` | `Cada plazo de la ley, y qué sistema lo garantiza` | **P0** |
| `…/ley-atencion-al-cliente/auditoria-acreditada/` | `auditoría atención al cliente` | **b** ᵉ | `entidad acreditada enac` | Informacional | Referência | `Auditoría de la Ley 10/2025: requisitos y acreditación ENAC` | `La audita una empresa acreditada por ENAC, no la ENAC` | P1 |
| `…/ley-atencion-al-cliente/{5 setores}/` | `ley atención al cliente {sector}` (5 primárias distintas: `… energía`, `… transporte de viajeros`, `… servicios postales`, `… telecomunicaciones`, `… servicios financieros`) | **b** ᵉ | — | Comercial | Setorial | *(existem)* | — | mantido |
| `…/ley-atencion-al-cliente/test/` | — | — | — | Conversão | Ferramenta | *(existe)* | — | mantido |
| `/es/cumplimiento/factura-electronica-b2b/` | `factura electronica obligatoria` | **d** | `crea y crece`, `factura electrónica b2b`, `rd 238/2026` | Informacional→Comercial | Pilar | `Factura electrónica B2B obligatoria: qué exige el RD 238/2026` | `La factura electrónica B2B, sin cambiar de ERP` | P1 |
| `…/factura-electronica-b2b/formatos/` | `facturae` | **b** ᵉ | `ubl`, `formato factura electrónica` | Informacional | Referência | `Facturae, UBL y los formatos admitidos` | `Qué formato tienes que emitir` | P2 |

### 6.2 Silo 2 — Integración y automatización (ES; 3 páginas também em EN)

| URL | KW primária | Faixa | CPC topo | KWs secundárias | Intenção | Title proposto | Prio |
|---|---|---|---|---|---|---|---|
| `/es/integracion/` | `integración de sistemas` | **c** | €5,93 | `integración de aplicaciones`, `sistema integral de gestion` | Comercial | `Integración de sistemas para empresas \| IA Operators` | **P0** |
| `/es/integracion/erp/` | `integracion erp` | **c** | €15,81 | `erp para pymes`, `soluciones erp`, `conectar erp` | Comercial | `Integración de ERP: conectar tu ERP con lo demás` | **P0** |
| `/es/integracion/crm/` | `crm para empresas` | **c** | €28,67 | `crm pymes`, `crm para inmobiliarias` | Comercial | `Integración y automatización de CRM` | P1 |
| `/es/integracion/whatsapp-business-api/` | `whatsapp business api` | **d** | €15,28 | `api de whatsapp business`, `automatizar whatsapp` | Comercial | `WhatsApp Business API: integración y automatización` | **P0** |
| `/es/integracion/api-y-webhooks/` | `integración de api` | **b** | — | `webhooks`, `conectar aplicaciones por api` | Comercial | `Integraciones por API y webhooks a medida` | P1 |
| `/es/integracion/sistemas-legados/` | `software a medida` | **c** | €8,31 | `modernizar sistema legado`, `desarrollo a medida` | Comercial | `Integrar sistemas legados sin reemplazarlos` | P2 |
| `/es/integracion/auditoria-de-sistemas/` | `auditoría informática` | **b** ᵉ | — (não medido; o termo vizinho `auditoria seguridad informatica` é **c** a €10,41 e `auditoria ciberseguridad` **c** a €48,07) | `radiografía digital`, `auditoría de sistemas`, `auditoria seguridad informatica` | Comercial | `Auditoría de sistemas (Radiografía Digital)` | P1 (mover) |
| `/en/services/system-integration/` | `system integration` | **d** | €20,75 | `system integration services`, `crm integration` | Comercial | `System Integration Services \| IA Operators` | P1 |

### 6.3 Silo 3 — Servicios / agencia (ES)

| URL | KW primária | Faixa | CPC topo | Intenção | Ação | Prio |
|---|---|---|---|---|---|---|
| `/es/servicios/` | — | — | — | Navegacional | Manter (hub) | — |
| `/es/servicios/agentes-de-ia/` | `agentes de ia` | **d** (+900%) | €8,23 | Comercial | **Criar** | **P0** |
| `/es/servicios/automatizacion-ia/` | `automatización de procesos` | **c** | €5,02 | Comercial | Manter; adicionar `automatización inteligente`, `rpa` | — |
| `/es/servicios/chatbots/` | `chatbot para empresas` | **c** | €17,29 | Comercial | Manter | — |
| `/es/servicios/agencia-ia/` | `agencia de inteligencia artificial` | **c** | €4,50 | Comercial | Manter; consolidação com `/es/agencia-de-ia/` **pendente** de reescrita + 60 dias de medição (§5.1-bis) | P1 |
| `/es/servicios/consultoria-ia/` | `consultoría inteligencia artificial` | **c** | €6,08 | Comercial | Manter como URL independente (fusão cancelada pela SERP, §3.1); acentuar a linguagem corporativa que a SERP dela mostra | P2 |
| `/es/servicios/agencia-seo/` | `agencia seo` | **d** | €8,28 | Comercial | Manter | — |
| `/es/servicios/diseno-web/` | `diseño web` | **d** | €4,99 | Comercial | Manter | — |
| `/es/servicios/marketing-digital/` | `marketing digital` | **e** | €8,65 | Comercial | Manter; ceder `posicionamiento web` para `agencia-seo` | — |
| `/en/services/ai-automation-agency/` | `ai automation agency` | **d** | €14,59 | Comercial | **Criar** | P1 |
| `/en/services/custom-ai-development/` | `custom ai development` | **c** | €42,88 | Comercial | **Criar** | P2 |

### 6.3-bis Páginas transversais (fora dos silos)

| URL | KW primária | Faixa | Intenção | Papel | Prio |
|---|---|---|---|---|---|
| `/es/` (home) | categoria ampla: *integración y automatización de sistemas* (sem disputar primárias dos filhos) | — | Marca + categoria | Consolida a entidade e distribui autoridade aos 3 silos. GSC: 69 impressões/90d, todas de marca — reescrever não tem risco de perda. Detalhe em §5.3. | **P0** |
| `/en/` (home) | `ai automation agency` (compartilhada com a landing; a home cede o alvo e mantém intenção de marca) | **d** | Navegacional / marca | Reposicionar copy para "AI automation & systems integration" | P1 |
| `/pt/` (home) | — | — | Navegacional / marca | Cartão de entidade. Sem alvo de busca. | P2 |
| `/es/agencia-de-ia/madrid/` | `agencia de ia madrid` | **b** ᵉ | Comercial local | Manter; régua ≥30% único (§7.3) | mantido |
| `/es/agencia-de-ia/barcelona/` | `agencia de ia barcelona` | **b** ᵉ | Comercial local | Manter | mantido |
| `/es/agencia-de-ia/valencia/` | `agencia de ia valencia` | **b** ᵉ | Comercial local | Manter | mantido |
| `/es/sobre/`, `/es/autores/…`, `/es/portfolio/`, `/es/contact/` | — | — | Institucional / E-E-A-T | Inalterado; `/es/metodologia/` é absorvida por `/es/sobre/` (§5.1) | — |
| `/{locale}/blog/` | — | — | Informacional | Hub editorial; pautas em §6.4 | — |

### 6.4 Blog — clusters que alimentam os silos

O blog não persegue conversão; alimenta autoridade e links internos. Prioridade de pauta derivada dos dados:

| Cluster de pauta | Sinal do Planner | Silo que alimenta | Prio |
|---|---|---|---|
| Verifactu na prática (encadenamiento, QR, anulaciones, series) | `verifactu` **e**, cauda em +∞ | Cumplimiento | **P0** |
| n8n (tutoriais, casos, comparações) | `n8n` **e** em ES; 165K/mês no BR | Integración + autoridade PT/BR | **P0** |
| Zapier vs n8n vs Make | `zapier` **e**; cauda `zapier whatsapp`, `zapier odoo`, `zapier precios` | Integración | P1 |
| Ley 10/2025 explicada por setor | cluster **c**, +900% | Cumplimiento | **P0** |
| Agentes de IA em operação real | `agentes de ia` **d**, +900% | Servicios | **P0** |
| ERP: integração, custos, comparações | `erp pymes` **c**, CPC €25 | Integración | P1 |
| WhatsApp Business API (custos, limites, casos) | `whatsapp business api` **d**, CPC €15,28 | Integración | P1 |
| Factura electrónica B2B / Crea y Crece | `facturación electrónica obligatoria` **d** | Cumplimiento | P1 |

---

## 7. Regras anti-canibalização

Estas regras entram como convenção do repositório, para que a próxima página não recrie o problema:

1. **Uma keyword primária, um URL.** A keyword primária de cada página é declarada em `src/data/keywords-primarias.ts` e não pode se repetir. O gate de CI (`npm run check:keywords`, ligado ao `build`) tem dois níveis:
   - **Duplicata exata → falha o build.** Proteção contra erro editorial.
   - **Similaridade alta → aviso.** Pares como `agencia de ia` / `agencia de inteligencia artificial` são marcados para revisão humana, mas não bloqueiam. Decidir se duas keywords são a mesma intenção exige olhar SERP e Search Console — um script não faz essa análise, e forçá-lo a decidir produziria consolidações erradas como a de §5.1-bis. Hierarquia pilar→filho (`ley atención al cliente` vs `… energía`) e irmãos que só diferem no qualificador (`… madrid` vs `… barcelona`) não geram aviso.
2. **Se duas páginas compartilham a SERP, é uma página.** Critério prático: se os 10 primeiros resultados coincidem em ≥6 posições entre duas keywords, elas pertencem à mesma página. **A régua vale nos dois sentidos** — foi ela que salvou `consultoria-ia` de uma fusão desnecessária (§3.1). Medir antes de fundir. E a SERP é só metade: o **Search Console decide a direção** do redirect (§5.1-bis).
3. **Conteúdo único: percentual é QA interno, não critério de SEO.** O Google não define percentual mínimo de originalidade; o critério dele é se a página oferece **valor substancial próprio**. Os limiares internos (≥40% em páginas de template de silo, ≥30% nas programáticas locais) continuam como *checklist de revisão*, mas **não decidem** se a página existe. O teste que decide é substantivo:
   - Página de template de silo: *o que esta página responde que o pilar não responde?*
   - Programática local: ***por que alguém de Madrid deveria preferir esta página à nacional?*** Precisa haver matéria local real — casos, clientes, disponibilidade, contexto regional, prova. Trocar a cidade e reescrever alguns parágrafos é exatamente o padrão que o Google classifica como **doorway**. Se a resposta for só "porque a keyword tem a cidade", a página não deve existir.
4. **Regra do menu:** um cluster aparece no menu uma vez. Se está no hub `/servicios/`, não aparece também na raiz.
5. **Cauda longa é seção, não página — salvo se tiver página de referência própria.** `qué es verifactu` e `reglamento verifactu` são H2 dentro do pilar. `verifactu 2027` e `verifactu autónomos` **são** secundárias legítimas de `/verifactu/plazos/`, porque essa página existe justamente para responder "quando" — o que o pilar não faz em profundidade. A regra é: só ganha URL própria a cauda que tem uma **pergunta distinta** por trás, não a que é sinônimo do head.
6. **Title do pilar leva o head term nu.** Os filhos levam head term + modificador. Nunca dois titles com o mesmo termo nu.
7. **Âncoras são descritivas, não exatas.** O Google pede texto de âncora descritivo, conciso e relevante para origem e destino — não correspondência exata. `consulta nuestra guía para integrar Verifactu en un ERP` é melhor que repetir `integrar verifactu` toda vez. Variedade natural; nada disso entra no CI.

---

## 8. Linking interno

**Os silos organizam a hierarquia, não proíbem links.** O Google entende a estrutura do site pelas relações entre páginas e recomenda linkar conteúdo relevante em contexto. **Cross-silo é permitido sempre que houver relação semântica e utilidade para o leitor** — quem lê `/es/integracion/whatsapp-business-api/` e vai encontrar a aplicação regulatória em `/es/cumplimiento/ley-atencion-al-cliente/` deve ter esse link. O que as regras abaixo garantem é o *mínimo* de estrutura, não um teto:

- **Home** → 3 cards de silo (`/es/cumplimiento/`, `/es/integracion/`, `/es/servicios/`) + 2 links diretos para os pilares `verifactu` e `ley-atencion-al-cliente`.
- **Hub de silo** → todos os seus filhos, com âncora descritiva e semanticamente clara; a keyword primária pode aparecer naturalmente, mas não é obrigatória.
- **Pilar** → seus próprios filhos (casos, setoriais, referências, teste) + 1 link lateral ao hub do silo.
- **Filho** → volta ao pilar (breadcrumb + link in-content) + 1–2 irmãos relevantes.
- **Cruzamento entre silos:** livre quando ajudar o leitor. A ponte mais importante — e que deve existir sempre — é `/es/cumplimiento/verifactu/integracion/` → `/es/integracion/erp/`, que leva do gatilho regulatório ao serviço de ticket maior.
- **Blog** → sempre ao menos 1 link in-content para o pilar do silo correspondente, com âncora descritiva (não exata).

**Dívidas de linking já identificadas em memória e que este plano absorve:**
- Faltam links in-content do blog para `diseno-web`, `agencia-seo`, `marketing-digital`, `agencia-ia` (faltam posts-âncora).
- Faltam os 2 posts-âncora do Sprint 3 da Ley 10/2025.
- `llms.txt` pendente.

---

## 9. Correções técnicas herdadas da auditoria (executar junto)

Estas não são arquitetura, mas devem entrar no mesmo ciclo porque tocam os mesmos arquivos:

| # | Correção | Onde | Prio |
|---|---|---|---|
| 1 | `Organization.logo` aponta para `favicon-32x32.png` — Google exige ≥112×112. Trocar por logo 512×512. | `src/data/identidad.ts` | 🔴 |
| 2 | Remover `potentialAction`/`SearchAction` do `WebSite` (URL malformada com `//` e `{locale}` não substituído; e o Sitelinks Search Box foi descontinuado). | `BaseLayout.astro` | 🟠 |
| 3 | `<main>` aninhado (dois `<main>`). Deixar um. | layout da home | 🟠 |
| 4 | H1 com texto duplicado no DOM (dois spans idênticos para desktop/mobile). Um texto, quebra por CSS. | hero da home | 🟠 |
| 5 | `alt="Logo 1..5"` no carrossel. Ou nome da marca, ou `alt=""` + `aria-hidden` nos clones. | seção de tecnologias | 🟡 |
| 6 | Validar reciprocidade de `hreflang` entre `/es/`, `/en/`, `/pt/` — e garantir que as páginas ES-only só declaram `es` + `x-default`. | `BaseLayout.astro` | 🟠 |
| 7 | Code smell em `BaseLayout.astro` L45-49 que inverte `noindex→index` em produção — confirmar que as propostas privadas seguem fora do índice. | `BaseLayout.astro` | 🔴 |
| 8 | Cloudflare → Scrape Shield → **Email Address Obfuscation OFF** (pendência da auditoria SEMrush: mata 93 broken internal links, sem deploy). | painel Cloudflare | 🔴 |
| 9 | `FAQPage` JSON-LD: manter, mas não investir tempo (rich result restrito desde 2023). O FAQ em HTML fica. | landings | 🟢 |

---

## 10. Sequenciamento

### Sprint 0 — Evidência antes de qualquer mudança de URL ★ BLOQUEANTE
**Nenhum 301, nenhuma fusão e nenhuma desindexação antes disto.** Uma página com demanda de mercado residual pode estar capturando cauda longa que o Keyword Planner não mostra — e a direção de um redirect só se decide com dados de quem já ranqueia.

Para cada URL candidata a mover, fundir ou desindexar, extrair do Search Console:
0.1 Queries, impressões, cliques e posição média (12–16 meses quando houver histórico).
0.2 Quais URLs concorrem pela mesma query.
0.3 Estado de indexação e canonical efetivo (Inspeção de URL).
0.4 Backlinks relevantes apontando para a URL.
0.5 Só então decidir: consolidar, reescrever, manter ou remover — **e em que direção**.

> **Executado em 09/ago/2026** para as URLs candidatas (§5.1-bis e §10-bis). Resultado imediato: um redirect já implementado teve de ser revertido, porque a direção estava invertida. **Falta ainda:** backlinks por URL, canonical efetivo (Inspeção de URL) e histórico de 12–16 meses. Isso deve estar feito antes do Sprint C.

#### 10-bis. Resultado do Sprint 0 (GSC, 90 dias, 09/ago/2026)

| URL | Impressões | Cliques | Queries que captura | Leitura |
|---|---|---|---|---|
| `/es/` (home) | 69 | **0** | `ia operator` (11) · `operator ia` (10) · `operadores ia` (2) · `operator` (2) · `operaitor`, `operator lt`, `aioperator` (1 cada) · **`orquestadores de ia`** (1) | **Só marca.** Zero pegada semântica não-branded em 90 dias. O title atual não comprou nenhuma visibilidade fora do nome. Reescrever Title/H1 **não tem risco de perda** — não há o que preservar. |
| `/es/agencia-de-ia/` | 505 | 0 | `agencia de ia` (146) · `agencia de inteligencia artificial` (119) · `agencia ia` (51) · `agencia con ia` (43) · `agencias ia` (39) · `agencia de asistentes de inteligencia artificial` (35) · `agencia de ia en españa` (20) | Candidato em teste, posição 77,9. |
| `/es/servicios/agencia-ia/` | 7 | 0 | `agencia con ia` (4) · `agencia ia` (2) · `consultoría agentes ia` (1) | **Divide queries com a de cima** → canibalização confirmada. |
| `/es/roadmap-tecnologico/` | 17 | 0 | `roadmap tecnológico empresa` (15) · `roadmap tecnologico` (2) | Residual. |
| `/es/blog/que-es-un-roadmap-tecnologico/` | **1.124** | 1 | — | **A intenção "roadmap tecnológico" é informacional, não de landing comercial.** O post funciona; a landing não. |
| `/es/auditoria-de-sistemas/` | **0** | 0 | **Nenhum dado** | Não tem pegada orgânica nenhuma. Mover é indolor. |
| `/es/blog/auditoria-de-sistemas-tecnologicos/` | 512 | 1 | — | Mesmo padrão do roadmap: o valor está no post. |
| `/es/metodologia/` | 8 | 0 | — | Residual. |
| `/es/servicios/consultoria-ia/` | ~0 | 0 | não aparece | Sem pegada. A decisão de mantê-la (§3.1) se apoia na SERP, não no GSC. |

**Padrão que emerge e que muda o desenho:** nos dois temas em que existe post e landing, quem tem visibilidade é o **post** (1.124 e 512) e não a landing (17 e 0). Isso valida em campo a separação do plano entre intenção informacional e intenção comercial. O fluxo correto é:

> **post informacional forte → hub `/es/integracion/` → página de serviço**

E não tentar transformar `roadmap tecnológico` numa landing pesquisável. **Antes de qualquer 301**, os links in-content desses dois posts precisam ser reapontados para o destino final, senão a migração corta o único caminho que hoje funciona.

### Sprint A — Fundação e desbloqueio (semana 1)
1. Correções técnicas #1, #7, #8 (as três de prioridade 🔴).
2. ~~Redirect 301 `/es/agencia-de-ia/`~~ — **revertido em 09/ago/2026**; a decisão passa para depois da reescrita (§5.1-bis). O de `consultoria-ia` já tinha sido cancelado pela verificação de SERP (§3.1).
3. Nova home (copy aprovado em 10/ago/2026): title `IA Operators | Integración y automatización de sistemas con IA`, H1 com a cláusula "— y los ponemos en regla" (texto único no DOM, com o subtítulo ancorando "en regla" em Verifactu + Ley 10/2025), meta terminando em "De la estrategia a producción.", 3 portas, caso quantitativo (1–2 h → ~3 min por solicitação, ~80/semana em pico).
3-bis. **Hub MVP `/es/integracion/` antecipado para o Sprint A** — só o hub, sem filhos e sem redirects, para a porta 1 da home nascer apontando ao destino definitivo. O Sprint C completa filhos e 301 sem trocar o destino da home.
4. Script de verificação de keyword primária duplicada no CI.

### Sprint B — Silo Verifactu (semanas 2–4) ★ maior retorno
5. `/es/cumplimiento/verifactu/api/`, `/integracion/`, `/plazos/`.
6. Teste `/es/cumplimiento/verifactu/test/` (reaproveitando `src/lib/assessment/` já parametrizado por `assessmentKey`).
7. Revisar titles dos 4 casos existentes para incluir a cauda (`verifactu erp`, `verifactu tpv`, `verifactu ecommerce`).
8. 3 posts de blog do cluster Verifactu, com link in-content ao pilar.

> Racional do sequenciamento: `verifactu` tem 10K–100K buscas/mês e o ramp reinicia no T4/2026. Cada semana de atraso é indexação e maturação de conteúdo que não acontece antes da onda.

### Sprint C — Fecho dos P0 (semanas 5–6)
9. `/es/cumplimiento/ley-atencion-al-cliente/plazos-y-sla/` (P0 — o último P0 pendente do silo 1).
10. Hub `/es/integracion/` absorvendo o conteúdo de roadmap + implementación + metodología, com os 301 (P0).
11. `/es/integracion/erp/` e `/es/integracion/whatsapp-business-api/` (P0).
12. `/es/servicios/agentes-de-ia/` (P0).

### Sprint D — P1 e higiene técnica (semanas 7–9)
13. `/es/cumplimiento/verifactu/homologacion/` e `/es/cumplimiento/verifactu/sanciones/`.
14. `/es/cumplimiento/ley-atencion-al-cliente/auditoria-acreditada/`.
15. Mover `auditoria-de-sistemas` para dentro do silo com 301.
16. Casos `tpv-multitienda` e `ecommerce-propio` revisados.
17. Os 2 posts-âncora pendentes do Sprint 3 da Ley 10/2025.
18. Correções técnicas #2 a #6.

### Sprint E — Expansão (trimestre seguinte)
19. Pilar `/es/cumplimiento/factura-electronica-b2b/` e, depois, `/formatos/`.
20. As 3 landings EN (`ai-automation-agency`, `system-integration`, `custom-ai-development`) + reposicionamento da home EN.
21. `/es/integracion/crm/`, `/api-y-webhooks/`, `/sistemas-legados/`.
22. Caso `software-vertical` revisado.
23. `llms.txt` + auditoria de linking interno.

> Toda página listada no §6 aparece em exatamente um sprint. Nenhum item P1 precede um P0.

---

## 11. Métricas e critérios de decisão

| Métrica | Baseline (jul/2026) | Meta 6 meses | Onde medir |
|---|---|---|---|
| Impressões orgânicas do silo `/es/cumplimiento/` | **~65/90 dias** (medido 09/ago/2026: `verifactu/tpv-multitienda` 52, `verifactu/erp-a-medida` 7, `ley-atencion-al-cliente` 4, +1 clique) | > 1.500/mês aos 6 meses | Search Console → filtro por prefixo `/es/cumplimiento/` |
| Posição média de `verifactu` + cauda de integração | não ranqueia | top 20 na cauda (`api verifactu`, `integrar verifactu`) | Search Console |
| Leads qualificados/mês dos testes (SAC + Verifactu) | 0 | ≥ 8 | Supabase `assessment_responses` |
| Taxa de conclusão dos testes | — | > 45% | evento `assessment_completed` |
| Domínios de referência | 36 (medido em jul/2026 via SEMrush) | ≥ 60 | SEMrush/Ahrefs quando houver plano; enquanto isso, contagem manual da campanha de diretórios |
| Páginas com ≥1 impressão/mês | **121 URLs com impressão em 90 dias** (medido 09/ago/2026) | > 180 | Search Console (UI) |
| Total do site (90 dias) | **75 cliques · 16,8 mil impressões · CTR 0,4% · posição média 18,8** | CTR > 1% | Search Console (UI) |

**Critérios de decisão (gatilhos, não opiniões):**
- Em **6 meses**, revisar as landings PT de serviço pela pergunta **"esta página tem função real para quem chega de PT/BR?"**. Se tiver (é destino de campanha, de link, de proposta), fica indexável mesmo gerando pouco. Se for tradução *thin* sem função → **consolidar, melhorar ou remover**. `noindex` automático por baixa impressão não é o instrumento certo: ele só esconde o problema.
- Se `api verifactu` + `integrar verifactu` não entrarem no top 30 em **4 meses** com o conteúdo publicado → o gargalo é autoridade, não conteúdo; realocar esforço para link building.
- Se o silo `/es/servicios/` (agência) seguir sem impressões relevantes em **9 meses** → considerar consolidar as 3 landings de agência numa só.

---

## 12. O que este plano ainda não sabe

Registro honesto do que falta medir antes de considerar o plano fechado:

1. **Volumes exatos e KD.** Todas as faixas acima vêm de uma conta Google Ads inativa. Reativar a conta com campanha mínima destrava números exatos; um plano Ahrefs ou units Semrush destrava KD, tráfego potencial e *parent topic*.
2. ~~**Search Console.**~~ **Resolvido em 09/ago/2026.** A API via Ahrefs continua bloqueada, mas a interface está acessível e foi de onde saiu o Sprint 0. Falta ainda: histórico de 12–16 meses, backlinks por URL e canonical efetivo das URLs candidatas a redirect. É a fonte que diria quais páginas já têm impressão e onde há canibalização *real* em vez de teórica.
3. **SERP das novas keywords.** As SERPs de Ley 10/2025 e Verifactu já foram inspecionadas em sessões anteriores (escritórios de advocacia e vendors de software, respectivamente). As de `integracion erp`, `crm para empresas` e `agentes de ia` **não** foram — antes de escrever essas landings vale olhar quem ocupa o top 10.
4. **Core Web Vitals reais.** Continua sem medição, como a própria auditoria reconhece.
5. **Canibalização com o subdomínio** `chatplug.iaoperators.com` — outro projeto, fora do repo, mas compartilha domínio raiz e vocabulário de chatbot/WhatsApp.

---

## 13. O que mudou na revisão 2 (09/ago/2026)

Consolidação da contra-auditoria recebida e dos dados do Search Console. Aceito, com o motivo:

| # | Mudança | Motivo |
|---|---|---|
| 1 | **Sprint 0 vira bloqueante** e vem antes de qualquer 301 | O plano dizia no §12 que faltava o Search Console e mesmo assim sequenciava redirects no Sprint A. Contradição interna. E a evidência provou o ponto: o primeiro 301 estava na direção errada. |
| 2 | **Redirect `/es/agencia-de-ia/` revertido** | GSC: 505 impressões nessa URL contra 7 na de destino. Diagnóstico certo, direção errada. |
| 3 | **Cumplimiento passa de "núcleo" a "wedge de aquisição"**; integración vira o core evergreen | Verifactu e Ley 10/2025 têm data de validade (2026–2027). A marca não pode ficar ancorada num pico regulatório. |
| 4 | **Peso do Keyword Planner reduzido** | `Competition` e `top of page bid` medem o leilão de anúncios, não dificuldade orgânica nem ticket. Passam a ser hipótese comercial. |
| 5 | **Agregado de 1–3K/mês da Ley 10/2025 removido** | O Planner agrupa close variants; somar grafias equivalentes conta a mesma demanda duas vezes. |
| 6 | **`+∞` e `+900%` reformulados** | São teto de escala e ausência de base comparável, não medidas exatas. |
| 7 | **Home ganha alvo de categoria** | "Sem head term" era rigidez desnecessária e contradizia o próprio title proposto. |
| 8 | **Cross-silo liberado no linking** | O Google entende relações entre páginas, não organogramas. A regra anterior era folclore de SEO. |
| 9 | **Âncora exata deixa de ser obrigatória** | O Google pede âncora descritiva e relevante, não correspondência exata. |
| 10 | **Redirects EN/PT em bloco para a home removidos** | Risco de *soft 404*. Decisão passa a ser por página: equivalente semântico, 410, ou manter. |
| 11 | **`noindex` por baixa impressão substituído** | O critério passa a ser função para o usuário, não contagem. |
| 12 | **30%/40% de conteúdo único vira QA interno** | O Google não define percentual. O teste real nas páginas de cidade é o de *doorway*: por que alguém de Madrid preferiria esta página à nacional? |
| 13 | **"out/2027" da factura B2B removido** | O RD 238/2026 difere a aplicação efetiva a 12/24 meses **contados da entrada em vigor de uma ordem ministerial** ainda não publicada. Não há data fixa. Esta correção também vale para o briefing do projeto, que trazia 1/out/2027 e 1/out/2028. |
| 14 | **`/verifactu/homologacion/` reenquadrada** | Não existe homologação prévia pela AEAT: quem certifica é o produtor do software, via declaración responsable. A página passa a corrigir a premissa da busca. |
| 15 | **`/auditoria-enac/` renomeada para `/auditoria-acreditada/`** | A ENAC acredita a entidade auditora; não realiza a auditoria. |

Mantido apesar da crítica:

- **A tese central** (cumplimiento → aquisição, integração → ticket, serviços → cobertura) e a árvore de URLs, preservadas em ~90%.
- **CPC como sinal**, não como prova. Continua sendo a melhor evidência disponível de intenção comercial enquanto não houver KD nem dados de conversão — desde que lida como hipótese.
- **O gate de CI anti-canibalização.** Não impõe âncora nem percentual de texto; só verifica que duas rotas não declaram a mesma keyword primária. Essa parte não é folclore, é higiene.
