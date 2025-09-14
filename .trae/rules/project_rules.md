# Project Rules — Trae AI Execution Standard

Purpose
- Single source of truth for how Trae AI (and contributors) should plan, change, validate, and document this repo.
- These rules are normative. If anything conflicts elsewhere, this document wins for process; code truths come from the repo itself.

Golden Rules
- No secrets in code, commits, issues, or logs. Use .env files; commit only *.env.example without real values.
- Every change must be recorded in docs/TRAEAI.md using append-only entries added at the TOP, with date, scope, files touched, reasoning, acceptance.
- Keep changes small and atomic. Prefer minimal viable change that satisfies the goal.
- Never overwrite existing .env files. Ask for explicit approval if you must change environment handling.
- Do not add/remove dependencies, perform major upgrades, rename directories, delete files, change public API contracts, or run DB migrations without explicit approval.
- For UI/visual changes, run a local preview and verify before considering complete.

Workflow (Discovery → Plan → Implement → Verify → Document)
1) Discovery
   - Infer stack, commands, and constraints from package.json, vite.config.ts, docs/, backend/, server/, and scripts/.
   - Identify affected boundaries (frontend, Node API, Python backend, Supabase) and required env vars.
2) Plan
   - Choose smallest viable approach. List acceptance criteria and verification steps.
   - If trade-offs exist, present 2–3 options and recommend one.
3) Implement
   - Follow Coding Standards and Preferred Patterns below.
   - Keep diffs focused; avoid refactors unless necessary to complete the task.
4) Verify (minimum checklist)
   - Lint: npm run lint
   - Unit/integration tests (critical path): npm run test
   - Frontend build: npm run build; run preview for sanity if UI changed
   - If Node API or backend changed, do a smoke run of impacted endpoints
5) Document
   - Add an append-only entry at the TOP of docs/TRAEAI.md: what, why, where, how to validate, acceptance.

Runbook (Cheat Sheet)
Frontend (Vite)
- Install: npm install
- Dev: npm run dev (http://localhost:3000)
- Build: npm run build → dist/
- Preview (serve build): npm run preview
- Type check: npm run type-check
- Vite proxy: /api → http://localhost:8000 by default (overridable via VITE_API_PROXY_TARGET)
- Required env: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY (never commit real values)

Node API (server/index.js)
- Purpose: search foods via Supabase RPC (exposed under /api/foods/search)
- Run: npm run api (default port 3000). To change: set API_PORT
- Required env: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
- Validate inputs with zod; return structured errors; never log secrets

Python Backend (FastAPI)
- Install: pip install -r backend/requirements.txt
- Run (from backend/): uvicorn app.main:app --reload --port 8000
- Key env (backend/.env): CORS_ORIGINS, INVITE_TOKEN_SECRET, COOKIE_SECURE, REGISTER_RATE_LIMIT_PER_MIN

Environment & Secrets Policy
- Never commit real credentials. Use .env and .env.example (placeholders only).
- Validate presence of required envs before running risky operations; fail fast with clear message.
- Scrub secrets from logs and errors.

Coding Standards
- TypeScript: favor strict typing; avoid any; name things semantically; colocate types with usage when helpful.
- React: functional components + hooks; no side-effects in render; memoize expensive work; keep components small; a11y via ARIA and Radix primitives.
- Styling: Tailwind utility-first; compose small class sets; keep consistency for spacing and states.
- Validation: zod at boundaries; validate before side effects (I/O, state writes).
- Logging & Errors: structured where useful; no PII/secrets; temporary debug logs must be removed before commit.
- Tests: focus on critical paths; deterministic; keep tests fast; use mocks only in isolated tests.
- Commits: Conventional Commits (feat|fix|chore|test|docs|refactor) with clear scope.

Preferred Patterns
- Small pure functions in utils/; selectors/memos for derived state.
- Encapsulate API calls; don’t leak transport details into components.
- Centralize constants in constants.ts; avoid magic values.
- Early returns over deep nesting; composition over inheritance.

Avoid Patterns
- Complex inline logic inside JSX; extract helpers.
- Implicit any or unsafe casts.
- Broad refactors bundled with feature changes.
- Logging tokens, keys, or sensitive payloads.

Verification Checklist (Done =)
- npm run test passes (unit/integration of changed areas)
- npm run lint clean
- npm run build succeeds; if UI changed, preview sanity check
- For API changes: smoke test endpoints with realistic inputs
- Env sanity: required variables present; no secrets in repo

Approval Gates (require explicit OK)
- Deleting/renaming directories or files; structural refactors
- Adding/removing dependencies; major upgrades
- Changing public API contracts, formats, or routing
- Database migrations or security policies (RLS)
- Infra/cost-impacting changes

Trae AI Execution Notes
- Use the smallest number of steps and tools necessary; avoid unnecessary terminal/process churn.
- Keep one task in progress; mark completed as soon as done; update todos when scope changes.
- For UI/visual work, open a preview and check for runtime errors before closing the task.

References
- Dev log (append-only, must update after every change): /e:/Macros V2/docs/TRAEAI.md
- Frontend: package.json, vite.config.ts, index.tsx, App.tsx
- Node API: server/index.js
- Backend: backend/app/main.py and backend/requirements.txt
- Supabase clients: supabaseClient.ts, src/lib/supabase.ts