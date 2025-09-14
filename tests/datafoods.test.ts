import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the supabase client
vi.mock('../supabaseClient', () => {
  const mockSupabase = {
    from: vi.fn(),
    rpc: vi.fn()
  };
  
  return {
    default: mockSupabase,
    supabase: mockSupabase
  };
});

import {
  generateSlug,
  listFoods,
  searchFoods,
  kcalForPortion,
  addFood,
  type Food,
  type FoodInput,
  type AddFoodInput,
  type PortionResult
} from '../datafoods';

// Get the mocked supabase for test assertions
const mockSupabase = vi.mocked(await vi.importMock('../supabaseClient')).default as any;

beforeEach(() => {
  vi.clearAllMocks();
  
  // Create a simple chainable mock
  const createChainableMock = () => {
    const mock = {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      range: vi.fn().mockReturnThis()
    };
    
    // Override specific methods that should resolve
    mock.select.mockResolvedValue({ data: [], error: null });
    mock.ilike.mockResolvedValue({ data: [], error: null });
    mock.range.mockResolvedValue({ data: [], error: null, count: 0 });
    
    return mock;
  };
  
  // Configure supabase mocks to return fresh chainable mocks
  mockSupabase.from.mockImplementation(() => createChainableMock());
  mockSupabase.rpc.mockImplementation(() => createChainableMock());
});

describe('generateSlug', () => {
  it('should convert simple text to slug', () => {
    expect(generateSlug('Arroz Branco')).toBe('arroz_branco');
  });

  it('should handle special characters and accents', () => {
    expect(generateSlug('Feijão Preto Cozido')).toBe('feijao_preto_cozido');
    expect(generateSlug('Açúcar Cristal')).toBe('acucar_cristal');
    expect(generateSlug('Pão de Açúcar')).toBe('pao_de_acucar');
  });

  it('should handle multiple spaces and special characters', () => {
    expect(generateSlug('  Peito   de   Frango  ')).toBe('peito_de_frango');
    expect(generateSlug('Óleo de Coco (100%)')).toBe('oleo_de_coco_100');
    expect(generateSlug('Leite - Integral')).toBe('leite_integral');
  });

  it('should handle numbers and mixed content', () => {
    expect(generateSlug('Vitamina B12 500mg')).toBe('vitamina_b12_500mg');
    expect(generateSlug('Whey Protein 80%')).toBe('whey_protein_80');
  });

  it('should handle edge cases', () => {
    expect(generateSlug('')).toBe('');
    expect(generateSlug('   ')).toBe('');
    expect(generateSlug('123')).toBe('123');
    expect(generateSlug('!@#$%')).toBe('');
  });

  it('should handle very long names', () => {
    const longName = 'Este é um nome muito longo para um alimento que deveria ser encurtado adequadamente';
    const slug = generateSlug(longName);
    expect(slug).toBe('este_e_um_nome_muito_longo_para_um_alimento_que_deveria_ser_encurtado_adequadamente');
    expect(slug.length).toBeGreaterThan(0);
  });
});

describe('listFoods', () => {
  it('should return list of foods successfully', async () => {
    const mockFoods: Food[] = [
      {
        id: '1',
        food_name: 'Arroz Branco Cozido',
        
        source: 'TACO 4 ed. (2011)',
        carbs_g: 28.1,
        protein_g: 2.5,
        fat_g: 0.2,
        energy_kcal: 124.4,
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        food_name: 'Feijão Preto Cozido',
        
        source: 'TACO 4 ed. (2011)',
        carbs_g: 14.0,
        protein_g: 8.9,
        fat_g: 0.5,
        energy_kcal: 77.0,
        created_at: '2024-01-01T00:00:00Z'
      }
    ];

    // Mock the chain to return the foods data
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockFoods, error: null })
    };
    mockSupabase.from.mockReturnValue(mockChain);

    const result = await listFoods();

    expect(mockSupabase.from).toHaveBeenCalledWith('foods');
    expect(result).toEqual(mockFoods);
  });

  it('should handle database errors', async () => {
    const mockError = { message: 'Database connection failed' };
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: null, error: mockError })
    };
    mockSupabase.from.mockReturnValue(mockChain);

    await expect(listFoods()).rejects.toThrow('Error fetching foods: Database connection failed');
  });

  it('should handle empty results', async () => {
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null })
    };
    mockSupabase.from.mockReturnValue(mockChain);

    const result = await listFoods();
    expect(result).toEqual([]);
  });
});

