Repo map (FE)

Stack: Vite + React 18 + TypeScript + Tailwind + Radix + shadcn/ui

Pastas principais: src/components, src/pages|routes, src/utils, src/types

Testes: Vitest + RTL

Lint/Format: ESLint (TS strict) + Prettier

Runbook

Dev: npm run dev (porta padrão 3000)

Lint: npm run lint (zero warnings é meta)

Types: npm run type-check

Build/Preview: npm run build && npm run preview

Tests: npm run test

Variáveis de ambiente (FE)

VITE_API_PROXY_TARGET (para o proxy de /api)

Nunca commitar segredos. Usar .env.local (gitignored).

UI & padrões (shadcn/ui)

Usar componentes shadcn/ui antes de reinventar componentes.

Layout consistente: container, espaçamentos, títulos e toasts.

Acessibilidade: foco visível, semântica, contrastes OK. 

Área protegida (Restrita)

- Rota atual: `/restrito` (label: "Restrita").
- Gate de acesso via `InviteGate` (fallback localStorage: `bmteam:inviteAccepted`, `bmteam:scope:BMTEAM`).
- Aceita convite por query `?invite=TOKEN` e libera o acesso quando logado.
- Tratar `/api/me` como non-blocker (UI não deve quebrar sem backend).

frontend_agent

Padrões de código (TS/React)

TS strict; evitar any; preferir interfaces e literais de união.

Componentes funcionais; named exports; hooks com prefixo use.

Evitar DnD para ordenar refeições (usar seletor 1..N conforme decisão).

Debounce/cancelar buscas; cache por query; sem requests em branco.

Navegação “Tutorial” → /tutorial; tema apenas dark (sem toggle).

Estado global mínimo; preferir estado local/hook por componente. 

react-project

Gate de aprovação (o que o Codex pode fazer sem pedir)

Refactors seguros (remover imports/vars não usados; eliminar any).

Ajustes cosméticos de UI (cores, textos, classes Tailwind).

Correções de lint/type que não mudem comportamento.

Precisa de aprovação: novas deps, mudanças de roteamento, API, estados globais.

Definição de pronto (DoD)

npm run lint → 0 warnings/0 errors

npm run type-check → pass

npm run build && npm run preview → sem erros de build

Testes críticos passam (ou justificativa documentada)

Registro de mudanças

Append-only no docs/TRAEAI.md: cada task com Scope/Files/Reasoning/Verification/Acceptance.

Referenciar entradas recentes (ex.: remoção de %/fibras, botão global, tema dark). (copie do seu log existente quando necessário)

Limites & guardrails

Sem segredos no repo/PRs.

Mudanças atômicas e localizadas.

Sem dependências novas sem aprovação.

Se backend ausente, não quebrar UI; tratar /api/me como “known non-blocker”.

---

## Commands

### generate PRD_new_feature.md
**Descrição:** Gera o PRD detalhado da nova feature protegida (histórico: BMTEAM; implementada como "Restrita" em `/restrito`) com passos 1, 2, 3 e 3.1.  
**Uso:** `generate PRD_new_feature.md`  
**Saídas esperadas:** arquivo `PRD_new_feature.md` com objetivos, escopo, requisitos funcionais/não-funcionais, critérios de aceitação, riscos e decisões.

### generate context.md
**Descrição:** Gera o contexto consolidado (transcrição e regras dos passos 1, 2, 3 e 3.1).  
**Uso:** `generate context.md`  
**Saídas esperadas:** arquivo `context.md` com resumo da feature, ordem de pré-geração, listas de alimentos/quantidades e botão REINICIAR.

### implement new feature with 4 steps
**Descrição:** Executa a implementação completa: rota/página Restrita (`/restrito`, cópia da Home) + acesso por convite (token_generator/InviteGate) + pré-geração de refeições + botão REINICIAR.  
**Uso:** `implement new feature with 4 steps`  
**Pré-requisito:** `PRD_new_feature.md` e `context.md` já gerados.  
**Critérios de aceitação (resumo):**
- Acesso só para logados com convite válido.  
- Página Restrita idêntica à Home com extras.  
- Pré-geração obedece às ordens para 3–8 refs.  
- Botão **REINICIAR** restaura o padrão.

Observações
- Documente mudanças no `docs/TRAEAI.md` (append-only). Referencie entradas recentes (remoção de %/fibras, botão global, tema dark, rename para `/restrito`, remoção de “Solicitar acesso”, limpeza de repo).
