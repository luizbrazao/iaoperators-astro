---
title: "How to use Codex: 15 tips to go from vibe coding to verifiable work"
seoTitle: "How to use Codex: 15 tips for real results"
ogTitle: "How to use Codex without wrecking production"
description: "Learn how to use Codex from OpenAI with 15 practical tips to write code, automate tasks, work with local files and execute changes safely and under control."
category: tools
articleSection: "AI Agents & Automation"
date: 2026-08-05T19:18:00+02:00
image: https://scribos.s3.us-east-1.amazonaws.com/workspaces/2/articles/7/cover/1785958349-938e0c31c666.png
cover: https://scribos.s3.us-east-1.amazonaws.com/workspaces/2/articles/7/cover/1785958349-938e0c31c666.png
imageSchema:
  - https://scribos.s3.us-east-1.amazonaws.com/workspaces/2/articles/7/cover/1785958349-938e0c31c666.png
imageAlt: "Developer reviewing on screen the changes proposed by an AI agent before approving them"
ogImage: /og/en/how-to-use-codex-tips.png
ogImageWidth: 1200
ogImageHeight: 630
about:
  - type: SoftwareApplication
    name: Codex
  - type: Organization
    name: OpenAI
  - type: Thing
    name: Coding agents
tags:
  - how to use Codex
  - OpenAI Codex
  - Codex tips
  - how Codex works
  - automate tasks with Codex
  - coding agents
  - Codex Computer Use
  - Codex Skills
  - Codex Goal mode
  - vibe coding
locale: en
translationKey: como-usar-codex
author: "Luiz Fernando Brazão"
authorTitle: "Founder of IA Operators"
authorUrl: "https://iaoperators.com/en/autores/luiz-fernando-brazao/"
authorSameAs:
  - "https://www.linkedin.com/in/ferbrazao/"
authorBio: "Luiz Fernando Brazão is the founder of IA Operators and works on agent architecture, enterprise automation, systems integration and shipping artificial intelligence to production."
faqSchema: true
draft: false
faq:
  - q: "What is OpenAI Codex?"
    a: "Codex is OpenAI's agent specialized in programming and technical work. It can write and debug code, run commands and tests, review changes, work with repositories and use extra tools depending on the environment and the permissions available."
  - q: "What is the difference between Codex and ChatGPT Work?"
    a: "Codex is aimed mainly at software development, terminal, repositories and technical tasks. ChatGPT Work is designed for research, analysis and deliverables such as documents, spreadsheets, presentations, reports and Sites."
  - q: "Which model should I use in Codex?"
    a: "Sol is the best option for complex or ambiguous problems. Terra works well for everyday work that needs reasoning and tools. Luna fits clear, repeatable, high-volume tasks. When you are not sure which one to pick, OpenAI recommends starting with Sol."
  - q: "Can Codex control my computer?"
    a: "In supported environments and with the right permissions, Codex can use Computer Use to observe and operate applications. You should limit access, require confirmation for sensitive actions and avoid granting permissions you do not need."
  - q: "What is Goal mode in Codex?"
    a: "Goal mode lets you set a durable objective and success criteria for work that needs several iterations. It works best when the goal can be measured through tests, metrics, states or verifiable deliverables."
  - q: "How do I stop Codex from deleting files or taking wrong actions?"
    a: "Limit access to specific folders, ask for a preview before destructive actions, use backups or version control, and require explicit confirmation before deleting, publishing, deploying or overwriting anything."
  - q: "Can Codex work while I am away from the computer?"
    a: "Codex can run automations and certain long-running jobs. How it behaves depends on whether the task is local, remote or cloud. With remote access to a local session, the host machine has to stay on, connected and running Codex."
  - q: "Is Codex only for developers?"
    a: "Codex is still specialized in software and technical work, but it can use code, Skills, plugins and Computer Use to complete tasks in other areas. For general deliverables with no meaningful technical component, ChatGPT Work is usually a more direct option."
---

You ask an AI for something, you get an answer that looks right, and the actual work still is not done. Sound familiar?

Codex changes that dynamic. Instead of suggesting code or explaining what you should do, it can work on a project, edit files, run commands, check results and hand you changes you can review.

But learning **how to use Codex** is not about writing longer prompts. The gap between an impressive demo and a useful result comes down to how you define the task, what context you provide, what permissions you grant and how you verify the output.

This guide gives you 15 practical tips to move from *vibe coding* — asking for changes on instinct and hoping they work — to a way of working that is controlled, verifiable and safe.

> **Update note — August 2026:** available features can vary depending on your plan, operating system, region, workspace permissions and app version.

## What Codex is and what it is for

