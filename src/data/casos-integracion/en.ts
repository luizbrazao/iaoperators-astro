// The five cases of the integration silo, in English.
//
// This file mirrors the structure of `es.ts` exactly —same keys, same number of
// patterns, deliverables, bridges and FAQ entries per case— but it is NOT a
// literal translation. The Spanish copy is the original; this is a rewrite that
// keeps the argument, the technical specifics and the deliberately unglamorous
// tone, in English that reads as written rather than converted.
//
// SPANISH REGULATION IS DELIBERATELY ABSENT. The Spanish pages sell compliance
// with Verifactu and the Spanish customer-service law, because those are legal
// obligations for a Spanish audience. They are not obligations for the audience
// of these pages, so no equivalent content appears here. Where the Spanish file
// argued from a legal deadline, the English file argues from an operational
// failure mode instead.
//
// LINK RULE: every `href` under `puentes` must exist under `/en/`. The list of
// valid English destinations is CLOSED —siblings in the integration silo, the
// service and hub pages, three portfolio cases and three blog posts—. Spanish
// blog posts with no English version are not linked; their bridges point at the
// nearest English destination and the `body` says what that destination is,
// never what the Spanish post said.
//
// VERIFIED SOURCES (2026-08-10):
// - WhatsApp Business Platform: billing is PER MESSAGE (the per-conversation
//   model is deprecated). Template categories: marketing, utility and
//   authentication. Free-form messages inside the 24-hour service window opened
//   by the user are not charged, nor are messages received from the user, nor
//   messages sent inside the 72-hour free entry point window.
//   https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing

import type { CasoIntegracion, CasoKey, SharedIntegracion } from "./types";

export const SHARED_EN: SharedIntegracion = {
  proceso: {
    title: "How we work",
    subtitle: "The people who run the diagnosis are the people who build it. No hand-offs.",
    phases: [
      {
        code: "01",
        title: "Diagnosis",
        plazo: "3–5 days",
        body: "We map systems, data flows and the dependencies that actually exist, including the ones nobody wrote down. Output: a closed scope and the list of what is broken today.",
      },
      {
        code: "02",
        title: "Integration design",
        plazo: "1 week",
        body: "Data contracts, direction of sync, retry policy and who owns each field. This is settled before any code gets written, because it is the expensive thing to change later.",
      },
      {
        code: "03",
        title: "Build and testing",
        plazo: "2–6 weeks",
        body: "Built against the real edge cases, not the happy path. Tested against the actual systems and rolled out in stages.",
      },
      {
        code: "04",
        title: "Production and observability",
        plazo: "ongoing",
        body: "Status dashboard, alerts when something has gone too long without confirmation, and maintenance of the integrations when third-party APIs change under you.",
      },
    ],
  },

  principios: [
    {
      title: "Idempotent by default",
      body: "Every operation can be repeated without duplicating anything. That is what makes a retry safe, and without it no integration survives its first dropped connection.",
    },
    {
      title: "Observable state",
      body: "Every message has a state you can query: pending, sent, confirmed, failed. An integration you only notice when it breaks had already been breaking for a while.",
    },
    {
      title: "One owner per field",
      body: "For each field there is one system that decides and the others follow. Bidirectional sync without that rule ends in loops and in data that changes on its own.",
    },
    {
      title: "AI where it judges, not where it calculates",
      body: "Classifying, extracting and drafting are model work. Adding up, validating and routing are code work. Swapping them round is expensive and impossible to audit.",
    },
  ],

  tech: [
    "Node / TypeScript",
    "Queues with retry",
    "Supabase / PostgreSQL",
    "n8n",
    "Signed webhooks",
    "LangChain",
    "Docker",
    "Vercel",
  ],
};

