🇮🇳 Bharat Navigator

Turn a citizen's goal into a clear, personalized government journey.

Bharat Navigator is an AI-powered citizen journey intelligence platform designed to make complex government procedures easier to understand and act on.

Instead of forcing citizens to search across departments, portals, eligibility rules, document lists, and office information themselves, Bharat Navigator brings those pieces together into one guided journey:

Goal → Context → Service → Evidence → Eligibility → Documents → Roadmap → Next Action → Completion

✨ Why Bharat Navigator?

Government information is increasingly available online, but availability is not the same as navigability.

A citizen may know:

“I need financial assistance for my education.”

But they may not know:

Which service applies to them

Whether they are eligible

Which jurisdiction or authority is responsible

Which documents are required

Which documents they already have

What is missing or needs verification

Where they need to apply

What step comes next

How to resume the process later

Bharat Navigator focuses on that missing navigation layer.

Government systems are organized around departments. Citizens experience them as journeys.

🧭 Core Product Concept

                         CITIZEN
                            │
                            ▼
                    CITIZEN CONTEXT
               profile • location • preferences
                            │
                            ▼
                       GOAL / INTENT
                            │
                            ▼
                SERVICE + JURISDICTION
                            │
                            ▼
                 GOVERNMENT EVIDENCE
                            │
                  ┌─────────┴─────────┐
                  ▼                   ▼
             ELIGIBILITY          REQUIREMENTS
                  │                   │
                  └─────────┬─────────┘
                            ▼
                    DOCUMENT STATE
                            │
                            ▼
                     JOURNEY ENGINE
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
          CURRENT STEP    BLOCKER     NEXT ACTION
              │             │             │
              └─────────────┼─────────────┘
                            ▼
                     CITIZEN ACTION
                            │
                            ▼
                     TRACK / RESUME
                            │
                            ▼
                        COMPLETE

The product is not just a chatbot.

The conversational AI is one component inside a larger system of context, evidence, rules, documents, workflow, persistence, and citizen-facing guidance.

🚀 Key Capabilities

Capability

What it does

🤖 AI Assistant

Understands natural-language citizen goals and explains complex information simply

🧠 Citizen Context

Maintains relevant profile, location, preferences, document state, and journey context

🔎 Government Knowledge / RAG

Retrieves relevant government information and source evidence

✅ Eligibility Engine

Applies structured eligibility rules where available

📄 Document Intelligence

Processes documents and connects document state to journey requirements

🗺️ Journey Engine

Converts multi-step procedures into persistent workflows

📌 Roadmaps

Shows completed, current, blocked, and upcoming steps

🎯 Next Best Action

Identifies the most useful action the citizen should take now

📍 Office Locator

Helps identify the relevant office/service location from citizen context

🔔 Notifications

Surfaces journey-aware updates and reminders

🌐 Multilingual Support

Provides language-aware interaction and presentation

🔐 Security Layer

Authentication, authorization, resource checks, validation, rate limiting, and security auditing

🧠 What Makes It Different from a Generic LLM?

A generic LLM is primarily:

Question
   ↓
Generated Answer

Bharat Navigator is:

Citizen Context
      ↓
Goal / Intent
      ↓
Jurisdiction
      ↓
Government Evidence
      ↓
Eligibility
      ↓
Document Readiness
      ↓
Journey State
      ↓
Next Best Action
      ↓
Track / Resume
      ↓
Complete

The key distinction

An LLM gives information. Bharat Navigator manages a citizen's journey.

The LLM can help with intent understanding, explanation, summarization, and conversation.

The application owns critical state such as:

Eligibility results

Document requirements

Document status

Workflow dependencies

Journey progress

Permissions

Evidence metadata

Persistence

This separation is intentional: AI assists the citizen; application logic governs the journey.

🏗️ Architecture

┌─────────────────────────────────────────────────────────────┐
│                    EXPERIENCE LAYER                         │
│                                                             │
│ React • TypeScript • Tailwind CSS • Responsive UI           │
│ AI Assistant • Eligibility • Documents • Journeys           │
│ Office Locator • Notifications • Profile                   │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                        │
│                                                             │
│ React Context • Citizen Context • Journey State             │
│ Node.js • Express • REST APIs                               │
└───────────────┬─────────────────────┬───────────────────────┘
                │                     │
                ▼                     ▼
┌──────────────────────────┐  ┌───────────────────────────────┐
│      AI / KNOWLEDGE      │  │       DECISION ENGINES        │
│                          │  │                               │
│ Featherless AI           │  │ Eligibility Rules             │
│ AI Orchestrator          │  │ Document Intelligence         │
│ Government RAG           │  │ Jurisdiction Resolution       │
│ Structured Responses     │  │ Journey / Workflow            │
└──────────────┬───────────┘  └───────────────┬───────────────┘
               │                              │
               └──────────────┬───────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    PERSISTENCE / TRUST                      │
│                                                             │
│ Firebase Authentication • Firestore • Storage               │
│ Security Rules • Resource Authorization • Audit / Telemetry │
└─────────────────────────────────────────────────────────────┘

