---
title: "You pay for AI twice: how to protect your company's knowledge"
seoTitle: "AI privacy: protect your company's know-how"
description: "Learn what data you share when using AI, when running it locally makes sense, and how to build a hybrid flow to protect your company's know-how."
category: privacy
articleSection: "AI Privacy & Governance"
date: 2026-07-21T09:00:00+02:00
updatedAt: 2026-07-21T19:40:00+02:00
image: /images/blog/pagas-ia-dos-veces-segunda-factura.png
cover: /images/blog/pagas-ia-dos-veces-segunda-factura-16x9.png
imageSchema:
  - /images/blog/pagas-ia-dos-veces-segunda-factura-16x9.png
  - /images/blog/pagas-ia-dos-veces-segunda-factura-4x3.png
  - /images/blog/pagas-ia-dos-veces-segunda-factura-1x1.png
imageWidth: 1200
imageHeight: 675
imageSizes: "(max-width: 768px) 100vw, 896px"
imageSrcset: "/images/blog/pagas-ia-dos-veces-segunda-factura-16x9-640.png 640w, /images/blog/pagas-ia-dos-veces-segunda-factura-16x9-960.png 960w, /images/blog/pagas-ia-dos-veces-segunda-factura-16x9.png 1200w"
imageAlt: "Two AI invoices: one paid in money and one paid with the company's knowledge"
tags:
  - AI privacy for business
  - protect data when using AI
  - business know-how protection
  - local AI for business
  - open-weight models
  - hybrid AI strategy
  - AI governance
  - Shadow AI
locale: en
translationKey: pay-ai-twice
author: "Luiz Fernando Brazão"
authorTitle: "Founder of IA Operators"
authorUrl: "https://iaoperators.com/en/autores/luiz-fernando-brazao/"
authorSameAs:
  - "https://www.linkedin.com/in/ferbrazao/"
faqSchema: false
draft: false
faq:
  - q: "Do AI providers train their models on all my conversations?"
    a: "Not necessarily. It depends on the provider, the product, the account type and the privacy settings. Many enterprise services and APIs don't use customer data to train models by default, while some personal products may do so unless the user opts out."
  - q: "What can a company reveal when using AI?"
    a: "Beyond personal data or documents, a company can reveal operational context, decision criteria, internal instructions, corrections and working methods. The risk depends on what is shared and on the provider's terms."
  - q: "Are open-weight models always open source?"
    a: "No. Open weights let you download and run the model's parameters, according to its license. Fully open-source AI also requires sufficient access to the code, training information and other components needed to study and modify the system."
---

Every time you use AI, two bills arrive. One you see: the subscription. The other you barely notice: the one charged with what you hand back to the system.

> **In 30 seconds:** not every AI tool uses your data the same way. The real risk shows up when you share documents, operational context and internal criteria without knowing the provider's terms. The safest strategy isn't to abandon the cloud, but to split the tasks: sensitive data local or anonymized; complex, non-confidential tasks on remote services; and your working memory under the company's control.

<nav aria-label="Table of contents">

**In this article**

