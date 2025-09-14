import React, { useState, useEffect } from 'react';
import { Search, Plus, Calculator } from 'lucide-react';
import { PortionResult, listFoods, searchFoods, kcalForPortion, addFood, type AddFoodInput } from '../datafoods';
import Button from './Button';
import Input from './Input';
import Card from './Card';
import { Dialog, DialogContent, DialogTitle } from './Dialog';
import { FoodListItem } from '../types';

interface FoodsSectionProps {
  isDarkMode?: boolean;
}

export function FoodsSection({ isDarkMode = false }: FoodsSectionProps) {
  const [foods, setFoods] = useState<FoodListItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodListItem | null>(null);
  const [portionGrams, setPortionGrams] = useState<number>(100);
  const [portionResult, setPortionResult] = useState<PortionResult | null>(null);
  const [calculatingPortion, setCalculatingPortion] = useState(false);

  // CSS utility classes for better readability
  const textClasses = {
    heading: isDarkMode ? 'text-white' : 'text-gray-900',
    subtext: isDarkMode ? 'text-gray-400' : 'text-gray-600',
    label: isDarkMode ? 'text-gray-300' : 'text-gray-700',
    error: isDarkMode ? 'text-red-400' : 'text-red-700',
    primary: isDarkMode ? 'text-white' : 'text-gray-900'
  };

  // Load foods on component mount
  useEffect(() => {
    loadFoods();
  }, []);

  // Search foods when query changes
  useEffect(() => {
    const handleSearch = async () => {
      try {
        setLoading(true);
        const data = await searchFoods(searchQuery);
        setFoods(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro na busca');
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      handleSearch();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Calculate portion when food or grams change
  useEffect(() => {
    const calculatePortion = async () => {
      if (!selectedFood) return;

      try {
        setCalculatingPortion(true);
        const result = await kcalForPortion(selectedFood.id, portionGrams);
        setPortionResult(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro no cálculo da porção');
      } finally {
        setCalculatingPortion(false);
      }
    };

    if (selectedFood && portionGrams > 0) {
      calculatePortion();
    }
  }, [selectedFood, portionGrams]);

  const loadFoods = async () => {
    try {
      setLoading(true);
      const data = await listFoods();
      setFoods(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar alimentos');
    } finally {
      setLoading(false);
    }
  };



  const handleAddFood = async (foodData: AddFoodInput) => {
    await addFood(foodData);
    setShowAddForm(false);
    await loadFoods(); // Reload the list
  };

  const formatNumber = (value: number | undefined, decimals: number = 1): string => {
    if (value === undefined || value === null || isNaN(value)) {
      return '0.0';
    }
    return value.toFixed(decimals);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className={`text-2xl font-bold ${textClasses.heading}`}>
          Alimentos
        </h2>
        <Button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Adicionar alimentos
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="Buscar alimentos..."
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className={`rounded-lg p-4 border ${
          isDarkMode 
            ? 'bg-red-900/20 border-red-800' 
            : 'bg-red-50 border-red-200'
        }`}>
          <p className={textClasses.error}>
            {error}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Foods List */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Lista de Alimentos (por 100g)
          </h3>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className={`mt-2 ${textClasses.subtext}`}>
                Carregando...
              </p>
            </div>
          ) : foods.length === 0 ? (
            <p className={`text-center py-8 ${textClasses.subtext}`}>
              {searchQuery ? 'Nenhum alimento encontrado' : 'Nenhum alimento cadastrado'}
            </p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {foods.map((food) => (
                <div
                  key={food.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedFood?.id === food.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => setSelectedFood(food)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {food.food_name}
                      </h4>
                      <p className={`text-sm ${textClasses.subtext}`}>
                        {food.source}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-red-600">
                        {Math.round(food.energy_kcal)} kcal
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                    <div className="text-center">
                      <p className={textClasses.subtext}>
                        Carbo
                      </p>
                      <p className="font-medium text-green-600">
                         {formatNumber(food.carbs_g)}g
                       </p>
                    </div>
                    <div className="text-center">
                      <p className={textClasses.subtext}>
                        Prot
                      </p>
                      <p className="font-medium text-green-600">
                         {formatNumber(food.protein_g)}g
                       </p>
                    </div>
                    <div className="text-center">
                      <p className={textClasses.subtext}>
                        Gord
                      </p>
                      <p className="font-medium text-green-600">
                         {formatNumber(food.fat_g)}g
                       </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Portion Calculator */}
        <Card className="p-6">
          <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${textClasses.heading}`}>
            <Calculator className="w-5 h-5" />
            Calculadora de Porções
          </h3>
          
          {selectedFood ? (
            <div className="space-y-4">
              <div>
                <p className={`font-medium ${textClasses.primary}`}>
                  {selectedFood.food_name}
                </p>
                <p className={`text-sm ${textClasses.subtext}`}>
                  {selectedFood.source}
                </p>
              </div>
              
              <div>
                <label htmlFor="portion-grams" className={`block text-sm font-medium mb-1 ${textClasses.label}`}>
                  Quantidade (gramas)
                </label>
                <Input
                  id="portion-grams"
                  type="number"
                  min="1"
                  step="1"
                  value={portionGrams}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPortionGrams(Number(e.target.value))}
                  placeholder="Ex: 140"
                />
              </div>
              
              {calculatingPortion ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : portionResult ? (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Para {portionResult.grams}g:
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">
                        {Math.round(portionResult.energy_kcal)}
                      </p>
                      <p className="text-sm text-red-600">kcal</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className={textClasses.subtext}>Carbo:</span>
                        <span className="font-medium text-green-600">
                          {formatNumber(portionResult.carbs_g)}g
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={textClasses.subtext}>Prot:</span>
                        <span className="font-medium text-green-600">
                          {formatNumber(portionResult.protein_g)}g
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={textClasses.subtext}>Gord:</span>
                        <span className="font-medium text-green-600">
                          {formatNumber(portionResult.fat_g)}g
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400 text-center py-8">
              Selecione um alimento da lista para calcular a porção
            </p>
          )}
        </Card>
      </div>

      {/* Add Food Dialog */}
      <AddFoodDialog
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onAdd={handleAddFood}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}

// Add Food Dialog Component
interface AddFoodDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (food: AddFoodInput) => Promise<void>;
  isDarkMode?: boolean;
}

function AddFoodDialog({ isOpen, onClose, onAdd, isDarkMode = false }: AddFoodDialogProps) {
  const [formData, setFormData] = useState<AddFoodInput>({
    food_name: '',
    source: 'TACO 4 ed. (2011)',
    carbs_g: 0,
    protein_g: 0,
    fat_g: 0,
    energy_kcal: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // CSS utility classes for dialog
  const dialogTextClasses = {
    heading: isDarkMode ? 'text-white' : 'text-gray-900',
    label: isDarkMode ? 'text-gray-300' : 'text-gray-700',
    error: isDarkMode ? 'text-red-400' : 'text-red-700',
    subtext: isDarkMode ? 'text-gray-400' : 'text-gray-600'
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.food_name.trim()) {
      setError('Nome é obrigatório');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onAdd(formData);
      // Reset form
      setFormData({
        food_name: '',
        source: 'TACO 4 ed. (2011)',
        carbs_g: 0,
        protein_g: 0,
        fat_g: 0,
        energy_kcal: 0
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar alimento');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setError(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogTitle className={`text-lg font-semibold ${dialogTextClasses.heading}`}>
          Adicionar Alimento
        </DialogTitle>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className={`rounded-lg p-3 border ${
              isDarkMode 
                ? 'bg-red-900/20 border-red-800' 
                : 'bg-red-50 border-red-200'
            }`}>
              <p className={`text-sm ${dialogTextClasses.error}`}>
                {error}
              </p>
            </div>
          )}
          
          <div>
            <label htmlFor="food-name" className={`block text-sm font-medium mb-1 ${dialogTextClasses.label}`}>
              Nome do Alimento *
            </label>
            <Input
              id="food-name"
              type="text"
              value={formData.food_name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, food_name: e.target.value })}
              placeholder="Ex: Arroz integral cozido"
              required
            />
          </div>
          
          <div>
            <label htmlFor="food-source" className={`block text-sm font-medium mb-1 ${dialogTextClasses.label}`}>
              Fonte
            </label>
            <Input
              id="food-source"
              type="text"
              value={formData.source}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, source: e.target.value })}
              placeholder="Ex: TACO 4 ed. (2011)"
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="carbo-g" className={`block text-sm font-medium mb-1 ${dialogTextClasses.label}`}>
                Carboidratos *
              </label>
              <Input
                id="carbo-g"
                type="number"
                min="0"
                step="0.1"
                value={formData.carbs_g}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, carbs_g: Number(e.target.value) })}
                placeholder="g por 100g"
                required
              />
            </div>
            
            <div>
              <label htmlFor="prot-g" className={`block text-sm font-medium mb-1 ${dialogTextClasses.label}`}>
                Proteínas *
              </label>
              <Input
                id="prot-g"
                type="number"
                min="0"
                step="0.1"
                value={formData.protein_g}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, protein_g: Number(e.target.value) })}
                placeholder="g por 100g"
                required
              />
            </div>
            
            <div>
              <label htmlFor="gord-g" className={`block text-sm font-medium mb-1 ${dialogTextClasses.label}`}>
                Gorduras *
              </label>
              <Input
                id="gord-g"
                type="number"
                min="0"
                step="0.1"
                value={formData.fat_g}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, fat_g: Number(e.target.value) })}
                placeholder="g por 100g"
                required
              />
            </div>
          </div>
          
          <div className={`text-sm ${dialogTextClasses.subtext}`}>
            <p>* Valores por 100g do alimento</p>
            <p>Calorias serão calculadas automaticamente: 4×carbo + 4×prot + 9×gord</p>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button
             type="button"
             variant="secondary"
             onClick={handleClose}
             disabled={loading}
           >
             Cancelar
           </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Adicionando...' : 'Adicionar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}