Codex is OpenAI's agent specialized in software development and technical work. It can write and debug code, run tests and commands, review changes, work with repositories and operate on local folders when you grant it permission.

OpenAI currently separates three main experiences:

- **Chat:** for questions, search, ideas and conversational help.
- **Work:** for research, analysis and deliverables such as documents, spreadsheets, presentations, reports or Sites.
- **Codex:** for programming, terminal, repositories, tests, technical changes and project-related automation.

Codex started out as a coding agent, but its capabilities have grown. In the desktop app it can use Skills, plugins, a browser, Computer Use, voice and other tools to work with applications and complete flows that go beyond writing code. Even so, if you need a report, a deck or a spreadsheet with no real technical component, ChatGPT Work is usually the more natural place to start.

If you are still mapping the landscape of [AI tools for development](/en/blog/9-herramientas-inteligencia-artificial-desarrollo/), Codex sits at the far end of it: not a system that suggests, but one that takes a goal, decides the steps and acts on your tools.

## Before you start: choose where to use Codex

Codex can be used from several surfaces:

- The ChatGPT desktop app for macOS or Windows.
- An extension for development environments.
- Codex CLI from the terminal.
- Supported cloud environments.
- Remote access to certain sessions from the mobile app.

The right choice depends on the job. Use the **desktop app** when you need to combine code, local files, terminal, browser and applications. Use the **IDE extension** when you want to review changes inside your editor. Pick the **CLI** if you prefer working from the terminal or want Codex inside an existing technical workflow.

With that out of the way, here are the 15 tips.

## How to use Codex to get real work done

### 1. Decide first whether the task belongs to Codex or to Work

One of the most common mistakes is reaching for Codex for anything AI-related.

Codex is strongest when the result requires a technical action:

- editing a repository;
- building or fixing a feature;
- running tests;
- analyzing logs;
- migrating code;
- setting up an integration;
- working with files and dev tools;
- automating a process with scripts.

If instead you want to research cameras and get a comparison spreadsheet, prepare a sales deck or turn several documents into a report, you should probably start in ChatGPT Work.

Rule of thumb:

- If the main output is **code, a technical configuration or an action on a system**, use Codex.
- If the main output is **a document, analysis, spreadsheet, deck or report**, start in Work.
- If you just need to **understand something or explore an idea**, use Chat.

Picking the right surface cuts usage, errors and context switching.

### 2. Define a deliverable, not a vague intention

An instruction like this leaves far too much room for interpretation:

> Improve this app.

Codex has no idea whether "improve" means make it faster, change the design, remove bugs or rewrite its architecture.

An executable instruction should contain four things:

1. **Context:** what the project is and what state it is in.
2. **Goal:** the result you want.
3. **Constraints:** what must not change.
4. **Definition of success:** how the result will be checked.

For example:

> This React app handles appointment booking. Fix the bug that creates duplicate bookings when the user double-clicks. Do not change the design or the database schema. Consider the task done when there is protection against double submission and the related tests pass.

Now Codex has a bounded problem and a win condition. The more verifiable the result, the less you have to guess whether it "seems to work".

### 3. Give the right context and declare the source of truth

Codex can read folders, repositories, documentation and files tied to a project. But having access to more information does not mean it automatically knows which part is correct.

Tell it:

- which folder holds the active project;
- which branch to use;
- where the requirements are;
- which file holds the business rules;
- which documentation is current;
- which files are historical or obsolete;
- which external services are involved.

A good prompt might read:

> Use `/docs/booking-rules.md` as the source of truth for booking rules. The file `/docs/old-flow.md` is historical and must not influence the solution. Before changing any code, list any contradictions you find between the requirements and the current implementation.

That stops the agent from quietly reconciling incompatible documents on its own.

On large projects it also pays to keep a permanent file with architecture, conventions, dev commands, quality criteria, security rules and your definition of done. Do not force the agent to rebuild an understanding of the project from scratch in every conversation.

### 4. Ask for a plan before allowing significant changes

For a small fix, Codex can just act. For migrations, refactors, infrastructure changes or anything touching several parts of the system, ask for a plan first.

Use an instruction like:

> Analyze the problem and present an execution plan. Include affected files, risks, dependencies, rollback strategy and how the result will be validated. Do not change anything yet.

Pay attention to:

- whether the order of execution makes sense;
- whether the agent spotted hidden dependencies;
- whether there is an objective way to validate;
- whether it proposes backups or restore points;
- whether the change touches more components than it needs to.

Asking for a plan is not about adding bureaucracy to every task. It is about raising the level of supervision when the cost of being wrong is high.

### 5. Allow browsing only when it adds information you actually need

