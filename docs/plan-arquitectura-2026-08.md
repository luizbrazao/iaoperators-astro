# Plano de arquitetura do site — IA Operators

**Base:** estudo de palavras-chave no Google Ads Keyword Planner (09/ago/2026), conta España, período jul/2025–jun/2026.
**Escopo:** ES prioritário, EN e PT secundários. Inclui o silo `/es/cumplimiento/` já construído.
**Substitui:** a direção estratégica proposta na auditoria SEO anexa (ver §1.3 — a auditoria acerta o diagnóstico e erra o eixo).

---

## 0. Sumário executivo

Três decisões, nesta ordem de importância:

**1. O eixo semântico do site é *integração e cumprimento normativo*, não "agencia de IA" nem "auditoría tecnológica".**
Verifactu sozinho tem **10.000–100.000 buscas/mês** em Espanha. Todo o vocabulário de "auditoría tecnológica / roadmap tecnológico" que hoje ocupa a home, o menu e quatro páginas do site (`auditoria-de-sistemas`, `roadmap-tecnologico`, `implementacion`, `metodologia`) tem demanda **residual** (a auditoria SEMrush de julho mediu ~20 buscas/mês). O site está gastando sua área mais valiosa numa intenção de busca que quase ninguém procura.

**2. O silo `/es/cumplimiento/` deixa de ser um anexo e passa a ser o núcleo do site.**
Hoje ele está enterrado abaixo de dez landings de serviço. Os dois pilares regulatórios (Verifactu e Ley 10/2025) são as únicas páginas do site que combinam demanda mensurável, prazo legal com sanção, e uma SERP onde **ninguém vende a implementação técnica**. É a única vantagem assimétrica defensável com 36 domínios de referência.

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

**Leitura.** Sete variantes na faixa 100–1K cada. O cluster agregado está plausivelmente entre **1.000 e 3.000 buscas/mês** e cresceu ~10× em doze meses. Concorrência paga baixa: os escritórios de advocacia que dominam a SERP não anunciam. A cauda adjacente (`call center para empresas`, `contact center empresas`, `call center omnicanal`, `call center automatizado`, `telemarketing empresas`) está toda na faixa **b**, mas é o vocabulário de quem já entendeu que precisa resolver o problema.

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
| Ley 10/2025 | ~1–3K/mês agregado, +900% | 1 pilar + 5 setoriais + 1 teste |
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
│   ├── ley-atencion-al-cliente/              ← PILAR ★★  (~1–3K/mês, +900% YoY)
│   │   ├── (index)                           ← já existe
│   │   ├── energia-agua-gas/                 ← já existe
│   │   ├── transporte-viajeros/              ← já existe
│   │   ├── servicios-postales/               ← já existe
│   │   ├── telecomunicaciones/               ← já existe
│   │   ├── servicios-financieros/            ← já existe
│   │   ├── test/                             ← já existe
│   │   ├── plazos-y-sla/                     ← NOVO  ★★ (3 min, 15 días, 2h, 5 días)
│   │   └── auditoria-enac/                   ← NOVO  ★  (a auditoria anual)
│   │
│   └── factura-electronica-b2b/              ← NOVO  ★★ PILAR 3 (Crea y Crece, out/2027)
│       ├── (index)
│       └── formatos/                         ← Facturae / UBL / conversão
│
├── integracion/                              ← SILO 2  ★★ NOVO (substitui o trio atual)
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
│   ├── agencia-ia/                           ← já existe  ← recebe o 301 de /agencia-de-ia/
│   ├── consultoria-ia/                       ← FUNDIR em agencia-ia/  (ver §5)
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
| `/es/agencia-de-ia/` (index) | `/es/servicios/agencia-ia/` | **301** | Canibalização direta. Um cluster, um URL. Manter as rotas `/es/agencia-de-ia/{ciudad}/` (intenção local é distinta) e **reapontar o breadcrumb delas para `/es/servicios/agencia-ia/`**, para que nenhum link interno aponte para uma URL que redireciona. As versões `/en/` e `/pt/` dessa rota redirecionam para a home do próprio locale. |
| ~~`/{locale}/servicios/consultoria-ia/`~~ | — | **cancelado** | A hipótese de canibalização **não se confirmou na SERP** (ver §3.1). As duas páginas ficam. O que fazer em vez de fundir: **acentuar a diferença** — `consultoria-ia` fala a linguagem corporativa que a SERP dela mostra (governança, riscos, arquitetura-alvo), `agencia-ia` fala a linguagem de execução. |
| `/es/roadmap-tecnologico/` | `/es/integracion/` (hub) | **301** | Demanda residual. O conteúdo vira uma seção "Del diagnóstico al roadmap" no hub. |
| `/es/implementacion/` | `/es/integracion/` (hub) | **301** | Idem. |
| `/es/metodologia/` | `/es/sobre/` | **301** | Conteúdo de processo, não alvo de busca. Destino único e definido: a página institucional. |
| `/es/auditoria-de-sistemas/` | `/es/integracion/auditoria-de-sistemas/` | **301** | Mantém a página (é a "Radiografía Digital", ativo de outbound), mas dentro do silo certo. |
| `/en/…` e `/pt/…` das quatro rotas acima | `/en/` e `/pt/` (home do respectivo locale) | **301** | O silo `/integracion/` só existe em ES. Redirect **dentro do mesmo locale** — nunca cross-locale, que quebraria hreflang e a expectativa do usuário. |

