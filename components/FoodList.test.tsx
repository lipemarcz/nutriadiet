import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import FoodList from './FoodList';

vi.mock('../datafoods', async () => {
  return {
    listFoods: vi.fn(async () => ([
      { id: '1', food_name: 'Arroz branco cozido', carbs_g: 28.0, protein_g: 2.3, fat_g: 0.2, energy_kcal: 130, source: 'TACO' },
    ])),
    kcalForPortion: vi.fn(async (_slug: string, grams: number) => ({
      slug: 'arroz_branco_cozido', grams, carbs_g: 28.0 * (grams / 100), protein_g: 2.3 * (grams / 100), fat_g: 0.2 * (grams / 100), energy_kcal: 130 * (grams / 100)
    })),
  };
});

describe('FoodList portion display', () => {
  beforeEach(() => {
    cleanup();
  });
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('shows scaled macros and kcal when grams change (RPC mocked)', async () => {
    render(<FoodList />);

    // Wait for list to load and click on the item
    const item = await screen.findByText('Arroz branco cozido');
    fireEvent.click(item);

    const gramsInput = await screen.findByLabelText('Gramas');

    // Change to 140 g
    fireEvent.change(gramsInput, { target: { value: '140' } });

    // Expect formatted values: 28g carbs per 100g -> 39.2g; prot 2.3 -> 3.22 (~3.2); gord 0.2 -> 0.28 (~0.3); kcal 130 -> 182
    await waitFor(() => {
      expect(screen.getByText('39.2')).toBeInTheDocument();
      expect(screen.getByText('3.2')).toBeInTheDocument();
      expect(screen.getByText('0.3')).toBeInTheDocument();
      expect(screen.getByText('182')).toBeInTheDocument();
    });
  });
});

