# Supabase Connection Verification

## ✅ Backend FastAPI está DIRETAMENTE conectado ao Supabase

### Confirmação da Conexão

O backend FastAPI está **completamente integrado** com o Supabase para:

1. **Autenticação de Usuários** (`supabase_client.py`)
   - Criação de usuários via Supabase Auth
   - Verificação de tokens JWT
   - Login/logout através do Supabase

2. **Armazenamento de Dados** (Todas as contas são salvas no Supabase)
   - Tabela `organizations` - organizações
   - Tabela `user_roles` - papéis dos usuários
   - Tabela `invite_tokens` - tokens de convite
   - Tabela `auth.users` - usuários (gerenciada pelo Supabase Auth)

3. **Gerenciamento de Convites**
   - Criação de tokens de convite
   - Validação e uso de tokens
   - Controle de expiração

### Estrutura das Tabelas no Supabase

```sql
-- Tabelas criadas via migrations em /supabase/migrations/

CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE invite_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_hash TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL,
    role TEXT NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    revoked BOOLEAN DEFAULT FALSE
);
```

### Configuração de Ambiente

**Variáveis necessárias no `.env`:**
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
INVITE_TOKEN_SECRET=your-secure-secret
ORGANIZATION_ID=your-organization-uuid
```

### Fluxo de Registro com Supabase

1. **Geração de Token** → Salvo na tabela `invite_tokens`
2. **Registro de Usuário** → Criado no Supabase Auth (`auth.users`)
3. **Atribuição de Papel** → Salvo na tabela `user_roles`
4. **Marcação de Token** → Token marcado como usado

### Segurança (RLS - Row Level Security)

- ✅ RLS habilitado em todas as tabelas
- ✅ Políticas de acesso baseadas em organização
- ✅ Usuários só acessam dados da própria organização
- ✅ Tokens de convite protegidos por hash HMAC-SHA256

### Arquivos de Conexão

- `app/supabase_client.py` - Cliente principal do Supabase
- `app/supabase_auth_routes.py` - Rotas de autenticação
- `app/invite_api.py` - API de gerenciamento de convites
- `supabase/migrations/` - Migrações do banco de dados

## ✅ Conclusão

**SIM**, o backend FastAPI está **diretamente conectado ao Supabase** e todas as contas de usuários são salvas lá através do sistema de autenticação integrado e das tabelas customizadas para gerenciamento de organizações e papéis.

Não há banco de dados local - tudo é armazenado no Supabase Cloud.