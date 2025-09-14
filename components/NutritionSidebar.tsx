import React, { useMemo } from 'react';
import type { AppState } from '../types';

interface NutritionSidebarProps {
  appState: AppState;
}

const round1 = (v: number) => Math.round(v * 10) / 10;
const round0 = (v: number) => Math.round(v);

const NutritionSidebar: React.FC<NutritionSidebarProps> = ({ appState }) => {
  const { meals } = appState;

  const totals = useMemo(() => {
    const allMeals = Object.values(meals || {});
    const sum = allMeals.reduce(
      (t, meal) => {
        const mealTotals = meal.foods.reduce(
          (mt, f) => {
            const m = (f.quantity || 0) / 100;
            return {
              protein: mt.protein + (f.macros.protein || 0) * m,
              carbs: mt.carbs + (f.macros.carbs || 0) * m,
              fat: mt.fat + (f.macros.fat || 0) * m,
              calories: mt.calories + (f.macros.calories || 0) * m,
              quantity: mt.quantity + (f.quantity || 0),
            };
          },
          { protein: 0, carbs: 0, fat: 0, calories: 0, quantity: 0 }
        );
        return {
          protein: t.protein + mealTotals.protein,
          carbs: t.carbs + mealTotals.carbs,
          fat: t.fat + mealTotals.fat,
          calories: t.calories + mealTotals.calories,
          quantity: t.quantity + mealTotals.quantity,
        };
      },
      { protein: 0, carbs: 0, fat: 0, calories: 0, quantity: 0 }
    );

    return {
      protein: round1(sum.protein),
      carbs: round1(sum.carbs),
      fat: round1(sum.fat),
      calories: round0(sum.calories),
      quantity: round0(sum.quantity),
    };
  }, [meals]);

  return (
    <aside className="sticky top-4 space-y-4">
      <div className="rounded-lg border border-gray-700 bg-gray-900 p-4">
        <h4 className="text-sm font-bold text-white">Resumo Diário</h4>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-md bg-gray-800 p-2">
            <div className="text-gray-400">PROTEÍNAS</div>
            <div className="text-green-400 font-semibold">{totals.protein} g</div>
          </div>
          <div className="rounded-md bg-gray-800 p-2">
            <div className="text-gray-400">CARBOIDRATOS</div>
            <div className="text-green-400 font-semibold">{totals.carbs} g</div>
          </div>
          <div className="rounded-md bg-gray-800 p-2">
            <div className="text-gray-400">GORDURAS</div>
            <div className="text-green-400 font-semibold">{totals.fat} g</div>
          </div>
          <div className="rounded-md bg-gray-800 p-2">
            <div className="text-gray-400">CALORIAS</div>
            <div className="text-red-400 font-semibold">{totals.calories} kcal</div>
          </div>
          <div className="rounded-md bg-gray-800 p-2 col-span-2">
            <div className="text-gray-400">QUANTIDADE TOTAL</div>
            <div className="text-gray-200 font-semibold">{totals.quantity} g</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default NutritionSidebar;