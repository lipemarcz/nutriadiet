import React, { useMemo } from 'react';
import { FileImage, Printer } from 'lucide-react';
import type { Meal } from '../types';

interface NutritionSummaryTableProps {
  meals: { [key: string]: Meal };
  isDarkMode?: boolean;
}

const round1 = (v: number) => Math.round(v * 10) / 10;
const round0 = (v: number) => Math.round(v);

const NutritionSummaryTable: React.FC<NutritionSummaryTableProps> = ({ meals, isDarkMode = true }) => {
  const rows = useMemo(() => {
    return Object.values(meals).map((meal) => {
      const totals = meal.foods.reduce(
        (t, f) => {
          const m = (f.quantity || 0) / 100;
          return {
            protein: t.protein + (f.macros.protein || 0) * m,
            carbs: t.carbs + (f.macros.carbs || 0) * m,
            fat: t.fat + (f.macros.fat || 0) * m,
            calories: t.calories + (f.macros.calories || 0) * m,
            quantity: t.quantity + (f.quantity || 0),
          };
        },
        { protein: 0, carbs: 0, fat: 0, calories: 0, quantity: 0 }
      );
      
      return {
        name: meal.name,
        protein: round1(totals.protein),
        carbs: round1(totals.carbs),
        fat: round1(totals.fat),
        calories: round0(totals.calories),
        quantity: round0(totals.quantity),
      };
    });
  }, [meals]);

  const totals = useMemo(() => {
    const totalsSum = rows.reduce(
      (t, r) => ({
        protein: t.protein + r.protein,
        carbs: t.carbs + r.carbs,
        fat: t.fat + r.fat,
        calories: t.calories + r.calories,
        quantity: t.quantity + r.quantity,
      }),
      { protein: 0, carbs: 0, fat: 0, calories: 0, quantity: 0 }
    );
    
    return {
      protein: round1(totalsSum.protein),
      carbs: round1(totalsSum.carbs),
      fat: round1(totalsSum.fat),
      calories: round0(totalsSum.calories),
      quantity: round0(totalsSum.quantity),
    };
  }, [rows]);

  const exportToPNG = () => {
    // Simplified canvas export without percentage and fiber columns
    const cols = [220, 120, 120, 120, 140, 140];
    const width = cols.reduce((a, b) => a + b, 0) + 40; // borders + padding
    const rowH = 45;
    const headH = 60;
    const footH = 50;
    const titleH = 50;
    const height = titleH + headH + rows.length * rowH + footH + 40;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Colors
    const bg = '#ffffff';
    const border = '#e5e7eb';
    const headBg = '#f8fafc';
    const text = '#1f2937';
    const muted = '#6b7280';
    const primary = '#059669';
    
    // Fill background
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);
    
    // Title
    ctx.fillStyle = primary;
    ctx.font = 'bold 20px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto';
    ctx.textAlign = 'center';
    ctx.fillText('NUTRIA MACRO - Resumo Nutricional', width / 2, 30);
    
    const currentDate = new Date().toLocaleDateString('pt-BR');
    ctx.fillStyle = muted;
    ctx.font = '12px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto';
    ctx.fillText(`Gerado em: ${currentDate}`, width / 2, 50);
    
    // Header
    const headerTop = titleH;
    ctx.fillStyle = headBg;
    ctx.fillRect(20, headerTop, width - 40, headH);
    ctx.strokeStyle = border;
    ctx.lineWidth = 1;
    ctx.strokeRect(20, headerTop, width - 40, headH);
    
    ctx.fillStyle = text;
    ctx.font = 'bold 11px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto';
    const headers = [
      'Refeição', 
      'Proteínas\n(g)', 
      'Carboidratos\n(g)', 
      'Lipídios\n(g)', 
      'Calorias\n(kcal)', 
      'Quantidade\n(g)'
    ];
    
    let x = 20;
    headers.forEach((h, i) => {
      const w = cols[i];
      const lines = h.split('\n');
      const alignRight = i > 0; // only first column left aligned
      const tx = alignRight ? x + w - 8 : x + 8;
      
      ctx.textAlign = alignRight ? 'right' : 'left';
      if (lines.length > 1) {
        ctx.fillText(lines[0], tx, headerTop + 20);
        ctx.fillText(lines[1], tx, headerTop + 35);
      } else {
        ctx.fillText(h, tx, headerTop + 30);
      }
      
      // Vertical lines
      if (i > 0) {
        ctx.strokeStyle = border;
        ctx.beginPath();
        ctx.moveTo(x, headerTop);
        ctx.lineTo(x, headerTop + headH);
        ctx.stroke();
      }
      x += w;
    });
    
    // Rows
    ctx.font = '11px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto';
    rows.forEach((r, idx) => {
      const top = titleH + headH + idx * rowH;
      
      // Alternate row background
      if (idx % 2 === 1) {
        ctx.fillStyle = '#f9fafb';
        ctx.fillRect(20, top, width - 40, rowH);
      }
      
      ctx.strokeStyle = border;
      ctx.strokeRect(20, top, width - 40, rowH);
      
      const cells = [
        r.name, 
        String(r.protein), 
        String(r.carbs), 
        String(r.fat), 
        String(r.calories), 
        String(r.quantity)
      ];
      
      let cx = 20;
      cells.forEach((c, i) => {
        const w = cols[i];
        const alignRight = i > 0;
        const tx = alignRight ? cx + w - 8 : cx + 8;
        const ty = top + rowH / 2 + 4;
        ctx.textAlign = alignRight ? 'right' : 'left';
        ctx.fillStyle = i === 0 ? text : muted;
        ctx.fillText(c, tx, ty);
        
        // Vertical lines
        if (i > 0) {
          ctx.strokeStyle = border;
          ctx.beginPath();
          ctx.moveTo(cx, top);
          ctx.lineTo(cx, top + rowH);
          ctx.stroke();
        }
        cx += w;
      });
    });
    
    // Footer total
    const footTop = titleH + headH + rows.length * rowH;
    ctx.fillStyle = headBg;
    ctx.fillRect(20, footTop, width - 40, footH);
    ctx.strokeStyle = border;
    ctx.strokeRect(20, footTop, width - 40, footH);
    
    ctx.fillStyle = primary;
    ctx.font = 'bold 12px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto';
    const totalCells = [
      'TOTAL DIÁRIO', 
      String(totals.protein), 
      String(totals.carbs), 
      String(totals.fat), 
      String(totals.calories), 
      String(totals.quantity)
    ];
    
    let tx2 = 20;
    totalCells.forEach((c, i) => {
      const w = cols[i];
      const alignRight = i > 0;
      const px = alignRight ? tx2 + w - 8 : tx2 + 8;
      const py = footTop + footH / 2 + 4;
      ctx.textAlign = alignRight ? 'right' : 'left';
      ctx.fillText(c, px, py);
      
      // Vertical lines
      if (i > 0) {
        ctx.strokeStyle = border;
        ctx.beginPath();
        ctx.moveTo(tx2, footTop);
        ctx.lineTo(tx2, footTop + footH);
        ctx.stroke();
      }
      tx2 += w;
    });
    
    // Trigger download
    const url = canvas.toDataURL('image/png', 1.0);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nutria-macro-resumo-${new Date().toISOString().split('T')[0]}.png`;
    a.click();
  };

  return (
    <div className={`mt-8 rounded-xl border shadow-lg ${isDarkMode ? 'border-gray-600 bg-gray-900' : 'border-gray-200 bg-white'}`}>
      <div className={`flex items-center justify-between px-6 py-4 border-b ${isDarkMode ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-900'}`}>
        <div>
          <h3 className="text-xl font-bold">Resumo Nutricional por Refeição</h3>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Análise completa dos macronutrientes por refeição</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportToPNG}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${
              isDarkMode
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-emerald-500/25'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-emerald-500/25'
            } hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2`}
            title="Exportar tabela como imagem PNG"
            aria-label="Exportar resumo nutricional como imagem PNG"
          >
            <FileImage className="w-4 h-4" aria-hidden="true" />
            Exportar PNG
          </button>
          <button
            onClick={() => window.print()}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${
              isDarkMode
                ? 'bg-gray-700 hover:bg-gray-600 text-white border border-gray-600'
                : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300'
            } hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2`}
            title="Imprimir tabela"
            aria-label="Imprimir resumo nutricional"
          >
            <Printer className="w-4 h-4" aria-hidden="true" />
            Imprimir
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm" role="table" aria-label="Resumo nutricional por refeição">
          <thead>
            <tr className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border-b`} role="row">
              <th className={`text-left px-2 py-2 font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`} role="columnheader" scope="col">
                <div className="flex flex-col">
                  <span className="text-xs">Refeição</span>
                </div>
              </th>
              <th className={`text-center px-1 py-2 font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`} role="columnheader" scope="col">
                <div className="flex flex-col items-center">
                  <span className="text-xs">Prot</span>
                  <span className="text-xs font-normal opacity-70">(g)</span>
                </div>
              </th>
              <th className={`text-center px-1 py-2 font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`} role="columnheader" scope="col">
                <div className="flex flex-col items-center">
                  <span className="text-xs">Carb</span>
                  <span className="text-xs font-normal opacity-70">(g)</span>
                </div>
              </th>
              <th className={`text-center px-1 py-2 font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`} role="columnheader" scope="col">
                <div className="flex flex-col items-center">
                  <span className="text-xs">Gord</span>
                  <span className="text-xs font-normal opacity-70">(g)</span>
                </div>
              </th>
              <th className={`text-center px-1 py-2 font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`} role="columnheader" scope="col">
                <div className="flex flex-col items-center">
                  <span className="text-xs">Kcal</span>
                </div>
              </th>
              <th className={`text-center px-1 py-2 font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`} role="columnheader" scope="col">
                <div className="flex flex-col items-center">
                  <span className="text-xs">Qtd</span>
                  <span className="text-xs font-normal opacity-70">(g)</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className={`${isDarkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'} border-b transition-colors`}>
                <td className={`px-2 py-2 font-semibold text-xs ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{row.name}</td>
                <td className="px-1 py-2 text-center font-medium text-green-600 text-xs">{row.protein}</td>
                <td className="px-1 py-2 text-center font-medium text-green-600 text-xs">{row.carbs}</td>
                <td className="px-1 py-2 text-center font-medium text-green-600 text-xs">{row.fat}</td>
                <td className="px-1 py-2 text-center font-bold text-red-600 text-xs">{row.calories}</td>
                <td className={`px-1 py-2 text-center font-medium text-xs ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{row.quantity}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border-t-2 font-bold`}>
              <td className={`px-2 py-3 font-bold text-xs ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Total Diário</td>
              <td className="px-1 py-3 text-center font-bold text-green-600 text-xs">{totals.protein}</td>
              <td className="px-1 py-3 text-center font-bold text-green-600 text-xs">{totals.carbs}</td>
              <td className="px-1 py-3 text-center font-bold text-green-600 text-xs">{totals.fat}</td>
              <td className="px-1 py-3 text-center font-bold text-red-600 text-xs">{totals.calories}</td>
              <td className={`px-1 py-3 text-center font-bold text-xs ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{totals.quantity}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default NutritionSummaryTable;