Browsing helps when you need current documentation, recent API changes, library versions, technical specs, known issues or current pricing and limits.

But opening the browser for everything adds time, usage and the risk of pulling from low-quality sources. You can set this rule:

> Use the files and documentation inside the project first. Only browse if information is missing that may have changed, or if you need to check the official documentation. If you browse, state what you are looking for, why it is necessary and which sources you used.

You can also restrict the sources:

> For this integration, use only the provider's official documentation. Do not base the implementation on tutorials, forums or old answers without verifying them.

Browsing should not replace reasoning over the context you already provided.

### 6. Use Computer Use with minimum permissions

Codex can operate applications through Computer Use: looking at interfaces, clicking, typing and working with tools that have no decent API.

That is useful for testing a UI, performing actions in an internal app, checking a signup flow, comparing visual behavior before and after a change, working with legacy systems or automating tasks in tools with no integration.

But driving an interface introduces risk. A misidentified button, an unexpected window or a layout change can trigger actions you did not want.

Set explicit limits:

> You may use the browser and the test application. Do not open the password manager, billing or personal accounts. Do not confirm purchases, publications, submissions or deletions without my authorization.

For file work:

> Work only inside the `/demo-project` folder. Do not move, rename or delete files outside it. Before deleting any file, show a preview and wait for confirmation.

OpenAI describes Computer Use as the ability to work with applications through its own cursor. That freedom needs scoped permissions and supervision proportional to the risk.

### 7. Review changes, run tests and demand evidence

A convincing answer is not proof that the work was done properly.

When Codex changes a project, ask it to hand over a summary of the changes, the list of modified files, the relevant diff, the tests it ran, the test results, outstanding errors, decisions or assumptions, and instructions to reproduce the validation.

For example:

> When you finish, give me a summary of ten bullet points maximum, list the modified files, run the relevant tests and explain how I can reproduce the result locally.

For a performance problem:

> Bring mobile LCP down from 4.0 seconds to a maximum of 2.5 seconds. Measure before and after under the same conditions and attach the Lighthouse results.

One conceptual correction matters here: improving LCP means **lowering** the time, not raising it.

For code, the best evidence is usually automated tests, a clean build, linters, type checks, benchmarks, screenshots, logs and a before/after comparison.

Without evidence, you are still relying on trust. With evidence, you can review.

### 8. Use voice to coordinate, not to define critical details

ChatGPT Voice lets you talk to Work and Codex in the supported desktop app. You can start tasks, ask about progress, interrupt and coordinate work through conversation.

Voice is great for explaining context quickly, capturing an idea while you review something, asking for an initial diagnosis, asking what is blocking a task, coordinating several threads or requesting a progress summary.

Sensitive details, though, should be confirmed in writing: paths, variable names, quantities, domains, commands, acceptance criteria, exclusions, credentials and destructive actions.

A good rhythm is: **use voice to set up and steer; use text to authorize and close.** You get the speed of talking without losing precision on the decisions that matter.

### 9. Choose between Sol, Terra and Luna based on the task

Codex currently offers three main models in the GPT-5.6 family:

- **Sol:** for complex, ambiguous or high-value work.
- **Terra:** for everyday tasks that need solid reasoning and tool use.
- **Luna:** for clear, repeatable, structured or high-volume work.

The official recommendation is to start with Sol when you do not know which model to pick. The Power setting uses Sol with medium reasoning. That does not mean you should always run at maximum capacity.

**When to use Sol:** complex architecture, bugs that are hard to reproduce, migrations, deep technical research, changes with many dependencies, decisions with real trade-offs.

**When to use Terra:** well-specified features, moderate refactors, code analysis, tests, technical documentation, automations of medium complexity.

**When to use Luna:** classification, extraction, repetitive transformations, mechanical changes, structured summaries, high-volume tasks with a stable format.

Use the lowest level of reasoning that produces a reliable result. More reasoning can help on hard tasks, but it also means higher usage and latency.

### 10. Turn repetitive processes into Skills

Skills are reusable flows that teach ChatGPT or Codex to do a task consistently. A Skill can contain instructions, examples, scripts, templates, quality criteria, reference material and a fixed sequence of steps.

Once installed, the system can pick it up automatically when it is relevant, or you can ask for it explicitly.

Examples of useful Skills:

- reviewing a pull request against your company standard;
- preparing a release;
- running an accessibility check;
- turning a technical meeting into tasks;
- reviewing an [n8n](/en/blog/n8n-vs-zapier-vs-make/) integration;
- generating documentation from a template;
- analyzing production logs;
- building a landing page with your design system.

