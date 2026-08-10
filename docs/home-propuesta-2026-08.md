# Nova home — proposta para aprovação

**Não implementado.** Este documento é para você aprovar ou corrigir antes de eu tocar no código.
**Base:** Sprint 0 do Search Console (90 dias, 09/ago/2026) + estudo de keywords de agosto.

---

## 1. O que o Search Console diz sobre a home

`/es/` — 69 impressões, **0 cliques**, 9 consultas:

| Consulta | Impressões | Tipo |
|---|---|---|
| `ia operator` | 11 | marca |
| `operator ia` | 10 | marca |
| `operadores ia` | 2 | marca |
| `operator` | 2 | marca |
| `operaitor` · `operator lt` · `aioperator` | 1 cada | marca (erro de grafia) |
| **`orquestadores de ia`** | 1 | **categoria** |

Três leituras que mudam como escrevo a home:

**1. A home não tem pegada semântica nenhuma fora da marca.** Em 90 dias, o title atual — *"IA Operators | Agencia de IA y marketing digital"* — não comprou uma única impressão não-branded. Isso quer dizer que **reescrever Title, H1 e meta não tem risco de perda**. Não há ranking a proteger. É a única página do site onde posso mexer sem custo de oportunidade.

**2. O cluster "agencia de IA" já pertence a outra URL.** `/es/agencia-de-ia/` captura 505 impressões dessas queries. Se a home perseguir os mesmos termos, eu crio a terceira página disputando o mesmo cluster — exatamente o erro que acabamos de reverter. **A home tem de falar um nível acima.**

**3. Zero cliques em 69 impressões de marca é um sintoma.** Alguém procura "ia operator" e não clica. Pode ser SERP com concorrentes homônimos, pode ser snippet fraco. O title começando por `IA Operators` e uma meta que diz o que fazemos em uma linha atacam isso diretamente.

E um detalhe pequeno mas bonito: `orquestadores de ia`. É uma impressão só, mas é exatamente a categoria — alguém procurando quem orquestra sistemas com IA e chegando na sua home. Vale ter esse vocabulário no corpo.

---

## 2. Title — recomendação e alternativa

### ✅ Recomendado

```
IA Operators | Integración y automatización de sistemas con IA
```
*61 caracteres.*

**Por quê.** Marca primeiro, porque hoje a home é uma página de consulta de marca e o CTR está em zero. Categoria depois, sem disputar nenhuma keyword primária de um filho. E — o ponto mais importante — **não coloca cumplimiento no title**, coerente com a decisão de que cumplimiento é *wedge* de aquisição e não o núcleo permanente da marca. O que vai no title é o que a IA Operators é em 2028.

### Alternativa (a que eu tinha proposto antes)

```
IA Operators | Automatización, integración de sistemas y cumplimiento normativo
```
*79 caracteres.*

Nomeia os três silos e é mais completa. O custo é que ancora a marca num tema com data de validade e dilui em três direções. **Se você prefere maximizar a captura de curto prazo em 2026–2027, esta é a escolha.** Eu não a escolheria, mas é defensável e você conhece o pipeline comercial melhor do que os dados.

### Descartada

```
Integración y automatización de sistemas para empresas | IA Operators
```
Keyword primeiro é a convenção usual, mas aqui a única demanda comprovada da página é de marca. Deixar `IA Operators` para o fim desperdiça o começo do title na consulta que já acontece.

---

## 3. H1

```
Conectamos y automatizamos los sistemas que tu empresa ya tiene
— y los ponemos en regla.
```

**Texto único no DOM.** Hoje há dois `<span>` com o mesmo conteúdo para alternar desktop/mobile, o que faz o HTML conter a frase duplicada. A quebra passa a ser só CSS.

**Por que o cumplimiento fica no H1 mas não no title.** É uma divisão deliberada: o **title diz o que somos de forma permanente**, o **H1 diz o que resolvemos agora**. Em 2028, se a onda regulatória passar, muda-se o H1 e a posição da marca fica intacta. Se a cláusula estivesse no title, mudá-la significaria remexer na identidade da página.

Se você preferir um H1 sem a cláusula regulatória:

```
Conectamos y automatizamos los sistemas que tu empresa ya tiene.
```

Mais limpo, menos diferenciado. A cláusula "y los ponemos en regla" é o que separa você de qualquer integrador.

---

## 4. Meta description

```
Integramos ERP, TPV, e-commerce y CRM con IA sobre los sistemas que ya usas.
Y los adaptamos a Verifactu y a la Ley 10/2025. Implementación técnica, no asesoría.
```

