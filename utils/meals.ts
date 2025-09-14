import { Meal, Food, Substitution, Macros } from '../types';

export function calcFoodMacros(food: Food): Macros {
  const m = food.quantity / 100;
  return {
    calories: Math.round(food.macros.calories * m),
    protein: Math.round(food.macros.protein * m * 10) / 10,
    carbs: Math.round(food.macros.carbs * m * 10) / 10,
    fat: Math.round(food.macros.fat * m * 10) / 10,
    fiber: Math.round(((food.macros.fiber || 0) * m) * 10) / 10,
  };
}

export function calcTotals(foods: Food[]): Macros & { quantity: number } {
  const totals = foods.reduce(
    (t, f) => {
      const m = f.quantity / 100;
      return {
        calories: t.calories + f.macros.calories * m,
        protein: t.protein + f.macros.protein * m,
        carbs: t.carbs + f.macros.carbs * m,
        fat: t.fat + f.macros.fat * m,
        fiber: (t.fiber || 0) + (f.macros.fiber || 0) * m,
        quantity: t.quantity + f.quantity,
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, quantity: 0 }
  );
  return {
    calories: Math.round(totals.calories),
    protein: Math.round(totals.protein * 10) / 10,
    carbs: Math.round(totals.carbs * 10) / 10,
    fat: Math.round(totals.fat * 10) / 10,
    fiber: Math.round((totals.fiber || 0) * 10) / 10,
    quantity: Math.round(totals.quantity),
  };
}

// API-like helpers (immutable)
export function addSubstitute(meal: Meal): Meal {
  const count = (meal.substitutions?.length || 0) + 1;
  const sub: Substitution = { id: `sub-${Date.now()}`, name: `Option ${count}`, foods: [] };
  return { ...meal, substitutions: [...(meal.substitutions || []), sub] };
}

export function editSubstitute(meal: Meal, subId: string, data: Partial<Substitution>): Meal {
  const next = (meal.substitutions || []).map(s => s.id === subId ? { ...s, ...data } : s);
  return { ...meal, substitutions: next };
}

export function deleteSubstitute(meal: Meal, subId: string): Meal {
  const next = (meal.substitutions || []).filter(s => s.id !== subId);
  return { ...meal, substitutions: next };
}

export function addFoodToSub(meal: Meal, subId: string, food: Food): Meal {
  const next = (meal.substitutions || []).map(s => s.id === subId ? { ...s, foods: [...s.foods, food] } : s);
  return { ...meal, substitutions: next };
}

export function updateFoodInSub(meal: Meal, subId: string, foodId: string, data: Partial<Food>): Meal {
  const next = (meal.substitutions || []).map(s => s.id === subId ? { ...s, foods: s.foods.map(f => f.id === foodId ? { ...f, ...data } : f) } : s);
  return { ...meal, substitutions: next };
}

export function removeFoodFromSub(meal: Meal, subId: string, foodId: string): Meal {
  const next = (meal.substitutions || []).map(s => s.id === subId ? { ...s, foods: s.foods.filter(f => f.id !== foodId) } : s);
  return { ...meal, substitutions: next };
}

export function reorderSubstitutes(meal: Meal, newOrderIds: string[]): Meal {
  const map = new Map((meal.substitutions || []).map(s => [s.id, s] as const));
  const next = newOrderIds.map(id => map.get(id)).filter(Boolean) as Substitution[];
  return { ...meal, substitutions: next };
}

export function recalcSubTotals(sub: Substitution): Substitution {
  return { ...sub, total: calcTotals(sub.foods) };
}

