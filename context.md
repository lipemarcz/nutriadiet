# Contexto consolidado — Área Restrita (BMTEAM)

## Resumo da feature
- Rota `/restrito` (label: “Restrita”) protegida por `InviteGate`.
- Acesso somente para usuários logados e com convite aceito (fallback localStorage: `bmteam:inviteAccepted=1` e `bmteam:scope:BMTEAM=1`).
- Aceite de convite via query `?invite=TOKEN` — não persistir o token, apenas os flags.
- Página idêntica à Home no layout, com pré‑geração de 3–8 refeições, e botão “REINICIAR”.

## Ordem de pré‑geração (3–8)
- 3: café, almoço, jantar
- 4: café, almoço, lanche_tarde, jantar
- 5: café, almoço, lanche_tarde, pos_treino, jantar
- 6: café, colacao, almoço, lanche_tarde, pos_treino, jantar
- 7: café, colacao, almoço, lanche_tarde, pos_treino, jantar, ceia
- 8: café, colacao, almoço, lanche_tarde, pre_treino, pos_treino, jantar, ceia

## Listas de alimentos e quantidades (padrão)

Legenda: nomes conforme UI, quantidades em gramas.

- café / lanche_tarde
  - Pão de forma (BM_TEAM) — 100g
  - Ovo de galinha (TACO) — 100g
  - Abacaxi (TACO) — 100g
  - Pasta de amendoim (BM_TEAM) — 100g

- almoço / jantar
  - Arroz branco cozido (BM_TEAM) — 250g
  - Frango, grelhado (TACO) — 150g
  - Azeite de oliva (TACO) — 8g
  - Farofa (BM_TEAM) — 15g

- pre_treino / pos_treino
  - Pão de forma (BM_TEAM) — 100g
  - Doce de leite (TACO) — 75g
  - Whey, protein (BM_TEAM) — 30g

- colacao / ceia
  - Iogurte natural (TACO) — 170g
  - Aveia (TACO) — 30g
  - Whey (BM_TEAM) — 15g
  - Abacaxi (TACO) — 200g

Observações
- Macros podem iniciar em 0 nos presets; UI calcula por quantidade quando aplicável.
- IDs internos seguem os mesmos das categorias; nomes apresentados são humanizados.

## Botão “REINICIAR”
- Regera os presets de acordo com a quantidade selecionada (3–8) no momento da ação.
- Não altera a quantidade selecionada; apenas restabelece as listas padrão.

