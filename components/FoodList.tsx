import React, { useEffect, useMemo, useState } from 'react';
import { listFoods, kcalForPortion, type PortionResult } from '../datafoods';
import type { FoodListItem } from '../types';
import AddFoodForm from './AddFoodForm';

const format1d = (n: number) => (Math.round(n * 10) / 10).toFixed(1);
const formatKcal = (n: number) => Math.round(n).toString();

const FoodList: React.FC = () => {
  const [foods, setFoods] = useState<FoodListItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<FoodListItem | null>(null);
  const [grams, setGrams] = useState<number>(100);
  const [portion, setPortion] = useState<PortionResult | null>(null);
  const [portionLoading, setPortionLoading] = useState(false);
  const [portionError, setPortionError] = useState<string | null>(null);

  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const rows = await listFoods();
        setFoods(rows);
      } catch (e) {
        setError((e as Error).message || 'Erro ao carregar alimentos.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return foods;
    return foods.filter((f) => f.food_name.toLowerCase().includes(q));
  }, [foods, search]);

  async function updatePortion(s: FoodListItem | null, g: number) {
    if (!s) return;
    setPortion(null);
    setPortionError(null);
    setPortionLoading(true);
    try {
      const res = await kcalForPortion(s.id, g);
      setPortion(res);
    } catch (e) {
      setPortionError((e as Error).message || 'Erro ao calcular porção.');
    } finally {
      setPortionLoading(false);
    }
  }

  useEffect(() => {
    if (selected) {
      void updatePortion(selected, grams);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-[#c9d1d9]">Alimentos (100 g)</h2>
        <button
          type="button"
          className="text-sm px-3 py-1.5 rounded bg-emerald-600 text-white hover:bg-emerald-700"
          onClick={() => setShowAdd((v) => !v)}
          aria-expanded={showAdd}
        >
          {showAdd ? 'Fechar' : 'Adicionar alimento'}
        </button>
      </div>

      {showAdd && (
        <div className="border rounded-lg p-4 bg-white dark:bg-[#151923] dark:border-[#272c35]">
          <AddFoodForm
            onCreated={(row) => {
              setFoods((prev) => [...prev, row]);
              setShowAdd(false);
              setSelected(row);
              setGrams(100);
              void updatePortion(row, 100);
            }}
          />
        </div>
      )}

      <div className="flex gap-3">
        <div className="relative flex-1">
          <label htmlFor="foods-search" className="sr-only">Pesquisar alimentos</label>
          <input
            id="foods-search"
            type="text"
            className="w-full rounded-md border border-gray-300 dark:border-[#272c35] bg-white dark:bg-[#0f1115] px-3 py-2 text-sm text-gray-900 dark:text-[#c9d1d9]"
            placeholder="Buscar por nome"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading && <div className="text-sm text-muted">Carregando alimentos...</div>}
      {error && <div className="text-sm text-red-500">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded-lg overflow-hidden dark:border-[#272c35]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-[#111827] text-gray-600 dark:text-[#9aa4b2]">
                <th className="text-left p-2">Nome</th>
                <th className="text-right p-2">Carb</th>
                <th className="text-right p-2">Prot</th>
                <th className="text-right p-2">Gord</th>
                <th className="text-right p-2">kcal</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f) => (
                <tr
                  key={f.id}
                  className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-[#0e1420] ${selected?.id === f.id ? 'bg-gray-50 dark:bg-[#0f1625]' : ''}`}
                  onClick={() => setSelected(f)}
                  aria-selected={selected?.id === f.id}
                >
                  <td className="p-2 text-gray-900 dark:text-[#c9d1d9]">{f.food_name}</td>
                  <td className="p-2 text-right text-green-600">{format1d(f.carbs_g)}</td>
                  <td className="p-2 text-right text-green-600">{format1d(f.protein_g)}</td>
                  <td className="p-2 text-right text-green-600">{format1d(f.fat_g)}</td>
                  <td className="p-2 text-right text-red-600">{formatKcal(f.energy_kcal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border rounded-lg p-4 dark:border-[#272c35] bg-white dark:bg-[#151923]">
          <h3 className="font-medium mb-2 text-gray-900 dark:text-[#c9d1d9]">Porção</h3>
          {!selected && <div className="text-sm text-muted">Selecione um alimento para calcular a porção.</div>}
          {selected && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void updatePortion(selected, grams);
              }}
            >
              <div className="flex items-end gap-3 mb-3">
                <div className="flex-1">
                  <label htmlFor="grams" className="block text-xs text-muted mb-1">Gramas</label>
                  <input
                    id="grams"
                    name="grams"
                    type="number"
                    min={0}
                    step={1}
                    value={grams}
                    onChange={(e) => {
                      const v = Number(e.target.value || 0);
                      setGrams(v);
                      void updatePortion(selected, v);
                    }}
                    className="w-full rounded-md border border-gray-300 dark:border-[#272c35] bg-white dark:bg-[#0f1115] px-3 py-2 text-sm text-gray-900 dark:text-[#c9d1d9]"
                    placeholder="g por 100 g"
                    aria-describedby="grams-help"
                  />
                  <div id="grams-help" className="text-[11px] text-muted mt-1">g por 100 g</div>
                </div>
              </div>

              {portionLoading && <div className="text-sm text-muted">Calculando...</div>}
              {portionError && <div className="text-sm text-red-500">{portionError}</div>}
              {portion && (
                <div className="grid grid-cols-4 gap-2 text-sm mt-2">
                  <div>
                    <div className="text-muted">Carb</div>
                    <div className="font-medium text-green-600">{format1d(portion.carbs_g)}</div>
                  </div>
                  <div>
                    <div className="text-muted">Prot</div>
                    <div className="font-medium text-green-600">{format1d(portion.protein_g)}</div>
                  </div>
                  <div>
                    <div className="text-muted">Gord</div>
                    <div className="font-medium text-green-600">{format1d(portion.fat_g)}</div>
                  </div>
                  <div>
                    <div className="text-muted">kcal</div>
                    <div className="font-medium text-red-600">{formatKcal(portion.energy_kcal)}</div>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodList;

