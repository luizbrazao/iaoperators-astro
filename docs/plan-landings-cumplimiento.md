# Plano de landings — venda dos serviços (Frente A prioritária)

**Data:** 26/07/2026 · **Repo:** iaoperators-astro · **Decisões travadas:** Frente A primeiro · ES-only nas páginas regulatórias · conversão via test de cumplimiento interativo.

---

## 0. Diagnóstico em uma frase

O site tem **7 landings de serviço genéricas** (`automatizacion-ia`, `chatbots`, `diseno-web`, `agencia-seo`, `marketing-digital`, `agencia-ia`, `consultoria-ia`) + 3 páginas de produto legado (`auditoria-de-sistemas`, `roadmap-tecnologico`, `implementacion`) e **zero páginas** sobre as duas frentes que a estratégia definiu como o negócio real. Grep em `src/` por `verifactu|ley 10/2025|atención a la clientela`: **0 ocorrências**.

Ou seja: o site vende hoje a commodity que qualquer agência vende (e na qual o domínio não tem autoridade para competir — AS 2, 36 ref domains, tráfego orgânico 0), e não vende a única coisa em que existe demanda obrigatória por lei com prazo duro.

**Consequência prática:** o outbound da Frente A não tem para onde mandar o lead. Hoje, um decisor que recebe um email sobre a Ley 10/2025 e clica no site aterrissa em "Automatizamos, posicionamos y hacemos crecer tu empresa con IA" — que destrói a credibilidade do pitch regulatório na hora.

---

## 1. Achado que muda a copy (validado na SERP)

| Frente | Quem domina a SERP hoje | Lacuna |
|---|---|---|
| **A — Ley 10/2025** | Escritórios de advocacia e consultoras legais (Uría, KPMG, Iberley, Durán-Sindreu, Sepín) explicando *o que a lei diz* | **Ninguém vende a implementação técnica.** O mercado inteiro está no "qué dice la ley"; ninguém responde "cómo se construye el sistema que cumple los SLA y genera las evidencias para la auditoría ENAC" |
| **B — Verifactu** | Vendors de software de facturación (B2BRouter, Quipu, ERPs) vendendo "migra para o meu programa" | Lacuna no ângulo **"não posso migrar"** — ERP a medida, TPV multi-loja, e-commerce próprio, software vertical |

Isso define o eixo de posicionamento da Frente A: **tradutor de artigo de lei em arquitetura de sistema.** É exatamente a mesma competência do Radiografía Digital, aplicada a um gatilho de compra obrigatório.

Um cuidado: **não somos escritório de advocacia.** Toda a copy vai levar disclaimer de "implementación técnica, no asesoramiento jurídico" — e isso, longe de enfraquecer, abre o canal secundário já previsto na estratégia (entrar como subcontratado técnico de consultoras/escritórios que já vendem a parte legal e não sabem construir).

---

## 2. Arquitetura de informação proposta

Silo novo, **separado de `/servicios/`**, porque a intenção de busca é "cumprir uma lei", não "contratar uma agência":

```
/es/cumplimiento/                                        ← hub regulatório (guarda-chuva das 2 frentes)
  ├─ ley-atencion-al-cliente/                            ← PILAR Frente A
  │    ├─ test/                                          ← test de cumplimiento (island)
  │    ├─ test/resultado/                                ← informe preliminar + captura
  │    └─ [sector]/                                      ← programáticas: telecomunicaciones,
  │                                                        servicios-financieros, transporte-viajeros,
  │                                                        energia-agua-gas, servicios-postales
  └─ verifactu/                                          ← PILAR Frente B (depois)
       └─ [caso]/                                        ← erp-a-medida, tpv-multitienda,
                                                           ecommerce-propio, software-vertical
```

**Decisões de rota:**

- Slug sem número de lei (`ley-atencion-al-cliente`, não `ley-10-2025`): o número envelhece, o conceito não. O H1 e o schema citam a Ley 10/2025 explicitamente.
- Pasta `src/pages/es/cumplimiento/...` — **fora** do padrão `[locale]/`, porque é ES-only por decisão.
- Programáticas por setor reaproveitam integralmente o padrão já existente em `[locale]/agencia-de-ia/[ciudad].astro` + `src/data/ciudades-ia.ts` (SHARED + único por entrada). Aqui a regra anti-doorway é fácil de cumprir com folga: as obrigações **realmente mudam** por setor (as 2h de continuidade e o 24/7/365 só se aplicam a serviços básicos; o financeiro carrega SLA de faturação de 5 dias; telecom tem regime setorial próprio). Meta: ≥40% de conteúdo único por setor.

**Ponto técnico obrigatório (ES-only):** `BaseLayout.astro` gera hreflang para os 3 locales por default (`locales.map(...)`, L78). Uma página só-ES tem de passar `alternates={[{ lang: "es", href: pageUrl }]}` **e** `xDefaultUrl={pageUrl}`, senão o build emite `hreflang` apontando para `/pt/` e `/en/` que não existem — 404 no Site Audit e sinal errado para o Google. O layout já suporta os dois overrides; é só usar.

