import React, { useEffect, useMemo, useState } from 'react'
import type { Meal } from '../../../types'
import MealCard from '../../../components/MealCard'
import Button from '../../../components/Button'
import { getDefaultMeals, getOrder } from './MealPresetService'

interface MealsGridProps {
  initialCount?: number // between 3..8
}

export const MealsGrid: React.FC<MealsGridProps> = ({ initialCount = 3 }) => {
  const [count, setCount] = useState<number>(() => Math.min(8, Math.max(3, Math.floor(initialCount))))
  const [mealsMap, setMealsMap] = useState<{ [key: string]: Meal }>(() => {
    const base = getDefaultMeals(initialCount)
    return base.reduce<{ [key: string]: Meal }>((acc, m: Meal) => { acc[m.id] = m; return acc }, {})
  })

  const order = useMemo(() => getOrder(count), [count])

  const regenerateFor = (n: number) => {
    const base = getDefaultMeals(n)
    const next = base.reduce<{ [key: string]: Meal }>((acc, m: Meal) => { acc[m.id] = m; return acc }, {})
    setMealsMap(next)
  }

  useEffect(() => {
    // When count changes through selector, re-generate default structure
    regenerateFor(count)
  }, [count])

  const handleUpdateMeal = (mealId: string, updated: Meal) => {
    setMealsMap(prev => ({ ...prev, [mealId]: updated }))
  }

  const handleRemoveMeal = (mealId: string) => {
    setMealsMap(prev => {
      const next = { ...prev }
      delete next[mealId]
      return next
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Restrita — Refeições</h2>
          <p className="text-sm text-white">Geração rápida conforme regras do acesso restrito</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-white">Refeições:</label>
          <select
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="px-3 py-2 rounded-md border text-sm bg-[#1b2027] border-[#2a3040] text-white"
            aria-label="Selecionar número de refeições"
          >
            {[3,4,5,6,7,8].map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          <Button
            variant="secondary"
            size="md"
            onClick={() => regenerateFor(count)}
          >
            REINICIAR
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {order.map((id) => {
          const meal = mealsMap[id]
          if (!meal) return null
          return (
            <div key={id}>
              <MealCard
                meal={meal}
                onUpdateMeal={(m) => handleUpdateMeal(id, m)}
                onRemoveMeal={() => handleRemoveMeal(id)}
                isDarkMode={false}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default MealsGrid
