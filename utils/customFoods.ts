import type { Food } from '../datafoods';

/**
 * Custom food type extending the base Food interface
 */
export interface CustomFood extends Omit<Food, 'created_at'> {
  id: string;
  food_name: string;
  source: 'CUSTOM';
  grams: number; // Base portion size
  energy_kcal: number;
  carbs_g: number;
  protein_g: number;
  fat_g: number;
  fiber_g: number;
  notes?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

/**
 * Input type for creating/updating custom foods
 */
export interface CustomFoodInput {
  food_name: string;
  grams: number; // Base portion size (default 100)
  energy_kcal: number;
  carbs_g: number;
  protein_g: number;
  fat_g: number;
  fiber_g: number;
  notes?: string;
  tags?: string[];
}

/**
 * Match type for search ranking
 */
export interface FoodMatch {
  food: Food | CustomFood;
  matchType: 'exact' | 'prefix' | 'partial';
  score: number;
}

// LocalStorage key following the pattern: nm.customFoods.v1
const STORAGE_KEY = 'nm.customFoods.v1';

/**
 * Generate a UUID v4 using crypto.randomUUID (modern browsers)
 * Fallback to simple timestamp-based ID if not available
 */
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Normalize text for search (remove accents, lowercase, remove punctuation)
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Get all custom foods from localStorage
 */
export function getCustomFoods(): CustomFood[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    
    return parsed.filter((item): item is CustomFood => 
      item && 
      typeof item === 'object' &&
      typeof item.id === 'string' &&
      typeof item.food_name === 'string' &&
      item.source === 'CUSTOM'
    );
  } catch (error) {
    console.error('Error loading custom foods:', error);
    return [];
  }
}

/**
 * Save custom foods array to localStorage
 */
function saveCustomFoods(foods: CustomFood[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(foods));
  } catch (error) {
    console.error('Error saving custom foods:', error);
    throw new Error('Erro ao salvar alimento. Verifique o espaço de armazenamento.');
  }
}

/**
 * Add a new custom food
 */
export function addCustomFood(input: CustomFoodInput): CustomFood {
  const now = new Date().toISOString();
  const newFood: CustomFood = {
    id: generateUUID(),
    food_name: input.food_name.trim(),
    source: 'CUSTOM',
    grams: input.grams || 100,
    energy_kcal: input.energy_kcal,
    carbs_g: input.carbs_g,
    protein_g: input.protein_g,
    fat_g: input.fat_g,
    fiber_g: input.fiber_g || 0,
    notes: input.notes?.trim() || undefined,
    tags: input.tags?.filter(t => t.trim()) || [],
    created_at: now,
    updated_at: now,
  };

  const existing = getCustomFoods();
  const updated = [...existing, newFood];
  saveCustomFoods(updated);
  
  return newFood;
}

/**
 * Update an existing custom food
 */
export function updateCustomFood(id: string, input: Partial<CustomFoodInput>): CustomFood | null {
  const existing = getCustomFoods();
  const index = existing.findIndex(f => f.id === id);
  
  if (index === -1) {
    throw new Error('Alimento não encontrado');
  }

  const updated: CustomFood = {
    ...existing[index],
    ...input,
    food_name: input.food_name?.trim() || existing[index].food_name,
    updated_at: new Date().toISOString(),
  };

  existing[index] = updated;
  saveCustomFoods(existing);
  
  return updated;
}

/**
 * Delete a custom food by ID
 */
export function deleteCustomFood(id: string): boolean {
  const existing = getCustomFoods();
  const filtered = existing.filter(f => f.id !== id);
  
  if (filtered.length === existing.length) {
    return false; // Not found
  }
  
  saveCustomFoods(filtered);
  return true;
}

/**
 * Get a custom food by ID
 */
export function getCustomFoodById(id: string): CustomFood | null {
  const foods = getCustomFoods();
  return foods.find(f => f.id === id) || null;
}

/**
 * Search custom foods with ranking (exact > prefix > partial)
 */