> ⚠️ **Não apagar conteúdo.** Todo o texto de auditoría/roadmap/implementación é bom material de venda; ele migra para dentro do hub `/integracion/` e das páginas de destino. O que muda é que deixa de ocupar URL e menu próprios.

### 5.2 Desindexar (manter no ar, tirar do índice e do menu)

- Páginas de proposta privada (`marfa-fase-2`, `propuesta-kpmg`, `propuesta-automatizacion-ia`, `proposta-technical-partner`, `pablo-tovar`, `sandra-g-design`, `rapiplaga`, `salao-malaga`, `salones-lume`, `roadmap-datadicoco`, `agencia-lanza-ghl`, `desafio-de-60-dias`) — já estão `noindex,nofollow` segundo a memória do projeto; **verificar** que continuam após o redeploy, dado o code smell conhecido em `BaseLayout.astro` L45-49 que inverte `noindex→index` em produção.
- `/es/admin/segunda-factura-ia/` — confirmar `noindex`.

### 5.3 Home — nova definição

| Elemento | Hoje | Proposto |
|---|---|---|
| **Intenção primária** | "agencia de IA y marketing digital" (genérico) + "auditoría tecnológica" (sem demanda) | **Entidade + ponte.** A home não persegue um head term; ela consolida a entidade `IA Operators` e distribui autoridade para os três silos. |
| **Keyword de apoio** | — | `ia para empresas` (c, CPC €17,70) e `inteligencia artificial para empresas` (c). **Não** `integración de sistemas` nem `automatización de procesos` — essas são primárias de páginas filhas (regra 1 do §7). |
| **Title** | `IA Operators \| Agencia de IA y marketing digital` | `IA Operators \| Automatización, integración de sistemas y cumplimiento normativo` |
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
| Silo servicios (catálogo) | ✅ | parcial — 2 páginas (`ai-automation-agency`, `custom-ai-development`); o resto do catálogo **não** se traduz | **congelar** — não criar novas; avaliar `noindex` nas existentes se ficarem sem impressões em 6 meses |
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
| `/es/cumplimiento/verifactu/homologacion/` | `homologacion verifactu` | **b** (+∞) | `declaración responsable verifactu`, `software homologado` | Informacional→Comercial | Referência | `Homologación y declaración responsable en Verifactu` | `Quién firma la declaración responsable` | P1 |
| `/es/cumplimiento/verifactu/sanciones/` | `sanciones verifactu` | **b** ᵉ | `multa verifactu`, `art 201 bis` | Informacional | Referência | `Sanciones de Verifactu: 50.000 € y 150.000 €` | `El régimen sancionador, en concreto` | P1 |
| `/es/cumplimiento/verifactu/test/` | — | — | — | Conversão | Ferramenta | `Test: ¿te obliga Verifactu y qué te falta?` | `Comprueba en 2 minutos si tu sistema cumple` | **P0** |
| `…/verifactu/erp-a-medida/` | `verifactu erp` | **b** (Alta) | `erp a medida verifactu` | Transacional | Caso | *(existe — revisar title para incluir `verifactu erp`)* | — | **P0** |
| `…/verifactu/tpv-multitienda/` | `verifactu tpv` | **b** ᵉ | `tpv verifactu` | Transacional | Caso | *(existe)* | — | P1 |
| `…/verifactu/ecommerce-propio/` | `verifactu ecommerce` | **b** ᵉ | `prestashop verifactu`, `woocommerce verifactu` | Transacional | Caso | *(existe)* | — | P1 |
| `…/verifactu/software-vertical/` | `verifactu software vertical` | **b** ᵉ | — | Transacional | Caso | *(existe)* | — | P2 |
| `/es/cumplimiento/ley-atencion-al-cliente/` | `ley de atención al cliente` | **c** (+900%) | `ley atención al cliente`, `nueva ley de atención al cliente`, `ley 10/2025`, `ley de atención a la clientela` | Informacional→Comercial | Pilar | `Ley 10/2025 de atención al cliente: qué exige y cómo cumplirla` | `La ley de atención al cliente, traducida a sistemas` | **P0** |
| `…/ley-atencion-al-cliente/plazos-y-sla/` | `sla atención al cliente` | **b** ᵉ | `3 minutos atención al cliente`, `15 días reclamaciones` | Informacional | Referência | `Los SLA de la Ley 10/2025: 3 min, 15 días, 2 h` | `Cada plazo de la ley, y qué sistema lo garantiza` | **P0** |
| `…/ley-atencion-al-cliente/auditoria-enac/` | `auditoría atención al cliente` | **b** ᵉ | `entidad acreditada enac` | Informacional | Referência | `La auditoría anual ENAC de la Ley 10/2025` | `Qué te va a pedir el auditor` | P1 |
| `…/ley-atencion-al-cliente/{5 setores}/` | `ley atención al cliente {sector}` (5 primárias distintas: `… energía`, `… transporte de viajeros`, `… servicios postales`, `… telecomunicaciones`, `… servicios financieros`) | **b** ᵉ | — | Comercial | Setorial | *(existem)* | — | mantido |
| `…/ley-atencion-al-cliente/test/` | — | — | — | Conversão | Ferramenta | *(existe)* | — | mantido |
| `/es/cumplimiento/factura-electronica-b2b/` | `factura electronica obligatoria` | **d** | `crea y crece`, `factura electrónica b2b`, `ley 18/2022` | Informacional→Comercial | Pilar | `Factura electrónica B2B obligatoria: plazos y formato` | `La factura electrónica B2B, sin cambiar de ERP` | P1 |
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
| `/es/servicios/agencia-ia/` | `agencia de inteligencia artificial` | **c** | €4,50 | Comercial | Manter + absorver `consultoria-ia` + receber 301 de `/agencia-de-ia/` | **P0** |
| `/es/servicios/agencia-seo/` | `agencia seo` | **d** | €8,28 | Comercial | Manter | — |
| `/es/servicios/diseno-web/` | `diseño web` | **d** | €4,99 | Comercial | Manter | — |
| `/es/servicios/marketing-digital/` | `marketing digital` | **e** | €8,65 | Comercial | Manter; ceder `posicionamiento web` para `agencia-seo` | — |
| `/en/services/ai-automation-agency/` | `ai automation agency` | **d** | €14,59 | Comercial | **Criar** | P1 |
| `/en/services/custom-ai-development/` | `custom ai development` | **c** | €42,88 | Comercial | **Criar** | P2 |

