import React, { useMemo, useState } from 'react';
import { addFood, type AddFoodInput, type Food } from '../datafoods';

interface Props {
  onCreated?: (row: Food) => void;
}

const AddFoodForm: React.FC<Props> = ({ onCreated }) => {
  const [name, setName] = useState('');
  const [carbs, setCarbs] = useState<string>('0');
  const [protein, setProtein] = useState<string>('0');
  const [fat, setFat] = useState<string>('0');
  const [source, setSource] = useState<string>('TACO 4 ed. (2011)');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState<Food | null>(null);



  const isValid = useMemo(() => {
    const c = Number(carbs);
    const p = Number(protein);
    const g = Number(fat);
    if (!name.trim()) return false;
    if (Number.isNaN(c) || c < 0) return false;
    if (Number.isNaN(p) || p < 0) return false;
    if (Number.isNaN(g) || g < 0) return false;
    return true;
  }, [name, carbs, protein, fat]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setCreated(null);
    if (!isValid) {
      setError('Preencha os campos obrigatórios corretamente.');
      return;
    }
    setSaving(true);
    try {
      const payload: AddFoodInput = {
        food_name: name.trim(),
        carbs_g: Number(carbs),
        protein_g: Number(protein),
        fat_g: Number(fat),
        energy_kcal: 0, // will be calculated
        source: source.trim() || undefined,
      };
      const row = await addFood(payload);
      setSuccess(`Alimento salvo com sucesso. kcal: ${Math.round(row.energy_kcal)}`);
      setCreated(row);
      if (onCreated) onCreated(row);
      // keep values for review
    } catch (e) {
      setError((e as Error).message || 'Erro ao salvar alimento.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label htmlFor="food-name" className="block text-xs text-muted mb-1">Nome *</label>
        <input
          id="food-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md border border-gray-300 dark:border-[#272c35] bg-white dark:bg-[#0f1115] px-3 py-2 text-sm text-gray-900 dark:text-[#c9d1d9]"
          placeholder="Ex.: Arroz branco cozido"
          required
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label htmlFor="food-carbo" className="block text-xs text-muted mb-1">Carbo (g/100g) *</label>
          <input
            id="food-carbo"
            type="number"
            min={0}
            step={0.1}
            inputMode="decimal"
            value={carbs}
            onChange={(e) => setCarbs(e.target.value)}
            className="w-full rounded-md border border-gray-300 dark:border-[#272c35] bg-white dark:bg-[#0f1115] px-3 py-2 text-sm text-gray-900 dark:text-[#c9d1d9]"
            placeholder="g por 100 g"
            required
          />
        </div>
        <div>
          <label htmlFor="food-prot" className="block text-xs text-muted mb-1">Proteína (g/100g) *</label>
          <input
            id="food-prot"
            type="number"
            min={0}
            step={0.1}
            inputMode="decimal"
            value={protein}
            onChange={(e) => setProtein(e.target.value)}
            className="w-full rounded-md border border-gray-300 dark:border-[#272c35] bg-white dark:bg-[#0f1115] px-3 py-2 text-sm text-gray-900 dark:text-[#c9d1d9]"
            placeholder="g por 100 g"
            required
          />
        </div>
        <div>
          <label htmlFor="food-gord" className="block text-xs text-muted mb-1">Gordura (g/100g) *</label>
          <input
            id="food-gord"
            type="number"
            min={0}
            step={0.1}
            inputMode="decimal"
            value={fat}
            onChange={(e) => setFat(e.target.value)}
            className="w-full rounded-md border border-gray-300 dark:border-[#272c35] bg-white dark:bg-[#0f1115] px-3 py-2 text-sm text-gray-900 dark:text-[#c9d1d9]"
            placeholder="g por 100 g"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="food-source" className="block text-xs text-muted mb-1">Fonte (opcional)</label>
        <input
          id="food-source"
          type="text"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="w-full rounded-md border border-gray-300 dark:border-[#272c35] bg-white dark:bg-[#0f1115] px-3 py-2 text-sm text-gray-900 dark:text-[#c9d1d9]"
          placeholder="TACO 4 ed. (2011)"
        />
      </div>

      {error && <div className="text-sm text-red-500">{error}</div>}
      {success && <div className="text-sm text-emerald-600">{success}</div>}
      {created && (
        <div className="text-xs text-muted">Criado: {created.food_name} • kcal {Math.round(created.energy_kcal)}</div>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          className="px-4 py-2 rounded bg-emerald-600 text-white text-sm hover:bg-emerald-700 disabled:opacity-60"
          disabled={!isValid || saving}
          aria-busy={saving}
        >
          {saving ? 'Salvando...' : 'Salvar alimento'}
        </button>
      </div>
    </form>
  );
};

export default AddFoodForm;

