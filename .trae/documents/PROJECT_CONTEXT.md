# PROJECT_CONTEXT.md — NUTRIA MACRO

## ✅ Estado Atual — Parte 1 (Público + Convites)

Esta seção reflete o estado vigente da aplicação após a implementação da Parte 1, mantendo o histórico abaixo sem apagá-lo.

### Visão Geral
- Experiência principal 100% pública (sem login obrigatório)
- Autenticação opcional para colaboradores e Conta Master
- Conta Master criada via variáveis de ambiente (.env)
- Colaboradores entram somente com Token de Convite de uso único

### Rotas (slugs em Português)
- Público: `/` (home), páginas já existentes públicas (ex.: `/foods`, `/tutorial`)
- Acesso direto (não linkadas na navegação pública): `/entrar`, `/cadastro`
- Restrito: `/gerador-de-token` (apenas master) e futuras “páginas exclusivas”

### Backend (FastAPI)
- DB: SQLite (`usuarios`, `tokens_convite`)
  - `usuarios`: id(uuid), nome, email(lowercase, único), senha_hash(bcrypt), papel(`master`|`colaborador`), criado_em
  - `tokens_convite`: id(uuid), token(uuid v4), usado(bool), criado_por(usuario master), criado_em, usado_em
- Autenticação: JWT assinado com `JWT_SECRET`, cookie httpOnly `auth_token`, SameSite=Lax, Secure em produção, validade 12h
- Seed: na inicialização, cria Conta Master se `MASTER_EMAIL` e `MASTER_SENHA` existirem no `.env`

### Endpoints (Português)
- `POST /api/entrar` → { email, senha } → 200 ou 401 (rate-limit 5/min/IP)
- `POST /api/sair` → limpa cookie
- `POST /api/cadastro` → { nome, email, senha, token } → cria colaborador e consome token
- `POST /api/gerar-token` → master only → retorna `{ token }`
- `GET /api/tokens` → master only → lista tokens (últimos 20)
- `GET /api/me` → retorna usuário autenticado

### Navegação
- Usuário anônimo: não vê links de login/cadastro/gerador de token
- Usuário autenticado: vê “Área interna”; somente master vê link/uso do gerador de token

### Variáveis de Ambiente
- `MASTER_EMAIL`, `MASTER_SENHA`, `JWT_SECRET`, `APP_DB_PATH` (opcional)

### Critérios (Parte 1)
- `/` e demais páginas públicas nunca redirecionam para login
- Conta Master criada via `.env`
- Token de convite é UUID v4 e de uso único
- Páginas/Endpoints restritos retornam 401/403 quando não autorizado

---

# PROJECT_CONTEXT.md — NUTRIA MACRO

## 📌 Purpose

NUTRIA MACRO is a modern nutrition planning platform with meal-builder, macro calculations, and professional exports.
Main audience: nutritionists, dietitians, fitness coaches, and health-conscious users.

The application helps users visualize their daily nutrition intake by showing foods in each meal and providing comprehensive macro calculations, targeting health-conscious individuals and nutrition professionals who need clear meal planning visualization.

## 🏗️ Tech Stack

* Frontend: React@19 + TypeScript + TailwindCSS + Vite (ES6 modules with importmap)

* Backend: Python (FastAPI planned) + Supabase (PostgreSQL + Auth + Storage)

* Deployment: Static hosting (initial), Vercel (frontend) + Dockerized FastAPI (future)

* Testing: Vitest (frontend), Pytest (backend)

* Styling: TailwindCSS via CDN

* Module System: ES6 modules loaded directly in browser

## ⚖️ Principles (BMAD Inspired)

* Append-only documentation (never delete context, only add)

* Clear separation: frontend vs backend vs infra

* All secrets in `.env`, never in code

* Always provide diff previews before merge

* Small, atomic commits with Conventional Commits

* Dark theme with professional UI/UX

* Responsive design (desktop-first, mobile-adaptive)

* Component-based architecture with reusable UI elements

## 📋 Current Architecture

*(The AI auto-updates this section whenever it changes project structure or adds new modules)*

```
/
├── index.html (Entry point with TailwindCSS CDN and importmap)
├── index.tsx (React app initialization)
├── App.tsx (Root component with state management)
├── metadata.json (Project metadata)
├── types.ts (TypeScript type definitions)
├── constants.ts (Initial data and constants)
└── components/
    ├── Header.tsx
    ├── MealBuilderSection.tsx
    ├── SummarySection.tsx
    ├── meal_builder/
    │   ├── MealCard.tsx
    │   └── MacrosSummary.tsx
    └── ui/
        ├── Button.tsx
        ├── Card.tsx
        └── Icons.tsx
```

## 🎨 Design System

* **Primary Colors**: Sky blue (#0ea5e9) for highlights and primary actions

* **Secondary Colors**: Neutral grays (neutral-900, neutral-950) for dark theme

* **Background**: Dark theme with neutral-950 body and neutral-900 cards

* **Typography**: Sans-serif font family for clean readability

* **Layout**: Card-based design with sticky navigation and summary panels

* **Icons**: SVG icons for logo, plus, chart bar, download, and total indicators

## 🔒 Security Rules

* Supabase Service Role used **only server-side**

* RLS enabled on database tables

* No sensitive data in localStorage

* Environment variables for all secrets

* Authentication delegated to Supabase by default

## 📊 Data Model

* **Food**: id, name, amount, protein, carbs, fats, calories, quantity

* **Meal**: id, name, foods array

* **Macros**: protein, carbs, fats, calories

* **CalculatedMacros**: extends Macros with quantity

* **MealWithMacros**: extends Meal with calculated macros

## 🚧 Roadmap

*(The AI appends incremental roadmap items here, as agreed with user)*

* [x] Phase 0: Create comprehensive documentation (PRD, Technical Architecture)

* [ ] Phase 1: Implement static React frontend with mock data

* [ ] Phase 2: Replace static data with API calls

* [ ] Phase 3: Add user authentication (Supabase Auth)

* [ ] Phase 4: CRUD operations for foods/meals

* [ ] Phase 5: User-specific meal plans

* [ ] Phase 6: Export functionality

* [ ] Phase 7: AI-based meal suggestions

* [ ] Phase 8: Mobile app development

## 🎯 Current Status

* Documentation: ✅ Complete (PRD, Technical Architecture, Project Context)

* Frontend Structure: ⏳ Pending implementation

* Backend Integration: ⏳ Planned for future phases

* Database Schema: ⏳ Designed, pending implementation

## 🔄 Integration Points

* Frontend communicates with Supabase via official SDK

* Authentication handled by Supabase Auth

* Real-time updates via Supabase subscriptions (future)

* File uploads via Supabase Storage (future)

## 📝 Documentation Structure

* `nutria-macro-prd.md`: Product Requirements Document

* `nutria-macro-technical-architecture.md`: Technical Architecture

* `PROJECT_CONTEXT.md`: This living contract (current file)

* `BUILDER_LOG.md`: Execution diary with timestamps