export const CASOS_EN: Record<CasoKey, CasoIntegracion> = {
  erp: {
    nombre: "Companies running an in-house or heavily customized ERP",
    nombreCorto: "ERP",
    // The H1 can run long; the <title> cannot, because the brand suffix is
    // appended at render time and Google truncates it. Hence the mismatch.
    metaTitle: "ERP integration: connecting it to everything else",
    metaDescription:
      "We connect your ERP —in-house, bespoke or off-the-shelf— with e-commerce, POS, CRM and invoicing. No migration, and no writes to your production database.",
    h1: "ERP integration: connecting your ERP to the rest of the business",
    intro:
      "The ERP is usually the system that holds the most truth in a company and has the fewest connections. Everybody reads from it, almost nobody is allowed to write to it, and so a layer of spreadsheets grows around it doing the work of glue.",
    sintoma:
      "The signal is always the same: someone exports a CSV out of the ERP every morning. Sometimes it is two people and two different CSVs. That file is an integration — it just happens to be run by a human, it never fails in any visible way, and nobody knows what happens the day that person is off sick.",
    porQue: {
      title: "Why switching ERP doesn't fix it",
      body: "The standard pitch is to migrate to a modern ERP that already comes integrated. The problem is that an ERP with years on it is not a program: it is the real logic of the business, with its exceptions, its strange discounts and its flows that nobody ever documented. Migrating means rediscovering all of that under pressure, with the operation still running. When the ERP works and the only thing missing is that it talk to the other systems, building that connection layer costs a fraction and puts nothing about next month's invoicing at risk.",
    },
    patrones: [
      {
        title: "Inbound orders into the ERP",
        body: "The order is created somewhere else —online shop, POS, marketplace, a rep on a phone— and it has to land in the ERP exactly once, with its lines, its taxes and its customer resolved correctly.",
        riesgo:
          "Without an idempotency key derived from the external reference, a retry creates the order twice. It is the most common failure and the most expensive one to unwind.",
      },
      {
        title: "Stock from the ERP out to the sales channels",
        body: "The stock figure lives in the ERP and the website, the marketplace and the shop floor all need it. The design question is not how to copy it, it is how stale it is allowed to get and what you do with stock that is reserved but not confirmed.",
        riesgo:
          "Publishing real stock with no reservation logic produces oversell during campaigns. Publishing a conservative figure leaves money on the table. It is a business decision wearing the costume of a technical one.",
      },
      {
        title: "Invoicing and payment reconciliation",
        body: "From order to invoice, and from payment to reconciliation. This is where the ERP touches the payment gateway, the bank feed and whatever currently stands in for the link between the two.",
        riesgo:
          "The same payment arrives twice —once from the gateway, once from the bank statement— and without a stable reference on both sides it gets matched twice. Nothing crashes: a customer who still owes money is marked as paid, or a customer who paid gets chased. Reconciliation drifts quietly, and by the time somebody notices, the gap is months deep and has to be untangled by hand.",
      },
      {
        title: "Reporting without touching production",
        body: "Reports get built against a replica database or an analytical store, never against the database that is serving the operation.",
        riesgo:
          "One heavy query fired at the production database at eleven in the morning blocks invoicing. This happens more often than anyone admits in public.",
      },
    ],
    entregables: [
      "Map of the data flows between the ERP and every connected system",
      "Connectors with a queue, retry and idempotency per operation",
      "A data contract per flow: which fields, who decides, what happens on conflict",
      "Status dashboard with an alert on the age of pending items",
      "Integration documentation and hand-off to the internal team",
    ],
    puentes: [
      {
        href: "/en/integration/api-and-webhooks/",
        label: "APIs and webhooks",
        body: "The plumbing underneath: how each connector handles retries, signatures and duplicate events.",
      },
      {
        href: "/en/auditoria-de-sistemas/",
        label: "Digital X-Ray",
        body: "When it isn't clear how many systems there are or which ones talk, the diagnosis comes before the connector.",
      },
      {
        href: "/en/integration/legacy-systems/",
        label: "Legacy systems",
        body: "If the ERP exposes no API and all you have is database access, the pattern changes.",
      },
      {
        href: "/en/implementacion/",
        label: "Implementation",
        body: "How the connector layer actually gets built, tested against the real systems and rolled out in stages.",
      },
    ],
    faq: [
      {
        q: "Does the ERP need an API to be integrated?",
        a: "It helps a great deal, but it is not a hard requirement. In order of preference: documented API, events or webhooks, read-only access to the database, and file exchange. Each step down adds work and fragility, and the last one requires agreeing a processing window. What is genuinely required is some controlled way to write: if the ERP is a sealed box with no entry point at all, the integration becomes a project with your vendor rather than with us.",
      },
      {
        q: "Are you going to touch the ERP database?",
        a: "Read only, and preferably against a replica. Writing directly into an ERP's tables bypasses its internal validations and produces data the application itself cannot interpret. When there is no write API, the right conversation is with the ERP vendor, not a hand-written INSERT.",
      },
      {
        q: "How long does an ERP integration take?",
        a: "Three to eight weeks including the diagnosis, depending on how many flows are in scope and how accessible the ERP is. What stretches these projects is almost never the connector: it is the business exceptions that surface once you look at real data —the customer who invoices under a different legal entity, the discount applied by hand, the order that splits into two delivery notes.",
      },
      {
        q: "What if we change ERP next year?",
        a: "Then it is worth designing the integration with that assumption on the table. A connector layer with explicit data contracts survives an ERP change far better than a pile of automations coupled to today's table names. It isn't free, but it is the difference between rebuilding one piece and rebuilding everything.",
      },
    ],
  },

  crm: {
    nombre: "Sales teams running a CRM",
    nombreCorto: "CRM",
    // The title no longer says "CRM for business": that query is served by
    // product comparisons ("best CRM") and belongs to someone about to buy a
    // CRM, not to someone integrating the one they have.
    metaTitle: "CRM integration: connecting it to your ERP",
    metaDescription:
      "Leads that arrive on their own without duplicates, activity logged without typing, and ERP sync without loops. We automate the CRM you already run.",
    h1: "CRM integration and automation",
    intro:
      "A CRM doesn't fail for lack of features. It fails because keeping it current is manual work, and manual work only happens when somebody is watching. Integration means taking the person doing the typing out of the middle.",
    sintoma:
      "The CRM looks immaculate the day before the sales meeting. The two months before that, it doesn't. When data quality tracks the meeting calendar, what you have is not a CRM: it is a report filled in after the fact.",
    porQue: {
      title: "Why switching CRM doesn't fix it either",
      body: "A CRM migration is sold as the cure for the adoption problem, and for about three months it sometimes is. Then the same pattern comes back, because the cause was never the tool: it was that entering the information stayed the job of the person who gains least from entering it. A salesperson doesn't stop updating the CRM out of defiance; they stop because there are thirty seconds of friction between them and their next call. What changes behaviour is the record happening by itself.",
    },
    patrones: [
      {
        title: "Multichannel lead capture with deduplication",
        body: "Web form, WhatsApp, phone, paid campaign, trade fair. The same lead comes in through two or three doors with slightly different details, and it all has to resolve to a single record.",
        riesgo:
          "Without an explicit identity rule —which field wins, how much variation in the name is tolerated, what happens with two people from the same company— the CRM fills with duplicates and the team stops trusting it.",
      },
      {
        title: "Model-assisted qualification and routing",
        body: "Classifying a lead by sector, intent and urgency from free text is precisely what a model does well and what a decision tree does badly. Who the lead gets assigned to, on the other hand, is a business rule and should stay readable code.",
        riesgo:
          "Letting the model decide assignments or discounts turns an occasional mistake into a mistake nobody can explain to the customer.",
      },
      {
        title: "Activity logged without typing",
        body: "Calls, WhatsApp messages and emails show up on the record with their summary, without anyone copying anything across. The salesperson corrects; they don't transcribe.",
        riesgo:
          "Logging automatically with no access control and no retention policy drops customer conversations into a system that was never designed to hold them. That is a decision worth taking before, not after.",
      },
      {
        title: "CRM ↔ ERP sync",
        body: "The customer exists in both systems and both allow edits. The question is who owns each field: the trading name is usually the CRM's, the tax details and the credit limit belong to the ERP.",
        riesgo:
          "Bidirectional sync with no owner per field produces loops: A writes, B sees the change and writes back, A sees it again. You spot it immediately and it is a lot of work to clean up.",
      },
    ],
    entregables: [
      "Contact identity rule and a deduplication process",
      "Automated capture from every channel that is actually live",
      "Classification and routing with auditable criteria",
      "Sync with the ERP, with a declared owner per field",
      "Data quality dashboard: duplicates, incomplete records, untouched leads",
    ],
    puentes: [
      {
        href: "/en/integration/whatsapp-business-api/",
        label: "WhatsApp Business API",
        body: "If a good share of the sales conversation happens on WhatsApp, the channel is part of the CRM.",
      },
      {
        href: "/en/servicios/automatizacion-ia/",
        label: "AI automation",
        body: "Classifying leads and summarizing conversations is the model's share of the work inside this flow.",
      },
      {
        href: "/en/integration/erp/",
        label: "ERP integration",
        body: "The other end of the customer record, and the side that owns the tax and credit data.",
      },
      {
        href: "/en/blog/n8n-vs-zapier-vs-make/",
        label: "Which tool does the typing",
        body: "Capture and sync run on an automation platform. This compares the three usual candidates and where each stops being the right answer.",
      },
    ],
    faq: [
      {
        q: "Does this work with any CRM?",
        a: "With any CRM that exposes an API or webhooks, which today is practically the whole market. The real difference isn't the brand, it is two things: whether it lets you create custom fields to store the integration's trail, and whether its per-minute call limits hold up at your volume. Both get checked during the diagnosis, before we commit to a scope.",
      },
      {
        q: "Does the AI decide which salesperson gets each lead?",
        a: "No, and that is deliberate. The model classifies —sector, intent, urgency— because that requires reading free text. The assignment is resolved with explicit rules on top of that classification, because it has consequences for people and commissions and has to be explainable and auditable. It is the same split we apply everywhere: the model interprets, the code decides.",
      },
      {
        q: "What about the duplicates we already have?",
        a: "They get handled separately, and usually before anything is connected. A CRM that already carries duplicates and then starts receiving automated capture multiplies the problem. The initial clean-up is a bounded piece of work: define the identity rule, group the candidates, and review the ambiguous merges by hand once.",
      },
      {
        q: "Does this replace the sales team?",
        a: "It replaces the part of their day spent copying information from one place to another. In the projects we have run, the measurable effect isn't a smaller headcount: it is that follow-up stops depending on each person's memory and leads stop going cold while somebody remembers to call them.",
      },
    ],
  },

  "whatsapp-business-api": {
    nombre: "Companies that sell and support customers over WhatsApp",
    nombreCorto: "WhatsApp Business API",
    metaTitle: "WhatsApp Business API: integration and automation",
    metaDescription:
      "We integrate WhatsApp Business API with your CRM and ERP: templates, 24-hour service window, stateful agents and traceability. Not the WhatsApp Business app.",
    h1: "WhatsApp Business API: integration and automation",
    intro:
      "WhatsApp is the channel your customers are already on and, almost always, the worst documented one in the company. The API changes that: it turns a conversation that lived on somebody's phone into a flow with state, history and rules.",
    sintoma:
      "The company number is installed on one person's handset. If that person is off, nobody answers; if they leave, the history leaves with them. And there is no way to answer the question how long do we take to reply with an actual number.",
    porQue: {
      title: "The API is not the app, and the difference matters",
      body: "There are three products with confusingly similar names: ordinary WhatsApp, the WhatsApp Business app, and the WhatsApp Business Platform —the API—. Only the third one allows several agents on the same number, integration with other systems, approved bulk sends and traceability. It is also the only one with a per-message cost and a business verification process. Starting on the app and migrating later is possible, but it means redoing the registration and losing part of the history: if the plan is to integrate, go in through the API from the start.",
    },
    patrones: [
      {
        title: "Templates and the service window",
        body: "Meta charges per message sent, and only in the template categories: marketing, utility and authentication. When the customer writes first, a 24-hour service window opens in which you can reply with free-form messages at no cost. Designing the flow around that window is the difference between a reasonable invoice and an unpleasant one.",
        riesgo:
          "Solving with a marketing template what would have fitted inside the service window multiplies the cost and improves nothing. And templates need prior approval, so they don't get improvised on a Friday.",
      },
      {
        title: "A stateful agent, not a tree of buttons",
        body: "Numbered menus age badly: the moment the customer types something that isn't on the list, the flow breaks. A model-backed agent holds the context of the conversation, understands a rephrasing and knows when it doesn't know.",
        riesgo:
          "An agent with no persistent state loses the thread between messages and asks the same question twice. An agent with no route to a human frustrates people in exactly the cases that matter most.",
      },
      {
        title: "Escalation to a person, with context",
        body: "When the conversation moves to a human, it has to arrive with the summary and the history — not with a hello, how can I help you that forces the customer to say everything again.",
        riesgo:
          "This is where the trust you just earned gets spent. One bad hand-off and the customer picks up the phone instead next time.",
      },
      {
        title: "A line to the system that holds the answer",
        body: "Checking an order, booking an appointment or confirming availability means reaching the ERP, the CRM or the booking engine in real time. Without that, the agent can only speak in generalities.",
        riesgo:
          "An agent that answers with stale information because it reads from an overnight copy creates more tickets than it closes.",
      },
    ],
    entregables: [
      "Number registration and business verification on the platform, through the appropriate provider",
      "Catalogue of approved templates by category and use case",
      "Conversational agent with persistent state and a route to a human",
      "Real-time connection to the system that holds the data",
      "Channel metrics: first response time, resolution rate and cost per conversation",
    ],
    puentes: [
      {
        href: "/en/portfolio/chatplug-whatsapp-altegio/",
        label: "WhatsApp connected to a booking system",
        body: "A real deployment: the channel wired to the system that holds the availability, not a demo.",
      },
      {
        href: "/en/servicios/chatbots/",
        label: "Chatbots for business",
        body: "The same agent, seen from the service side rather than from the channel side.",
      },
      {
        href: "/en/integration/crm/",
        label: "CRM integration",
        body: "So the conversation ends up on the customer record instead of on a phone.",
      },
      {
        href: "/en/integration/api-and-webhooks/",
        label: "APIs and webhooks",
        body: "What sits under the channel: signed inbound webhooks, delivery states and a queue with retry.",
      },
    ],
    faq: [
      {
        q: "How much does WhatsApp Business API cost?",
        a: "There are two separate costs. Meta bills per message sent in the template categories —marketing, utility and authentication— at rates that depend on the destination country; messages you receive and messages you send inside an open service window are not charged. The second cost is the provider you access the platform through, and that varies a lot by commercial model. The specific rates change often, so we verify them when we size the project rather than quoting them from memory.",
      },
      {
        q: "Can I keep my current number?",
        a: "Generally yes, but that number stops working in the WhatsApp app: it moves to the platform and is operated from whatever system we integrate. You cannot run both at once. If the number is somebody's personal mobile, plan the switch before you start rather than during.",
      },
      {
        q: "Can I send bulk campaigns?",
        a: "With pre-approved templates in the right category and with the recipient's consent. Sending without opt-in is not only a data protection problem: it is the fast route to users marking the number as spam and the platform downgrading your account quality, which cuts the volume you are allowed to send.",
      },
      {
        q: "Can the agent resolve things without a human?",
        a: "Some of it, and it is better to measure which part than to promise it. Status checks, availability and specific data get resolved end to end when the agent can reach the system that stores the answer. Negotiations, complaints and anything with emotional weight are designed to escalate early. The metric we track isn't percentage automated, it is how many conversations end resolved without the customer having to repeat what they already said.",
      },
    ],
  },

  "api-y-webhooks": {
    nombre: "Technical teams connecting applications",
    nombreCorto: "APIs & webhooks",
    metaTitle: "Custom API integration and webhooks",
    metaDescription:
      "We connect applications over APIs and webhooks with idempotency, retries, signature checks and observable state. Whatever has no API gets solved another way.",
    h1: "Custom API integration and webhooks",
    intro:
      "Almost anyone can stand up an integration that works on day one. The hard part is that it still works on the day the other end takes ten seconds to answer, returns an error halfway through a batch, or resends the same event three times.",
    sintoma:
      "The integration is fine, except that every couple of weeks somebody asks about an order that never arrived. Nobody can answer without opening the database, because there is no single place to look up what happened to that one message.",
    porQue: {
      title: "Why a no-code tool isn't always enough",
      body: "Visual automation platforms handle 80% of cases very well, and we use them daily. They stop being enough in three specific situations: when the volume makes the per-execution price stop making sense, when you need a real transaction spanning two steps, and when the error logic is more complex than the business logic. That last one is more common than it sounds — what takes time to build is never the happy path, it is everything else. The right answer is rarely everything custom: it is usually leaving in the tool what belongs there and pulling into code the two or three pieces that overflow it.",
    },
    patrones: [
      {
        title: "At-least-once delivery, exactly-once processing",
        body: "Practically no webhook sender guarantees single delivery. What you build on the receiving end is the ability to recognize a repeated event and discard it, storing the event key alongside the operation in the same transaction.",
        riesgo:
          "Without that, one retry from the sender produces a duplicate charge, a duplicate order or an email sent twice. And senders retry more times than you expect them to.",
      },
      {
        title: "Receive fast, process later",
        body: "The endpoint that receives the webhook verifies the signature, persists the event and answers. The real work happens on a separate queue, with increasing back-off and a dead letter queue where whatever cannot be processed ends up.",
        riesgo:
          "Processing inside the request means a slow third party causes timeouts, and many senders disable a webhook that fails repeatedly. You lose the integration over a temporary slowdown.",
      },
      {
        title: "Signature, not trust",
        body: "Every inbound request verifies its signature with a constant-time comparison and rejects old timestamps. Every outbound call authenticates with rotatable, minimum-scope credentials.",
        riesgo:
          "A public endpoint with no verification is a write form open to the internet, pointed at your management system.",
      },
      {
        title: "Ordering and rate limits",
        body: "Events do not necessarily arrive in order, and the other end has a per-minute call limit. Both are solved in the design: a version number per entity so stale updates get discarded, and throttling with back-off that respects the retry-after header.",
        riesgo:
          "Ignoring order means an old state overwrites a newer one. Ignoring the limit produces throttling that shows up precisely during volume peaks.",
      },
    ],
    entregables: [
      "Inbound endpoints with signature verification and an event log",
      "Queue with exponential retry and a reviewable dead letter queue",
      "Idempotency key per operation, persisted next to its effect",
      "Per-message status dashboard: received, processed, failed, retrying",
      "Alerts on the age of pending items and on dead letter queue growth",
    ],
    puentes: [
      {
        href: "/en/integration/legacy-systems/",
        label: "Legacy systems",
        body: "When the other end has no API, this pattern stops applying and a different one takes over.",
      },
      {
        href: "/en/blog/n8n-vs-zapier-vs-make/",
        label: "n8n vs Zapier vs Make",
        body: "The other half of the decision above: which of the three tools holds up, and where each one runs out of road.",
      },
      {
        href: "/en/integration/erp/",
        label: "ERP integration",
        body: "The most common destination for these connectors.",
      },
      {
        href: "/en/technology-architecture/",
        label: "Technology architecture",
        body: "Where the contracts, sync direction and ownership rules get decided, before anyone writes a connector.",
      },
    ],
    faq: [
      {
        q: "What is the difference between integrating over an API and over a webhook?",
        a: "Who takes the initiative. With an API you ask when you want to: it is predictable and you control the pace, but you find out late and you spend calls asking about things that haven't changed. With a webhook the other system tells you when something happens: immediate and efficient, but it forces you to be available always and to tolerate repeats. Most serious integrations use both: the webhook to find out, the API to confirm the detail.",
      },
      {
        q: "What happens if the other system goes down?",
        a: "Messages pile up in the queue and get retried with increasing back-off until the service returns. What you must never do is let a third party's outage stop your own operation: your flow carries on and the sync catches up afterwards. That is exactly why the queue exists.",
      },
      {
        q: "Do you use n8n or build everything custom?",
        a: "Both, and the choice gets argued case by case. n8n covers orchestration and frequently changing flows very well, with the advantage that your team can edit them without depending on us. What we pull into code are the pieces with hard requirements: high volume, transactions, complex error logic, or anything that has to be auditable. Mixing the two worlds usually costs less than picking one on principle.",
      },
      {
        q: "Who maintains the integration when a third-party API changes?",
        a: "It is part of the maintenance agreement, and it is worth being explicit about that. Third-party APIs change without telling anyone in particular: they retire versions, tighten limits, rename fields. An integration with nobody watching for those changes works right up until it doesn't, and it is normally a customer complaint that tells you.",
      },
    ],
  },

  "sistemas-legados": {
    nombre: "Companies running old software in production",
    nombreCorto: "Legacy systems",
    metaTitle: "Legacy system modernization without a rewrite",
    metaDescription:
      "We modernize around the system that works: translation layer, change capture and piece-by-piece replacement. No two-year rewrites, no single cutover date.",
    h1: "Legacy system modernization: integrate instead of replacing",
    intro:
      "Legacy doesn't mean bad. It means it works, that it has spent years accumulating rules nobody has written down anywhere else, and that replacing the whole thing is a project carrying more risk than the company can absorb in one go.",
    sintoma:
      "There is one person who knows how it works. Sometimes they no longer work here and get called when something breaks. The system has no test environment, the documentation is a manual from eight years ago, and every change is tested directly in production at seven in the morning.",
    porQue: {
      title: "Why the full rewrite almost always goes badly",
      body: "Rebuilding everything is an attractive proposal because it promises to end the problem. In practice it means keeping two systems running in parallel for months, rediscovering business rules that only exist inside the old code, and absorbing the pressure of a long project with nothing visible to show. The alternative that does work is boring: you wrap the old system, you put a translating layer in front of it, and you pull functions out one at a time. Every step delivers something and every step is reversible. The old system gets switched off when it has stopped doing anything, not on a date circled in a plan.",
    },
    patrones: [
      {
        title: "A translation layer in front",
        body: "You build a modern interface that acts as a facade. New systems talk to it and never to the legacy system, so its quirks —numeric codes, fields with two meanings, dates in in-house formats— stay encapsulated in one place.",
        riesgo:
          "Without that layer, every new integration learns the legacy quirks and inherits them. By the third one, you cannot replace it without touching everything.",
      },
      {
        title: "Change capture instead of polling",
        body: "When the legacy system emits no events, changes are detected in its database —by timestamp, by audit table, or by reading the transaction log— and published outwards as events.",
        riesgo:
          "Polling a production database every minute punishes the users and finds out about changes late. And with a timestamp alone you lose deletions, which is exactly what nobody tests.",
      },
      {
        title: "Replacement in pieces",
        body: "Functions leave the legacy system one at a time, starting with the ones that have the fewest dependencies and cause the most pain. The facade decides, request by request, whether it goes to the new system or the old one.",
        riesgo:
          "Starting with the core module because it is the important one is the fastest way to stall the project halfway. You start at the edges.",
      },
      {
        title: "When there is no data route at all",
        body: "Some systems will only let you in through the screen. There, file exchange in an agreed folder still works, or interface automation as a last resort.",
        riesgo:
          "Screen automation breaks with any visual change and gives you no transactional guarantees. It is a bridging solution with an expiry date, and it has to be treated as one from day one.",
      },
    ],
    entregables: [
      "Documentation of the business rules recovered from the old system",
      "Translation layer with a stable data contract",
      "Change publication out to the rest of the ecosystem",
      "Phased replacement plan, with a justified order and points of return",
      "A measured reduction in dependence on specific individuals",
    ],
    puentes: [
      {
        href: "/en/auditoria-de-sistemas/",
        label: "Digital X-Ray",
        body: "The unavoidable first step: without knowing what the legacy system does, any replacement plan is a bet.",
      },
      {
        href: "/en/integration/api-and-webhooks/",
        label: "APIs and webhooks",
        body: "What gets built in front of the legacy system, once the translation layer exists.",
      },
      {
        href: "/en/roadmap-tecnologico/",
        label: "Technology roadmap",
        body: "To order what leaves the old system first, and on what criteria.",
      },
      {
        href: "/en/portfolio/hotel-chain-digital-audit-menorca/",
        label: "Mapping the systems of a hotel chain",
        body: "A real case of finding out what was running, what talked to what, and which pieces nobody could explain.",
      },
    ],
    faq: [
      {
        q: "When is it better to integrate and when to replace?",
        a: "Integrate when the system does its job and the problem is that it is isolated, when it holds business rules nobody has documented, or when the operation cannot afford an interruption. Replace when the vendor has disappeared and nobody can maintain it, when the technology blocks something that cannot be solved from outside, or when the cost of keeping it already exceeds the cost of rebuilding it. Most real cases are the first, even though the conversation always opens with the second.",
      },
      {
        q: "Can a system with no API and no documentation be integrated?",
        a: "Almost always yes, though with more work and by less elegant routes: read access to the database, change detection, file exchange or —when nothing else is left— screen automation. What decides viability isn't the age of the system, it is whether some controlled way to read and to write exists. That gets checked during the diagnosis, and it is the first question we ask.",
      },
      {
        q: "How long does it take?",
        a: "The translation layer and the first integration are usually in production in four to eight weeks. Full replacement, if you decide to do it, is measured in quarters and by design has no single cutover date: each function that leaves is a delivery in itself. That is precisely the advantage over a rewrite, not a side effect of it.",
      },
      {
        q: "What if the person who knew the system has left?",
        a: "Then the first phase stops being technical and becomes archaeological: the rules get reconstructed from the data and from observed behaviour, not from the code. It is slower and it is worth saying so up front. It is also why documenting what we find is a project deliverable rather than a courtesy.",
      },
    ],
  },
};
