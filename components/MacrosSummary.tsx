import React from 'react';
import { MacrosSummaryProps } from '../types';
import Card from './Card';
import { formatKcal, formatGrams, formatPercent, clampPercent } from '../utils/format';

const MacrosSummary: React.FC<MacrosSummaryProps> = ({ dailyMacros, isDarkMode }) => {
  const { calories, protein, carbs, fat } = dailyMacros;

  const totalMacroGrams = protein + carbs + fat;
  const proteinPercentage = totalMacroGrams > 0 ? clampPercent((protein / totalMacroGrams) * 100) : 0;
  const carbsPercentage = totalMacroGrams > 0 ? clampPercent((carbs / totalMacroGrams) * 100) : 0;
  const fatPercentage = totalMacroGrams > 0 ? clampPercent((fat / totalMacroGrams) * 100) : 0;

  const macroColors = {
    protein: 'bg-sky-500',
    carbs: 'bg-emerald-500',
    fat: 'bg-amber-500'
  };

  return (
    <div className="w-full">
      <Card isDarkMode={isDarkMode} className="w-full overflow-hidden border border-[#272c35]">
        <div className="p-4 min-w-0">
          <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-[#c9d1d9]' : 'text-gray-900'}`}>Resumo do Dia</h3>

          <div className="mb-4">
            <div className={`text-center p-3 rounded-lg ${isDarkMode ? 'bg-[#1b2027]' : 'bg-gray-100'}`}>
              <div className="text-3xl font-extrabold text-red-600">{formatKcal(calories)}</div>
              <div className={`text-xs uppercase tracking-wide ${isDarkMode ? 'text-[#9aa4b2]' : 'text-gray-600'}`}>Calorias Totais</div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${macroColors.protein}`}></div>
                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Proteína</span>
              </div>
              <div className="flex items-center gap-2 w-2/3">
                <div className={`w-full h-2 rounded-full ${isDarkMode ? 'bg-[#111520]' : 'bg-gray-300'}`}>
                  <div className={`h-full rounded-full ${macroColors.protein}`} style={{ width: `${proteinPercentage}%` }}></div>
                </div>
                <span className="text-sm font-bold min-w-[3rem] text-right text-green-600">{formatGrams(protein)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${macroColors.carbs}`}></div>
                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Carboidratos</span>
              </div>
              <div className="flex items-center gap-2 w-2/3">
                <div className={`w-full h-2 rounded-full ${isDarkMode ? 'bg-[#111520]' : 'bg-gray-300'}`}>
                  <div className={`h-full rounded-full ${macroColors.carbs}`} style={{ width: `${carbsPercentage}%` }}></div>
                </div>
                <span className="text-sm font-bold min-w-[3rem] text-right text-green-600">{formatGrams(carbs)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${macroColors.fat}`}></div>
                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Gorduras</span>
              </div>
              <div className="flex items-center gap-2 w-2/3">
                <div className={`w-full h-2 rounded-full ${isDarkMode ? 'bg-[#111520]' : 'bg-gray-300'}`}>
                  <div className={`h-full rounded-full ${macroColors.fat}`} style={{ width: `${fatPercentage}%` }}></div>
                </div>
                <span className="text-sm font-bold min-w-[3rem] text-right text-green-600">{formatGrams(fat)}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-[#272c35]">
            <div className={`text-xs text-center ${isDarkMode ? 'text-[#9aa4b2]' : 'text-gray-500'}`}>
              P: {formatPercent(proteinPercentage)} | C: {formatPercent(carbsPercentage)} | G: {formatPercent(fatPercentage)}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MacrosSummary;