Do not turn every prompt into a Skill. Create one when you repeat the flow often, there is a recognisable standard, several people should get consistent results, or skipping a step has a real cost.

A well-designed Skill turns tacit expertise into a reusable process.

### 11. Use plugins and integrations before automating the interface

Before asking Codex to open an app and click around, check whether there is a plugin, an official integration, an API, an MCP server, a specific Skill or a command line tool.

Plugins can bundle Skills, apps, templates and integrations so Codex gets context and can act inside supported tools. OpenAI has expanded the catalogue of plugins available for development and productivity services.

Recommended order:

1. API or official integration.
2. Trusted plugin or MCP server.
3. CLI.
4. Computer Use as the fallback.

Structured integrations are usually more reliable than automating a visual interface, especially when the process will run many times. It is the same criterion we apply when choosing between [automation tools](/en/blog/n8n-vs-zapier-vs-make/): anything that runs a thousand times needs a stable contract, not a screen that can change.

When no suitable integration exists, use Computer Use with intermediate checks and confirmation before irreversible actions.

### 12. Schedule automations that deliver auditable output

Codex can run recurring work through Automations: triaging unlabelled issues, analyzing CI failures, preparing a pull request summary, checking outdated documentation, reviewing dependencies, analyzing logs, continuing a long-running task or following up on project conversations.

Automations can reuse existing threads, keep context and pick work back up over time.

Do not just schedule an action. Define what it has to deliver:

> Every morning, review production errors from the last 24 hours. Group them by likely cause, state frequency and impact, link the evidence and propose a priority. Do not change anything in production.

Always include scope, frequency, time limit, sources, stop conditions, output format, allowed actions and forbidden actions.

An automation that does work without producing a verifiable record turns into a black box very quickly.

### 13. Use Goal mode for durable, verifiable objectives

Goal mode is built for work that a single action cannot finish. It lets you set a durable objective and define success criteria so Codex keeps pushing the result forward.

It suits goals like raising test coverage, cutting build errors, completing a migration, keeping documentation in sync, improving a metric over time or closing a defined list of issues.

The objective needs an observable condition.

Bad objective:

> Make the project better.

Useful objective:

> Reduce the project's TypeScript errors from 86 to zero without disabling rules or using `any` as a blanket fix. Run the type check after each block of changes and keep a record of the errors you resolved.

Another example:

> Raise test coverage on the billing modules from 54% to 80%, prioritizing critical paths. Do not write tests that only inflate coverage without validating behavior.

Goal mode does not remove supervision. The longer the agent can work, the more important it is to define limits, checkpoints and acceptance criteria.

### 14. Understand the difference between local, remote and cloud work

This distinction prevents a lot of permission and expectation problems.

**Local work.** Codex accesses a folder or environment on your computer. Useful when it needs local files, installed tools, a specific dev environment, services that only run on your network or desktop applications. Grant access only to the folders it needs.

**Remote work.** From the mobile app you can reach certain Codex sessions running on a supported computer. The host machine has to stay on, connected and running Codex for remote access to keep working. It is useful for checking progress, answering questions, approving actions or continuing a task you started on the computer. It is not the same as running Codex entirely on the phone.

**Cloud work.** In cloud flows, the task runs in a managed, isolated environment. That model fits working on repositories, running tasks in parallel or delegating processes that do not depend on your desktop.

Before choosing, ask yourself:

- Does it need files or programs from my computer? **Local.**
- Do I need to supervise a computer session from another device? **Remote.**
- Can it run in an isolated environment connected to the repository? **Cloud.**

Where execution happens determines what data and tools the agent can reach.

### 15. Close every task with a deliverable, not with "done"

Codex's last message should let someone else understand what happened without rereading the whole conversation.

Always ask for a closing report with the original goal, the final state, modified files, tests run, evidence, outstanding risks, decisions made, steps to deploy or continue, and rollback instructions where relevant.

You can use this prompt:

> Close the task with a short report. Include what you changed, what you did not change, how you validated the result, outstanding risks and the exact steps for someone else to continue.

When the result needs to be shared visually, you can also use ChatGPT Sites to build a page, a lightweight app, a dashboard or a prototype. Sites can be used from Work on the web and from Work or Codex in the desktop app, where it is available for your plan, region and workspace.

Do not auto-publish a sensitive result. Check the files included, personal data, keys or secrets, access permissions, visibility, domain and the deployed version.

Delivering is not just finishing execution. It is leaving the result ready for review, approval or use.

## Security: the rules that should accompany every prompt

The more capable an agent is, the higher the potential cost of an ambiguous instruction. These rules shrink the risk surface:

