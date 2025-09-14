import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Dialog, DialogContent, DialogTitle } from './Dialog';
import Button from './Button';
import Input from './Input';
import Card from './Card';
import { Search } from 'lucide-react';
import type { PagedResult, Food } from '../datafoods';
import { searchFoodsFuzzyPaged } from '../datafoods';
import { 
  searchCustomFoods, 
  customFoodToFood, 
  addCustomFood, 
  updateCustomFood, 
  deleteCustomFood, 
  validateCustomFoodInput,
  type CustomFood, 
  type CustomFoodInput
} from '../utils/customFoods';

// Helper to narrow unknown error to an AbortError-like shape without using `any`
const isAbortError = (e: unknown): e is { name: 'AbortError' } => {
  return typeof e === 'object' && e !== null && 'name' in e && (e as { name?: unknown }).name === 'AbortError';
};

interface FoodSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (row: Food, grams: number) => void;
  isDarkMode?: boolean;
  pageSize?: number;
}

const FoodSearchDialog: React.FC<FoodSearchDialogProps> = ({ open, onOpenChange, onSelect, isDarkMode = true, pageSize = 100 }) => {
  const [query, setQuery] = useState('');
  const [grams, setGrams] = useState(100);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false); // Separate loading for search input
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PagedResult<Food>>({ items: [], total: 0, page: 1, pageSize, hasNext: false, hasPrev: false });
  const [sources, setSources] = useState<string[]>(['CUSTOM','TACO','TBCA']);
  // Removido: measurementMode, householdAmount, householdUnit - usando apenas gramas
  const [selectedIndex, setSelectedIndex] = useState(-1);
  // Custom food modal state
  const [customOpen, setCustomOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [customForm, setCustomForm] = useState<CustomFoodInput>({
    food_name: '',
    grams: 100,
    energy_kcal: 0,
    carbs_g: 0,
    protein_g: 0,
    fat_g: 0,
    fiber_g: 0,
    notes: ''
  });
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const cacheRef = useRef<Map<string, PagedResult<Food>>>(new Map());

  // Persist source filters
  useEffect(() => {
    try {
      const saved = localStorage.getItem('foods.sources');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.every((s) => typeof s === 'string')) {
          const def = ['CUSTOM','TACO','TBCA'];
          const uniq = Array.from(new Set(parsed.concat(def.filter(d => !parsed.includes(d)))));
          setSources(uniq.length ? uniq : def);
        }
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try { localStorage.setItem('foods.sources', JSON.stringify(sources)); } catch { /* ignore */ }
  }, [sources]);

  const fetchFoods = useCallback(async () => {
    if (!open) return;

    // Cancel previous request if any
    if (abortRef.current) {
      try { abortRef.current.abort(); } catch { /* noop */ }
    }
    const controller = new AbortController();
    abortRef.current = controller;

    // Debounce 300ms
    await new Promise((resolve) => setTimeout(resolve, 300));
    // If request was aborted during debounce, stop
    if (controller.signal.aborted) return;

    // Set appropriate loading state based on context
    if (page === 1) {
      setSearchLoading(true); // New search
    } else {
      setLoading(true); // Pagination
    }
    setError(null);
    setSelectedIndex(-1); // Reset selection

    try {
      const qTrim = query.trim();
      // Do not fetch when query is empty — show guidance state instead
      if (!qTrim) {
        setResult({ items: [], total: 0, page: 1, pageSize, hasNext: false, hasPrev: false });
        return;
      }

      if (sources.length === 0) {
        setResult({ items: [], total: 0, page: 1, pageSize, hasNext: false, hasPrev: false });
        return;
      }

      const limit = pageSize;
      const currentPage = page;

      const activeRemoteSources = sources.filter((s) => s !== 'CUSTOM');

      // Cache key per q/sources/page
      const cacheKey = JSON.stringify({ q: qTrim, s: activeRemoteSources.slice().sort(), p: currentPage, ps: limit });
      const cached = cacheRef.current.get(cacheKey);
      if (cached) {
        setResult(cached);
        return;
      }

      let usedFallback = false;

      try {
        // Attempt via backend proxy if available
        const params = new URLSearchParams({ q: qTrim, page: String(currentPage), pageSize: String(limit) });
        if (activeRemoteSources.length) params.set('sources', activeRemoteSources.join(','));

        const res = await fetch('/api/foods/search?' + params.toString(), { method: 'GET', signal: controller.signal });
        if (!res.ok) throw new Error('Backend not OK');
        const apiData: PagedResult<Food> & { estimatedTotal?: number } = await res.json();
        const { items: remoteItems, estimatedTotal = apiData.total, hasNext = apiData.hasNext, hasPrev = apiData.hasPrev } = apiData;

        let mergedItems = remoteItems;
        if (sources.includes('CUSTOM')) {
          const matches = searchCustomFoods(qTrim);
          const customFoods = matches.map(m => customFoodToFood(m.food as CustomFood));
          mergedItems = [...customFoods, ...remoteItems];
        }

        const next: PagedResult<Food> = {
          items: mergedItems,
          total: estimatedTotal,
          page: currentPage,
          pageSize: limit,
          hasNext: !!hasNext,
          hasPrev: !!hasPrev,
        };
        setResult(next);
        cacheRef.current.set(cacheKey, next);
      } catch (err: unknown) {
        if (isAbortError(err)) return; // ignore aborted
        // Graceful fallback to direct Supabase RPC if backend/API is unavailable
        usedFallback = true;
        const data: PagedResult<Food> = await searchFoodsFuzzyPaged(qTrim, currentPage, pageSize, activeRemoteSources.length ? activeRemoteSources : ['TACO','TBCA']);
        let mergedItems = data.items;
        if (sources.includes('CUSTOM')) {
          const matches = searchCustomFoods(qTrim);
          const customFoods = matches.map(m => customFoodToFood(m.food as CustomFood));
          mergedItems = [...customFoods, ...data.items];
        }
        const next: PagedResult<Food> = { ...data, items: mergedItems };
        setResult(next);
        cacheRef.current.set(cacheKey, next);
      }

      // Optionally log telemetry (no PII)
      try {
        // eslint-disable-next-line no-console
        console.log(
          JSON.stringify({ evt: 'foods_search_client', q_len: qTrim.length, page, pageSize, sources, used_fallback: usedFallback })
        );
      } catch {
        /* noop */
      }
    } catch (err: unknown) {
      if (isAbortError(err)) return;
      console.error('Error fetching foods:', err);
      setError('Erro ao buscar alimentos. Tente novamente.');
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  }, [open, query, page, pageSize, sources]);

  useEffect(() => {
    fetchFoods();
  }, [fetchFoods]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!result.items.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, result.items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      const selected = result.items[selectedIndex];
      onSelect(selected, grams);
    }
  }, [result.items, selectedIndex, onSelect, grams]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-3xl ${isDarkMode ? 'bg-[#1b2027] text-white' : 'bg-white text-gray-900'}`}>
        <DialogTitle>Adicionar alimento</DialogTitle>
        <div className="flex flex-col gap-4">
          {/* Search input and grams */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Input
                ref={searchInputRef}
                value={query}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setQuery(e.target.value); setPage(1); }}
                placeholder="Busque por nome do alimento"
                aria-label="Buscar alimentos"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-60" />
            </div>
            <div className="w-[140px]">
              <label className="text-xs opacity-70">Quantidade (g)</label>
              <Input type="number" value={grams} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGrams(Math.max(1, Number(e.target.value)||1))} />
            </div>
          </div>

          {/* Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" onKeyDown={handleKeyDown} tabIndex={0} ref={resultsRef}>
            {/* Left: results list */}
            <div className="space-y-2">
              {error && (
                <div className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{error}</div>
              )}
              {!error && result.items.length === 0 && !loading && !searchLoading && (
                <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Digite para buscar alimentos nas bases selecionadas.
                </div>
              )}

              {result.items.map((row, idx) => (
                <Card key={row.id} className={`${selectedIndex === idx ? 'ring-2 ring-emerald-400' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{row.food_name}</div>
                      <div className="text-xs opacity-70">{row.energy_kcal} kcal · P {row.protein_g}g · C {row.carbs_g}g · G {row.fat_g}g</div>
                    </div>
                    <Button variant="primary" size="sm" onClick={() => onSelect(row, grams)}>Adicionar</Button>
                  </div>
                </Card>
              ))}

              {(loading || searchLoading) && (
                <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Carregando...</div>
              )}

              {/* Pagination */}
              <div className="flex items-center justify-between mt-2">
                <Button variant="secondary" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={!result.hasPrev}>Anterior</Button>
                <div className="text-xs opacity-70">Página {result.page} de {Math.max(1, Math.ceil(result.total / result.pageSize))}</div>
                <Button variant="secondary" size="sm" onClick={() => setPage((p) => p + 1)} disabled={!result.hasNext}>Próxima</Button>
              </div>
            </div>

            {/* Right: sources and custom foods */}
            <div className="space-y-3">
              <div>
                <div className="text-sm font-medium mb-1">Fontes</div>
                <div className="flex flex-wrap gap-2">
                  {['CUSTOM','TACO','TBCA'].map((src) => (
                    <button
                      key={src}
                      onClick={() => {
                        setSources((prev) => prev.includes(src) ? prev.filter((s) => s !== src) : [...prev, src]);
                        setPage(1);
                      }}
                      className={`px-2 py-1 rounded-md text-xs border ${sources.includes(src) ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-transparent text-gray-300 border-[#2a3040]'}`}
                    >
                      {src}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom foods editor */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Alimentos personalizados</div>
                  <Button variant="secondary" size="sm" onClick={() => { setCustomOpen(true); setEditingId(null); }}>Novo</Button>
                </div>

                {/* List custom foods matching query */}
                {query.trim() && (
                  <div className="space-y-2">
                    {searchCustomFoods(query).map((m) => {
                      const asFood = customFoodToFood(m.food as CustomFood);
                      return (
                        <Card key={(m.food as CustomFood).id}>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{asFood.food_name}</div>
                              <div className="text-xs opacity-70">{asFood.energy_kcal} kcal · P {asFood.protein_g}g · C {asFood.carbs_g}g · G {asFood.fat_g}g</div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="secondary" size="sm" onClick={() => { setEditingId((m.food as CustomFood).id); setCustomOpen(true); }}>Editar</Button>
                              <Button variant="secondary" size="sm" onClick={() => { try { deleteCustomFood((m.food as CustomFood).id); } catch { /* noop */ } }}>Excluir</Button>
                              <Button variant="primary" size="sm" onClick={() => onSelect(asFood, grams)}>Adicionar</Button>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}

                {/* Custom food modal */}
                {customOpen && (
                  <div className="mt-2 p-3 rounded-md border border-[#2a3040]">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="col-span-2">
                        <label className="text-xs">Nome</label>
                        <Input value={customForm.food_name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomForm(v => ({...v, food_name: e.target.value}))} />
                      </div>
                      <div>
                        <label className="text-xs">Base (g)</label>
                        <Input type="number" value={customForm.grams} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomForm(v => ({...v, grams: Math.max(1, Number(e.target.value)||100)}))} />
                      </div>
                      <div>
                        <label className="text-xs">Calorias (kcal)</label>
                        <Input type="number" value={customForm.energy_kcal} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomForm(v => ({...v, energy_kcal: Math.max(0, Number(e.target.value)||0)}))} />
                      </div>
                      <div>
                        <label className="text-xs">Proteínas (g)</label>
                        <Input type="number" value={customForm.protein_g} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomForm(v => ({...v, protein_g: Math.max(0, Number(e.target.value)||0)}))} />
                      </div>
                      <div>
                        <label className="text-xs">Carboidratos (g)</label>
                        <Input type="number" value={customForm.carbs_g} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomForm(v => ({...v, carbs_g: Math.max(0, Number(e.target.value)||0)}))} />
                      </div>
                      <div>
                        <label className="text-xs">Gorduras (g)</label>
                        <Input type="number" value={customForm.fat_g} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomForm(v => ({...v, fat_g: Math.max(0, Number(e.target.value)||0)}))} />
                      </div>
                      <div>
                        <label className="text-xs">Fibras (g)</label>
                        <Input type="number" value={customForm.fiber_g} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomForm(v => ({...v, fiber_g: Math.max(0, Number(e.target.value)||0)}))} />
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs">Notas (opcional)</label>
                        <Input value={customForm.notes} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomForm(v => ({...v, notes: e.target.value}))} />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-end gap-2">
                      <Button variant="secondary" onClick={() => setCustomOpen(false)}>Cancelar</Button>
                      <Button variant="primary" onClick={() => {
                        const errors = validateCustomFoodInput(customForm);
                        if (errors.length) {
                          return;
                        }
                        try {
                          if (editingId) {
                            updateCustomFood(editingId, customForm);
                          } else {
                            addCustomFood(customForm);
                          }
                          setCustomOpen(false);
                          // Refresh list
                          fetchFoods();
                        } catch {
                          // noop
                        }
                      }}>Salvar</Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FoodSearchDialog;