export function searchCustomFoods(query: string): FoodMatch[] {
  if (!query.trim()) return [];
  
  const foods = getCustomFoods();
  const normalizedQuery = normalizeText(query);
  const matches: FoodMatch[] = [];

  for (const food of foods) {
    const normalizedName = normalizeText(food.food_name);
    
    let matchType: 'exact' | 'prefix' | 'partial';
    let score: number;
    
    if (normalizedName === normalizedQuery) {
      matchType = 'exact';
      score = 100;
    } else if (normalizedName.startsWith(normalizedQuery)) {
      matchType = 'prefix';
      score = 80;
    } else if (normalizedName.includes(normalizedQuery)) {
      matchType = 'partial';
      score = 60;
    } else {
      continue; // No match
    }
    
    matches.push({ food, matchType, score });
  }

  // Sort by score (descending), then by name
  return matches.sort((a, b) => {
    if (a.score !== b.score) return b.score - a.score;
    return a.food.food_name.localeCompare(b.food.food_name);
  });
}

/**
 * Scale macro values proportionally from base portion to target grams
 */
export function scaleCustomFoodMacros(food: CustomFood, targetGrams: number): CustomFood {
  const multiplier = targetGrams / food.grams;
  
  return {
    ...food,
    grams: targetGrams,
    energy_kcal: Math.round(food.energy_kcal * multiplier * 10) / 10,
    carbs_g: Math.round(food.carbs_g * multiplier * 10) / 10,
    protein_g: Math.round(food.protein_g * multiplier * 10) / 10,
    fat_g: Math.round(food.fat_g * multiplier * 10) / 10,
    fiber_g: Math.round(food.fiber_g * multiplier * 10) / 10,
  };
}

/**
 * Convert CustomFood to standard Food interface for compatibility
 */
export function customFoodToFood(customFood: CustomFood): Food {
  // Convert base-portion values to per-100g semantics expected by Food
  const base = Math.max(1, customFood.grams || 100);
  const multiplier = 100 / base;
  return {
    id: customFood.id,
    food_name: customFood.food_name,
    source: customFood.source,
    portion_grams: customFood.grams, // keep original base portion for reference
    energy_kcal: Math.round(customFood.energy_kcal * multiplier * 10) / 10,
    carbs_g: Math.round(customFood.carbs_g * multiplier * 10) / 10,
    protein_g: Math.round(customFood.protein_g * multiplier * 10) / 10,
    fat_g: Math.round(customFood.fat_g * multiplier * 10) / 10,
    fiber_g: Math.round((customFood.fiber_g || 0) * multiplier * 10) / 10,
    created_at: customFood.created_at,
  };
}

/**
 * Validate custom food input
 */
export function validateCustomFoodInput(input: CustomFoodInput): string[] {
  const errors: string[] = [];

  if (!input.food_name?.trim()) {
    errors.push('Nome do alimento é obrigatório');
  } else if (input.food_name.trim().length < 2) {
    errors.push('Nome deve ter pelo menos 2 caracteres');
  } else if (input.food_name.trim().length > 100) {
    errors.push('Nome deve ter no máximo 100 caracteres');
  }

  if (typeof input.grams !== 'number' || input.grams <= 0) {
    errors.push('Porção base deve ser maior que 0');
  } else if (input.grams > 10000) {
    errors.push('Porção base deve ser menor que 10kg');
  }

  if (typeof input.energy_kcal !== 'number' || input.energy_kcal < 0) {
    errors.push('Energia deve ser um número >= 0');
  } else if (input.energy_kcal > 9999) {
    errors.push('Energia deve ser menor que 10000 kcal');
  }

  const macros = ['carbs_g', 'protein_g', 'fat_g', 'fiber_g'] as const;
  for (const macro of macros) {
    const value = input[macro];
    if (typeof value !== 'number' || value < 0) {
      const name = macro === 'carbs_g' ? 'Carboidratos' : 
                   macro === 'protein_g' ? 'Proteínas' :
                   macro === 'fat_g' ? 'Gorduras' : 'Fibras';
      errors.push(`${name} deve ser um número >= 0`);
    }
  }

  return errors;
}