🧩 Core Engineering Layers

1. Citizen Context

The citizen context is the shared foundation for the product.

It can contain:

Identity
Location / jurisdiction
Demographics
Language preferences
Voice preference
Document state
Active journeys
Permissions
Context provenance
Confidence / verification state

The goal is to ensure that a citizen does not have to repeat the same information across every feature.

2. Government Knowledge & Evidence

Government information is treated as evidence rather than simply as model memory.

The system supports metadata such as:

Service
Department
Jurisdiction
Source URL
Source type
Publication date
Effective period
Version
Last checked
Current / superseded / unknown

Conceptually:

Government Source
        ↓
Knowledge Corpus
        ↓
Retrieval
        ↓
Relevant Evidence
        ↓
AI Explanation

3. Eligibility Engine

Where eligibility can be represented as explicit rules, the application can evaluate those rules programmatically.

Citizen Context
      +
Service Rules
      ↓
Eligibility Engine
      ↓
Eligibility Result
      ↓
AI Explanation

This avoids making the LLM the sole authority for rule-based decisions.

4. Document Intelligence

Documents are treated as journey inputs, not just uploaded files.

A document can move through states such as:

PRESENT
MISSING
UNVERIFIED
INVALID
EXPIRED
VERIFICATION_PENDING

That enables the platform to answer a more useful question:

“Which required documents for my current journey are actually ready?”

5. Journey Engine

Government processes are workflows, not single questions.

The journey engine represents:

Goal
Service
Jurisdiction
Steps
Dependencies
Requirements
Current state
Blockers
Next action
Evidence
History

Example:

✓ Understand eligibility
✓ Prepare identity proof
→ Obtain income certificate
○ Submit application
○ Track application

🎯 Citizen Experience

The interface is designed around the question:

“What should I do next?”

Instead of exposing internal system concepts, the citizen should see:

YOUR JOURNEY
─────────────
Higher Education Assistance

64% complete

✓ Eligibility checked
✓ Identity documents ready
→ Get income certificate
○ Submit application

CURRENT STEP
Get income certificate

WHY?
Required for the selected process.

NEXT ACTION
[ Get income certificate → ]

The system may internally understand dependency graphs, rule identifiers, evidence records, and workflow states.

The citizen sees a simple explanation.

Maximum intelligence underneath. Minimum cognitive load on top.

🔐 Trust & Safety Principles

Bharat Navigator is designed around several important principles.

Evidence before confidence

The system should prefer supported evidence over unsupported certainty.

Deterministic logic where possible

Critical rule-based decisions should not depend entirely on generated text.

Explicit uncertainty

If the available evidence is insufficient, the product should say so rather than fabricate a procedure.

Provenance

Important government information should be traceable to source metadata.

Scoped AI access

The AI should receive only the context needed for the current task rather than unrestricted access to application infrastructure.

No secret leakage

API keys, private credentials, service-account files, and local environment files must never be committed to the repository.

🛠️ Technology Stack

Frontend

React 19

TypeScript

Vite

Tailwind CSS

Lucide React

Motion

React Markdown

D3 for journey/visualization experiences

Backend

Node.js

Express.js

TypeScript / TSX

esbuild

AI

Featherless AI

AI workflow orchestration

Retrieval-based government knowledge layer

Structured response parsing

Authentication & Data

Firebase Authentication

Cloud Firestore

Firebase Storage

Firestore Security Rules

Supporting capabilities

Document processing

PDF generation / preview

Journey visualization

Notifications

Multilingual engine

WebAuthn-related authentication utilities

Security auditing and telemetry

📁 Project Structure

bharat-navigator/
│
├── src/
│   ├── components/
│   │   ├── navigation/
│   │   ├── AIAssistantChat.tsx
│   │   ├── DynamicEligibilityChecker.tsx
│   │   ├── DocumentIntelligenceView.tsx
│   │   ├── JourneyEngineView.tsx
│   │   ├── OfficeLocatorView.tsx
│   │   ├── NotificationCentre.tsx
│   │   └── ...
│   │
│   ├── context/
│   │   ├── AppContext.tsx
│   │   └── CitizenContext.tsx
│   │
│   ├── data/
│   │   ├── governmentKnowledgeCorpus.ts
│   │   ├── governmentSourceRegistry.ts
│   │   ├── documentProcurementRegistry.ts
│   │   └── sampleJourney.ts
│   │
│   ├── hooks/
│   │   ├── useProfileManager.ts
│   │   ├── useDashboardMetrics.ts
│   │   └── ...
│   │
│   ├── services/
│   │   ├── aiWorkflowOrchestrator.ts
│   │   ├── citizenContextService.ts
│   │   ├── citizenIntelligenceEngine.ts
│   │   ├── contextResolutionEngine.ts
│   │   ├── documentIntelligence.ts
│   │   ├── documentProcessor.ts
│   │   ├── eligibilityRulesEngine.ts
│   │   ├── governmentRAG.ts
│   │   ├── journeyEngine.ts
│   │   ├── jurisdictionEngine.ts
│   │   ├── officeLocatorService.ts
│   │   ├── proactiveNotificationEngine.ts
│   │   ├── securityHardeningService.ts
│   │   └── ...
│   │
│   ├── server/
│   │   └── multilingualEngine.ts
│   │
│   ├── types/
│   │   └── citizenContext.ts
│   │
│   ├── utils/
│   │   ├── firebaseDb.ts
│   │   ├── firebaseStorage.ts
│   │   ├── roadmapGenerator.ts
│   │   ├── structuredResponseParser.ts
│   │   ├── contextConfidence.ts
│   │   └── ...
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── public/
├── scripts/
├── server.ts
├── firestore.rules
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
└── .env.example

