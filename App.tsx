import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import AppShell from './components/AppShell'
import Header from './components/Header'
import { AuthProvider, useAuth } from './src/contexts/AuthContext'
import { AdminPanel } from './src/components/auth/AdminPanel'
import { AuthModal } from './src/components/auth/AuthModal'
import GeradorDeTokenPage from './src/components/auth/GeradorDeTokenPage'
import { AppState, Meal } from './types'
import MealBuilderSection from './components/MealBuilderSection'
import NutritionSidebar from './components/NutritionSidebar'

import { FoodsSection } from './components/FoodsSection'
import { INITIAL_MEALS } from './constants'
import Button from './components/Button'
import Tutorial from './components/Tutorial'
import RestritoPage from './src/pages/restrito'

// TODO: Navigation base config can be centralized if needed [DATA UNCERTAIN]

/**
 * App content component that handles authenticated user interface
 */
const AppContent: React.FC = () => {
  const { user, loading } = useAuth()
  const [showAdmin, setShowAdmin] = useState(false)
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'login' | 'register' }>({ isOpen: false, mode: 'login' })
  
  const navigationLinks = [
    { id: 'meal-builder', label: 'Inicio', icon: null },
    { id: 'tutorial', label: 'Tutorial', icon: null },
    { id: 'restrito', label: 'Restrita', icon: null },
  ]
  
  // Global application state
  const [appState, setAppState] = useState<AppState>({
    meals: {},
    isDarkMode: true,
    activeSection: 'meal-builder',
    isLoading: false,
    error: null
  })

  // Force global dark theme (no light mode)
  useEffect(() => {
    try {
      document.documentElement.classList.add('dark');
    } catch {
      // ignore
    }
  }, []);

  // View rendering is handled later to avoid conditional hook calls



  // Load saved meals or initialize with INITIAL_MEALS
  useEffect(() => {
    try {
      const raw = localStorage.getItem('nutria-meals');
      let baseMeals: { [key: string]: Meal };
      if (raw) {
        const saved = JSON.parse(raw) as { [key: string]: Meal };
        baseMeals = saved;
      } else {
        // Initialize with INITIAL_MEALS if no saved data
        baseMeals = INITIAL_MEALS.reduce((acc, meal) => {
          acc[meal.id] = meal;
          return acc;
        }, {} as { [key: string]: Meal });
      }

      // Apply saved order if available
      let orderedMeals = baseMeals;
      try {
        const orderRaw = localStorage.getItem('nutria-meal-order');
        const orderIds = orderRaw ? (JSON.parse(orderRaw) as string[]) : null;
        if (orderIds && Array.isArray(orderIds)) {
          const next: { [key: string]: Meal } = {};
          orderIds.forEach((id) => { if (baseMeals[id]) next[id] = baseMeals[id]; });
          Object.keys(baseMeals).forEach((id) => { if (!next[id]) next[id] = baseMeals[id]; });
          orderedMeals = next;
        }
      } catch { /* ignore order parsing */ }

      setAppState(prev => ({ ...prev, meals: orderedMeals }));
    } catch {
      // ignore
    }
  }, []);

  // Persist meals on change
  useEffect(() => {
    try {
      localStorage.setItem('nutria-meals', JSON.stringify(appState.meals));
    } catch {
      // ignore
    }
  }, [appState.meals]);

  // TODO: Add daily macro computation when summary UI is implemented [DATA UNCERTAIN]

  // TODO: Add update/remove helpers as features require [DATA UNCERTAIN]

  // Handlers for meal state
  const handleUpdateMeal = (mealId: string, updated: Meal) => {
    setAppState(prev => ({
      ...prev,
      meals: { ...prev.meals, [mealId]: updated }
    }));
  };

  const handleRemoveMeal = (mealId: string) => {
    setAppState(prev => {
      const next = { ...prev.meals };
      delete next[mealId];
      // update stored order as well
      try {
        const orderRaw = localStorage.getItem('nutria-meal-order');
        const currentOrder = orderRaw ? (JSON.parse(orderRaw) as string[]) : Object.keys(next);
        const filtered = currentOrder.filter((id) => id !== mealId).filter((id) => !!next[id]);
        localStorage.setItem('nutria-meal-order', JSON.stringify(filtered));
      } catch { /* ignore */ }
      return { ...prev, meals: next };
    });
  };

  // Persist explicit meal order when user reorders via drag-and-drop
  const handleReorderMeals = (orderedIds: string[]) => {
    setAppState(prev => {
      const next: { [key: string]: Meal } = {};
      // keep only existing ids in the requested order
      orderedIds.forEach((id) => { if (prev.meals[id]) next[id] = prev.meals[id]; });
      // append any meals that were not in orderedIds at the end (e.g., newly added)
      Object.keys(prev.meals).forEach((id) => { if (!next[id]) next[id] = prev.meals[id]; });
      try {
        localStorage.setItem('nutria-meal-order', JSON.stringify(Object.keys(next)));
      } catch { /* ignore */ }
      return { ...prev, meals: next };
    });
  };

  // Route-aware AppShell: sidebar (Resumo diário) somente em "/" e "/restrito"
  const MainLayout: React.FC = () => {
    const location = useLocation();
    const showSidebar = location.pathname === '/' || location.pathname === '/restrito';

    return (
      <AppShell
        header={(
          <div>
            <Header 
              isDarkMode={appState.isDarkMode}
              onToggleDarkMode={() => { /* Dark/Light mode disabled by product decision */ }}
              activeSection={appState.activeSection}
              onSetActiveSection={(section: string) => setAppState(prev => ({
                ...prev,
                activeSection: section
              }))}
              navigationLinks={navigationLinks}
              rightSlot={user ? (
                <div className="flex items-center gap-3">
                  <a href="/gerador-de-token" className="text-sm text-white/80 hover:underline">Área interna</a>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setAuthModal({ isOpen: true, mode: 'login' })}
                    className="text-sm"
                  >
                    Entrar
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setAuthModal({ isOpen: true, mode: 'register' })}
                    className="text-sm"
                  >
                    Cadastro
                  </Button>
                </div>
              )}
            />
          </div>
        )}
        sidebar={showSidebar ? (
          <NutritionSidebar appState={appState} />
        ) : undefined}
      >
        <Routes>
          <Route path="/" element={
            <div className="p-6">
              <MealBuilderSection
                meals={appState.meals}
                onUpdateMeal={handleUpdateMeal}
                onRemoveMeal={handleRemoveMeal}
                isDarkMode={false}
                isLoading={false}
                onReorderMeals={handleReorderMeals}
              />
            </div>
          } />
          <Route path="/meal-builder" element={<Navigate to="/" replace />} />
          <Route 
            path="/foods" 
            element={
              <div className="p-6">
                <FoodsSection isDarkMode={false} />
              </div>
            } 
          />
          <Route 
            path="/tutorial" 
            element={
              <div className="p-6">
                <Tutorial isDarkMode={false} />
              </div>
            } 
          />
          <Route 
            path="/restrito" 
            element={<RestritoPage />} 
          />
          {/* Restrita */}
          <Route path="/gerador-de-token" element={<GeradorDeTokenPage />} />
        </Routes>
      </AppShell>
    );
  };

  // Compute the view based on auth/loading state without conditional hook calls
  let content: React.ReactNode;
  if (loading) {
    content = (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  } else if (!user) {
    content = (
      <MainLayout />
    );
  } else if (showAdmin) {
    content = (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin</h1>
            <button
              onClick={() => setShowAdmin(false)}
              className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Voltar
            </button>
          </div>
          <AdminPanel onClose={() => setShowAdmin(false)} />
        </div>
      </div>
    );
  } else {
    content = (
      <MainLayout />
    );
  }

  return (
    <Router>
      <div className="min-h-screen">
        {appState.isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-center">Loading...</p>
            </div>
          </div>
        )}
        
        {appState.error && (
          <div className="fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50">
            <div className="flex items-center justify-between">
              <span>{appState.error}</span>
              <button 
                onClick={() => setAppState(prev => ({ ...prev, error: null }))}
                className="ml-4 text-white hover:text-gray-200"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {content}
        
        {/* Modal de Autenticação */}
        <AuthModal
          isOpen={authModal.isOpen}
          onClose={() => setAuthModal({ isOpen: false, mode: 'login' })}
          initialMode={authModal.mode}
        />
      </div>
    </Router>
  )
}

/**
 * Main App component with AuthProvider wrapper
 */
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
};

export default App;