Sem perseguir contagem de caracteres — o Google corta conforme dispositivo e consulta. O que importa: nomeia os sistemas concretos (é o que o comprador reconhece), nomeia as duas normas (é o gatilho de urgência) e fecha com a frase que te diferencia de consultoria.

---

## 5. As três portas

Substituem o bloco da Ley 10/2025 que hoje aparece logo abaixo do hero. Cada uma é um card com rótulo, uma linha e um link.

| Porta | Rótulo | Microcopy | Destino |
|---|---|---|---|
| 1 | **Integración y automatización** | *El sistema que ya tienes, conectado y automatizado: ERP, TPV, e-commerce, CRM y WhatsApp.* | `/es/integracion/` |
| 2 | **Cumplimiento normativo** | *Verifactu y la Ley 10/2025 sin cambiar de software. Adaptamos lo que ya usas.* | `/es/cumplimiento/` |
| 3 | **Servicios de agencia** | *Web, SEO, contenido, chatbots y agentes de IA.* | `/es/servicios/` |

Ordem deliberada: **integración primeiro** — é o core. Cumplimiento em segundo, com destaque visual maior (é o que converte agora), mas não em primeiro lugar na hierarquia. Isso é a tradução visual da decisão *core evergreen* vs *wedge de aquisição*.

> ⚠️ O hub `/es/integracion/` **ainda não existe** — está no Sprint C. Até lá, a porta 1 aponta provisoriamente para `/es/servicios/automatizacion-ia/`, e eu deixo um comentário no código marcando a troca. Alternativa: adiar a home até o hub existir. Prefiro não adiar, porque as correções de title/H1/meta são ganho imediato e sem risco.

---

## 6. Ordem das seções

```
1. Hero                    Title/H1/meta acima + CTA primário
2. El problema             "Tu empresa tiene más tecnología de la que controla"
                           (o texto atual, que é o mais forte do site — fica)
3. Las tres puertas        os três cards
4. Cómo trabajamos         diagnóstico → prioridad → ejecución, sin hand-offs
5. Casos                   problema → contexto → sistemas → intervención → resultado
6. Quién está detrás       "Hola, soy Luiz Brazão" (E-E-A-T, fica como está)
7. FAQ                     mantém em HTML; FAQPage JSON-LD é baixa prioridade
8. CTA final
```

O que sai da posição atual: o bloco inteiro da Ley 10/2025 que hoje ocupa o espaço logo abaixo do hero. Ele vira a porta 2. Não se perde conteúdo — ele já existe, e melhor, em `/es/cumplimiento/ley-atencion-al-cliente/`.

---

## 7. O que a home **não** pode fazer

Regra prática derivada do incidente do `/agencia-de-ia/`: a home pode usar o vocabulário da categoria de forma descritiva, mas **não pode construir um H2 + bloco de conteúdo + link interno em torno da keyword primária de um filho**. Concretamente, nada disso vira seção da home:

| Termo | Dono |
|---|---|
| `agencia de ia` / `agencia de inteligencia artificial` | `/es/agencia-de-ia/` e `/es/servicios/agencia-ia/` (decisão pendente) |
| `automatización de procesos` | `/es/servicios/automatizacion-ia/` |
| `chatbot para empresas` | `/es/servicios/chatbots/` |
| `integración de sistemas` | `/es/integracion/` (futuro hub) |
| `verifactu` | `/es/cumplimiento/verifactu/` |
| `ley de atención al cliente` | `/es/cumplimiento/ley-atencion-al-cliente/` |

A home menciona; os filhos possuem.

---

## 8. Correções técnicas que entram no mesmo commit

Estão no mesmo arquivo, então não faz sentido separar:

1. H1 com texto único no DOM (hoje duplicado em dois spans).
2. Remover o `<main>` aninhado — hoje há dois.
3. `alt="Logo 1..5"` no carrossel de tecnologias → nome real da marca nos originais, `alt=""` + `aria-hidden` nos clones do loop.
4. Remover `potentialAction`/`SearchAction` do `WebSite` schema (URL malformada com `//` e `{locale}` não substituído; e o Sitelinks Search Box foi descontinuado em nov/2024).

---

## 9. O que eu preciso de você

1. **Title:** recomendado (sem cumplimiento) ou alternativa (com)?
2. **H1:** com ou sem a cláusula *"— y los ponemos en regla"*?
3. **Porta 1 antes do hub existir:** apontar provisoriamente para `/es/servicios/automatizacion-ia/`, ou adiar a home até o Sprint C?
4. **Casos:** a seção 5 pede `problema → contexto → sistemas → intervención → resultado medible`. Você tem número real de algum caso que possa ir para a home? Se não tiver, mantenho a seção qualitativa — mas com número converte muito mais.