1. [What the second AI bill is](#la-segunda-factura)
2. [What data and knowledge are at risk](#datos-en-riesgo)
3. [Open weights vs. open source](#pesos-abiertos)
4. [When local AI makes sense](#ia-local)
5. [How to build a hybrid flow](#flujo-hibrido)
6. [Checklist to protect your company](#checklist)

</nav>

Satya Nadella, CEO of Microsoft, called this problem the "Reverse Information Paradox": a company pays for access to intelligence and, at the same time, may reveal proprietary knowledge through the prompts, tools, evaluations and corrections needed to make the model useful. The thesis was laid out by Nadella in an [essay published on X](https://x.com/i/article/2076319195718090753) and later analyzed by [TechRadar](https://www.techradar.com/pro/you-essentially-pay-for-intelligence-twice-once-with-money-and-again-with-something-even-more-valuable-microsoft-ceo-satya-nadella-warns-ai-users-not-to-give-away-too-much).

According to TechRadar, Nadella criticized companies that "protect" their models but learn from customer data through interactions and feedback. In his words, it means paying for intelligence twice, and giving away what makes your work unique.

Let's break down what this means, why you need to react now, and what the practical path looks like: keeping AI's power without handing your company's know-how over on a plate.

<h2 id="la-segunda-factura">The second bill: where your know-how leaks</h2>

Think of AI as a brilliant intern. It observes everything, works fast, learns from every tweak you make. In three months it works almost like you. There's just one catch: it isn't yours. What it learned from you may show up on your competitor's desk tomorrow.

That's how you lose what matters most: your craft memory, your quality standards, your mental shortcuts. It's not "just data." It's judgment. When you paste an entire document "just to summarize it," explain which project you're on, or correct answers with "don't do it like that, do it this way," you're transferring method.

This doesn't work the same across every service. The rules depend on the product, the plan you've subscribed to, and the privacy settings. In personal products, some providers may use conversations to improve their models, though they offer opt-out mechanisms. In enterprise offerings and APIs, training on customer data is commonly disabled by default. So before sharing sensitive information, check the specific product's policy, not just the company's general policy. See, for example, the official policies of [OpenAI](https://help.openai.com/en/articles/5722486-how-your-data-is-used-to-impr) and [Anthropic](https://privacy.claude.com/en/articles/7996868-is-my-data-used-for-model-training).

That's the core of Nadella's warning: with AI, the one at risk of giving away knowledge is not the one selling the model, it's the one buying the service and having to feed it to make it work well.

<div class="not-prose my-10">
  <a href="/en/estudio/segunda-factura-ia/encuesta/" class="group block rounded-3xl border border-orange-500/25 bg-gradient-to-br from-orange-500/10 to-transparent p-6 md:p-8 no-underline transition hover:border-orange-500/50">
    <p class="mb-2 text-xs font-semibold uppercase tracking-widest text-orange-400">Study in progress · 3 min · anonymous</p>
    <h3 class="mb-2 text-xl font-bold leading-tight text-white md:text-2xl">And in your company? Help us measure it</h3>
    <p class="mb-4 text-sm leading-relaxed text-gray-300 md:text-base">We're measuring exactly this — the second bill of AI — with a 3-minute anonymous survey: real AI use at work, what information flows through these tools and what controls exist. No sign-up and no confidential data required.</p>
    <span class="inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-black transition group-hover:bg-orange-400">Take the survey →</span>
  </a>
</div>

<h2 id="datos-en-riesgo">How we classify data in IA Operators projects</h2>

Before connecting any model, at [IA Operators](https://iaoperators.com/en/) we start from a simple idea: not all data deserves the same treatment. Most know-how leaks don't come from a sophisticated attack, but from sending "out" something that should have stayed in. So the first step isn't picking a tool: it's classifying the information and deciding its route.

This is the framework we apply as a starting point on a project:

| Type of information | Example | Recommended route |
| ------------------- | ------- | ----------------- |
| Public | Website content and public documentation | Remote model |
| Internal | Procedures with no personal data | Enterprise API |
| Confidential | Contracts and strategy | Local or anonymized |
| Highly sensitive | Credentials and personal data | Don't send to the model |

A pattern we see often (illustrative example): a team pastes entire contracts into a public chat "just to summarize them." The summary comes out fast, but it just exposed clauses, amounts and negotiation strategy. The same task, done with an anonymized version of the contract or with a local model, delivers the summary without exposing what sets the company apart. The result is nearly identical; the hidden bill is not. This classification is exactly the kind of risk we surface in a [technology ecosystem audit](https://iaoperators.com/en/auditoria-de-sistemas/), where Shadow AI — tools used with no control or policy — is usually the biggest source of leaks.

<h2 id="pesos-abiertos">Open weights, open source and real choice</h2>

"If tomorrow they take away the model you use, can you keep working?" If the answer is no, you're in a dead end.

Open-weight models make the model's final parameters available, allowing it, depending on the license, to be downloaded and run on your own infrastructure. But "open weights" doesn't automatically mean "open source." According to the [Open Source Initiative](https://opensource.org/ai/open-weights), truly open-source AI also requires sufficient access to the code, the training process and information about the data, so the system can be studied, modified and shared.

Open-weight models offer a real way out: you can download and run the weights on your own infrastructure and, depending on the license and the materials provided, adapt the model to your needs. That gives you freedom to keep your memory and your corrections with you, standardize your "work manual" in a portable way, and avoid your work depending on a single provider.

The open-weight ecosystem is gaining adoption fast. In June 2026, [OpenRouter reported](https://openrouter.ai/blog/insights/deepseek-v4-adoption/) that DeepSeek's share of tokens nearly doubled in six months, going from roughly 9% to 18%. Chinese models from Xiaomi, MiniMax and Tencent also grew, mainly at the expense of Google and OpenAI models.

It's not about picking "the best in the world at everything." It's about having options. And about being able to keep working even if someone shuts off the tap.

<h2 id="ia-local">"But can you run local AI without a $15,000 machine?"</h2>

Direct question that came up several times. Honest answer: it depends on what you want to do.

If the task is private, repetitive and well-scoped (summarizing internal documents, generating drafts, classifying emails, standardizing reports), a small or medium local model is usually enough. If the task is open-ended, creative and heavy (broad research, complex reasoning, advanced multimodal), a powerful remote service will still be better.

It's not all or nothing. It's designing a flow where what's sensitive and standard runs local, what's heavy and non-confidential runs remote, and your working memory stays with you.

And hardware? What really matters is three things: available memory (to load the model and the context), acceptable latency (how long you tolerate per response), and the size/type of the model (smaller, quantized ones run on ordinary machines; giants demand serious acceleration).

Projects like [llama.cpp](https://github.com/ggml-org/llama.cpp/blob/master/README.md) let you run models locally on different kinds of hardware, including CPU, GPU and hybrid setups. They also offer quantization at different levels to reduce memory usage. The [Ollama](https://docs.ollama.com/import) documentation explains that quantization can make a model faster and more viable on more modest equipment, though there is usually some loss of precision.

Where people trip up:

- Expecting a massive model to run "smoothly" on any laptop. It won't.
- Believing that without a top-tier GPU nothing is any good. Not true for plenty of useful day-to-day work.
- Concluding that, because it can't run the biggest model, "local AI is useless." It's useful, if you pick the right task.

Practical tip to start without pain: begin with what you already have, run a small open-weight model with quantization, test it on your own tasks and measure whether it delivers. If it stalls, first simplify the task (less context, more iteration) and only then think about investing in hardware. Weigh real latency against the privacy gain: for many routines, waiting 5–10 seconds pays off if the content is sensitive.

Many scoped tasks can run without a data-center GPU, as long as the model size, the quantization, the available memory and the expected latency are compatible with the equipment.

## "What if they 'cap you by hardware'? What about geopolitics?"

A legitimate concern. But speculating about future blocks doesn't help you decide today. What can you do now?

- Work with open, portable standards (open-weight models, simple formats for your memory and your instructions).
- Avoid tying your process to a single provider or an exclusive SDK.
- Have a plan B: a second remote provider and a working local model for the essentials.

What matters is reducing excessive dependency. That's controllable today, without accepting paralysis out of fear. When that dependency touches critical systems, it's worth ordering it inside a [technology roadmap](https://iaoperators.com/en/roadmap-tecnologico/) that prioritizes what to migrate, in what order, and with which alternatives.

## Privacy without giving up features: a middle path

If you want the conveniences of an online assistant but don't want to pay the second bill with your data, you can already choose differently.

Proton, known for Proton Mail and Proton VPN, launched <a href="https://pr.tn/ref/ZB65FBGN" rel="sponsored nofollow noopener noreferrer" target="_blank">Lumo</a>, a privacy-focused AI assistant. (Disclosure: this is a referral link. We may receive a benefit if you sign up through it, at no additional cost to you.) According to its [official security model](https://proton.me/lumo/security), the company keeps no logs of conversations and doesn't use the content to train its models. Saved history is protected with zero-access encryption. During response generation, however, the message must be temporarily decrypted on Proton's servers to be processed by the model; after that, the server keeps no permanent plaintext copy.

Why does this matter here? Because it strikes at the heart of the second bill: reducing the leak of your judgment and your context when you need to run something off your machine.

Use any tool that delivers three things: explicit control over data usage; portable memories and preferences; and clarity about which model is running and where.

<h2 id="flujo-hibrido">How to build a hybrid LOCAL/REMOTE flow that protects what's yours</h2>

Here's a process design you can fold into your work right now. It's, in essence, the [AI strategy for business](https://iaoperators.com/en/servicios/consultoria-ia/) we apply with our clients.

**1. Define the policy for what never leaves.** List what's sensitive: client documents, contracts, internal databases, personal emails. Create a "working version" without critical data (simple redaction already solves a lot).

**2. Structure your working memory.** Keep instructions, voice patterns, checklists and review rubrics locally. Every correction you make becomes an explicit rule. That's your manual. It's yours, not the provider's.

**3. Split tasks by risk vs. reward.** High sensitivity + low creativity: runs local. Medium sensitivity + medium effort: try local; if the time blows up, consider remote with data protection. Low sensitivity + high complexity: powerful remote.

**4. Keep two model routes.** One path with an open-weight model you can run today. One path with a trusted remote provider, plus a second as backup. It keeps you from being held hostage.

**5. Audit the "second bill."** Log when you shared context, attachments and corrections. Ask: did I really need to send that out? What could have stayed in my manual?

**6. Measure what matters.** Time to a good draft. Number of corrections needed. Privacy comfort with what you sent.

Continuous improvement: every time you correct the agent, turn the correction into a rule inside your local memory. That's how your judgment stays with you.

## "Do local agents actually work?"

Let's take a common case: you come back from vacation and need to pick a client back up from a bundle of documents.

Local-agent flow in 6 steps:

1. **Ingestion:** the agent reads the client folders (redacted versions), extracts topics, deadlines, stakeholders and open items.
2. **Map:** generates an executive summary of up to 1 page and a timeline with next steps.
3. **Questions:** flags uncertainties and asks for the missing documents.
4. **Standardization:** applies your tone and your rubrics (which live in your local memory) to format the deliverables.
5. **Check:** validates consistency against a checklist of your own (dates, names, numbers).
6. **Output:** produces re-engagement emails, a meeting schedule and a 30-day plan.

What might a local model not deliver? Open web research at top-tier quality, long creative reasoning without breaking into stages, and advanced multimodal generation.

But for an organized restart, with private context, it already does a lot. And when you're short on muscle, you have the remote route, without opening the whole safe. Taking this kind of agent to production, with persistent state and observability, is exactly the work of [AI systems implementation](https://iaoperators.com/en/implementacion/).

## Where people go wrong most

- Unwittingly training someone else's AI with your standard of excellence. Every "fine-tune" you give in the chat should become your rule, not content for their model.
- Believing that "total privacy" requires ludicrously expensive hardware. What solves it is a well-chosen scope and suitable open-weight models, not just GPU.
- Getting held hostage by a single provider. Dependence gets expensive when the rules change and you can't change with them.
- Dumping sensitive data into the chat out of haste. Simple redaction avoids the unnecessary leak.
- Expecting local AI to replace the entire remote ecosystem. The winning strategy today is hybrid.

## Trade-offs, no illusions

Instead of an absolute rule, compare the three modes by what's actually at stake:

| Criterion | Local AI | Enterprise API | Public chat |
| --------- | -------- | -------------- | ----------- |
| Data control | High | Medium/high | Variable |
| Power | Depends on hardware | High | High |
| Deployment | More complex | Medium | Simple |
| Privacy | Potentially high | Contractual | Depends on settings |
| Best use | Sensitive information | Corporate operations | Non-confidential tasks |

Don't turn the table into an absolute rule: settings and contract still matter. Maturity is knowing when each one makes more sense, and not giving away your work manual on impulse.

## Facts that help you decide now

- The "paying twice" warning and the case for control, portability and retaining what's yours come from Microsoft's own CEO, as reported by TechRadar. Use it as a criterion when choosing a provider.
- If you want an online assistant without giving up privacy, <a href="https://pr.tn/ref/ZB65FBGN" rel="sponsored nofollow noopener noreferrer" target="_blank">Proton's Lumo</a> uses zero-access encryption, stores no chat logs and doesn't train its models on your data; the [Lumo 2.0 update](https://proton.me/blog/lumo-2) added reasoning, persistent memory, image and cited-search capabilities while keeping the privacy focus.
- The open ecosystem is competitive: in 2026, Chinese models overtook American ones in share of tokens processed on [OpenRouter](https://openrouter.ai/blog/insights/deepseek-v4-adoption/) in early June. It's a meaningful adoption signal within the platform, but it doesn't represent the entire AI market on its own.

These figures aren't telling you to "swap everything." They reinforce one line: keep your power to choose, keep your memory with you, and have a plan B that doesn't depend on a single company.

<h2 id="checklist">Final checklist to protect your work (and still gain speed)</h2>

- Do I know what I never send out?
- Do my corrections become rules in my local memory?
- Do I have a working open-weight model for sensitive tasks?
- Do I have two remote-provider routes (primary and backup)?
- Do I log when and why I share documents and context?
- Does my remote assistant clearly explain how it uses my data?
- If my favorite model disappears tomorrow, do I keep producing?

If you answered "no" to three or more, adjust the flow today. Not to isolate yourself. To work better on both fronts and, above all, to keep the fruit of your effort yours.

The takeaway? AI can be your best intern, your right hand and your accelerator. As long as the notebook, the manual and the memory stay with you, always.

Before you connect one more AI, find out what needs to stay under your control. [IA Operators](https://iaoperators.com/en/) runs a Digital X-Ray of your technology ecosystem, mapping applications, integrations, dependencies, Shadow IT and operational risks. Then we turn the diagnosis into a prioritized roadmap and, when needed, implement the automations, integrations and systems, with the same team, from diagnosis to execution.

[Request a 30-minute conversation with a specialist](https://iaoperators.com/en/contact/)