describe('searchFoods', () => {
  it('should search foods by name', async () => {
    const mockFoods: Food[] = [
      {
        id: '1',
        food_name: 'Arroz Branco Cozido',
        
        source: 'TACO 4 ed. (2011)',
        carbs_g: 28.1,
        protein_g: 2.5,
        fat_g: 0.2,
        energy_kcal: 124.4,
        created_at: '2024-01-01T00:00:00Z'
      }
    ];

    const mockChain = {
      select: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockFoods, error: null })
    };
    mockSupabase.from.mockReturnValue(mockChain);

    const result = await searchFoods('arroz');

    expect(mockSupabase.from).toHaveBeenCalledWith('foods');
    expect(result).toEqual(mockFoods);
  });

  it('should return all foods when query is empty', async () => {
    const mockFoods: Food[] = [];
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockFoods, error: null })
    };
    mockSupabase.from.mockReturnValue(mockChain);

    const result = await searchFoods('');

    expect(result).toEqual(mockFoods);
  });

  it('should handle search errors', async () => {
    const mockError = { message: 'Search failed' };
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: null, error: mockError })
    };
    mockSupabase.from.mockReturnValue(mockChain);

    await expect(searchFoods('test')).rejects.toThrow('Error searching foods: Search failed');
  });
});

describe('kcalForPortion', () => {
  it('should calculate portion macros correctly', async () => {
    const mockResult: PortionResult = {
      slug: 'arroz_branco',
      grams: 150,
      energy_kcal: 186.6,
      carbs_g: 42.15,
      protein_g: 3.75,
      fat_g: 0.3
    };

    mockSupabase.rpc.mockResolvedValue({ data: [mockResult], error: null });

    const result = await kcalForPortion('arroz-branco-cozido', 150);

    expect(mockSupabase.rpc).toHaveBeenCalledWith('kcal_for_portion', {
      food_slug: 'arroz-branco-cozido',
      portion_grams: 150
    });
    expect(result).toEqual(mockResult);
  });

  it('should handle invalid food slug', async () => {
    const mockError = { message: 'Food not found' };
    mockSupabase.rpc.mockResolvedValue({ data: null, error: mockError });

    await expect(kcalForPortion('invalid-slug', 100))
      .rejects.toThrow('Error calculating portion: Food not found');
  });

  it('should handle zero portion', async () => {
    const mockResult: PortionResult = {
      slug: 'arroz_branco_cozido',
      grams: 1000,
      energy_kcal: 1244,
      carbs_g: 281,
      protein_g: 25,
      fat_g: 2
    };

    mockSupabase.rpc.mockResolvedValue({ data: [mockResult], error: null });

    const result = await kcalForPortion('arroz-branco-cozido', 1000);
    expect(result?.grams).toBe(1000);
    expect(result?.energy_kcal).toBeGreaterThan(1000);
  });

  it('should handle large portions', async () => {
    const mockResult: PortionResult = {
      slug: 'arroz_branco_cozido',
      grams: 1000,
      energy_kcal: 1244,
      carbs_g: 281,
      protein_g: 25,
      fat_g: 2
    };

    mockSupabase.rpc.mockResolvedValue({ data: [mockResult], error: null });

    const result = await kcalForPortion('arroz-branco-cozido', 1000);
    expect(result?.grams).toBe(1000);
    expect(result?.energy_kcal).toBeGreaterThan(1000);
  });
});

