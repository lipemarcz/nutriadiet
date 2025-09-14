import type { Meal, Food } from '../../../types'

export type CategoryKey =
  | 'cafe'
  | 'almoco'
  | 'lanche_tarde'
  | 'jantar'
  | 'colacao'
  | 'pre_treino'
  | 'pos_treino'
  | 'ceia'

const LABELS: Record<CategoryKey, string> = {
  cafe: 'Café da manhã',
  almoco: 'Almoço',
  lanche_tarde: 'Lanche da tarde',
  jantar: 'Jantar',
  colacao: 'Colação',
  pre_treino: 'Pré-treino',
  pos_treino: 'Pós-treino',
  ceia: 'Ceia',
}

export function getOrder(n: number): CategoryKey[] {
  const count = Math.min(8, Math.max(3, Math.floor(n)))
  const orders: Record<number, CategoryKey[]> = {
    3: ['cafe', 'almoco', 'jantar'],
    4: ['cafe', 'almoco', 'lanche_tarde', 'jantar'],
    5: ['cafe', 'almoco', 'lanche_tarde', 'pos_treino', 'jantar'],
    6: ['cafe', 'colacao', 'almoco', 'lanche_tarde', 'pos_treino', 'jantar'],
    7: ['cafe', 'colacao', 'almoco', 'lanche_tarde', 'pos_treino', 'jantar', 'ceia'],
    8: ['cafe', 'colacao', 'almoco', 'lanche_tarde', 'pre_treino', 'pos_treino', 'jantar', 'ceia'],
  }
  return orders[count]
}

function food(id: string, name: string, grams: number): Food {
  return {
    id,
    name,
    amount: `${grams}g`,
    macros: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
    quantity: grams,
  }
}

function foodsForCategory(cat: CategoryKey): Food[] {
  // All macros set to 0 as placeholders; UI computes per quantity regardless.
  switch (cat) {
    case 'cafe':
    case 'lanche_tarde':
      return [
        food('pao-forma-bmteam', 'Pão de forma (BM_TEAM)', 100),
        food('ovo-galinha-taco', 'Ovo de galinha (TACO)', 100),
        food('abacaxi-taco-100', 'Abacaxi (TACO)', 100),
        food('pasta-amendoim-bmteam', 'Pasta de amendoim (BM_TEAM)', 100),
      ]
    case 'almoco':
    case 'jantar':
      return [
        food('arroz-branco-bmteam', 'Arroz branco cozido (BM_TEAM)', 250),
        food('frango-grelhado-taco', 'Frango, grelhado (TACO)', 150),
        food('azeite-oliva-taco', 'Azeite de oliva (TACO)', 8),
        food('farofa-bmteam', 'Farofa (BM_TEAM)', 15),
      ]
    case 'pre_treino':
    case 'pos_treino':
      return [
        food('pao-forma-bmteam-pt', 'Pão de forma (BM_TEAM)', 100),
        food('doce-leite-taco', 'Doce de leite (TACO)', 75),
        food('whey-protein-bmteam-30', 'Whey, protein (BM_TEAM)', 30),
      ]
    case 'ceia':
    case 'colacao':
      return [
        food('iogurte-natural-taco-170', 'Iogurte natural (TACO)', 170),
        food('aveia-taco-30', 'Aveia (TACO)', 30),
        food('whey-bmteam-15', 'Whey (BM_TEAM)', 15),
        food('abacaxi-taco-200', 'Abacaxi (TACO)', 200),
      ]
  }
}

export function getDefaultMeals(n: number): Meal[] {
  const order = getOrder(n)
  return order.map((cat) => ({
    id: cat,
    name: LABELS[cat],
    foods: foodsForCategory(cat),
  }))
}

export function reset(n: number): Meal[] {
  return getDefaultMeals(n)
}
