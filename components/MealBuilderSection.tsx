import React, { useEffect, useState } from 'react';
import { MealBuilderSectionProps } from '../types';
import MealCard from './MealCard';
import Button from './Button';
import { PlusIcon } from './Icons';
import { MEAL_TYPES } from '../constants';
import NutritionSummaryTable from './NutritionSummaryTable';
import { buildMealsForCount } from '../utils/mealStructure';
import { Dialog, DialogContent, DialogTitle } from './Dialog';
import Input from './Input';
import { addCustomFood, validateCustomFoodInput, type CustomFoodInput } from '../utils/customFoods';

const MealBuilderSection: React.FC<MealBuilderSectionProps> = ({
  meals,
  onUpdateMeal,
  onRemoveMeal,
  isDarkMode,
  isLoading: _isLoading,
  onReorderMeals
}) => {
  const handleAddMeal = () => {
    const count = Object.keys(meals).length;
    if (count >= 8) {
      return; // hard limit: 8 meals/day
    }
    const newMealId = `meal-${Date.now()}`;
    const newMeal = {
      id: newMealId,
      name: `Refeição ${count + 1}`,
      type: MEAL_TYPES[count % MEAL_TYPES.length] || 'snack',
      foods: []
    };
    onUpdateMeal(newMealId, newMeal);
  };

  const handleRemoveMeal = (mealId: string) => {
    onRemoveMeal(mealId);
  };

  const mealEntries = Object.entries(meals);

  // Maintain a stable order for meals (drag-and-drop removido; usando seletor posicional)
  const [order, setOrder] = useState<string[]>(() => Object.keys(meals));
  useEffect(() => {
    const currentIds = Object.keys(meals);
    setOrder(prev => {
      const kept = prev.filter(id => currentIds.includes(id));
      const added = currentIds.filter(id => !kept.includes(id));
      return [...kept, ...added];
    });
  }, [meals]);

  const mealCount = mealEntries.length;
  const handleChangeMealCount = (count: number) => {
    const next = buildMealsForCount(meals, count);
    // Convoca onUpdateMeal para cada refeição nova/substituída
    Object.entries(next).forEach(([id, meal]) => onUpdateMeal(id, meal));
    // Remove refeições que não estão no preset
    Object.keys(meals)
      .filter((id) => !next[id])
      .forEach((id) => onRemoveMeal(id));
  };

  const handleDuplicateMeal = (mealId: string) => {
    const meal = meals[mealId];
    if (!meal) return;
    const newMealId = `meal-${Date.now()}`;
    const duplicated = {
      ...meal,
      id: newMealId,
      name: `${meal.name} (cópia)`
    };
    onUpdateMeal(newMealId, duplicated);
    // Append duplicated to the end of the current order
    setOrder(prev => [...prev.filter(id => id !== newMealId), newMealId]);
  };

  // Custom food modal (local-only CUSTOM)
  const [customOpen, setCustomOpen] = useState(false);
  const [customErrors, setCustomErrors] = useState<string[]>([]);
  const [customForm, setCustomForm] = useState<CustomFoodInput>({
    food_name: '', grams: 100,
    energy_kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0,
    notes: ''
  });

  const handleSaveCustomFood = () => {
    const errs = validateCustomFoodInput(customForm);
    setCustomErrors(errs);
    if (errs.length > 0) return;
    addCustomFood(customForm);
    setCustomOpen(false);
    setCustomForm({ food_name: '', grams: 100, energy_kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0, notes: '' });
  };

  return (
    <div className="space-y-6" role="list" aria-label="Lista de refeições reordenável">
      {/* Section Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Refeições</h2>
            <p className="text-sm text-white">Monte suas refeições do dia e acompanhe os macronutrientes</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Seletor de número de refeições */}
            <label className="text-sm text-white">Refeições:</label>
            <select
              value={Math.min(8, Math.max(3, mealCount))}
              onChange={(e) => handleChangeMealCount(Number(e.target.value))}
              className={`px-3 py-2 rounded-md border text-sm ${
                isDarkMode
                  ? 'bg-[#1b2027] border-[#2a3040] text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              aria-label="Selecionar número de refeições"
            >
              {[3,4,5,6,7,8].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <Button
              variant="primary"
              size="md"
              onClick={handleAddMeal}
              disabled={Object.keys(meals).length >= 8}
              className="flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              {Object.keys(meals).length >= 8 ? 'Limite de 8 refeições' : 'Adicionar Refeição'}
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => setCustomOpen(true)}
              className="flex items-center gap-2"
            >
              Adicionar alimento personalizado
            </Button>
          </div>
        </div>
      </div>

      {/* Custom Food Modal */}
      {customOpen && (
        <Dialog open={customOpen} onOpenChange={setCustomOpen}>
          <DialogContent className={`max-w-lg ${isDarkMode ? 'bg-[#1b2027] text-white' : 'bg-white text-gray-900'}`}>
            <DialogTitle>Adicionar alimento personalizado</DialogTitle>
            <div className="mt-4 space-y-3">
              {customErrors.length > 0 && (
                <div className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                  {customErrors.map((e, i) => (<div key={i}>• {e}</div>))}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs opacity-70">Nome</label>
                  <Input value={customForm.food_name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomForm(v => ({...v, food_name: e.target.value}))} />
                </div>
                <div>
                  <label className="text-xs opacity-70">Base (g)</label>
                  <Input type="number" value={customForm.grams} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomForm(v => ({...v, grams: Math.max(1, Number(e.target.value)||100)}))} />
                </div>
                <div>
                  <label className="text-xs opacity-70">Calorias (kcal)</label>
                  <Input type="number" value={customForm.energy_kcal} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomForm(v => ({...v, energy_kcal: Math.max(0, Number(e.target.value)||0)}))} />
                </div>
                <div>
                  <label className="text-xs opacity-70">Proteína (g)</label>
                  <Input type="number" value={customForm.protein_g} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomForm(v => ({...v, protein_g: Math.max(0, Number(e.target.value)||0)}))} />
                </div>
                <div>
                  <label className="text-xs opacity-70">Carboidratos (g)</label>
                  <Input type="number" value={customForm.carbs_g} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomForm(v => ({...v, carbs_g: Math.max(0, Number(e.target.value)||0)}))} />
                </div>
                <div>
                  <label className="text-xs opacity-70">Gorduras (g)</label>
                  <Input type="number" value={customForm.fat_g} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomForm(v => ({...v, fat_g: Math.max(0, Number(e.target.value)||0)}))} />
                </div>
                <div>
                  <label className="text-xs opacity-70">Fibra (g)</label>
                  <Input type="number" value={customForm.fiber_g} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomForm(v => ({...v, fiber_g: Math.max(0, Number(e.target.value)||0)}))} />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs opacity-70">Notas (opcional)</label>
                  <Input value={customForm.notes} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomForm(v => ({...v, notes: e.target.value}))} />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setCustomOpen(false)}>Cancelar</Button>
                <Button variant="primary" onClick={handleSaveCustomFood}>Salvar</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Meals Grid */}
      {order.length > 0 ? (
        <div className="flex flex-col gap-6">
          {order.map((mealId) => {
            const meal = meals[mealId];
            if (!meal) return null;
            const currentIndex = order.indexOf(mealId);
            return (
              <div key={mealId} role="listitem" className="rounded-md">
                <div className="mb-2 flex items-center justify-end">
                  <label className="sr-only" htmlFor={`meal-order-${mealId}`}>Alterar ordem da refeição</label>
                  <select
                    id={`meal-order-${mealId}`}
                    value={currentIndex + 1}
                    onChange={(e) => {
                      const targetPos = Number(e.target.value) - 1;
                      if (targetPos === currentIndex) return;
                      const next = [...order];
                      next.splice(currentIndex, 1);
                      next.splice(targetPos, 0, mealId);
                      setOrder(next);
                      onReorderMeals?.(next);
                    }}
                    className={`px-2 py-1 rounded-md border text-xs ${isDarkMode ? 'bg-[#1b2027] border-[#2a3040] text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    aria-label="Alterar ordem da refeição"
                    title="Alterar ordem da refeição"
                  >
                    {Array.from({ length: order.length }, (_, i) => i + 1).map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
                <MealCard
                  meal={meal}
                  onUpdateMeal={(updatedMeal) => onUpdateMeal(mealId, updatedMeal)}
                  onRemoveMeal={() => handleRemoveMeal(mealId)}
                  onDuplicateMeal={() => handleDuplicateMeal(mealId)}
                  isDarkMode={isDarkMode}
                />
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className={`${isDarkMode 
            ? 'text-center py-12 px-4 rounded-lg border-2 border-dashed border-[#272c35] bg-[#1b2027]/50' 
            : 'text-center py-12 px-4 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50'
        }`}>
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
            isDarkMode ? 'bg-[#1b2027]' : 'bg-gray-200'
          }`}>
            <PlusIcon className="w-8 h-8" />
          </div>
          
          <h3 className={`text-lg font-semibold mb-2 ${
            isDarkMode ? 'text-[#c9d1d9]' : 'text-gray-900'
          }`}>
            Nenhuma refeição planejada
          </h3>
          
          <p className={`text-sm mb-6 max-w-sm mx-auto ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Comece criando seu plano diário adicionando sua primeira refeição. 
            Acompanhe calorias, proteína, carboidratos e gorduras de cada refeição.
          </p>
          
          <Button
            variant="primary"
            size="md"
            onClick={handleAddMeal}
            className="inline-flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            Adicionar Primeira Refeição
          </Button>
        </div>
      )}

      {/* Nutrition Summary Table */}
      {order.length > 0 && (
        <div className="mt-8">
          <NutritionSummaryTable 
            meals={meals} 
            isDarkMode={isDarkMode} 
          />
        </div>
      )}
    </div>
  );
};

export default MealBuilderSection;
