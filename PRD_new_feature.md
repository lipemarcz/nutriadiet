# PRD — Área Protegida “Restrita” (/restrito)

## Objetivos
- Disponibilizar uma área protegida (“Restrita”) acessível apenas para usuários logados que possuam convite válido.
- Entregar uma página idêntica à Home (Meal Builder) no layout, com pré‑geração rápida de refeições (3–8) baseada em regras definidas.
- Permitir reconfiguração instantânea via botão “REINICIAR” mantendo a seleção atual de quantidade.

## Escopo
- Rota/página: `/restrito` com label “Restrita”.
- Gate de acesso: `InviteGate` dependente do login e do convite aceito (fallback localStorage: `bmteam:inviteAccepted`, `bmteam:scope:BMTEAM`).
- Aceitação de convite via query: `?invite=TOKEN` (não persistir o token em si; apenas flags de aceitação/scope no localStorage).
- Pré‑geração de refeições (3–8) obedecendo às ordens definidas e listas de alimentos com quantidades padrão.
- Botão “REINICIAR” que restaura a configuração padrão para a quantidade selecionada.

Fora do escopo
- Criar novos componentes de UI além do necessário (usar componentes existentes; seguir Tailwind/Radix/shadcn/ui quando aplicável).
- Toggle de tema (tema apenas dark).
- Reordenação por drag‑and‑drop (usar seletor 3..8 conforme decisão de produto).

## Requisitos funcionais
1) Acesso restrito
- Somente usuários logados e com convite aceito podem ver o conteúdo da rota `/restrito`.
- Quando não logado ou sem convite aceito, exibir mensagem 403 amigável com CTA “Ir para Início”.
- Tratar `/api/me` como non‑blocker: a UI não quebra caso o backend esteja indisponível.

2) Aceite de convite por query
- Ao acessar `/restrito?invite=TOKEN`, o sistema registra o aceite em localStorage: `bmteam:inviteAccepted=1` e `bmteam:scope:BMTEAM=1`.
- O valor do token não deve ser persistido.

3) Pré‑geração de refeições (3–8) — ordem e listas
- Dispor de um seletor da quantidade de refeições: 3, 4, 5, 6, 7 ou 8.
- Gerar automaticamente as refeições com IDs fixos e nomes padronizados, seguindo a ordem:
  - 3: café, almoço, jantar
  - 4: café, almoço, lanche_tarde, jantar
  - 5: café, almoço, lanche_tarde, pos_treino, jantar
  - 6: café, colacao, almoço, lanche_tarde, pos_treino, jantar
  - 7: café, colacao, almoço, lanche_tarde, pos_treino, jantar, ceia
  - 8: café, colacao, almoço, lanche_tarde, pre_treino, pos_treino, jantar, ceia
- Cada refeição inicia com lista de alimentos padrão e suas quantidades (ver Contexto detalhado em `context.md`).

3.1) Botão REINICIAR
- Ação: re‑gera a estrutura padrão (mesmas regras) respeitando a quantidade selecionada no momento.
- Não altera a quantidade selecionada, apenas os conteúdos das refeições.

## Requisitos não funcionais
- TypeScript estrito; evitar `any`; preferir interfaces e literais de união.
- UI acessível: foco visível, semântica, contraste OK; layout consistente (container, espaçamentos, títulos e toasts).
- Sem requisições desnecessárias: debouncing/cancelamento nas buscas; cache por query; evitar requests em branco.
- Estado global mínimo; preferir estado local/hook por componente.
- Sem novas dependências sem aprovação.

## Critérios de aceitação
- O conteúdo de `/restrito` só aparece quando logado e com convite aceito.
- A página “Restrita” replica a Home no visual base e exibe as refeições pré‑geradas.
- O seletor 3–8 altera a estrutura conforme a ordem descrita; listas padrão condizem com o contexto.
- O botão “REINICIAR” restaura os padrões para a quantidade atual.
- Tema apenas dark; navegação “Tutorial” → `/tutorial` permanece funcional.

## Riscos e decisões
- Backend ausente: `/api/me` tratado como non‑blocker; fallback por localStorage para convite/escopo.
- Dependências: não adicionar libs novas; manter Tailwind + Radix + shadcn/ui.
- Build (Rollup optional deps): pode falhar em alguns ambientes; documentar workaround se necessário, sem alterar deps sem aprovação.

## Métricas de sucesso
- Zero erros/warnings de lint; type‑check OK.
- Uso do fluxo de convite sem atritos; acesso garantido após login + aceite.
- Usuários conseguem reconfigurar rapidamente entre 3–8 refeições e usar “REINICIAR”.