### 6.3-bis Páginas transversais (fora dos silos)

| URL | KW primária | Faixa | Intenção | Papel | Prio |
|---|---|---|---|---|---|
| `/es/` (home) | — (entidade, sem head term próprio) | — | Navegacional / marca | Consolida a entidade e distribui autoridade aos 3 silos. Detalhe em §5.3. | **P0** |
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

1. **Uma keyword primária, um URL.** A keyword primária de cada página é declarada num campo do arquivo de dados (`src/data/*.ts`) e não pode se repetir. Um script de verificação no CI falha se houver duplicata.
2. **Se duas páginas compartilham a SERP, é uma página.** Critério prático: se os 10 primeiros resultados coincidem em ≥6 posições entre duas keywords, elas pertencem à mesma página. **A régua vale nos dois sentidos** — foi ela que salvou `consultoria-ia` de uma fusão desnecessária (§3.1). Medir antes de fundir.
3. **Conteúdo único mínimo por página nova:** **≥40%** para páginas de silo geradas a partir de um template (setoriais da Ley 10/2025, casos de Verifactu — a régua já aplicada, medida em 47–51%); **≥30%** para as programáticas locais `/agencia-de-ia/{ciudad}/`, onde o template é mais rígido por natureza e a régua vigente já é essa. Sem matéria própria acima do limiar, não se cria a página — vira seção.
4. **Regra do menu:** um cluster aparece no menu uma vez. Se está no hub `/servicios/`, não aparece também na raiz.
5. **Cauda longa é seção, não página — salvo se tiver página de referência própria.** `qué es verifactu` e `reglamento verifactu` são H2 dentro do pilar. `verifactu 2027` e `verifactu autónomos` **são** secundárias legítimas de `/verifactu/plazos/`, porque essa página existe justamente para responder "quando" — o que o pilar não faz em profundidade. A regra é: só ganha URL própria a cauda que tem uma **pergunta distinta** por trás, não a que é sinônimo do head.
6. **Title do pilar leva o head term nu.** Os filhos levam head term + modificador. Nunca dois titles com o mesmo termo nu.

