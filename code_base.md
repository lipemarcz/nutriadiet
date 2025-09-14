# Code Base Documentation - Macros V2

## Visão Geral do Projeto

O **Macros V2** é uma plataforma moderna de planejamento nutricional que permite aos usuários gerenciar refeições, alimentos e acompanhar macronutrientes (carboidratos, proteínas, gorduras).

## Arquitetura

### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS 4.x
- **Roteamento**: React Router DOM
- **Estado**: Context API + Local Storage
- **UI Components**: Componentes customizados + Radix UI
- **Ícones**: Lucide React

### Backend  
- **Framework**: FastAPI (Python 3.11+)
- **Base de Dados**: Supabase (PostgreSQL)
- **Autenticação**: JWT + Cookies + Invite System
- **ORM**: Supabase Client (Python)

### Banco de Dados
- **Plataforma**: Supabase (PostgreSQL)
- **Dados principais**: Tabela `foods` com ~6300+ alimentos (TACO/TBCA)
- **Busca**: Função RPC `search_foods` com busca fuzzy e normalização de acentos

## Estrutura de Diretórios

```
E:\Macros V2\
├── backend/                    # Backend FastAPI
│   ├── app/                   # Aplicação principal
│   │   ├── main.py           # Entrypoint principal
│   │   ├── pt_routes.py      # Rotas em português (auth)
│   │   ├── models.py         # Modelos Pydantic
│   │   ├── db.py             # Conexão SQLite para usuários
│   │   ├── security.py       # JWT/Auth helpers
│   │   └── supabase_client.py # Cliente Supabase
│   └── requirements.txt      # Dependências Python
├── components/               # Componentes React
│   ├── FoodSearchDialog.tsx  # Dialog de busca de alimentos
│   ├── MealBuilderSection.tsx
│   └── AppShell.tsx
├── src/                     # Código fonte principal
│   ├── contexts/AuthContext.tsx
│   └── components/auth/     # Componentes de autenticação
├── supabase/               # Migrações Supabase
│   └── migrations/         # Scripts SQL
├── styles/                 # CSS
├── utils/                  # Utilitários
└── package.json           # Dependências Node.js
```

## Funcionalidades Principais

### 1. Gestão de Refeições
- Criação, edição e remoção de refeições
- Arrastar e soltar para reordenar
- Persistência no Local Storage

### 2. Busca de Alimentos
- **Fonte de dados**: Tabela `foods` com dados TACO/TBCA
- **Busca fuzzy**: Função RPC `search_foods` 
- **Normalização de acentos**: "pão" ↔ "pao"
- **Priorização**: TACO > TBCA > IBGE
- **Paginação**: 25 itens por página
- **Filtros**: Por fonte (TACO/TBCA)

### 3. Sistema de Autenticação
- **Método**: JWT em cookies HttpOnly
- **Roles**: Master, Colaborador
- **Invite System**: Tokens de convite para registro
- **Rate Limiting**: 5 tentativas por minuto

### 4. Cálculo de Macros
- **Base**: Por 100g de alimento
- **Escalamento**: Função `kcal_for_portion` 
- **Exibição**: Calorias, Carboidratos, Proteínas, Gorduras, Fibras

## API Endpoints Principais

### Backend (FastAPI)
- `POST /api/entrar` - Login
- `POST /api/sair` - Logout  
- `POST /api/cadastro` - Registro com token
- `GET /api/me` - Perfil do usuário
- `POST /api/gerar-token` - Gerar token de convite (master only)

### Supabase
- `searchFoodsFuzzyPaged()` - Busca paginada de alimentos
- `search_foods()` RPC - Função SQL de busca fuzzy

## Configuração de Ambiente

### Variables Necessárias (.env)
```bash
# Backend
MASTER_EMAIL=admin@exemplo.com
MASTER_SENHA=senha_segura
JWT_SECRET=chave_jwt_secreta
APP_DB_PATH=backend/app/app.db

# Supabase
REACT_APP_SUPABASE_URL=https://xxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=xxx
```

### Como Executar

#### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

#### Frontend  
```bash
npm install
npm run dev
```

## Principais Componentes

### FoodSearchDialog.tsx
- **Função**: Dialog para buscar e selecionar alimentos
- **Features**: Busca em tempo real, paginação, filtros por fonte
- **Estado**: Query, loading, resultados paginados
- **Problemas atuais**: Poucos resultados, busca não inteligente

### MealBuilderSection.tsx
- **Função**: Interface principal para construir refeições
- **Features**: Adicionar alimentos, calcular macros totais
- **Integração**: Com FoodSearchDialog para seleção

### AuthContext.tsx
- **Função**: Gerenciamento de estado de autenticação
- **Features**: Login, logout, registro com tokens
- **Persistência**: Cookies HttpOnly

## Banco de Dados

### Tabela `foods`
```sql
- id (serial)
- food_name (text) 
- source (text) - TACO/TBCA/IBGE
- carbs_g, protein_g, fat_g, fiber_g (numeric)
- energy_kcal (numeric)
- portion_grams (numeric)
- unit (text)
```

### Função `search_foods()`
- **Input**: query, sources[], limit, offset
- **Processo**: Normalização de acentos, busca ILIKE
- **Ordenação**: Fonte > Exato > Prefixo > Alfabético
- **Output**: Registros paginados

## Problemas Identificados

### 1. Busca de Alimentos
- **Problema**: Mostra apenas 2 resultados para "pão"
- **Causa**: Busca muito restritiva
- **Solução**: Melhorar algoritmo de busca fuzzy

### 2. Performance
- **Problema**: Busca lenta com muitos resultados
- **Causa**: Função RPC complexa + UI blocking
- **Solução**: Otimizar query + debouncing

### 3. UX Issues
- **Problema**: Filtro de medidas caseiras desnecessário
- **Solução**: Manter apenas gramas

### 4. UI Problems
- **Problema**: Texto ilegível na sidebar (cor igual ao background)
- **Solução**: Ajustar cores do tema

## Stack Tecnológico Completo

- **Frontend**: React, TypeScript, Tailwind, Vite
- **Backend**: FastAPI, Python, Pydantic
- **Database**: Supabase (PostgreSQL)
- **Auth**: JWT + Cookies + Invite System
- **Testing**: Vitest, Testing Library
- **Build**: Vite, TypeScript Compiler
- **Lint**: ESLint, Prettier (implícito)
- **Deploy**: Static hosting (frontend) + FastAPI server
