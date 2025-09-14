Implemente a feature BMTEAM no front-end (Vite + React 18 + TypeScript + Tailwind + Radix + shadcn/ui) seguindo estes requisitos. Não adicione novas dependências. Respeite TS strict, ESLint sem warnings, Vitest + RTL. Se backend não existir, trate como “known non-blocker” e use mocks locais.

Escopo (4 passos)
Passo 1 — Página protegida por convite (somente logados)

Criar rota/página /bmteam que só aparece para usuários logados e convidados pelo admin (via token_generator).

Implementar guard de acesso:

Funções utilitárias:

getCurrentUser(): { id: string; email: string } | null

hasAcceptedInviteFor(scope: 'BMTEAM'): boolean

acceptInviteToken(token: string, scope: 'BMTEAM'): void (fallback localStorage)

Fluxo de convite:

Se a URL tiver ?invite=TOKEN, chamar acceptInviteToken(TOKEN, 'BMTEAM') e marcar aceito (persistência localStorage se não houver API).

Estados:

allowed (renderiza a página)

forbidden (403 com CTA “Solicitar acesso”)

loading (skeleton)

Entregar componente InviteGate e envolver a página /bmteam.

Passo 2 — Cópia da Home com extras

A /bmteam deve ser cópia visual/estrutural da Home (layout, cards, resumos, toasts), porém com as funcionalidades do Passo 3.

Navbar: adicionar item BMTEAM ativo quando na rota, com badge/label “BMTEAM”.

Passo 3 — Pré-geração de refeições (seleção 3..8)

Na /bmteam, ao selecionar quantidade de refeições (n), pré-gerar os blocos no mesmo formato da Home, porém com ordem específica por n (ver mapeamento abaixo).

Os blocos inicialmente exibem título da refeição e os alimentos padrão (ver Passo 3.1).

Incluir um botão REINICIAR que restaura o estado padrão para o n atual.

Passo 3.1 — Mapeamento de ordens e catálogo padrão

Ordens por quantidade (n):

3 refs: café / almoço / jantar

4 refs: café / almoço / lanche da tarde / jantar

5 refs: café / almoço / lanche da tarde / pós-treino / jantar

6 refs: café / colação / almoço / lanche da tarde / pós-treino / jantar

7 refs: café / colação / almoço / lanche da tarde / pós-treino / jantar / ceia

8 refs: café / colação / almoço / lanche da tarde / pré-treino / pós-treino / jantar / ceia

Catálogo por categoria (itens e quantidades padrão):

Café da manhã e lanche da tarde

Pão de forma (BM_TEAM) → 100g

Ovo de galinha (TACO) → 100g

Abacaxi (TACO) → 100g

Pasta de amendoim (BM_TEAM) → 100g

Almoço e jantar

Arroz branco cozido (BM_TEAM) → 250g

Frango, grelhado (TACO) → 150g

Azeite de oliva (TACO) → 8g

Farofa (BM_TEAM) → 15g

Pré e pós-treino

Pão de forma (BM_TEAM) → 100g

Doce de leite (TACO) → 75g

Whey, protein (BM_TEAM) → 30g

Ceia e colação

Iogurte natural (TACO) → 170g

Aveia (TACO) → 30g

Whey (BM_TEAM) → 15g

Abacaxi (TACO) → 200g

Arquivos/Componentes a criar/alterar (sem novas deps)

Roteamento/UI

src/routes/bmteam.tsx (ou src/pages/bmteam.tsx, conforme projeto)

src/components/bmteam/InviteGate.tsx

src/components/bmteam/MealsGrid.tsx

Navbar existente: adicionar link “BMTEAM”

Serviço de presets

src/components/bmteam/MealPresetService.ts

getOrder(n: number): CategoryKey[]

getDefaultMeals(n: number): Meal[] (usa catálogo por categoria)

reset(n: number): Meal[] (estrutura idempotente para o botão REINICIAR)

Definir CategoryKey (ex.: 'cafe' | 'almoco' | 'lanche_tarde' | 'jantar' | 'colacao' | 'pre_treino' | 'pos_treino' | 'ceia')

Utils de acesso

src/utils/auth.ts com getCurrentUser, hasAcceptedInviteFor, acceptInviteToken

Fallback persistente: localStorage (chaves: bmteam:inviteAccepted, bmteam:scope:BMTEAM)

Estado/Interação

MealsGrid deve receber count (3..8), renderizar blocos na ordem de getOrder(count), popular com getDefaultMeals(count), e expor ação REINICIAR.

UI/UX

Usar Radix + shadcn/ui + Tailwind.

Acessibilidade: foco visível, semântica correta, contrastes OK.

Página deve manter consistência com a Home (containers, spacing, títulos, toasts).

forbidden renderiza card 403 com CTA “Solicitar acesso”.

Qualidade / Guardrails

Sem novas dependências.

npm run lint → 0 warnings / 0 errors

npm run type-check → pass

npm run build && npm run preview → sem erros

Não quebrar UI se /api/me indisponível; use mocks.

Testes (Vitest + React Testing Library)

tests/bmteam/meal-preset.spec.ts

Para n = 3..8, getOrder(n) retorna exatamente as sequências definidas.

getDefaultMeals(n) traz itens/quantidades corretos por categoria.

reset(n) restaura o estado inicial.

tests/bmteam/invite-gate.spec.tsx

Renderiza children quando hasAcceptedInviteFor('BMTEAM') === true.

Mostra 403/CTA quando false.

Aceita convite via ?invite=TOKEN e passa a permitir acesso (simular localStorage).

Critérios de Aceitação (checks finais)

Navbar mostra BMTEAM e navega para /bmteam.

Usuário não logado → bloqueado/redirect conforme padrão do app; logado sem convite aceito → 403 com CTA.

Usuário logado com convite aceito acessa /bmteam.

Selecionar 5 refeições gera exatamente: café, almoço, lanche da tarde, pós-treino, jantar com itens padrão.

Botão REINICIAR restaura o padrão para o n atual.

Build/lint/type-check/preview ok.

Registro de mudanças

Adicionar entrada no docs/TRAEAI.md (Append-only) com: Scope/Files/Reasoning/Verification/Acceptance citando esta tarefa.

Saídas esperadas deste prompt

Rota /bmteam funcional, protegida por InviteGate.

Pré-geração correta (3..8) e botão REINICIAR operante.

MealPresetService implementado e testado.

Testes Vitest + RTL cobrindo presets e gate de convite.

Ajuste da Navbar e consistência visual com a Home.

Executar agora: implementar tudo acima, garantindo que os testes e quality gates passem ao final.