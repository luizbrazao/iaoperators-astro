---
title: "Open AI models: the letter that turns a technical decision into a power struggle"
seoTitle: "Open AI models: what Nvidia's letter proposes"
ogTitle: "Open AI models: who keeps the key"
description: "Nvidia, Microsoft and Meta are defending open AI models. We look at competition, safety and the risk of depending on closed APIs."
category: privacy
articleSection: "AI Governance & Architecture"
date: 2026-07-29T23:26:00+02:00
image: /images/blog/modelos-ia-abiertos-16x9.png
cover: /images/blog/modelos-ia-abiertos-16x9.png
imageSchema:
  - /images/blog/modelos-ia-abiertos-16x9.png
  - /images/blog/modelos-ia-abiertos-4x3.png
  - /images/blog/modelos-ia-abiertos-1x1.png
imageWidth: 1200
imageHeight: 675
imageSizes: "(max-width: 768px) 100vw, 896px"
imageSrcset: "/images/blog/modelos-ia-abiertos-16x9-640.png 640w, /images/blog/modelos-ia-abiertos-16x9-960.png 960w, /images/blog/modelos-ia-abiertos-16x9.png 1200w"
imageSrcsetAvif: "/images/blog/modelos-ia-abiertos-16x9-640.avif 640w, /images/blog/modelos-ia-abiertos-16x9-960.avif 960w, /images/blog/modelos-ia-abiertos-16x9.avif 1200w"
imageSrcsetWebp: "/images/blog/modelos-ia-abiertos-16x9-640.webp 640w, /images/blog/modelos-ia-abiertos-16x9-960.webp 960w, /images/blog/modelos-ia-abiertos-16x9.webp 1200w"
imageAlt: "Executive holding up the letter signed by Microsoft, Meta and Nvidia in front of a leadership team, next to a laptop showing a restricted access notice"
ogImage: /images/blog/modelos-ia-abiertos-og.png
ogImageWidth: 1200
ogImageHeight: 630
about:
  - type: Thing
    name: Open artificial intelligence models
  - type: Thing
    name: Open-weight models
  - type: Thing
    name: Artificial intelligence governance
tags:
  - open AI models
  - open vs closed models
  - open weights AI
  - Nvidia letter on AI
  - open-weight models
  - open artificial intelligence
  - AI vendor dependency
  - AI architecture
  - vendor lock-in
locale: en
translationKey: modelos-ia-abiertos-carta-nvidia
author: "Luiz Fernando Brazão"
authorTitle: "Founder of IA Operators"
authorUrl: "https://iaoperators.com/en/autores/luiz-fernando-brazao/"
authorSameAs:
  - "https://www.linkedin.com/in/ferbrazao/"
authorBio: "Luiz Fernando Brazão is the founder of IA Operators and works on agent architecture, enterprise automation, systems integration and putting artificial intelligence into production."
faqSchema: true
draft: false
faq:
  - q: "What does the letter propose about open AI models?"
    a: "The letter argues that open-weight models can broaden access to artificial intelligence, increase competition, reduce vendor dependency and let companies and institutions run and adapt models on their own infrastructure. It also acknowledges that releasing weights carries risks that must be managed."
  - q: "What is the difference between open source and open weights?"
    a: "An open-weight model publishes its trained parameters so they can be downloaded and run. A fully open source AI system must additionally provide the freedoms and the components needed to use, study, modify and share it, including code and enough information about how it was built."
  - q: "Does Anthropic want to ban open models?"
    a: "No. Anthropic states that it does not advocate a general ban on open-weight models. The company proposes mandatory safety testing for all sufficiently capable models, open or closed, alongside export controls on advanced chips and action against certain industrial distillation operations."
  - q: "Is it better to use an open model or a closed API?"
    a: "It depends on the use case. Closed APIs usually make it easier to launch quickly and reach the highest available capability. Open-weight models offer more control, customisation and portability. For many companies the best strategy is a hybrid architecture that allows different options without locking into a single provider."
  - q: "What are the risks of open-weight models?"
    a: "Once weights are published, the developer loses part of its ability to withdraw the model, control how it is used or update its safeguards. That can make independent audits easier, but it can also reduce the room to intervene against malicious use."
  - q: "How can a company avoid depending on a single AI API?"
    a: "The company should build an abstraction layer between its processes and the models, validate several providers, build its own evaluations, separate data and business logic from prompts, and keep a migration plan for critical systems."
