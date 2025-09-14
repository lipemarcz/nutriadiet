NUTRIA Macro - Parte 1 (Público + Convites)

Executar backend (FastAPI):
- Python 3.11+
- Instalar deps: `pip install -r backend/requirements.txt`
- Variáveis de ambiente (.env na raiz):
  - MASTER_EMAIL=
  - MASTER_SENHA=
  - JWT_SECRET=
  - APP_DB_PATH= (opcional; padrão: backend/app/app.db)
- Rodar API: `uvicorn backend.app.main:app --reload`

O backend cria automaticamente a Conta Master se `MASTER_EMAIL` e `MASTER_SENHA` estiverem definidos. A senha é armazenada com bcrypt.

Fluxo de autenticação (colaboradores):
- POST /api/gerar-token (master) → retorna `{ token }`
- POST /api/cadastro { nome, email, senha, token } → cria colaborador e consome o token
- POST /api/entrar { email, senha } → cria cookie httpOnly `auth_token`
- POST /api/sair → remove cookie
- GET /api/tokens (master) → lista os últimos tokens

Cookies: httpOnly, SameSite=Lax, Secure em produção. Sessão padrão: 12h.

Frontend:
- `npm i`
- `npm run dev`
- Rotas públicas: `/`, `/foods`, `/tutorial`
- Rotas internas visíveis apenas por URL direta serão adicionadas na Parte 2.

.env.example incluso com chaves necessárias.


