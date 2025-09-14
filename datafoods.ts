// Data layer for food macronutrients using Supabase
import { supabase } from './supabaseClient';

// Types for food data
export interface Food {
  id: string; // converted from number to string for compatibility
  food_name: string;
  unit?: string;
  portion_grams?: number;
  carbs_g: number;
  protein_g: number;
  fat_g: number;
  fiber_g?: number;
  energy_kcal: number;
  source?: string;
  created_at?: string;
}

export interface FoodInput {
  food_name: string;
  unit?: string;
  portion_grams?: number;
  carbs_g: number;
  protein_g: number;
  fat_g: number;
  fiber_g?: number;
  energy_kcal?: number;
  source?: string;
}

export interface AddFoodInput {
  food_name: string;
  unit?: string;
  portion_grams?: number;
  carbs_g: number;
  protein_g: number;
  fat_g: number;
  fiber_g?: number;
  energy_kcal?: number;
  source?: string;
}

export interface PortionResult {
  slug: string;
  grams: number;
  carbs_g: number;
  protein_g: number;
  fat_g: number;
  energy_kcal: number;
}

// Utility function to generate slug from name
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s]/g, '') // Remove special chars
    .trim()
    .replace(/\s+/g, '_'); // Replace spaces with underscores
}

/**
 * List all foods ordered by name
 * @returns Promise with array of foods
 */
export async function listFoods(): Promise<Food[]> {
  const { data, error } = await supabase
    .from('foods')
    .select('*')
    .order('food_name');

  // Convert id from number to string for compatibility
  const convertedData = data?.map(item => ({
    ...item,
    id: String(item.id)
  }));

  if (error) {
    throw new Error(`Error fetching foods: ${error.message}`);
  }

  return convertedData || [];
}

/**
 * Calculate macros for a specific portion using RPC
 * @param slug - Food slug identifier
 * @param grams - Portion size in grams
 * @returns Promise with scaled macronutrient values
 */
export async function kcalForPortion(slug: string, grams: number): Promise<PortionResult | null> {
  const { data, error } = await supabase
    .rpc('kcal_for_portion', {
      food_slug: slug,
      portion_grams: grams
    });

  if (error) {
    throw new Error(`Error calculating portion: ${error.message}`);
  }

  return data && data.length > 0 ? data[0] : null;
}

/**
 * Add a new food to the database
 * @param input - Food data to insert
 * @returns Promise with created food record
 */
export async function addFood(input: AddFoodInput): Promise<Food> {
  const { data, error } = await supabase
    .from('foods')
    .insert([{
      food_name: input.food_name,
      unit: input.unit,
      portion_grams: input.portion_grams,
      carbs_g: input.carbs_g,
      protein_g: input.protein_g,
      fat_g: input.fat_g,
      fiber_g: input.fiber_g,
      energy_kcal: input.energy_kcal || 0,
      source: input.source
    }])
    .select()
    .single();

  if (error) {
    throw new Error(`Erro ao adicionar alimento: ${error.message}`);
  }

  if (!data) {
    throw new Error('Erro inesperado: nenhum dado retornado após inserção');
  }

  // Convert id from number to string for compatibility
  return {
    ...data,
    id: String(data.id)
  };
}

/**
 * Search foods by name
 * @param query - Search term
 * @returns Promise with filtered foods
 */
export async function searchFoods(query: string): Promise<Food[]> {
  if (!query.trim()) {
    return listFoods();
  }

  // Busca por linguagem natural básica: fragmentos na ordem e priorização por fonte
  const q = query.trim();
  const terms = q
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(/\s+/)
    .filter(Boolean);

  const { data, error } = await supabase
    .from('foods')
    .select('*')
    .ilike('food_name', `%${q}%`)
    .order('food_name', { ascending: true });

  // Convert id from number to string for compatibility
  const convertedData = data?.map(item => ({
    ...item,
    id: String(item.id)
  }));

  if (error) {
    throw new Error(`Error searching foods: ${error.message}`);
  }

  const prioritized = (convertedData || []).sort((a, b) => {
    // 1) Priorizar correspondência de termos na ordem
    const aName = a.food_name.toLowerCase();
    const bName = b.food_name.toLowerCase();
    const orderScore = (name: string) =>
      terms.reduce((score, term, idx) => (name.includes(term) ? score + (idx + 1) : score), 0);
    const aOrder = orderScore(aName);
    const bOrder = orderScore(bName);
    if (aOrder !== bOrder) return bOrder - aOrder;

    // 2) Priorizar por fonte: TACO > TBCA > IBGE > outros
    const rank = (s?: string) => {
      const src = (s || '').toLowerCase();
      if (src.includes('taco')) return 3;
      if (src.includes('tbca')) return 2;
      if (src.includes('ibge')) return 1;
      return 0;
    };
    const ar = rank(a.source);
    const br = rank(b.source);
    if (ar !== br) return br - ar;

    // 3) Fallback alfabético
    return a.food_name.localeCompare(b.food_name);
  });

  return prioritized;
}

