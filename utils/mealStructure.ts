import type { Meal } from '../types';

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export type PresetMeal = { id: string; name: string };

export function getPresetForCount(count: number): PresetMeal[] {
  const base: Record<number, PresetMeal[]> = {
    3: [
      { id: 'cafe', name: 'Café da manhã' },
      { id: 'almoco', name: 'Almoço' },
      { id: 'jantar', name: 'Jantar' },
    ],
    4: [
      { id: 'cafe', name: 'Café da manhã' },
      { id: 'almoco', name: 'Almoço' },
      { id: 'lanche', name: 'Lanche' },
      { id: 'jantar', name: 'Jantar' },
    ],
    5: [
      { id: 'cafe', name: 'Café da manhã' },
      { id: 'almoco', name: 'Almoço' },
      { id: 'lanche_tarde', name: 'Lanche da tarde' },
      { id: 'pos_treino', name: 'Pós-treino' },
      { id: 'jantar', name: 'Jantar' },
    ],
    6: [
      { id: 'cafe', name: 'Café da manhã' },
      { id: 'lanche_manha', name: 'Lanche da manhã' },
      { id: 'almoco', name: 'Almoço' },
      { id: 'lanche_tarde', name: 'Lanche da tarde' },
      { id: 'pos_treino', name: 'Pós-treino' },
      { id: 'jantar', name: 'Jantar' },
    ],
    7: [
      { id: 'cafe', name: 'Café da manhã' },
      { id: 'lanche_manha', name: 'Lanche da manhã' },
      { id: 'almoco', name: 'Almoço' },
      { id: 'lanche_tarde', name: 'Lanche da tarde' },
      { id: 'pos_treino', name: 'Pós-treino' },
      { id: 'jantar', name: 'Jantar' },
      { id: 'ceia', name: 'Ceia' },
    ],
    8: [
      { id: 'cafe', name: 'Café da manhã' },
      { id: 'lanche_manha', name: 'Lanche da manhã' },
      { id: 'almoco', name: 'Almoço' },
      { id: 'lanche_tarde', name: 'Lanche da tarde' },
      { id: 'pos_treino', name: 'Pós-treino' },
      { id: 'jantar', name: 'Jantar' },
      { id: 'lanche_extra', name: 'Lanche extra' },
      { id: 'ceia', name: 'Ceia' },
    ],
  };
  return base[Math.max(3, Math.min(8, count))];
}

const knownNameAliases: Record<string, string> = {
  'cafe da manha': 'Café da manhã',
  'cafedamanha': 'Café da manhã',
  'almoco': 'Almoço',
  'lanche': 'Lanche',
  'lanche da tarde': 'Lanche da tarde',
  'lanche da manha': 'Lanche da manhã',
  'pós-treino': 'Pós-treino',
  'pos treino': 'Pós-treino',
  'pos-treino': 'Pós-treino',
  'jantar': 'Jantar',
  'ceia': 'Ceia',
  'lanche extra': 'Lanche extra',
};

export function chooseDisplayName(raw: string): string {
  const n = normalizeName(raw);
  return knownNameAliases[n] || raw;
}

/**
 * Reestrutura as refeições com base no preset desejado.
 * Preserva alimentos de refeições existentes quando nomes equivalentes são encontrados.
 */
export function buildMealsForCount(
  currentMeals: { [key: string]: Meal },
  count: number
): { [key: string]: Meal } {
  const preset = getPresetForCount(count);

  // Índices de busca por nome normalizado das refeições atuais
  const normToMeal: Map<string, Meal> = new Map(
    Object.values(currentMeals).map((m) => [normalizeName(m.name), m])
  );

  const next: { [key: string]: Meal } = {};
  for (const p of preset) {
    const normalized = normalizeName(p.name);
    const found = normToMeal.get(normalized);
    next[p.id] = found
      ? { ...found, id: p.id, name: chooseDisplayName(p.name) }
      : {
          id: p.id,
          name: chooseDisplayName(p.name),
          foods: [],
          type: undefined,
        } as Meal;
  }
  return next;
}


