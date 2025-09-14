Variáveis de ambiente necessárias (.env na raiz):

- MASTER_EMAIL: <email_da_conta_master>
- MASTER_SENHA: <senha_da_conta_master>
- JWT_SECRET: <segredo_para_assinar_JWT>
- APP_DB_PATH: <caminho_sqlite_opcional>

Outras (frontend supabase opcional):
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

Observação: Nunca comite o arquivo .env. Use `.env.example` como referência.


Arquivos de exemplo (não contêm valores reais):

- `docs/env.frontend.example` → copiar para `.env` na raiz e preencher:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `INVITE_TOKEN_SECRET` (opcional no frontend)

- `docs/env.backend.example` → copiar para `backend/.env` e preencher:
  - `VITE_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY` (NUNCA expor no frontend)
  - `ORGANIZATION_ID`
  - `INVITE_TOKEN_SECRET`

