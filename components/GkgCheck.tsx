import React, { useEffect, useMemo, useState } from 'react';
import type { Macros } from '../types';
import Card from './Card';

interface GkgCheckProps {
  dailyMacros: Macros;
  isDarkMode?: boolean;
}

const numberOr = (v: string) => {
  const n = Number(String(v).replace(',', '.'));
  return Number.isNaN(n) ? 0 : n;
};

const GkgCheck: React.FC<GkgCheckProps> = ({ dailyMacros, isDarkMode = true }) => {
  const [carbs, setCarbs] = useState<number>(0);
  const [protein, setProtein] = useState<number>(0);
  const [fat, setFat] = useState<number>(0);
  const [weight, setWeight] = useState<number>(70);
  const [useTotals, setUseTotals] = useState<boolean>(false);

  useEffect(() => {
    if (useTotals) {
      setCarbs(Math.round(dailyMacros.carbs * 10) / 10);
      setProtein(Math.round(dailyMacros.protein * 10) / 10);
      setFat(Math.round(dailyMacros.fat * 10) / 10);
    }
  }, [useTotals, dailyMacros]);

  const calories = useMemo(() => Math.round(carbs * 4 + protein * 4 + fat * 9), [carbs, protein, fat]);

  const gkg = useMemo(() => ({
    carbs: weight > 0 ? Math.round((carbs / weight) * 100) / 100 : 0,
    protein: weight > 0 ? Math.round((protein / weight) * 100) / 100 : 0,
    fat: weight > 0 ? Math.round((fat / weight) * 100) / 100 : 0,
  }), [carbs, protein, fat, weight]);

  const label = isDarkMode ? 'text-[#c9d1d9]' : 'text-gray-900';
  const muted = isDarkMode ? 'text-[#9aa4b2]' : 'text-gray-600';

  const clear = () => {
    setUseTotals(false);
    setCarbs(0); setProtein(0); setFat(0); setWeight(70);
  };

  return (
    <Card isDarkMode={isDarkMode} padding="medium">
      <h3 className={`text-lg font-semibold mb-3 ${label}`}>Checagem g/kg</h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={`block text-xs mb-1 ${muted}`}>Carboidratos (g)</label>
          <input className="w-full px-2 py-1 rounded bg-transparent border border-border" type="number" step="0.1"
            value={carbs} onChange={(e) => setCarbs(numberOr(e.target.value))} disabled={useTotals} />
        </div>
        <div>
          <label className={`block text-xs mb-1 ${muted}`}>Proteínas (g)</label>
          <input className="w-full px-2 py-1 rounded bg-transparent border border-border" type="number" step="0.1"
            value={protein} onChange={(e) => setProtein(numberOr(e.target.value))} disabled={useTotals} />
        </div>
        <div>
          <label className={`block text-xs mb-1 ${muted}`}>Lipídios (g)</label>
          <input className="w-full px-2 py-1 rounded bg-transparent border border-border" type="number" step="0.1"
            value={fat} onChange={(e) => setFat(numberOr(e.target.value))} disabled={useTotals} />
        </div>
        <div>
          <label className={`block text-xs mb-1 ${muted}`}>Peso (kg)</label>
          <input className="w-full px-2 py-1 rounded bg-transparent border border-border" type="number" step="0.1"
            value={weight} onChange={(e) => setWeight(numberOr(e.target.value))} />
        </div>
        <div>
          <label className={`block text-xs mb-1 ${muted}`}>Calorias (kcal)</label>
          <input className="w-full px-2 py-1 rounded bg-transparent border border-border" type="number" value={calories} readOnly />
        </div>
        <div className="flex items-center gap-2 mt-6">
          <input id="useTotals" type="checkbox" checked={useTotals} onChange={(e) => setUseTotals(e.target.checked)} />
          <label htmlFor="useTotals" className={`text-sm ${label}`}>Usar totais atuais do plano</label>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-4">
        <div className={`rounded-md ${isDarkMode ? 'bg-[#1b2027]' : 'bg-gray-100'} p-3 text-center`}>
          <div className={`text-xs ${muted}`}>Carboidratos</div>
          <div className="text-xl font-semibold">{gkg.carbs} g/kg</div>
        </div>
        <div className={`rounded-md ${isDarkMode ? 'bg-[#1b2027]' : 'bg-gray-100'} p-3 text-center`}>
          <div className={`text-xs ${muted}`}>Proteínas</div>
          <div className="text-xl font-semibold">{gkg.protein} g/kg</div>
        </div>
        <div className={`rounded-md ${isDarkMode ? 'bg-[#1b2027]' : 'bg-gray-100'} p-3 text-center`}>
          <div className={`text-xs ${muted}`}>Lipídios</div>
          <div className="text-xl font-semibold">{gkg.fat} g/kg</div>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button onClick={clear} className="px-3 py-1.5 rounded-md text-sm border border-border hover:bg-surface2">Limpar</button>
      </div>
    </Card>
  );
};

export default GkgCheck;
