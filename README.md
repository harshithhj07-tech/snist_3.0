# 🇮🇳 Bharat Navigator — Intelligent Citizen Workflow & Scheme Orchestrator

[![CI Pipeline](https://github.com/bharat-navigator/bharat-navigator/actions/workflows/ci.yml/badge.svg)](https://github.com/bharat-navigator/bharat-navigator/actions)
[![Featherless Native](https://img.shields.io/badge/AI_Engine-Featherless_Native-amber.svg)](https://featherless.ai)
[![Auth & Database](https://img.shields.io/badge/Database-Supabase_Postgres-emerald.svg)](https://supabase.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0_Strict-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-lightgrey.svg)](LICENSE)

Bharat Navigator is a **production-grade, autonomous civic intelligence platform** designed for 1.4 billion citizens across India. It grounds open government data, statutory gazettes, state rulesets, and local DigiLocker document vaults into deterministic roadmaps, multi-agent action plans, and explainable AI recommendations.

---

## 🌟 Core Architecture & Pillars

### 1. ⚡ 100% Featherless-Native AI (Zero Google / Gemini Involvement)
- Direct integration with `api.featherless.ai` via strict server-side proxy (`/api/chat`, `/api/eligibility`, `/api/ocr`, `/api/translate`).
- Caching layer for deterministic endpoints with SHA-256 token hashing and in-memory TTL.
- Output schema validation using strict Zod contract enforcement with single re-prompt error correction.
- Prompt injection protection sanitizing all OCR and citizen document inputs before LLM ingestion.
- Structured observability logging (latencies, token counts, cache hits, model IDs).

### 2. 🛡️ Supabase Postgres & Auth (Full Google Exodus)
- Completely migrated from Firebase Auth and Firestore to Supabase.
- Row Level Security (RLS) policies protecting `profiles`, `documents`, `roadmaps`, `bookmarks`, `history`, and `orchestrator_checkpoints`.
- Multi-provider authentication support (Email/Password, Google OAuth via Supabase, and Offline Citizen Sandbox).

### 3. 📂 Grounded DigiLocker Vault & Dynamic Context
- Citizen profiles (`Priya Sharma`, `Telangana`, `Hyderabad`) automatically sync across top navigation, sidebar, AI chat, and journey context.
- Verified vault documents (`Aadhaar Card`, `Address Proof`) provide grounding context without hallucination.

### 4. 🤖 Multi-Agent Orchestrator Engine
- Step-by-step statutory execution (`plan-and-execute`) with human-in-the-loop approvals.
- State persistence and crash recovery via Supabase orchestrator checkpoints.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/bharat-navigator/bharat-navigator.git
cd bharat-navigator
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Fill in your configuration:
```env
# Featherless AI Configuration
FEATHERLESS_API_KEY=your_featherless_api_key_here
FEATHERLESS_DEFAULT_MODEL=mistralai/Mistral-7B-Instruct-v0.2

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Vite Client Variables
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Port
PORT=3000
```

### 3. Start Development Server
```bash
npm run dev
```
The application will be live at `http://localhost:3000`.

---

## 🧪 Testing & Verification

Run the comprehensive test suites:

```bash
# 1. Type Check & Strict Linting
npm run lint

# 2. Supabase Auth Verification Suite (11/11 tests)
npx tsx scripts/test-supabase-auth.ts

# 3. Supabase RLS Policy Verification Suite (71/71 tests)
npx tsx scripts/test-supabase-rls.ts
```

---

## 📁 Project Structure

```
├── .github/
│   └── workflows/
│       ├── ci.yml                 # Lint, build, and automated test pipeline
│       └── deploy.yml             # Continuous deployment workflow
├── src/
│   ├── components/                # React UI components (Chat, Vault, Modals)
│   ├── context/                   # AppContext with Supabase auth sync
│   ├── data/                      # Sample journeys and default citizen profiles
│   ├── services/                  # Civic AI engine, Featherless client proxy
│   ├── supabase.ts                # Client-side Supabase client & fallback auth
│   ├── types.ts                   # TypeScript interfaces & domain schemas
│   └── App.tsx                    # Main root component & routing
├── server/
│   └── index.ts                   # Express backend proxy with Featherless routing
├── scripts/                       # Automated auth & RLS verification scripts
└── legacy-firebase-reference/     # Isolated legacy files (archival only)
```

---

## 🔒 Security & Privacy

- **No Hardcoded Keys**: All secrets are loaded strictly via environment variables.
- **Data Isolation**: All citizen data is partitioned strictly by user ID via Supabase RLS.
- **Prompt Sanitization**: Untrusted user uploads and OCR results are wrapped in tagged boundaries with injection defenses.

---

## 📜 License
Distributed under the MIT License. See `LICENSE` for details.