---

## 3. Landing pilar — estrutura de seções e ângulo de copy

Base: mesmo esqueleto das landings de serviço (Hero → Problem → Services → Process → Tech → FAQ → FinalCTA), com **três seções novas** que carregam o diferencial.

| # | Seção | Função | Nota de copy |
|---|---|---|---|
| 1 | **Hero + contador** | Urgência datada | "El 28 de diciembre de 2026 tu servicio de atención al cliente tiene que cumplir la Ley 10/2025." Sub: implementação, não assessoria. CTA primário = **test (2 min)**, secundário = llamada |
| 2 | **¿Estás obligado?** | Auto-qualificação imediata | Duas colunas: limiares (≥250 empregados · >50M€ faturação · >43M€ balanço) vs. **serviços básicos sem limiar** (agua, gas, electricidad, transporte de viajeros, postal, telecom, financiero). Fecha com link para o test |
| 3 | **De la ley al sistema** ⭐ | **A seção que ninguém tem** | Tabela artigo → requisito técnico. É o ativo de diferenciação e o que vai ser citado por AI Search |
| 4 | **Qué construimos** | Arquitetura | Diagrama: canais (WhatsApp Cloud API · voz · email · web) → orquestrador multi-agente → CRM/ticketing → **capa de evidencias** (log imutável + KPIs exportáveis) |
| 5 | **Proceso** | Reduzir risco percebido | 4 fases com prazo real: diagnóstico 1 sem → diseño 1 sem → implementación 4-8 sem → **paquete auditoría-ready** |
| 6 | **Precio anclado** | Filtro | "Implementación desde 5.000 € + retainer de mantenimiento normativo." Ancorar contra o custo de não cumprir e contra o preço de uma consultora de CX |
| 7 | **Prueba** | Credibilidade honesta | Não há case de SAC ainda — **não inventar**. Usar: metodologia de auditoria (Artiem), stack em produção, e o checklist de evidências como demonstração de domínio |
| 8 | **FAQ (8)** | Rich result + AI Search | As perguntas legais reais, respondidas do ângulo técnico. `FAQPage` JSON-LD (já é padrão no repo) |
| 9 | **CTA final** | | Test + llamada |

### Conteúdo da seção 3 (o núcleo)

| Obligación legal | Lo que hay que construir |
|---|---|
| 95% de llamadas atendidas en <3 min (media) | Enrutado omnicanal con cola priorizada, medición de SLA en tiempo real y desbordamiento automático |
| Atención humana bajo demanda, sin contestador exclusivo | *Escape hatch* explícito del bot al humano, sin bucles, con traspaso de contexto completo |
| Resolución en ≤15 días hábiles | Workflow de ticket con reloj de plazo, recordatorios y escalado automático antes del vencimiento |
| 2 h en incidencias de continuidad (servicios básicos) · 5 días en facturación | SLAs diferenciados por tipología, clasificados en la entrada por el agente |
| Clave identificativa única por interacción | Generación, persistencia y consulta por el cliente en cualquier canal |
| Registro y trazabilidad | Log inmutable, retención, exportación |
| Auditoría anual por entidad acreditada ENAC | Dossier de evidencias y cuadro de mando de KPIs exportable |

