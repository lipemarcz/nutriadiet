import { describe, it, expect } from 'vitest'
import { getOrder, getDefaultMeals, reset } from '../../src/components/bmteam/MealPresetService'

describe('MealPresetService', () => {
  it('returns exact orders for 3..8', () => {
    expect(getOrder(3)).toEqual(['cafe', 'almoco', 'jantar'])
    expect(getOrder(4)).toEqual(['cafe', 'almoco', 'lanche_tarde', 'jantar'])
    expect(getOrder(5)).toEqual(['cafe', 'almoco', 'lanche_tarde', 'pos_treino', 'jantar'])
    expect(getOrder(6)).toEqual(['cafe', 'colacao', 'almoco', 'lanche_tarde', 'pos_treino', 'jantar'])
    expect(getOrder(7)).toEqual(['cafe', 'colacao', 'almoco', 'lanche_tarde', 'pos_treino', 'jantar', 'ceia'])
    expect(getOrder(8)).toEqual(['cafe', 'colacao', 'almoco', 'lanche_tarde', 'pre_treino', 'pos_treino', 'jantar', 'ceia'])
  })

  it('getDefaultMeals has correct items per category', () => {
    const meals = getDefaultMeals(8)
    const byId = new Map(meals.map(m => [m.id, m]))

    const cafe = byId.get('cafe')!
    expect(cafe.foods.map((f) => `${f.name}:${f.quantity}`)).toEqual([
      'Pão de forma (BM_TEAM):100',
      'Ovo de galinha (TACO):100',
      'Abacaxi (TACO):100',
      'Pasta de amendoim (BM_TEAM):100',
    ])

    const almoco = byId.get('almoco')!
    expect(almoco.foods.map((f) => `${f.name}:${f.quantity}`)).toEqual([
      'Arroz branco cozido (BM_TEAM):250',
      'Frango, grelhado (TACO):150',
      'Azeite de oliva (TACO):8',
      'Farofa (BM_TEAM):15',
    ])

    const pre = byId.get('pre_treino')!
    expect(pre.foods.map((f) => `${f.name}:${f.quantity}`)).toEqual([
      'Pão de forma (BM_TEAM):100',
      'Doce de leite (TACO):75',
      'Whey, protein (BM_TEAM):30',
    ])

    const pos = byId.get('pos_treino')!
    expect(pos.foods.map((f) => `${f.name}:${f.quantity}`)).toEqual([
      'Pão de forma (BM_TEAM):100',
      'Doce de leite (TACO):75',
      'Whey, protein (BM_TEAM):30',
    ])

    const ceia = byId.get('ceia')!
    expect(ceia.foods.map((f) => `${f.name}:${f.quantity}`)).toEqual([
      'Iogurte natural (TACO):170',
      'Aveia (TACO):30',
      'Whey (BM_TEAM):15',
      'Abacaxi (TACO):200',
    ])
  })

  it('reset regenerates the initial state', () => {
    const a = reset(5)
    const b = getDefaultMeals(5)
    expect(a).toEqual(b)
  })
})
