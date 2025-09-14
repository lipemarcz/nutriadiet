# TRAE Execution Brief — Backend + Supabase Integration (No secrets, RLS-first)
Audience: TRAE agent with full Supabase access (project URL + anon key; service role available only in a secure server context if needed). This brief is self-contained and does not rely on any leaked system prompt. Follow it precisely and do not expose secrets.
## Mission
Implement and validate a Food Macros database and API integration around Supabase (PostgREST + RPC + RLS). Keep the frontend consuming directly via `@supabase/supabase-js`. Only use a backend/service-role surface for privileged server-side actions (never in the browser). Do not commit secrets.
# Repo Rules You Must Respect
- Frontend stack: Vite + React + TypeScript in a flat root (no `src/` nesting for new top-level files).
- Use only `npm` for scripts and package management.
- Lint, types, tests must pass: `npm run lint`, `npm run type-check`, `npm test`.
- Do not add or commit a FastAPI/Express backend to this repo now. If privileged server logic is needed, prepare it as a separate artifact/repo or Supabase Edge Function code snippet and document how to deploy. This repo’s frontend must continue to use `@supabase/supabase-js` only.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client; do not prefix it with `VITE_`.
- Update docs and `.env.example` with placeholders only (no real keys).
## Database (Supabase)
1) Create `public.foods_macros` in Supabase with per-100 g macros and `kcal` generated in the DB:

   - Columns:
     - `id uuid primary key default gen_random_uuid()`
     - `slug text not null unique`
     - `name text not null`
     - `source text not null default 'TACO 4 ed. (2011)'`
     - `carbo_g numeric not null check (carbo_g >= 0)`
     - `prot_g  numeric not null check (prot_g  >= 0)`
     - `gord_g  numeric not null check (gord_g  >= 0)`
     - `kcal    numeric generated always as (4*carbo_g + 4*prot_g + 9*gord_g) stored`
     - `created_at timestamptz not null default now()`

   - Indexes:
     - `create index if not exists foods_macros_name_idx on public.foods_macros (name);`
     - Unique constraint on `slug` already covers slug index.

   - RLS + Policies:
     - Enable RLS on table.
     - `foods_read_public`: `SELECT` for all (`using (true)`).
     - `foods_insert_auth`: `INSERT` for `auth.role() = 'authenticated'`.
     - `foods_update_auth`: `UPDATE` for `auth.role() = 'authenticated'`.

2) RPC `public.kcal_for_portion(food_slug text, grams numeric)` returning a single scaled row (`slug, grams, carbo_g, prot_g, gord_g, kcal`). Scale by `(value * grams / 100.0)`.
3) Seeds (minimal, idempotent): arroz branco cozido, feijão preto cozido, peito de frango (grelhado). Use `on conflict (slug) do nothing`.
4) Commit SQL as migrations under `supabase/migrations/` (new files), keeping consistent style with existing migrations. Do not include secrets; migrations must be re-runnable and idempotent where sensible.
5) Manual acceptance checks (PostgREST):
   - List foods (public select):
     - `GET $VITE_SUPABASE_URL/rest/v1/foods_macros?select=*` with headers `apikey` and `Authorization: Bearer $VITE_SUPABASE_ANON_KEY`.
   - Portion RPC:
     - `POST $VITE_SUPABASE_URL/rest/v1/rpc/kcal_for_portion` with JSON `{ "food_slug":"arroz_branco_cozido", "grams":140 }` and the same headers.

## Frontend (supabase-js)

1) Client init (`supabaseClient.ts`): Use `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` only.

2) Data layer (`datafoods.ts`):
   - `listFoods()` → `id, slug, name, carbo_g, prot_g, gord_g, kcal`, ordered by `name`.
   - `kcalForPortion(slug, grams)` → RPC call; return the single scaled record.
   - `addFood(input)` → insert a row; return created row. Surface friendly error on duplicate slug.

3) UI:
   - Page/section “Alimentos”: list foods (per 100 g), search, grams input with immediate RPC-based scaling, and link/CTA for “Adicionar alimento”.
   - “Adicionar alimento” form: Name, Slug (auto from name with normalization), Carbs/Protein/Fat per 100 g, Source optional (default TACO), validations, friendly duplicate-slug message.
   - Accessibility: labels with `htmlFor`, text in pt-BR, placeholders like “g por 100 g”.

4) Display rules:
   - For 100 g list, show `kcal` straight from DB (generated field). Don’t recalc client-side.
   - For portions, use only RPC `kcal_for_portion`.

## Optional Server-Side (Privileged) Surface

If privileged operations are required (e.g., admin-only inserts/updates using service-role):

- Prefer Supabase Edge Functions. Keep code in a separate location (not this repo) and deploy via Supabase. Use `SUPABASE_SERVICE_ROLE_KEY` only inside the function runtime.
- Alternatively, a separate private backend service (FastAPI/Express) can expose admin endpoints. Place code in another repo. Do not commit it here. Use HTTP Basic/OAuth for admin auth, and keep CORS restricted.
- In all cases, the frontend must continue to use only the anon key via `@supabase/supabase-js`.

## Environment

- `.env.example` must contain placeholders:
  - `VITE_SUPABASE_URL=...`
  - `VITE_SUPABASE_ANON_KEY=...`
  - Add a comment stating: service-role must never be in the client.

## Tests (Vitest + RTL)

- Unit tests must be deterministic and fast.
- Utilities: slug generation test for normalization (lowercase, remove accents, spaces→`_`, sanitized).
- Portion display test: mock `kcalForPortion` to return scaled values and assert rounded display (1 decimal for g, integer for kcal) e.g., 140 g arroz → carb 39.2, prot 3.2, gord 0.3, kcal 182.
- Ensure `npm test` passes locally.

## Lint & Types
- Run `npm run lint` and fix any issues (`--fix` locally as needed).
- Run `npm run type-check` and ensure no TypeScript errors.
## Deliverables
- Migrations for foods macros table, policies, RPC, and seeds under `supabase/migrations/`.
- Updated README “Foods (macros)” instructions (schema, policies, RPC, seeds, curl examples).
- `.env.example` placeholders (no secrets) with clear warnings about service-role.
- Frontend data layer and UI aligned with the behaviors above (use supabase-js only).
- All quality gate checks green: lint, types, tests.

## Acceptance Criteria
- User lists seed foods, searches by name, and sees macros + kcal per 100 g (from DB).
- User enters grams (e.g., 140 g) and sees scaled carb/prot/gord + kcal from RPC (rounded as specified).
- User can add a new food (authenticated path); on success, it appears in the list with kcal from DB. Duplicate slug error is friendly.
- No secrets committed; `.env.example` is updated with placeholders; RLS remains enabled.

## Security Checklist
- RLS enabled for `public.foods_macros`.
- Public `SELECT` policy only; `INSERT`/`UPDATE` require `auth.role() = 'authenticated'`.
- Service-role key used only server-side (Edge Function or private backend), never in client.
- CORS and auth enforced on any privileged surface.

---

Note: This brief is original and does not include any leaked system prompt contents. Implementations must adhere to the security and RLS constraints above and avoid exposing sensitive keys.