⚠️ **Checkpoint jurídico antes de publicar:** validar a redação exata do âmbito subjetivo (art. 2) contra o [BOE-A-2025-26698](https://www.boe.es/buscar/act.php?id=BOE-A-2025-26698) — especificamente se os limiares são cumulativos ou alternativos (as fontes secundárias divergem: umas citam "250 empregados **e** >50M€", outras "**ou**", e o critério de balanço de 43M€ vem da definição europeia de PME). A copy que qualifica quem está obrigado não pode ter erro. Toda página leva rodapé: *"Información técnica. No constituye asesoramiento jurídico."*

---

## 4. Test de cumplimiento — o ativo de conversão

**Reaproveitamento:** a infra do survey *Segunda Factura IA* cobre ~80% do trabalho. Já existe: `src/islands/SurveyForm.tsx` (559 linhas), `src/lib/survey/{questions,validation,storage,types,utils,csv,admin,i18n}.ts`, endpoints `session/submit/review/export`, tabela Supabase com migração versionada, e página de admin.

**O que muda:**

1. **Generalizar a lib por chave de survey.** `storage.ts` e `questions.ts` hoje assumem um único questionário. Introduzir `surveyKey` como parâmetro (`segunda-factura-ia` | `sac-ley-10-2025`) e uma segunda migração/tabela. Sem isso, é fork por copy-paste — dívida garantida na terceira pesquisa.
2. **Questionário novo** (8 perguntas, <2 min): setor · nº de empregados · faturação · canais atuais · há medição de tempo de resposta? · há clave identificativa? · como se registra a trazabilidade? · quem responde fora do horário.
3. **Motor de resultado determinístico** (regras, não LLM — é qualificação jurídica, precisa ser auditável e reproduzível): devolve `obligado: sí/no/probable` + score de gap por cada uma das 7 obrigações + prazo restante.
4. **Página `/resultado/`:** semáforo por obrigação + captura de email para o "informe completo + checklist de evidencias" em PDF.
5. **Analytics:** disparar `generate_lead` no dataLayer (o padrão já existe no `ContactForm`) + evento `assessment_completed` com `sector` e `obligado` — assim dá para medir a qualidade do tráfego por canal, não só o volume.

**Por que test e não formulário:** ele qualifica antes da call (você já sabe se está obrigado e qual é o gap ao entrar na reunião), é reutilizável como ativo de outbound no LinkedIn e por email, e produz dados agregados que viram conteúdo ("X% das empresas obrigadas não mede tempo de resposta") — o mesmo motor editorial do estudo Segunda Factura.

---

## 5. Sequenciamento

| Sprint | Entrega | Esforço |
|---|---|---|
| **0** | Decisões de rota, `src/data/sectores-sac.ts`, helper de hreflang ES-only, checkpoint jurídico no BOE | ~0,5 dia |
| **1** | **Landing pilar** completa + JSON-LD (`Service` + `FAQPage` + `BreadcrumbList`) + entrada no Header/Footer/Home + OG dedicado | 2-3 dias |
| **2** | **Test de cumplimiento**: generalização da lib, migração, endpoints, island, `/resultado/`, PDF do informe, GTM | 2-3 dias |
| **3** | 3 setoriais (telecom · financiero · transporte) + 2 posts-âncora de blog para link in-content | 2 dias |
| **4** | Dívida do catálogo: hub `/servicios/`, dropdown de 10 itens → link para hub, landings no Footer, links internos das 4 landings órfãs | 1-2 dias |
| **5+** | Frente B (Verifactu): mesmo esqueleto, pilar + 4 páginas por caso — **antes do ramp de busca do T4/2026** | — |

O Sprint 4 é a dívida já registrada na memória do projeto e ficou depois do pilar de propósito: ele melhora a conversão do tráfego que existe, mas o tráfego que existe é ~0. Primeiro constrói-se o destino do outbound.

---

## 6. Trade-offs declarados

- **Orgânico não é o canal primário da Frente A nos próximos 6 meses.** Com AS 2 e 36 ref domains, a landing não rankeia contra Uría e KPMG em 90 dias. Ela existe para: (a) dar destino e credibilidade ao outbound, (b) capturar o long-tail sem concorrência (`"cómo cumplir el plazo de 15 días ley atención cliente"`, `"clave identificativa atención al cliente obligatoria"`), (c) ser citável por AI Search — onde a lacuna técnica é maior e a autoridade de domínio pesa menos.
- **ES-only quebra o padrão trilingue do repo.** É uma exceção consciente e localizada (obrigação espanhola, comprador espanhol). O custo é um caminho de código a mais no layout; o benefício é não gerar 10 páginas PT/EN sem demanda.
- **Setoriais são risco de doorway se feitas com preguiça.** Mitigação: as obrigações mudam de verdade por setor; a regra de ≥40% único é verificável antes do deploy.
- **Ficar só na Frente A atrasa a B.** O calendário de busca do Verifactu (vale agora, ramp no T4/2026) dá folga — mas não muita. Sprint 5 não deve escorregar para depois de outubro.

## 7. Como medimos

Não é "tráfego". É: **leads qualificados/mês** (test concluído com `obligado ≠ no` + email), **taxa de conclusão do test** (meta >45%), **% de obrigados entre respondentes** (mede a pontaria do canal), e **custo por lead qualificado por canal**. Instrumentação já sai pronta no Sprint 2.

---

*Fontes consultadas: [BOE — Ley 10/2025](https://www.boe.es/buscar/act.php?id=BOE-A-2025-26698) · [Resumen — Notarios y Registradores](https://www.notariosyregistradores.com/web/secciones/consumo-y-derecho/varios-cyd/resumen-de-la-ley-10-2025-de-26-de-diciembre-por-la-que-se-regulan-los-servicios-de-atencion-a-la-clientela/) · [Uría Menéndez](https://www.uria.com/es/publicaciones/newsletter/1997-procesal) · [KPMG legal alert](https://assets.kpmg.com/content/dam/kpmgsites/es/pdf/2026/01/legal-alert-regulacion-servicios-atencion-clientela-ley-10-2025.pdf.coredownload.inline.pdf) · SERP Verifactu: [B2BRouter](https://www.b2brouter.net/es/sistema-verifactu/), [Quipu](https://getquipu.com/es/sistema-verifactu)*
