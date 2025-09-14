import React, { useMemo, useState } from 'react';
import { MealCardProps, Macros } from '../types';
import type { Food, Substitution } from '../types';
import Card from './Card';
import Button from './Button';
import { DeleteIcon, MinusIcon, PlusIcon, DragHandleIcon } from './Icons';
import { Dialog, DialogContent, DialogTitle, DialogClose } from './Dialog';
import FoodSearchDialog from './FoodSearchDialog';
import { MEAL_TYPES, DEFAULT_SERVING_SIZES } from '../constants';
type Serving = { name: string; grams: number };
const SERVING_SIZES: Record<string, Serving> = DEFAULT_SERVING_SIZES as unknown as Record<string, Serving>;

const MealCard: React.FC<MealCardProps> = ({ meal, onUpdateMeal, onDuplicateMeal, onRemoveMeal, isDarkMode = true }) => {
  const [customFormOpen, setCustomFormOpen] = useState(false);
  const [subFormOpen, setSubFormOpen] = useState<{ [key: string]: boolean }>({});
  const [subCustomFood, setSubCustomFood] = useState<{ [key: string]: { name: string; quantity: number; calories: number; protein: number; carbs: number; fat: number; fiber: number } }>({});
  const [subsExpanded, setSubsExpanded] = useState<boolean>(() => {
    try { return sessionStorage.getItem(`subs.expanded.${meal.id}`) === '1'; } catch { return false; }
  });
  const setSubsExpandedPersist = (v: boolean) => {
    setSubsExpanded(v);
    try { sessionStorage.setItem(`subs.expanded.${meal.id}`, v ? '1' : '0'); } catch { /* ignore */ }
  };
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [showReorderInput, setShowReorderInput] = useState<string | null>(null);
  const [reorderPosition, setReorderPosition] = useState<number>(1);
  const [editFood, setEditFood] = useState<Food | null>(null);
  const [editUnit, setEditUnit] = useState<'g' | 'household'>('g');
  const [editGrams, setEditGrams] = useState<number>(100);
  const [editCount, setEditCount] = useState<number>(1);
  // Active substitution id for 'Add food' dialog
  const [activeSubForAdd, setActiveSubForAdd] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [customFood, setCustomFood] = useState({
    name: '', quantity: 100,
    calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0
  });

  // Keyboard shortcuts handler
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'a':
          e.preventDefault();
          setShowSearch(true);
          break;
        case 'd':
          e.preventDefault();
          onDuplicateMeal?.();
          break;
        case 'r':
          e.preventDefault();
          handleRenameMeal();
          break;
        case 'Delete':
        case 'Backspace':
          e.preventDefault();
          onRemoveMeal?.();
          break;
      }
    }
  };

  const mealTotals = useMemo<Macros>(() => {
    return meal.foods.reduce(
      (total, food) => {
        const multiplier = food.quantity / 100;
        return {
          calories: total.calories + food.macros.calories * multiplier,
          protein: total.protein + food.macros.protein * multiplier,
          carbs: total.carbs + food.macros.carbs * multiplier,
          fat: total.fat + food.macros.fat * multiplier,
          fiber: (total.fiber || 0) + (food.macros.fiber || 0) * multiplier,
        };
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
    );
  }, [meal.foods]);

  const allGrams = useMemo(() => {
    return meal.foods.every(f => (f.unit || 'g') === 'g');
  }, [meal.foods]);

  // quantity updates are handled via Edit dialog save

  const removeFood = (foodId: string) => {
    const updatedFoods = meal.foods.filter((food) => food.id !== foodId);
    onUpdateMeal({ ...meal, foods: updatedFoods });
  };

  const updateFoodQuantity = (foodId: string, newQuantity: number) => {
    const updatedFoods = meal.foods.map((food) => 
      food.id === foodId ? { ...food, quantity: newQuantity } : food
    );
    onUpdateMeal({ ...meal, foods: updatedFoods });
  };

  const reorderFoods = (from: number, to: number) => {
    if (from === to || from == null || to == null) return;
    const next = [...meal.foods];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onUpdateMeal({ ...meal, foods: next });
  };

  // inline quantity handlers were removed in favor of Edit dialog

  const handleMealTypeChange = (typeLabel: string) => {
    onUpdateMeal({ ...meal, type: typeLabel, name: typeLabel });
  };

  const handleAddCustomFood = () => {
    const id = `custom-${Date.now()}`;
    const newFood = {
      id,
      name: customFood.name || 'Alimento personalizado',
      amount: `${customFood.quantity}g`,
      macros: {
        calories: customFood.calories,
        protein: customFood.protein,
        carbs: customFood.carbs,
        fat: customFood.fat,
        fiber: customFood.fiber,
      },
      quantity: customFood.quantity,
    };
    onUpdateMeal({ ...meal, foods: [...meal.foods, newFood] });

    try {
      const key = 'nutria-custom-foods';
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      localStorage.setItem(key, JSON.stringify([...existing, newFood]));
    } catch {
      /* ignore persistence errors */
    }

    setCustomFormOpen(false);
    setCustomFood({ name: '', quantity: 100, calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
  };

  const addSubstitution = () => {
    const count = (meal.substitutions?.length || 0) + 1;
    const newId = `sub-${Date.now()}`;
    const newSub = { id: newId, name: `Substituição ${count}`, foods: [] };
    // Ensure the substitutions panel is visible to the user when adding
    setSubsExpandedPersist(true);
    onUpdateMeal({ ...meal, substitutions: [...(meal.substitutions || []), newSub] });
    // Immediately open the add-food flow for the new substitution
    setActiveSubForAdd(newId);
  };

  const removeSubstitution = (subId: string) => {
    const next = (meal.substitutions || []).filter(s => s.id !== subId);
    onUpdateMeal({ ...meal, substitutions: next });
  };

  // No rename field per new spec; we keep label auto-generated

  const addCustomFoodToSub = (subId: string) => {
    const form = subCustomFood[subId] || { name: '', quantity: 100, calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
    const nf = {
      id: `subfood-${Date.now()}`,
      name: form.name || 'Alimento (substituição)',
      amount: `${form.quantity}g`,
      macros: { calories: form.calories, protein: form.protein, carbs: form.carbs, fat: form.fat, fiber: form.fiber },
      quantity: form.quantity,
    };
    const nextSubs = (meal.substitutions || []).map(s => s.id === subId ? { ...s, foods: [...s.foods, nf] } : s);
    onUpdateMeal({ ...meal, substitutions: nextSubs });
    setSubCustomFood({ ...subCustomFood, [subId]: { name: '', quantity: 100, calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 } });
    setSubFormOpen({ ...subFormOpen, [subId]: false });
  };

  const removeFoodFromSub = (subId: string, foodId: string) => {
    const nextSubs = (meal.substitutions || []).map(s => s.id === subId ? { ...s, foods: s.foods.filter((f: Food) => f.id !== foodId) } : s);
    onUpdateMeal({ ...meal, substitutions: nextSubs });
  };

  const isStandardType = useMemo(() => MEAL_TYPES.includes(meal.name as typeof MEAL_TYPES[number]), [meal.name]);

  const handleRenameMeal = () => {
    const newName = window.prompt('Renomear refeição', meal.name);
    const trimmed = (newName ?? '').trim();
    if (!trimmed || trimmed === meal.name) return;
    onUpdateMeal({ ...meal, name: trimmed });
  };

  return (
    <Card 
      title={undefined} 
      subtitle={undefined} 
      isDarkMode={isDarkMode} 
      className="w-full"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label={`Refeição ${meal.name}`}
    >
      {/* Header row with meal type selector and actions */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {isStandardType ? (
            <select
              className={`px-3 py-2 rounded-md border text-sm ${isDarkMode ? 'bg-surface2 border-border text-foreground' : 'bg-white border-gray-300 text-gray-900'}`}
              value={meal.name}
              onChange={(e) => handleMealTypeChange(e.target.value)}
              aria-label="Selecionar refeição"
            >
              {MEAL_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          ) : (
            <input
              className={`px-3 py-2 rounded-md border text-sm ${isDarkMode ? 'bg-surface2 border-border text-foreground' : 'bg-white border-gray-300 text-gray-900'}`}
              value={meal.name}
              onChange={(e) => onUpdateMeal({ ...meal, name: e.target.value })}
              aria-label="Editar nome da refeição"
            />
          )}
          <div className={`text-xs ${isDarkMode ? 'text-muted' : 'text-gray-600'}`}>
            {meal.foods.length} alimentos • {Math.round(mealTotals.calories)} kcal
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="secondary" 
            size="sm" 
            aria-label="Adicionar alimentos da base (Ctrl+A)" 
            title="Adicionar alimentos da base (Ctrl+A)"
            onClick={() => setShowSearch(true)}
          >
            Adicionar alimentos (base)
          </Button>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => onDuplicateMeal?.()} 
            aria-label="Duplicar refeição (Ctrl+D)"
            title="Duplicar refeição (Ctrl+D)"
          >
            Duplicar
          </Button>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={handleRenameMeal} 
            aria-label="Renomear refeição (Ctrl+R)"
            title="Renomear refeição (Ctrl+R)"
          >
            Renomear
          </Button>
          <button
            className={`p-2 rounded border transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${isDarkMode ? 'border-border hover:bg-red-900 text-red-400' : 'border-gray-300 hover:bg-red-50 text-red-600'}`}
            aria-label="Excluir refeição (Ctrl+Delete)"
            title="Excluir refeição (Ctrl+Delete)"
            onClick={() => onRemoveMeal?.()}
          >
            <DeleteIcon size={16} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm leading-6" role="table" aria-label={`Alimentos da refeição ${meal.name}`}>
          <thead>
            <tr className={`border-b ${isDarkMode ? 'border-border' : 'border-gray-200'}`} role="row">
              <th className="text-left py-4 px-3 font-medium" role="columnheader" scope="col">Alimento</th>
              <th className="text-center py-4 px-3 font-medium w-32" role="columnheader" scope="col">{allGrams ? 'Qtd (g)' : 'Qtd'}</th>
              <th className="text-center py-4 px-3 font-medium w-24" role="columnheader" scope="col">Kcal</th>
              <th className="text-center py-4 px-3 font-medium w-24" role="columnheader" scope="col">Prot</th>
              <th className="text-center py-4 px-3 font-medium w-24" role="columnheader" scope="col">Carb</th>
              <th className="text-center py-4 px-3 font-medium w-24" role="columnheader" scope="col">Gord</th>
              <th className="text-center py-3 px-2 font-medium w-16" role="columnheader" scope="col">Ações</th>
            </tr>
          </thead>
          <tbody>
            {meal.foods.map((food, idx) => {
              const multiplier = food.quantity / 100;
              const foodMacros = {
                calories: Math.round(food.macros.calories * multiplier),
                protein: Math.round(food.macros.protein * multiplier * 10) / 10,
                carbs: Math.round(food.macros.carbs * multiplier * 10) / 10,
                fat: Math.round(food.macros.fat * multiplier * 10) / 10,
              };

              return (
                <React.Fragment key={food.id}>
                  <tr
                    className={`border-b transition-all duration-200 ${
                      dragIndex === idx 
                        ? (isDarkMode ? 'bg-blue-900/30 border-blue-500' : 'bg-blue-100 border-blue-400')
                        : dragOverIndex === idx
                        ? (isDarkMode ? 'bg-green-900/30 border-green-500' : 'bg-green-100 border-green-400')
                        : isDarkMode ? 'border-border hover:bg-surface2' : 'border-gray-100 hover:bg-gray-50'
                    }`}
                    draggable
                    onDragStart={() => setDragIndex(idx)}
                    onDragEnd={() => { setDragIndex(null); setDragOverIndex(null); }}
                    onDragEnter={() => setDragOverIndex(idx)}
                    onDragLeave={() => setDragOverIndex(null)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => { 
                      if (dragIndex !== null && dragIndex !== idx) { 
                        reorderFoods(dragIndex, idx); 
                      }
                      setDragIndex(null); 
                      setDragOverIndex(null);
                    }}
                    role="row"
                    aria-label={`Alimento ${food.name}, ${foodMacros.calories} kcal`}
                  >
                    <td className="py-4 px-3 leading-6" role="cell">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <span 
                            className="cursor-grab opacity-60 hover:opacity-100 transition-opacity" 
                            title="Arraste para reordenar" 
                            aria-label="Arrastar para reordenar alimento"
                            tabIndex={0}
                            role="button"
                          >
                            <DragHandleIcon size={14} />
                          </span>
                          {showReorderInput === food.id ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min="1"
                                max={meal.foods.length}
                                value={reorderPosition}
                                onChange={(e) => setReorderPosition(Math.max(1, Math.min(meal.foods.length, parseInt(e.target.value) || 1)))}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    const newIndex = reorderPosition - 1;
                                    if (newIndex !== idx) {
                                      reorderFoods(idx, newIndex);
                                    }
                                    setShowReorderInput(null);
                                  } else if (e.key === 'Escape') {
                                    setShowReorderInput(null);
                                  }
                                }}
                                className={`w-12 px-1 py-0.5 text-xs text-center rounded border ${isDarkMode ? 'bg-surface2 border-border text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                autoFocus
                              />
                              <button
                                onClick={() => {
                                  const newIndex = reorderPosition - 1;
                                  if (newIndex !== idx) {
                                    reorderFoods(idx, newIndex);
                                  }
                                  setShowReorderInput(null);
                                }}
                                className={`text-xs px-1 py-0.5 rounded ${isDarkMode ? 'bg-primary text-white hover:bg-primary/80' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                              >
                                ✓
                              </button>
                              <button
                                onClick={() => setShowReorderInput(null)}
                                className={`text-xs px-1 py-0.5 rounded ${isDarkMode ? 'bg-surface2 text-muted hover:bg-surface3' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setReorderPosition(idx + 1);
                                setShowReorderInput(food.id);
                              }}
                              className={`text-xs px-1 py-0.5 rounded opacity-60 hover:opacity-100 transition-opacity ${isDarkMode ? 'bg-surface2 text-muted hover:bg-surface3' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                              title="Reordenar numericamente"
                            >
                              #{idx + 1}
                            </button>
                          )}
                        </div>
                        <div
                          className="font-medium truncate whitespace-nowrap max-w-[260px]"
                          title={food.name}
                        >
                          {food.name}
                        </div>
                      </div>
                      <div className={`text-xs ${isDarkMode ? 'text-muted' : 'text-gray-500'}`}>{food.category}</div>
                    </td>
                    <td className="py-4 px-3 text-center leading-6" role="cell">
                      <div className="flex items-center justify-center gap-1">
                        <input
                          type="number"
                          min="1"
                          max="9999"
                          value={Math.round(food.quantity)}
                          onChange={(e) => {
                            const newQuantity = Math.max(1, parseInt(e.target.value) || 1);
                            updateFoodQuantity(food.id, newQuantity);
                          }}
                          className={`w-16 px-2 py-1 text-sm text-center rounded border focus:ring-2 focus:ring-primary/20 ${isDarkMode ? 'bg-surface2 border-border text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                          aria-label={`Quantidade de ${food.name} em gramas`}
                        />
                        <span className={`text-sm ${isDarkMode ? 'text-muted' : 'text-gray-600'}`}>g</span>
                      </div>
                    </td>
                    <td className="py-4 px-3 text-center font-medium leading-6 text-red-600" role="cell">{foodMacros.calories}</td>
                    <td className="py-4 px-3 text-center leading-6 text-green-600" role="cell">{foodMacros.protein}g</td>
                    <td className="py-4 px-3 text-center leading-6 text-green-600" role="cell">{foodMacros.carbs}g</td>
                    <td className="py-4 px-3 text-center leading-6 text-green-600" role="cell">{foodMacros.fat}g</td>
                    <td className="py-4 px-3 text-center leading-6" role="cell">
                      <button
                        onClick={() => removeFood(food.id)}
                        className={`p-1 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 ${isDarkMode ? 'hover:bg-red-900 text-red-400' : 'hover:bg-red-100 text-red-600'}`}
                        title={`Remover ${food.name} da refeição`}
                        aria-label={`Remover ${food.name} da refeição`}
                      >
                        <DeleteIcon size={14} />
                      </button>
                    </td>
                  </tr>
                  {/* Removed duplicate macro line under food name */}
                    {/* details removed
                      Prot {foodMacros.protein}g • Carb {foodMacros.carbs}g • Gord {foodMacros.fat}g • {foodMacros.calories} kcal
                    </td>
                    */}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Edit quantity dialog */}
      <Dialog open={!!editFood} onOpenChange={(open) => setEditFood(open ? editFood : null)}>
        <DialogContent>
          <DialogTitle>Editar quantidade</DialogTitle>
          {editFood && (
            <div className="mt-3 space-y-3">
              <div className={`text-sm ${isDarkMode ? 'text-muted' : 'text-gray-700'}`}>{editFood.name}</div>
              <div className="flex items-center gap-3">
                <label className="text-sm">Unidade</label>
                {(() => {
                  const serving = SERVING_SIZES[editFood.id];
                  const hasHousehold = !!serving;
                  return (
                    <select
                      className={`px-2 py-1 text-sm rounded border ${isDarkMode ? 'bg-surface2 border-border text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      value={editUnit}
                      onChange={(e) => setEditUnit(e.target.value as 'g' | 'household')}
                    >
                      <option value="g">g</option>
                      <option value="household" disabled={!hasHousehold}>{hasHousehold ? serving.name : 'medida caseira'}</option>
                    </select>
                  );
                })()}
              </div>
              {editUnit === 'g' ? (
                <div className="flex items-center gap-3">
                  <label className="text-sm w-32">Quantidade (g)</label>
                  <input
                    type="number"
                    className={`w-28 px-2 py-1 text-sm rounded border ${isDarkMode ? 'bg-surface2 border-border text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    value={Number.isFinite(editGrams) ? editGrams : 0}
                    onChange={(e) => setEditGrams(Math.max(0, Number(String(e.target.value).replace(',', '.')) || 0))}
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <label className="text-sm w-32">Porções</label>
                  <input
                    type="number"
                    className={`w-28 px-2 py-1 text-sm rounded border ${isDarkMode ? 'bg-surface2 border-border text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    value={Number.isFinite(editCount) ? editCount : 1}
                    onChange={(e) => setEditCount(Math.max(1, Math.round(Number(String(e.target.value).replace(',', '.')) || 1)))}
                  />
                </div>
              )}
              <div className="flex items-center gap-2">
                <DialogClose asChild>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      if (!editFood) return;
                      const serving = SERVING_SIZES[editFood.id];
                      if (editUnit === 'g') {
                        const grams = Math.max(0, Math.round(editGrams));
                        const updated = {
                          ...editFood,
                          unit: 'g' as const,
                          quantity: grams,
                          amount: `${grams} g`,
                          householdUnit: undefined,
                          gramsPerHouseholdUnit: undefined,
                        };
                        const nextFoods = meal.foods.map(f => f.id === editFood.id ? updated : f);
                        onUpdateMeal({ ...meal, foods: nextFoods });
                      } else if (serving) {
                        const per = Number(serving.grams) || 0;
                        const count = Math.max(1, Math.round(editCount));
                        const grams = Math.max(0, count * per);
                        const label = `${count} ${serving.name}`;
                        const updated = {
                          ...editFood,
                          unit: 'household' as const,
                          householdUnit: serving.name as string,
                          gramsPerHouseholdUnit: per,
                          quantity: grams,
                          amount: label,
                        };
                        const nextFoods = meal.foods.map(f => f.id === editFood.id ? updated : f);
                        onUpdateMeal({ ...meal, foods: nextFoods });
                      }
                      setEditFood(null);
                    }}
                  >
                    Salvar
                  </Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button variant="secondary" size="sm" onClick={() => setEditFood(null)}>Cancelar</Button>
                </DialogClose>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-border' : 'border-gray-200'}`}>
        <div className="grid grid-cols-5 gap-4 text-center">
          <div>
            <div className={`text-xs font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>TOTAL</div>
            <div className="text-lg font-bold text-red-600">{Math.round(mealTotals.calories)} kcal</div>
          </div>
          <div>
            <div className={`text-xs font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>PROTEÍNA</div>
            <div className="text-lg font-bold text-green-600">{Math.round(mealTotals.protein * 10) / 10}g</div>
          </div>
          <div>
            <div className={`text-xs font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>CARBOIDRATO</div>
            <div className="text-lg font-bold text-green-600">{Math.round(mealTotals.carbs * 10) / 10}g</div>
          </div>
          <div>
            <div className={`text-xs font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>GORDURA</div>
            <div className="text-lg font-bold text-green-600">{Math.round(mealTotals.fat * 10) / 10}g</div>
          </div>
          <div>
            <div className={`text-xs font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>FIBRA</div>
            <div className="text-lg font-bold text-green-600">{Math.round((mealTotals.fiber || 0) * 10) / 10}g</div>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {!customFormOpen && (
          <Button variant="secondary" size="sm" className="w-full" onClick={() => setCustomFormOpen(true)}>
            <PlusIcon size={16} className="mr-2" />
            Adicionar alimento personalizado
          </Button>
        )}
        {customFormOpen && (
          <div className={`p-3 rounded-md border ${isDarkMode ? 'border-border bg-surface2' : 'border-gray-200 bg-gray-50'}`}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
              <input className="px-2 py-1 rounded bg-transparent border border-border" placeholder="Nome"
                value={customFood.name} onChange={(e) => setCustomFood({ ...customFood, name: e.target.value })} />
              <input className="px-2 py-1 rounded bg-transparent border border-border" placeholder="Quantidade (g)" type="number"
                value={customFood.quantity} onChange={(e) => setCustomFood({ ...customFood, quantity: Number(e.target.value) })} />
              <input className="px-2 py-1 rounded bg-transparent border border-border" placeholder="Kcal/100g" type="number"
                value={customFood.calories} onChange={(e) => setCustomFood({ ...customFood, calories: Number(e.target.value) })} />
              <input className="px-2 py-1 rounded bg-transparent border border-border" placeholder="Prot/100g" type="number"
                value={customFood.protein} onChange={(e) => setCustomFood({ ...customFood, protein: Number(e.target.value) })} />
              <input className="px-2 py-1 rounded bg-transparent border border-border" placeholder="Carb/100g" type="number"
                value={customFood.carbs} onChange={(e) => setCustomFood({ ...customFood, carbs: Number(e.target.value) })} />
              <input className="px-2 py-1 rounded bg-transparent border border-border" placeholder="Gord/100g" type="number"
                value={customFood.fat} onChange={(e) => setCustomFood({ ...customFood, fat: Number(e.target.value) })} />
              <input className="px-2 py-1 rounded bg-transparent border border-border" placeholder="Fibra/100g" type="number"
                value={customFood.fiber} onChange={(e) => setCustomFood({ ...customFood, fiber: Number(e.target.value) })} />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="primary" size="sm" onClick={handleAddCustomFood}>Adicionar</Button>
              <Button variant="secondary" size="sm" onClick={() => setCustomFormOpen(false)}>Cancelar</Button>
            </div>
          </div>
        )}
      </div>

      {/* Substituições (Substitute Meals) */}
      <div className={`mt-6 p-3 rounded-md border ${isDarkMode ? 'border-border bg-surface2' : 'border-gray-200 bg-gray-50'}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Substituições</div>
            <div className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{(meal.substitutions || []).length} substituições</div>
          </div>
          <div className="flex items-center gap-2">
            <button className={`text-xs underline ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'}`} onClick={() => setSubsExpandedPersist(!subsExpanded)}>{subsExpanded ? 'Ocultar' : 'Mostrar'}</button>
            <Button variant="primary" size="sm" onClick={addSubstitution} aria-label="Add refeição de substituição">Add refeição de substituição</Button>
          </div>
        </div>
        {subsExpanded && (
          <div className="mt-3 space-y-3">
            {(meal.substitutions || []).map((sub, idx) => {
              // per-option totals
              const totals = sub.foods.reduce((t, f) => {
                const m = f.quantity / 100; return {
                  calories: t.calories + f.macros.calories * m,
                  protein: t.protein + f.macros.protein * m,
                  carbs: t.carbs + f.macros.carbs * m,
                  fat: t.fat + f.macros.fat * m,
                  fiber: (t.fiber || 0) + (f.macros.fiber || 0) * m,
                  quantity: t.quantity + f.quantity,
                };
              }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, quantity: 0 as number });
              const totalsView = {
                calories: Math.round(totals.calories),
                protein: Math.round(totals.protein * 10) / 10,
                carbs: Math.round(totals.carbs * 10) / 10,
                fat: Math.round(totals.fat * 10) / 10,
                quantity: Math.round(totals.quantity),
              };
              return (
                <div key={sub.id} className={`rounded-md border ${isDarkMode ? 'border-border bg-surface' : 'border-gray-200 bg-white'}`}>
                  <div className="flex items-center justify-between p-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded ${isDarkMode ? 'bg-[#1b2027] text-white' : 'bg-gray-100 text-gray-900'}`}>Substitution {idx + 1}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Reorder options: up/down (nice-to-have) */}
                      <button className={`text-xs px-2 py-1 rounded ${isDarkMode ? 'hover:bg-[#1b2027] text-[#9aa4b2]' : 'hover:bg-gray-100 text-gray-700'}`} title="Move up" aria-label={`Move Substitution ${idx + 1} up`} onClick={() => {
                        if (idx === 0) return; const ids = [...(meal.substitutions || []).map(s => s.id)];
                        const [moved] = ids.splice(idx, 1); ids.splice(idx - 1, 0, moved);
                        const nextSubs = ids
                          .map(id => (meal.substitutions || []).find(s => s.id === id))
                          .filter((s): s is Substitution => Boolean(s));
                        onUpdateMeal({ ...meal, substitutions: nextSubs });
                      }}>Up</button>
                      <button className={`text-xs px-2 py-1 rounded ${isDarkMode ? 'hover:bg-[#1b2027] text-[#9aa4b2]' : 'hover:bg-gray-100 text-gray-700'}`} title="Move down" aria-label={`Move Substitution ${idx + 1} down`} onClick={() => {
                        const n = (meal.substitutions || []).length; if (idx === n - 1) return; const ids = [...(meal.substitutions || []).map(s => s.id)];
                        const [moved] = ids.splice(idx, 1); ids.splice(idx + 1, 0, moved);
                        const nextSubs = ids
                          .map(id => (meal.substitutions || []).find(s => s.id === id))
                          .filter((s): s is Substitution => Boolean(s));
                        onUpdateMeal({ ...meal, substitutions: nextSubs });
                      }}>Down</button>
                      <button
                        className={`p-1 rounded border ${isDarkMode ? 'border-border hover:bg-red-900 text-red-400' : 'border-gray-300 hover:bg-red-50 text-red-600'}`}
                        aria-label={`Excluir Substituição ${idx + 1}`}
                        title="Excluir substituição"
                        onClick={() => removeSubstitution(sub.id)}
                      >
                        <DeleteIcon size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="px-2 pb-2 space-y-2">
                    {sub.foods.length === 0 && (
                      <div className={`text-xs ${isDarkMode ? 'text-muted' : 'text-gray-600'}`}>Nenhum alimento adicionado</div>
                    )}
                    {sub.foods.map((f) => {
                      const m = f.quantity / 100;
                      const view = {
                        calories: Math.round(f.macros.calories * m),
                        protein: Math.round(f.macros.protein * m * 10) / 10,
                        carbs: Math.round(f.macros.carbs * m * 10) / 10,
                        fat: Math.round(f.macros.fat * m * 10) / 10,
                      };
                      return (
                        <div key={f.id} className={`flex items-center justify-between text-sm ${isDarkMode ? 'text-foreground' : 'text-gray-800'}`}>
                          <div className="flex items-center gap-3">
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded ${isDarkMode ? 'bg-[#1b2027] text-[#9aa4b2]' : 'bg-gray-100 text-gray-700'}`}><DragHandleIcon size={12} /></span>
                            <span
                              className="font-medium truncate whitespace-nowrap max-w-[200px]"
                              title={f.name}
                            >
                              {f.name}
                            </span>
                            <span className={`text-xs ${isDarkMode ? 'text-[#9aa4b2]' : 'text-gray-600'}`}>{f.amount || '100g'}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="hidden md:flex items-center gap-3">
                              <span className="text-green-600">{view.carbs}g</span>
                              <span className="text-green-600">{view.fat}g</span>
                              <span className="text-green-600">{view.protein}g</span>
                              <span className="text-red-600">{view.calories} kcal</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button className={`p-1 rounded ${isDarkMode ? 'hover:bg-[#1b2027]' : 'hover:bg-gray-100'}`} aria-label={`Decrease ${f.name} quantity`} onClick={() => {
                                const q = Math.max(0, f.quantity - 10);
                                const next = (meal.substitutions || []).map(s => s.id === sub.id ? { ...s, foods: s.foods.map(x => x.id === f.id ? { ...x, quantity: q } : x) } : s);
                                onUpdateMeal({ ...meal, substitutions: next });
                              }}><MinusIcon size={14} /></button>
                              <input
                                type="number"
                                className={`w-20 px-2 py-1 text-sm rounded border text-center ${isDarkMode ? 'bg-surface2 border-border text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                value={f.quantity}
                                onChange={(e) => {
                                  const v = Number(String(e.target.value).replace(',', '.'));
                                  if (!Number.isNaN(v)) {
                                    const next = (meal.substitutions || []).map(s => s.id === sub.id ? { ...s, foods: s.foods.map(x => x.id === f.id ? { ...x, quantity: v } : x) } : s);
                                    onUpdateMeal({ ...meal, substitutions: next });
                                  }
                                }}
                                aria-label={`${f.name} quantity (g)`}
                              />
                              <button className={`p-1 rounded ${isDarkMode ? 'hover:bg-[#1b2027]' : 'hover:bg-gray-100'}`} aria-label={`Increase ${f.name} quantity`} onClick={() => {
                                const q = f.quantity + 10;
                                const next = (meal.substitutions || []).map(s => s.id === sub.id ? { ...s, foods: s.foods.map(x => x.id === f.id ? { ...x, quantity: q } : x) } : s);
                                onUpdateMeal({ ...meal, substitutions: next });
                              }}><PlusIcon size={14} /></button>
                              <button className={`p-1 rounded ${isDarkMode ? 'hover:bg-red-900/40 text-red-300' : 'hover:bg-red-100 text-red-600'}`} title="Delete" aria-label={`Remove ${f.name}`} onClick={() => removeFoodFromSub(sub.id, f.id)}><DeleteIcon size={14} /></button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setActiveSubForAdd(sub.id)}
                        aria-label={`Adicionar alimento à Substituição ${idx + 1}`}
                      >
                        Adicionar alimento
                      </Button>
                      {!subFormOpen[sub.id] && (
                        <Button variant="secondary" size="sm" onClick={() => setSubFormOpen({ ...subFormOpen, [sub.id]: true })}>Alimento personalizado</Button>
                      )}
                    </div>
                    {subFormOpen[sub.id] && (
                      <div className={`p-2 rounded-md border ${isDarkMode ? 'border-border bg-surface2' : 'border-gray-200 bg-gray-50'}`}>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
                          <input className="px-2 py-1 rounded bg-transparent border border-border" placeholder="Name"
                            value={(subCustomFood[sub.id]?.name) || ''} onChange={(e) => setSubCustomFood({ ...subCustomFood, [sub.id]: { ...(subCustomFood[sub.id] || { name: '', quantity: 100, calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }), name: e.target.value } })} />
                          <input className="px-2 py-1 rounded bg-transparent border border-border" placeholder="Quantity (g)" type="number"
                            value={(subCustomFood[sub.id]?.quantity) || 100} onChange={(e) => setSubCustomFood({ ...subCustomFood, [sub.id]: { ...(subCustomFood[sub.id] || { name: '', quantity: 100, calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }), quantity: Number(e.target.value) } })} />
                          <input className="px-2 py-1 rounded bg-transparent border border-border" placeholder="Kcal/100g" type="number"
                            value={(subCustomFood[sub.id]?.calories) || 0} onChange={(e) => setSubCustomFood({ ...subCustomFood, [sub.id]: { ...(subCustomFood[sub.id] || { name: '', quantity: 100, calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }), calories: Number(e.target.value) } })} />
                          <input className="px-2 py-1 rounded bg-transparent border border-border" placeholder="Prot/100g" type="number"
                            value={(subCustomFood[sub.id]?.protein) || 0} onChange={(e) => setSubCustomFood({ ...subCustomFood, [sub.id]: { ...(subCustomFood[sub.id] || { name: '', quantity: 100, calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }), protein: Number(e.target.value) } })} />
                          <input className="px-2 py-1 rounded bg-transparent border border-border" placeholder="Carb/100g" type="number"
                            value={(subCustomFood[sub.id]?.carbs) || 0} onChange={(e) => setSubCustomFood({ ...subCustomFood, [sub.id]: { ...(subCustomFood[sub.id] || { name: '', quantity: 100, calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }), carbs: Number(e.target.value) } })} />
                          <input className="px-2 py-1 rounded bg-transparent border border-border" placeholder="Fat/100g" type="number"
                            value={(subCustomFood[sub.id]?.fat) || 0} onChange={(e) => setSubCustomFood({ ...subCustomFood, [sub.id]: { ...(subCustomFood[sub.id] || { name: '', quantity: 100, calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }), fat: Number(e.target.value) } })} />
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="primary" size="sm" onClick={() => addCustomFoodToSub(sub.id)}>Add</Button>
                          <Button variant="secondary" size="sm" onClick={() => setSubFormOpen({ ...subFormOpen, [sub.id]: false })}>Cancel</Button>
                        </div>
                      </div>
                    )}
                    {/* Totals row */}
                    <div className="mt-2 grid grid-cols-5 gap-3 text-center">
                      <div>
                        <div className={`text-xs font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>TOTAL</div>
                        <div className="text-sm font-bold text-red-600">{totalsView.calories} kcal</div>
                      </div>
                      <div>
                        <div className={`text-xs font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>PROTEÍNA</div>
                        <div className="text-sm font-bold text-green-600">{totalsView.protein}g</div>
                      </div>
                      <div>
                        <div className={`text-xs font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>CARBOIDRATO</div>
                        <div className="text-sm font-bold text-green-600">{totalsView.carbs}g</div>
                      </div>
                      <div>
                        <div className={`text-xs font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>GORDURA</div>
                        <div className="text-sm font-bold text-green-600">{totalsView.fat}g</div>
                      </div>
                      <div>
                        <div className={`text-xs font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>QUANTIDADE</div>
                        <div className="text-sm font-bold text-green-600">{totalsView.quantity}g</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* Food search dialogs */}
      <FoodSearchDialog
        open={showSearch}
        onOpenChange={setShowSearch}
        isDarkMode={isDarkMode}
        onSelect={(row, grams) => {
          const newFood = {
            id: `${row.id}:${Date.now()}`,
            name: row.food_name,
            amount: `${grams}g`,
            macros: { calories: row.energy_kcal, protein: row.protein_g, carbs: row.carbs_g, fat: row.fat_g, fiber: 0 },
            quantity: grams,
          };
          onUpdateMeal({ ...meal, foods: [...meal.foods, newFood] });
        }}
      />
      <FoodSearchDialog
        open={!!activeSubForAdd}
        onOpenChange={(open) => setActiveSubForAdd(open ? activeSubForAdd : null)}
        isDarkMode={isDarkMode}
        onSelect={(row, grams) => {
          if (!activeSubForAdd) return;
          const nf = {
            id: `${row.id}:${Date.now()}`,
            name: row.food_name,
            amount: `${grams}g`,
            macros: { calories: row.energy_kcal, protein: row.protein_g, carbs: row.carbs_g, fat: row.fat_g, fiber: 0 },
            quantity: grams,
          };
          const nextSubs = (meal.substitutions || []).map(s => s.id === activeSubForAdd ? { ...s, foods: [...s.foods, nf] } : s);
          onUpdateMeal({ ...meal, substitutions: nextSubs });
          setActiveSubForAdd(null);
        }}
      />
    </Card>
  );
};

export default MealCard;
