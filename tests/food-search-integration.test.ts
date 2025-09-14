import { describe, it, expect } from 'vitest';
import fetch from 'node-fetch';

describe('Food Search Integration Tests', () => {
  const SUPABASE_URL = 'https://rkidgbpqivofvoerzwqk.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJraWRnYnBxaXZvZnZvZXJ6d3FrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMTM2MDAsImV4cCI6MjA3MjY4OTYwMH0.56VRHwDeaAG_r7stIJTAdh9ohljnIJQeH_jR7GkazHI';

  async function fetchFoods(query?: string, limit = 5) {
    const baseUrl = `${SUPABASE_URL}/rest/v1/foods`;
    const params = new URLSearchParams({
      select: 'id,food_name,source,carbs_g,protein_g,fat_g,energy_kcal,created_at',
      limit: limit.toString(),
      order: 'food_name'
    });
    
    if (query) {
      params.append('food_name', `ilike.%${query}%`);
    }

    try {
      const response = await fetch(`${baseUrl}?${params}`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('Response data length:', Array.isArray(data) ? data.length : 0);
      return data;
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  }

  it('should list foods successfully', async () => {
    const foods = await fetchFoods() as any[];
    
    expect(Array.isArray(foods)).toBe(true);
    expect(foods.length).toBeGreaterThan(0);
    expect(foods.length).toBeLessThanOrEqual(5);
    
    if (foods.length > 0) {
      const firstFood = foods[0];
      expect(firstFood).toHaveProperty('id');
      expect(firstFood).toHaveProperty('food_name');
      expect(firstFood).toHaveProperty('energy_kcal');
      expect(firstFood).toHaveProperty('carbs_g');
      expect(firstFood).toHaveProperty('protein_g');
      expect(firstFood).toHaveProperty('fat_g');
    }
    
    console.log('✅ List foods test passed:', {
      count: foods.length,
      firstItem: foods[0]?.food_name || 'No items'
    });
  }, 10000);
  
  it('should search foods by name', async () => {
    const searchTerm = 'arroz';
    const foods = await fetchFoods(searchTerm) as any[];
    
    expect(Array.isArray(foods)).toBe(true);
    
    // Check if search results contain the search term
    if (foods.length > 0) {
      const hasSearchTerm = foods.some((food: any) => 
        food.food_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      expect(hasSearchTerm).toBe(true);
    }
    
    console.log('✅ Search foods test passed:', {
      searchTerm,
      count: foods.length,
      items: foods.map((food: any) => ({ name: food.food_name, kcal: food.energy_kcal }))
    });
  }, 10000);
  
  it('should handle empty search results gracefully', async () => {
    const searchTerm = 'xyznonexistentfood123';
    const foods = await fetchFoods(searchTerm) as any[];
    
    expect(Array.isArray(foods)).toBe(true);
    expect(foods.length).toBe(0);
    
    console.log('✅ Empty search test passed');
  }, 10000);
  
  it('should validate food data structure', async () => {
    const foods = await fetchFoods(undefined, 1) as any[];
    
    expect(foods.length).toBeGreaterThan(0);
    
    const food = foods[0];
    expect(typeof food.id).toBe('number');
    expect(typeof food.food_name).toBe('string');
    expect(food.source === null || typeof food.source === 'string').toBe(true);
    expect(typeof food.carbs_g).toBe('number');
    expect(typeof food.protein_g).toBe('number');
    expect(typeof food.fat_g).toBe('number');
    expect(typeof food.energy_kcal).toBe('number');
    expect(typeof food.created_at).toBe('string');
    
    // Validate that macronutrients are non-negative
    expect(food.carbs_g).toBeGreaterThanOrEqual(0);
    expect(food.protein_g).toBeGreaterThanOrEqual(0);
    expect(food.fat_g).toBeGreaterThanOrEqual(0);
    expect(food.energy_kcal).toBeGreaterThanOrEqual(0);
    
    console.log('✅ Data structure validation passed:', {
      food: {
        name: food.food_name,
        macros: {
          carbs_g: food.carbs_g,
          protein_g: food.protein_g,
          fat_g: food.fat_g,
          energy_kcal: food.energy_kcal
        }
      }
    });
  }, 10000);
});