// -------------------------
// Pagination helpers (read-only)
// -------------------------

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
}

function computePageMeta(total: number, page: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;
  return { totalPages, currentPage, hasPrev, hasNext };
}

/**
 * Paginated list of foods ordered by name
 */
export async function listFoodsPaged(page: number, pageSize: number): Promise<PagedResult<Food>> {
  const from = (Math.max(1, page) - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from('foods')
    .select('*', { count: 'exact' })
    .order('food_name', { ascending: true })
    .range(from, to);

  if (error) {
    throw new Error(`Error fetching foods: ${error.message}`);
  }

  // Convert id from number to string for compatibility
  const convertedData = data?.map(item => ({
    ...item,
    id: String(item.id)
  }));

  const total = count || 0;
  const meta = computePageMeta(total, page, pageSize);
  return {
    items: convertedData || [],
    total,
    page: meta.currentPage,
    pageSize,
    hasNext: meta.hasNext,
    hasPrev: meta.hasPrev,
  };
}

/**
 * Paginated search by name (case-insensitive)
 */
export async function searchFoodsPaged(query: string, page: number, pageSize: number): Promise<PagedResult<Food>> {
  const from = (Math.max(1, page) - 1) * pageSize;
  const to = from + pageSize - 1;

  const q = query.trim();

  const base = supabase
    .from('foods')
    .select('*', { count: 'exact' })
    .order('food_name')
    .range(from, to);

  const { data, error, count } = q
    ? await base.ilike('food_name', `%${q}%`)
    : await base;

  if (error) {
    throw new Error(`Error searching foods: ${error.message}`);
  }

  // Convert id from number to string for compatibility
  const convertedData = data?.map(item => ({
    ...item,
    id: String(item.id)
  }));

  // Ordenação por prioridade (mesma lógica do searchFoods)
  const qterms = q
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(/\s+/)
    .filter(Boolean);
  const prioritized = (convertedData || []).sort((a, b) => {
    const aName = a.food_name.toLowerCase();
    const bName = b.food_name.toLowerCase();
    const orderScore = (name: string) =>
      qterms.reduce((score, term, idx) => (name.includes(term) ? score + (idx + 1) : score), 0);
    const aOrder = orderScore(aName);
    const bOrder = orderScore(bName);
    if (aOrder !== bOrder) return bOrder - aOrder;
    const rank = (s?: string) => {
      const src = (s || '').toLowerCase();
      if (src.includes('taco')) return 3;
      if (src.includes('tbca')) return 2;
      if (src.includes('ibge')) return 1;
      return 0;
    };
    const ar = rank(a.source);
    const br = rank(b.source);
    if (ar !== br) return br - ar;
    return a.food_name.localeCompare(b.food_name);
  });

  const total = count || 0;
  const meta = computePageMeta(total, page, pageSize);
  return {
    items: prioritized,
    total,
    page: meta.currentPage,
    pageSize,
    hasNext: meta.hasNext,
    hasPrev: meta.hasPrev,
  };
}

/**
 * Fuzzy search using Supabase RPC `search_foods` with TACO-first ranking.
 * Supports pagination via limit/offset and source filtering chips.
 *
 * Note: The RPC does not return total count. We infer pagination flags
 * using the number of items returned (hasNext when items === pageSize).
 */
export async function searchFoodsFuzzyPaged(
  query: string,
  page: number,
  pageSize: number,
  sources: string[] = ['TACO', 'TBCA']
): Promise<PagedResult<Food>> {
  const q = (query || '').trim();
  const currentPage = Math.max(1, page);
  const limit = Math.max(1, Math.min(pageSize, 200));
  const offset = (currentPage - 1) * limit;

  if (!q) {
    // Fallback to alphabetical list when query is empty
    return listFoodsPaged(currentPage, limit);
  }

  const { data, error } = await supabase.rpc('search_foods', {
    q,
    sources,
    limit_count: limit,
    offset_count: offset,
  });

  if (error) {
    throw new Error(`Error searching foods (fuzzy): ${error.message}`);
  }

  const convertedData: Food[] = (data || []).map((item: Partial<Food> & { id: string | number }) => ({
    ...item,
    id: String(item.id),
  }));

  const hasNext = convertedData.length === limit;
  const hasPrev = currentPage > 1;

  // We cannot know the real total here; provide a conservative estimate
  const estimatedTotal = (currentPage - 1) * limit + convertedData.length + (hasNext ? limit : 0);

  return {
    items: convertedData,
    total: estimatedTotal,
    page: currentPage,
    pageSize: limit,
    hasNext,
    hasPrev,
  };
}