- **Minimum permissions.** Work only inside the authorized folder.
- **Preview before destructive actions.** Show which files would be deleted or overwritten. Do not run it yet.
- **Explicit confirmation.** Do not publish, purchase, send, delete or deploy without written confirmation.
- **Usage limits.** Stop if you exceed the defined limit on time, external calls or cost.
- **Credentials outside the prompt.** Do not paste passwords or tokens into a conversation when there is a secrets mechanism, environment variables or managed credentials.
- **Change log.** Produce a log with date, actions, affected files and outcome.
- **Rollback.** Before touching production, explain how to get back to the previous state.

Security is not a review you bolt on at the end. It is part of how the task is defined in the first place.

## Common mistakes when using Codex

**Asking for a solution without defining success.** If it cannot be measured, the agent has to guess when to stop.

**Granting access to the whole computer.** An agent does not need global permission to edit one project folder.

**Using Computer Use when an API exists.** Automating clicks is usually more fragile than a structured integration.

**Picking the most powerful model for everything.** Unnecessary power increases usage and latency without guaranteeing a proportional improvement.

**Not reviewing the diff.** Passing tests does not mean the change is correct, maintainable or aligned with the business.

**Allowing browsing without controlling sources.** A recent answer is not automatically a reliable one.

**Scheduling tasks without asking for reports.** Automations have to produce evidence and keep a trail.

**Confusing Codex with ChatGPT Work.** The two experiences share capabilities, but they were designed for different outputs.

**Giving contradictory instructions.** If you ask it to "act autonomously" and also to "check with me before any decision", the agent has no way to know which one wins.

**Treating "works on my machine" as validation.** Define environments, tests and reproducible conditions.

## A prompt template for using Codex

You can reuse this structure:

- **Context.** Describe the project, its current state and the source of truth.
- **Goal.** State the specific result you need.
- **Scope.** Explain which files, systems or components it can change.
- **Exclusions.** Make clear what it must not touch.
- **Constraints.** Include security, compatibility, cost and allowed technologies.
- **Plan.** Say whether it should present a plan before executing.
- **Validation.** Define tests, metrics or evidence.
- **Delivery.** Specify the format of the final output.

### Full example

> We are working on a React and Node.js app for managing bookings. The updated rules are in `/docs/booking-rules.md`.
>
> Fix the bug that allows two bookings to be created when the user clicks the confirm button twice.
>
> You may change the frontend, the API and the tests related to booking creation. Do not change the database schema or the visual design.
>
> Before editing, present a short plan with the likely cause, affected files and validation strategy.
>
> Consider the task finished when there is protection on both frontend and backend, the tests pass, and a repeated request with the same identifier does not create a second booking.
>
> When you are done, deliver the summary, the modified files, the tests you ran and any outstanding risks.

## Checklist to start today

- Pick a real, bounded task.
- Decide whether it belongs in Chat, Work or Codex.
- Define the deliverable.
- State the source of truth.
- Limit permissions.
- Ask for a plan when the risk is real.
- Define how the result will be checked.
- Select the right model.
- Review changes and evidence.
- Document the close.

You do not need to start with a full migration or an automation that runs your whole company. Start with a task that currently costs you 30 to 60 minutes, has a verifiable result and can run inside a controlled environment.

## Conclusion

Learning how to use Codex is not about finding a magic phrase.

It is about moving from vague instructions to testable objectives; from global permissions to minimum access; from accepting answers to reviewing evidence; and from using artificial intelligence as an assistant to directing it as a technical operator.

*Vibe coding* is fine for exploring ideas and building prototypes. But when the result touches customers, data, production or money, you need more: context, limits, tests and traceability.

Codex can write code, run commands, work with repositories, operate tools and carry tasks over time. Your advantage does not come from having access to the agent. It comes from knowing how to design the working system around it.

Start with a small result. Define what finished means. Allow only what is necessary. Demand evidence. Then, and only then, increase autonomy.

---

Want to apply AI agents to real processes in your company? At **IA Operators** we analyze processes, tools, data and risks before automating anything. We design systems that do not just answer: they execute, integrate with your existing stack and produce measurable results. Start with a [systems and automation audit](/en/auditoria-de-sistemas/) or take a look at our [AI automation service](/en/servicios/automatizacion-ia/).

### Official sources

- OpenAI — Codex in ChatGPT.
- OpenAI Help Center — ChatGPT Work and Codex.
- OpenAI Developers — Recommended models for Codex.
- OpenAI Help Center — Skills in ChatGPT.
- OpenAI — Introducing the Codex app.
- OpenAI — Codex for almost everything.
- OpenAI Help Center — ChatGPT Sites.
