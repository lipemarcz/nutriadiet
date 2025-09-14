import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';
import { INITIAL_MEALS } from './constants';

// Compute expected daily calories from INITIAL_MEALS using the same logic (per 100g basis)
const expectedCalories = Math.round(
  INITIAL_MEALS.reduce((dayTotal, meal) => {
    const mealCalories = meal.foods.reduce((acc, food) => acc + food.macros.calories * (food.quantity / 100), 0);
    return dayTotal + mealCalories;
  }, 0)
);

describe('App daily macros', () => {
  it('shows correct total daily calories in the summary', async () => {
    render(<App />);
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    }, { timeout: 5000 });
    
    // MacrosSummary shows the calorie block as "{calories} kcal" above the "Total Calories" label
    const kcalText = screen.getByText(new RegExp(`^${expectedCalories} kcal$`));
    expect(kcalText).toBeInTheDocument();
  });
});