---

## 8. Linking interno

**Regra de silo (fluxo descendente e lateral, nunca cruzado entre silos exceto pela home e pelo blog):**

- **Home** → 3 cards de silo (`/es/cumplimiento/`, `/es/integracion/`, `/es/servicios/`) + 2 links diretos para os pilares `verifactu` e `ley-atencion-al-cliente`.
- **Hub de silo** → todos os seus filhos, com âncora = keyword primária do filho.
- **Pilar** → seus próprios filhos (casos, setoriais, referências, teste) + 1 link lateral ao hub do silo.
- **Filho** → volta ao pilar (breadcrumb + link in-content) + 1–2 irmãos relevantes.
- **Cruzamento controlado:** `/es/cumplimiento/verifactu/integracion/` → `/es/integracion/erp/` (a ponte natural entre cumprimento e ticket maior). Este é o único cruzamento inter-silo permitido em landings.
- **Blog** → sempre ao menos 1 link in-content para o pilar do silo correspondente, com âncora exata da keyword primária.

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

### Sprint A — Fundação e desbloqueio (semana 1)
1. Correções técnicas #1, #7, #8 (as três de prioridade 🔴).
2. Redirect 301 `/es/agencia-de-ia/` → `/es/servicios/agencia-ia/` (o de `consultoria-ia` foi cancelado pela verificação de SERP, ver §3.1).
3. Nova home: title, H1 (texto único), meta description, reordenação em 3 portas de silo.
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
14. `/es/cumplimiento/ley-atencion-al-cliente/auditoria-enac/`.
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
| Impressões orgânicas do silo `/es/cumplimiento/` | a **medir na UI do Search Console** (a API está bloqueada, a interface não) | > 5.000/mês aos 6 meses | Search Console → filtro por prefixo `/es/cumplimiento/` |
| Posição média de `verifactu` + cauda de integração | não ranqueia | top 20 na cauda (`api verifactu`, `integrar verifactu`) | Search Console |
| Leads qualificados/mês dos testes (SAC + Verifactu) | 0 | ≥ 8 | Supabase `assessment_responses` |
| Taxa de conclusão dos testes | — | > 45% | evento `assessment_completed` |
| Domínios de referência | 36 (medido em jul/2026 via SEMrush) | ≥ 60 | SEMrush/Ahrefs quando houver plano; enquanto isso, contagem manual da campanha de diretórios |
| Páginas com ≥1 impressão/mês | a medir | > 70% do índice | Search Console (UI) |

**Critérios de decisão (gatilhos, não opiniões):**
- Se em **6 meses** as landings PT de serviço seguirem com 0 impressões → `noindex` nelas e concentrar `/pt/` no blog.
- Se `api verifactu` + `integrar verifactu` não entrarem no top 30 em **4 meses** com o conteúdo publicado → o gargalo é autoridade, não conteúdo; realocar esforço para link building.
- Se o silo `/es/servicios/` (agência) seguir sem impressões relevantes em **9 meses** → considerar consolidar as 3 landings de agência numa só.

---

## 12. O que este plano ainda não sabe

Registro honesto do que falta medir antes de considerar o plano fechado:

1. **Volumes exatos e KD.** Todas as faixas acima vêm de uma conta Google Ads inativa. Reativar a conta com campanha mínima destrava números exatos; um plano Ahrefs ou units Semrush destrava KD, tráfego potencial e *parent topic*.
2. **Search Console.** Nenhum dado real de impressões/consultas do próprio site entrou neste estudo (o endpoint via Ahrefs está bloqueado; **a interface do Search Console continua acessível e deveria ser a primeira coisa a olhar antes do Sprint A**). É a fonte que diria quais páginas já têm impressão e onde há canibalização *real* em vez de teórica.
3. **SERP das novas keywords.** As SERPs de Ley 10/2025 e Verifactu já foram inspecionadas em sessões anteriores (escritórios de advocacia e vendors de software, respectivamente). As de `integracion erp`, `crm para empresas` e `agentes de ia` **não** foram — antes de escrever essas landings vale olhar quem ocupa o top 10.
4. **Core Web Vitals reais.** Continua sem medição, como a própria auditoria reconhece.
5. **Canibalização com o subdomínio** `chatplug.iaoperators.com` — outro projeto, fora do repo, mas compartilha domínio raiz e vocabulário de chatbot/WhatsApp.