---

Imagine that a critical part of your company depends on intelligence you do not control.

You reach it through an API. The provider decides the price, the available capacity, the usage policies and the countries you can connect from. It can change the terms, retire a model or block certain use cases.

Your product is still yours. So is your data. But a growing share of the capability that makes it work belongs to another company.

> **In 30 seconds:** a letter backed by Nvidia, Microsoft, Meta, Google and dozens of other organisations defends open-weight models as a condition for keeping competition alive in AI. Anthropic replies that openness is not safe by definition and must be tested. For a company, the conclusion is not to pick a side: it is to stop building critical systems without alternatives.

<nav aria-label="Table of contents">

**In this article**

1. [What "open" actually means](#what-open-means)
2. [How AI's commercial layer concentrated](#concentration)
3. [What the letter argues](#what-the-letter-argues)
4. [Nvidia's incentives](#incentives)
5. [Anthropic's response](#anthropic)
6. [Safety and openness](#safety)
7. [Kimi K3 and the shrinking gap](#kimi-k3)
8. [The right question for a company](#open-or-closed)
9. [How to avoid single-vendor dependency](#portability)
10. [Where the value will sit](#value)

</nav>

That does not automatically make closed models a bad decision. They have let thousands of companies adopt artificial intelligence without training models or building their own infrastructure.

But it does force a question that stayed confined to technical teams for a long time:

> **Who actually controls the intelligence we are building on?**

On 24 July 2026, a letter titled *Open Weights and American AI Leadership* put that question at the centre of the debate. The document, backed by dozens of technology organisations — among them Nvidia, Microsoft, Meta, Google, IBM, OpenAI, Hugging Face, Mozilla, Mistral and Palantir — argues that open-weight models are necessary to preserve competition, broaden access to AI and prevent a strategic capability from concentrating in a handful of providers.

The letter is not only a defence of one way of distributing models. It is a statement about how power should be shared in the artificial intelligence economy. ([official letter](https://images.nvidia.com/pdf/Open-Weights-and-American-AI-Leadership.pdf))

<h2 id="what-open-means">Before arguing, let's clarify what "open" means</h2>

One problem with this debate is that concepts which do not mean the same thing get used as synonyms.

### Open source

According to the Open Source Initiative's definition, a genuinely open AI system must let people use it, study it, modify it and share it.

Exercising those freedoms takes more than access to the model. It also requires the relevant components to understand and modify it: parameters, code, and information about the data and processes used to build it.

It is a demanding standard that few current models fully meet. ([Open Source AI Definition](https://opensource.org/ai/open-source-ai-definition))

### Open weights

Weights are the parameters learned during training. When an organisation publishes those weights, other people can download the model, run it on their own infrastructure, adapt it or fine-tune it.

However, publishing the weights does not necessarily mean publishing:

- the data used during training;
- the full training code;
- the data filtering process;
- every component needed to reproduce the model;
- a licence that permits any use.

That is why **a model can be open-weight without being fully open source**.

### API access

Here you can use the model, but you cannot download it or run it under your own control.

The provider keeps the weights, the infrastructure and the decisions about the service. You access a capability, usually paying per use.

It is the fastest way to start, and also the one that creates the most direct dependency on the provider.

<h2 id="concentration">AI was not born closed, but its commercial layer concentrated</h2>

Artificial intelligence research was built over decades on academic publications, open libraries, shared standards and collaboration between universities and companies.

The shift came with frontier generative models.

Training these systems began to require large amounts of capital, chips, data, energy and infrastructure. As a result, the most capable models started to be distributed mainly as services controlled by a small number of companies.

That model had a clear economic logic: whoever absorbed the training cost needed to recover the investment.

It also offered practical advantages. A startup could add an advanced capability through an API without hiring a research team or maintaining a GPU cluster.

The problem appears when a temporary implementation decision turns, with nobody planning it, into a structural dependency.

A company starts using an API because it is fast. Then it builds its processes, its evaluations, its agents and its products around that model's particularities. Switching provider stops being a technical change and becomes a complex migration.

**Initial speed can end up producing long-term lock-in.**

<h2 id="what-the-letter-argues">What the letter actually argues</h2>

The letter driven by Nvidia puts forward three main arguments in favour of open-weight models.

### 1. They broaden access to the AI economy

Not every task requires the most powerful model on the market.

Classifying documents, extracting data, summarising conversations or running certain internal processes can be done with smaller, specialised models.

When weights are available, a company can pick the right model for each function, run it wherever makes most sense, and reserve the expensive models for the problems that genuinely need frontier capability.

Openness does not remove the cost of compute. Running large models is still expensive.

What changes is who gets to decide where to run them, how to optimise them and which provider supplies the infrastructure.

### 2. They introduce competition at more layers

With closed models, competition concentrates mainly among the companies that own the APIs.

Open weights extend competition to other layers:

- infrastructure providers;
- inference platforms;
- optimisation tooling;
- security services;
- specialised applications;
- deployments on private infrastructure.

Intelligence stops being packaged only as a service and becomes a component that can be deployed in different ways.

### 3. They give organisations more control

A company that can download and run a model has more options to decide where its data lives, how the system is adapted and what happens if a provider changes the terms.

This does not guarantee absolute independence. Hardware, cloud, deployment tooling and specialised talent remain concentrated.

But it reduces one concrete dependency: having all of the organisation's intelligence rely on a single API.

<h2 id="incentives">Nvidia defends openness, but it also has incentives</h2>

Nvidia supporting open models should not be a surprise.

The more models get trained, adapted and run, the higher the demand for compute infrastructure. Open models let more companies take part in that ecosystem and push competition towards deployment, inference and optimisation.

It is reasonable to infer that Nvidia benefits from that expansion.

That does not invalidate the letter's arguments. Companies can defend principles that also serve their commercial interests.

What matters is not to present the debate as a fight between disinterested actors. Everyone occupies a position in the value chain.

Closed-model providers capture value through access to intelligence. Infrastructure providers capture value when more organisations can run that intelligence.

**The argument about openness is also an argument about where the economic margin will concentrate.**

<h2 id="anthropic">Anthropic's response: don't ban it, but don't idealise it either</h2>

Anthropic was one of the most commented absences among the signatories.

A few days later, its CEO, Dario Amodei, published an explanation of the company's position.

Anthropic states that it has never advocated a general ban on open-weight models. It also acknowledges that models without dangerous capabilities can be a public good for companies, researchers and developers.

Its disagreement lies elsewhere.

Once a model's weights are published, the developer loses the ability to withdraw them, control how they are used or update its safeguards. Copies can be distributed, modified and run on private systems without oversight.

For sufficiently powerful models, Anthropic argues this could raise the risk of misuse in cyberattacks, biology or other sensitive areas.

The company proposes three main measures:

1. limiting authoritarian regimes' access to advanced chips and manufacturing equipment;
2. countering industrial distillation operations aimed at replicating foreign models' capabilities;
3. requiring mandatory safety testing for all sufficiently capable models, open or closed.

Its most important criticism of the letter is that openness does not necessarily help defenders more than attackers. That relationship has to be verified through rigorous evaluations, not assumed on principle.

It is a more nuanced position than "Anthropic is against open models". The company does not propose banning them as a category. It proposes that the level of control should depend on the capabilities and risks each model demonstrates. ([Anthropic's official position](https://www.anthropic.com/news/position-open-weights-models))

<h2 id="safety">Safety and openness: both sides have valid arguments</h2>

Openness increases auditability.

External researchers can study the model's behaviour, test attacks, hunt for vulnerabilities, develop mitigations and verify the vendor's claims.

But it can also reduce the ability to intervene after release.

With a closed API, the provider can block an account, change the filters, update the model or withdraw a version. Once the weights are downloaded, those measures are no longer available.

That is why claiming "open is always safer" is as simplistic as claiming "closed is always safer".

Each model should be assessed on:

- its actual capabilities;
- the harm it could enable;
- whether those capabilities can be withdrawn or mitigated;
- the kind of organisation that will deploy it;
- the infrastructure it will run on;
- the oversight measures available.

Safety does not depend only on whether the model is open or closed. It depends on the ability to evaluate, constrain, detect and respond.

<h2 id="kimi-k3">Kimi K3 shows the gap is shrinking</h2>

Kimi K3, built by Moonshot AI, has become one of the most recent examples of how far open-weight models have come.

The model uses a Mixture of Experts architecture with 2.8 trillion total parameters and 104 billion activated during inference. It also has native vision capabilities and a one-million-token context window.

Moonshot released the full model weights to support research and deployment.

But its results are worth describing precisely.

The technical report states that Kimi K3 reaches frontier performance on coding, reasoning, knowledge, vision and long-horizon execution tasks. It also claims it outperforms other open models and several proprietary models evaluated by the team.

However, Moonshot itself acknowledges that its overall performance still trails the strongest proprietary models included in the comparison: Claude Fable 5 and GPT-5.6 Sol.

Kimi K3 does not prove that open models have definitively overtaken closed ones.

It proves something more relevant: **the gap is no longer wide enough to assume closed models will always keep an insurmountable advantage.** ([Kimi K3 technical report](https://arxiv.org/abs/2607.24653))

For a deeper look at the geopolitical and business implications, read [our analysis of Kimi K3 and WAICO](/en/blog/kimi-k3-waico-new-ai-contest-companies/).

<h2 id="open-or-closed">The right question for a company is not "open or closed"</h2>

The mistake would be turning this into an ideological choice.

A company should not use an open model on principle, nor a closed API because it is the best-known option.

The right question is:

> **Which combination of models gives the right balance of capability, speed, cost, control and risk?**

For many organisations, the answer will be a hybrid architecture.

**Closed APIs** may be the better option when:

- you need to launch fast;
- initial volume is low;
- you need the highest capability available;
- you do not want to maintain inference infrastructure;
- the provider offers adequate guarantees on availability and data handling.

**Open-weight models** may fit better when:

- data must not leave a controlled infrastructure;
- volume justifies optimising inference costs;
- you need to adapt the model deeply;
- you want to control updates;
- latency is critical;
- you need to reduce dependency on one provider;
- the use case works with a specialised model.

Most companies do not need to pick a single path. They need to keep any of those paths from becoming irreversible. That is exactly the kind of decision we structure in a [technology roadmap](/en/roadmap-tecnologico/).

<h2 id="portability">How to avoid depending on a single AI provider</h2>

Portability is not achieved by simply wiring two APIs into the same product.

It has to be designed from the start.

### Build an abstraction layer

Business logic should not call functions exclusive to a single model in every part of the system.

An intermediate layer lets you normalise requests, responses, tools and error handling.

Switching models will never be fully automatic, but this layer reduces the cost of migration.

### Validate more than one model

Keep two or three models evaluated for critical tasks.

They do not all have to be active. They have to be tested well enough that the company knows their differences in quality, speed and cost.

### Build your own evaluations

Public benchmarks are useful for comparing general capabilities, but they do not necessarily predict performance in your business.

Build a set of real cases and measure:

- accuracy;
- instruction following;
- cost;
- latency;
- hallucinations;
- correct tool use;
- safety;
- stability across versions.

Your internal evaluator is worth more than a general leaderboard.

### Separate data, logic and intelligence

Customer data, business rules and operational flows should not be baked into prompts that cannot be moved.

The better separated those components are, the simpler it is to swap the model. It is one of the principles we apply when [putting AI systems into production](/en/implementacion/).

### Calculate total cost, not just price per token

An open model may have a lower inference price, but it demands infrastructure, monitoring, updates, security and specialised staff.

An API may look more expensive per use, but it removes much of that complexity.

The comparison has to include total cost of ownership, not just the visible rate.

### Review the licence

Having access to the weights does not mean you can use the model for any purpose.

Check:

- whether commercial use is allowed;
- whether there are sector restrictions;
- whether it caps the number of users;
- whether modifications are permitted;
- whether you can redistribute an adapted version;
- what obligations remain attached to the outputs.

"Available to download" does not mean "free of conditions".

### Design an exit plan

Every critical dependency should have answers to these questions:

- What happens if the provider doubles the price?
- What happens if it retires the model?
- What happens if it changes its data policy?
- What happens if it lowers the usage limits?
- How long would migration take?
- Which features would we lose?

If the answer is "we don't know", you do not have an AI strategy. You have an unmeasured dependency.

<h2 id="value">Where the value will sit once models become components</h2>

As competition increases, intelligence will look less like a finished product and more like a replaceable layer.

Value will move in three directions.

### Above the model

User experience, process integration, automation, proprietary data, distribution and the ability to solve a complete problem.

The customer does not pay because you use a particular model. They pay because the system cuts costs, raises revenue or removes manual work.

### At the model layer

Capability, cost, specialisation, speed, context, tool use and ease of integration.

This is where open and closed models will compete.

### Below the model

Compute, infrastructure, inference, observability, security and optimisation.

Every efficiency gain can turn directly into margin.

For a company building AI solutions, the conclusion is clear:

> **Your competitive advantage cannot rest solely on having access to the same model as everyone else.**

The real asset is in the data, the processes, the distribution, the experience and the ability to change technology without rebuilding everything from scratch.

<h2 id="conclusion">The debate is not about opening everything</h2>

The letter driven by Nvidia is right to warn that an economy built exclusively on closed models risks concentrating too much power in a few providers.

Anthropic is also right to remind us that publishing the weights of a sufficiently dangerous model can be an irreversible decision.

The mature answer is neither to open everything nor to close everything.

It is to require testing proportional to capability, protect competition, allow independent audits and keep companies from building critical systems without alternatives.

A few years from now, when artificial intelligence is embedded in most economic processes, we will need to answer an uncomfortable question:

> Who can inspect, modify and decide how the intelligence we depend on works?

If the answer is "only a few companies", we will have created a new form of concentration.

If the answer is "anyone with the resources, the knowledge and the necessary safeguards", we will have a more competitive and more resilient ecosystem.

The letter does not settle the debate. But it forces us to argue about the right question: not only which models are most capable, but who will hold the keys to the intellectual infrastructure we build on.

Choose carefully where you put the lock.

And above all, choose carefully who keeps the key.

<h2 id="cta">Is your company ready to switch models?</h2>

Many organisations are already using AI, but they do not know how much they depend on a single provider, what data they are sending outside their infrastructure or what migration would cost.

At IA Operators we analyse processes, architecture, integrations and risks to identify where artificial intelligence generates real return and how to implement it without creating new unnecessary dependencies. It is the work we do in the [AI X-Ray](/en/auditoria-de-sistemas/) and in our [AI consulting](/en/servicios/consultoria-ia/) projects.

[Talk to IA Operators →](/en/contact/)

<h2 id="sources">Sources</h2>

- Nvidia — [Open Weights and American AI Leadership (official letter)](https://images.nvidia.com/pdf/Open-Weights-and-American-AI-Leadership.pdf)
- Anthropic — [Our position on open-weights models](https://www.anthropic.com/news/position-open-weights-models)
- Moonshot AI — [Kimi K3: Open Frontier Intelligence (technical report)](https://arxiv.org/abs/2607.24653)
- Open Source Initiative — [The Open Source AI Definition](https://opensource.org/ai/open-source-ai-definition)
- Open Source Initiative — [Open Weights: not quite what you've been told](https://opensource.org/ai/open-weights)