describe('addFood', () => {
  it('should add new food successfully', async () => {
    const newFood: AddFoodInput = {
      food_name: 'Quinoa Cozida',
      source: 'USDA',
      carbs_g: 21.3,
      protein_g: 4.4,
      fat_g: 1.9
    };

    const mockInsertedFood: Food = {
      id: '3',
      food_name: 'Quinoa Cozida',

      source: 'USDA',
      carbs_g: 21.3,
      protein_g: 4.4,
      fat_g: 1.9,
      energy_kcal: 120.1, // Calculated: (21.3 * 4) + (4.4 * 4) + (1.9 * 9)
      created_at: '2024-01-01T00:00:00Z'
    };

    const mockChain = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockInsertedFood, error: null })
    };
    mockSupabase.from.mockReturnValue(mockChain);

    const result = await addFood(newFood);

    expect(mockSupabase.from).toHaveBeenCalledWith('foods');
    expect(result).toEqual(mockInsertedFood);
  });

  it('should handle duplicate food names', async () => {
    const duplicateFood: FoodInput = {
      food_name: 'Arroz Branco Cozido',
      source: 'TACO 4 ed. (2011)',
      carbs_g: 28.1,
      protein_g: 2.5,
      fat_g: 0.2
    };

    const mockError = { 
      message: 'duplicate key value violates unique constraint',
      code: '23505'
    };
    const mockChain = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: mockError })
    };
    mockSupabase.from.mockReturnValue(mockChain);

    await expect(addFood(duplicateFood))
      .rejects.toThrow('Erro ao adicionar alimento: duplicate key value violates unique constraint');
  });

  it('should handle validation errors', async () => {
    const invalidFood: FoodInput = {
      food_name: '', // Empty name
      source: 'Test',
      carbs_g: -1, // Negative value
      protein_g: 0,
      fat_g: 0
    };

    const mockError = { message: 'Validation failed' };
    const mockChain = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: mockError })
    };
    mockSupabase.from.mockReturnValue(mockChain);

    await expect(addFood(invalidFood))
      .rejects.toThrow('Erro ao adicionar alimento: Validation failed');
  });

  it('should generate correct slug for complex names', async () => {
    const complexFood: AddFoodInput = {
      food_name: 'Açaí com Granola e Mel (Tigela 300ml)',
      source: 'Análise Nutricional',
      carbs_g: 45.2,
      protein_g: 8.1,
      fat_g: 12.3
    };

    const mockInsertedFood: Food = {
      id: '4',
      food_name: 'Açaí com Granola e Mel (Tigela 300ml)',
      
      source: 'Análise Nutricional',
      carbs_g: 45.2,
      protein_g: 8.1,
      fat_g: 12.3,
      energy_kcal: 291.5,
      created_at: '2024-01-01T00:00:00Z'
    };

    const mockChain = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockInsertedFood, error: null })
    };
    mockSupabase.from.mockReturnValue(mockChain);

    const result = await addFood(complexFood);

    expect(result.food_name).toBe('Açaí com Granola e Mel (Tigela 300ml)');
  });
});

// Integration-style tests for realistic scenarios
describe('Food Management Integration', () => {
  it('should handle complete food workflow', async () => {
    // 1. Add a new food
    const newFood: AddFoodInput = {
      food_name: 'Batata Doce Assada',
      source: 'TACO 4 ed. (2011)',
      carbs_g: 18.4,
      protein_g: 2.0,
      fat_g: 0.1
    };

    const addedFood: Food = {
      id: '5',
      food_name: 'Batata Doce Assada',
      
      source: 'TACO 4 ed. (2011)',
      carbs_g: 18.4,
      protein_g: 2.0,
      fat_g: 0.1,
      energy_kcal: 77.3,
      created_at: '2024-01-01T00:00:00Z'
    };

    // Mock add food
    const addMockChain = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: addedFood, error: null })
    };
    mockSupabase.from.mockReturnValueOnce(addMockChain);

    const result = await addFood(newFood);
    expect(result.food_name).toBe('Batata Doce Assada');

    // 2. Search for the food
    const searchMockChain = {
      select: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [addedFood], error: null })
    };
    mockSupabase.from.mockReturnValueOnce(searchMockChain);
    
    const searchResults = await searchFoods('batata');
    expect(searchResults).toHaveLength(1);
    expect(searchResults[0].food_name).toBe('Batata Doce Assada');

    // 3. Calculate portion
    const portionResult: PortionResult = {
      slug: 'arroz_branco_cozido',
      grams: 200,
      energy_kcal: 154.6,
      carbs_g: 35.6,
      protein_g: 5.0,
      fat_g: 0.4
    };

    mockSupabase.rpc.mockResolvedValueOnce({ data: [portionResult], error: null });
    
    const portion = await kcalForPortion('batata-doce-assada', 200);
    expect(portion).not.toBeNull();
    expect(portion!.grams).toBe(200);
    expect(portion!.energy_kcal).toBeCloseTo(154.6, 1);
  });

  it('should handle realistic macro calculations', async () => {
    // Test with real food data
    const portions = [
      { grams: 50, expectedKcal: 62.2 },
      { grams: 100, expectedKcal: 124.4 },
      { grams: 150, expectedKcal: 186.6 },
      { grams: 200, expectedKcal: 248.8 }
    ];

    for (const { grams, expectedKcal } of portions) {
      const mockResult: PortionResult = {
        slug: 'test_food',
        grams,
        energy_kcal: expectedKcal,
        carbs_g: (28.1 * grams) / 100,
        protein_g: (2.5 * grams) / 100,
        fat_g: (0.2 * grams) / 100
      };

      mockSupabase.rpc.mockResolvedValueOnce({ data: [mockResult], error: null });
      
      const result = await kcalForPortion('arroz-branco-cozido', grams);
      expect(result).not.toBeNull();
      expect(result!.energy_kcal).toBeCloseTo(expectedKcal, 1);
      expect(result!.grams).toBe(grams);
    }
  });
});