import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MealCard from './MealCard';
import type { Meal } from '../types';

const meal: Meal = {
  id: 'test-meal',
  name: 'Teste',
  foods: [
    {
      id: 'f1',
      name: 'Arroz',
      macros: { calories: 130, protein: 2.7, carbs: 28.0, fat: 0.3, fiber: 0.4 },
      quantity: 150, // 1.5x
    },
    {
      id: 'f2',
      name: 'Frango',
      macros: { calories: 165, protein: 31.0, carbs: 0, fat: 3.6, fiber: 0 },
      quantity: 100, // 1x
    },
  ],
};

const expected = (() => {
  const totals = meal.foods.reduce(
    (t, f) => {
      const m = f.quantity / 100;
      return {
        calories: t.calories + f.macros.calories * m,
        protein: t.protein + f.macros.protein * m,
        carbs: t.carbs + f.macros.carbs * m,
        fat: t.fat + f.macros.fat * m,
        fiber: (t.fiber || 0) + (f.macros.fiber || 0) * m,
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );
  return {
    calories: Math.round(totals.calories),
    protein: Math.round(totals.protein * 10) / 10,
    carbs: Math.round(totals.carbs * 10) / 10,
    fat: Math.round(totals.fat * 10) / 10,
  };
})();

describe('MealCard totals', () => {
  it('renders correct meal totals', () => {
    render(
      <MealCard meal={meal} onUpdateMeal={() => {}} isDarkMode />
    );

    expect(screen.getByText(new RegExp(`^${expected.calories} kcal$`))).toBeInTheDocument();
    expect(screen.getAllByText(new RegExp(`^${expected.protein}g$`)).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(new RegExp(`^${expected.carbs}g$`)).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(new RegExp(`^${expected.fat}g$`)).length).toBeGreaterThanOrEqual(1);
  });
});