🔄 Example Citizen Journey

Scenario

A student says:

“I need financial assistance for my higher education.”

Bharat Navigator flow

1. Understand the citizen's goal
              ↓
2. Read relevant citizen context
              ↓
3. Determine the relevant jurisdiction/service
              ↓
4. Retrieve supporting government evidence
              ↓
5. Evaluate applicable eligibility rules
              ↓
6. Determine required documents
              ↓
7. Compare requirements with available documents
              ↓
8. Generate a personalized journey
              ↓
9. Identify blockers
              ↓
10. Recommend the next best action
              ↓
11. Persist progress
              ↓
12. Allow the citizen to resume later

The important output is not simply:

“Here are some schemes.”

It is:

“Here is what appears relevant to you, here is why, here is what you need, here is what is missing, and here is the next step.”

💻 Getting Started

Prerequisites

Node.js

npm

Firebase project/configuration

Featherless AI API access for AI functionality

Installation

git clone https://github.com/harshithhj07-tech/snist_3.0.git
cd snist_3.0
npm install

Environment

Copy the example environment file:

cp .env.example .env

Set required secrets in your local environment.

Example:

FEATHERLESS_API_KEY=your_key_here

Never commit .env or .env.local.

The repository .gitignore is configured to exclude environment files.

Development

npm run dev

Production build

npm run build

TypeScript validation

npm run lint

☁️ Deployment

The project includes a Vercel configuration for deployment.

Typical flow:

Local Development
      ↓
GitHub
      ↓
Vercel
      ↓
Production

Before deploying:

npm install
npm run lint
npm run build

Only deploy after the production build succeeds locally.

🧪 Validation Philosophy

A government-facing assistant should be evaluated on more than visual quality.

Useful evaluation dimensions include:

Metric

Question

Service identification

Did the citizen reach the correct service?

Evidence support

Can important claims be traced to supporting evidence?

Eligibility correctness

Were explicit rules applied correctly?

Document readiness

Were required documents identified accurately?

Journey correctness

Are dependencies and blockers correct?

Next-action quality

Is the recommended action actually useful?

Completion

Can the citizen progress through the procedure?

Resumability

Can the citizen return and continue later?

Unsupported answers

How often does the system answer without adequate evidence?

The objective is to measure whether Bharat Navigator reduces navigation effort and improves task completion, not merely whether the AI produces impressive responses.

🔭 Product Direction

Bharat Navigator is designed to evolve from a collection of government-assistance tools into a unified citizen journey operating layer.

The long-term model is:

Many Government Services
          ↓
Shared Citizen Context
          ↓
Shared Evidence Model
          ↓
Shared Requirement Model
          ↓
Shared Journey Engine
          ↓
Personalized Citizen Experiences

New government services should primarily introduce validated service definitions, evidence, rules, requirements, and workflow configuration rather than requiring a new application architecture.

🏆 Product Philosophy

Don't make citizens learn how government is organized.

Make the system understand what the citizen is trying to accomplish.

Bharat Navigator is built around five principles:

Context over repetition
The system should remember relevant information.

Evidence over confidence
Important claims should be grounded and traceable.

Action over information overload
The citizen should know what to do next.

Workflow over isolated chat
Government processes are journeys.

Trust over impressive AI
When the system does not know, it should say so.

⚠️ Production Security Note

Before making the repository public or deploying to production:

Keep .env and .env.local private.

Rotate any credential that has ever been exposed.

Never store API keys directly in source code.

Never commit Firebase Admin/service-account credentials.

Review Firestore rules and storage authorization.

Review all server-side AI access and resource authorization.

Treat external integrations as real only when they are actually implemented and verified.

Repository documentation should reflect implemented capabilities, not planned integrations.

📌 Current Status

Bharat Navigator currently contains the architectural building blocks for:

Citizen context

AI-assisted interaction

Government knowledge retrieval

Eligibility evaluation

Document intelligence

Journey/roadmap management

Office discovery

Notifications

Security controls

Multilingual support

Analytics/evaluation tooling

The strongest validation target is a single complete golden citizen journey that can be demonstrated from:

Goal
→ Context
→ Evidence
→ Eligibility
→ Documents
→ Journey
→ Next Action
→ Completion

❤️ Bharat Navigator

A citizen should not need to understand the government system to use the government system.

Bharat Navigator helps turn “I need to get this done” into “Here is what I need to do next.”

Built for citizen-first digital governance.
