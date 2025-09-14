import type { Meal } from './types';

/**
 * Navigation links for the header
 */
export const NAV_LINKS = [
  { name: 'Dashboard', href: '#dashboard' },
  { name: 'Planos', href: '#plans' },
  { name: 'Receitas', href: '#recipes' },
  { name: 'Relatórios', href: '#reports' }
];

/**
 * Initial meal data with realistic Brazilian foods and macro values
 */
export const INITIAL_MEALS: Meal[] = [
  {
    id: 'breakfast',
    name: 'Café da manhã',
    foods: [
      {
        id: 'oats',
        name: 'Aveia em flocos',
        amount: '50g (5 colheres de sopa)',
        macros: {
          protein: 6.9,
          carbs: 32.8,
          fat: 3.4,
          calories: 185,
          fiber: 5.0
        },
        quantity: 50
      },
      {
        id: 'banana',
        name: 'Banana nanica',
        amount: '1 unidade média (120g)',
        macros: {
          protein: 1.3,
          carbs: 26.0,
          fat: 0.4,
          calories: 112,
          fiber: 2.6
        },
        quantity: 120
      },
      {
        id: 'milk',
        name: 'Leite desnatado',
        amount: '200ml',
        macros: {
          protein: 6.8,
          carbs: 9.6,
          fat: 0.4,
          calories: 70,
          fiber: 0.0
        },
        quantity: 200
      },
      {
        id: 'honey',
        name: 'Mel',
        amount: '1 colher de sopa (20g)',
        macros: {
          protein: 0.1,
          carbs: 16.4,
          fat: 0.0,
          calories: 66,
          fiber: 0.0
        },
        quantity: 20
      }
    ]
  },
  {
    id: 'lunch',
    name: 'Almoço',
    foods: [
      {
        id: 'rice',
        name: 'Arroz branco cozido',
        amount: '150g (3 colheres de servir)',
        macros: {
          protein: 4.1,
          carbs: 41.2,
          fat: 0.3,
          calories: 185,
          fiber: 0.6
        },
        quantity: 150
      },
      {
        id: 'beans',
        name: 'Feijão carioca cozido',
        amount: '100g (1 concha)',
        macros: {
          protein: 8.5,
          carbs: 14.0,
          fat: 0.5,
          calories: 94,
          fiber: 8.5
        },
        quantity: 100
      },
      {
        id: 'chicken',
        name: 'Peito de frango grelhado',
        amount: '120g',
        macros: {
          protein: 31.0,
          carbs: 0.0,
          fat: 3.6,
          calories: 153,
          fiber: 0.0
        },
        quantity: 120
      },
      {
        id: 'salad',
        name: 'Salada mista (alface, tomate, cenoura)',
        amount: '100g',
        macros: {
          protein: 1.2,
          carbs: 4.8,
          fat: 0.2,
          calories: 25,
          fiber: 2.0
        },
        quantity: 100
      },
      {
        id: 'olive-oil',
        name: 'Azeite de oliva extravirgem',
        amount: '1 colher de sopa (15ml)',
        macros: {
          protein: 0.0,
          carbs: 0.0,
          fat: 15.0,
          calories: 135,
          fiber: 0.0
        },
        quantity: 15
      }
    ]
  },
  {
    id: 'snack',
    name: 'Lanche da tarde',
    foods: [
      {
        id: 'yogurt',
        name: 'Iogurte grego natural',
        amount: '150g (1 pote)',
        macros: {
          protein: 15.0,
          carbs: 6.0,
          fat: 9.0,
          calories: 150,
          fiber: 0.0
        },
        quantity: 150
      },
      {
        id: 'granola',
        name: 'Granola caseira',
        amount: '30g (2 colheres de sopa)',
        macros: {
          protein: 3.6,
          carbs: 18.0,
          fat: 6.3,
          calories: 135,
          fiber: 3.0
        },
        quantity: 30
      }
    ]
  },
  {
    id: 'dinner',
    name: 'Jantar',
    foods: [
      {
        id: 'sweet-potato',
        name: 'Batata-doce assada',
        amount: '200g (1 unidade média)',
        macros: {
          protein: 4.0,
          carbs: 40.0,
          fat: 0.2,
          calories: 180,
          fiber: 6.0
        },
        quantity: 200
      },
      {
        id: 'salmon',
        name: 'Salmão grelhado',
        amount: '150g',
        macros: {
          protein: 31.5,
          carbs: 0.0,
          fat: 18.0,
          calories: 294,
          fiber: 0.0
        },
        quantity: 150
      },
      {
        id: 'broccoli',
        name: 'Brócolis refogado',
        amount: '100g',
        macros: {
          protein: 2.8,
          carbs: 4.0,
          fat: 0.4,
          calories: 30,
          fiber: 2.6
        },
        quantity: 100
      },
      {
        id: 'avocado',
        name: 'Abacate',
        amount: '50g (1/4 de unidade)',
        macros: {
          protein: 1.0,
          carbs: 4.3,
          fat: 7.3,
          calories: 80,
          fiber: 3.4
        },
        quantity: 50
      }
    ]
  }
];

/**
 * Application constants
 */
export const APP_CONFIG = {
  name: 'NUTRIA MACRO',
  version: '1.0.0',
  description: 'Modern nutrition planning platform',
  author: 'NUTRIA Team',
  defaultLanguage: 'pt-BR',
  theme: 'dark'
} as const;

/**
 * Macro calculation constants
 */
export const MACRO_CONSTANTS = {
  PROTEIN_CALORIES_PER_GRAM: 4,
  CARBS_CALORIES_PER_GRAM: 4,
  FATS_CALORIES_PER_GRAM: 9,
  ALCOHOL_CALORIES_PER_GRAM: 7
} as const;

/**
 * Color scheme constants for charts and UI
 */
export const COLORS = {
  primary: '#0ea5e9', // sky-500
  secondary: '#64748b', // slate-500
  success: '#10b981', // emerald-500
  warning: '#f59e0b', // amber-500
  error: '#ef4444', // red-500
  info: '#3b82f6', // blue-500
  
  // Macro colors
  protein: '#ef4444', // red-500
  carbs: '#3b82f6', // blue-500
  fats: '#f59e0b', // amber-500
  calories: '#0ea5e9', // sky-500
  
  // Dark theme colors
  background: '#0a0a0a', // neutral-950
  surface: '#171717', // neutral-900
  surfaceVariant: '#262626', // neutral-800
  onSurface: '#f5f5f5', // neutral-100
  onSurfaceVariant: '#a3a3a3' // neutral-400
} as const;

/**
 * Responsive breakpoints (matching Tailwind CSS)
 */
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
} as const;

/**
 * Animation durations
 */
export const ANIMATIONS = {
  fast: '150ms',
  normal: '300ms',
  slow: '500ms'
} as const;

/**
 * Z-index layers
 */
export const Z_INDEX = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modal: 1040,
  popover: 1050,
  tooltip: 1060
} as const;

/**
 * Default serving sizes for common foods
 */
export const DEFAULT_SERVING_SIZES = {
  // Grains and cereals
  rice: { name: 'Colher de servir', grams: 50 },
  pasta: { name: 'Porção', grams: 80 },
  bread: { name: 'Fatia', grams: 25 },
  oats: { name: 'Colher de sopa', grams: 15 },
  
  // Proteins
  chicken: { name: 'Peito médio', grams: 120 },
  beef: { name: 'Bife médio', grams: 100 },
  fish: { name: 'Filé médio', grams: 150 },
  egg: { name: 'Unidade', grams: 50 },
  
  // Dairy
  milk: { name: 'Copo', grams: 200 },
  yogurt: { name: 'Pote', grams: 150 },
  cheese: { name: 'Fatia', grams: 30 },
  
  // Fruits
  banana: { name: 'Unidade média', grams: 120 },
  apple: { name: 'Unidade média', grams: 150 },
  orange: { name: 'Unidade média', grams: 180 },
  
  // Vegetables
  broccoli: { name: 'Porção', grams: 100 },
  carrot: { name: 'Unidade média', grams: 80 },
  tomato: { name: 'Unidade média', grams: 100 },
  
  // Fats
  'olive-oil': { name: 'Colher de sopa', grams: 15 },
  avocado: { name: '1/4 unidade', grams: 50 },
  nuts: { name: 'Punhado', grams: 30 }
} as const;

/**
 * Food categories for filtering and organization
 */
export const FOOD_CATEGORIES = [
  'Cereais e grãos',
  'Proteínas',
  'Laticínios',
  'Frutas',
  'Vegetais',
  'Gorduras',
  'Bebidas',
  'Doces',
  'Temperos',
  'Outros'
] as const;

/**
 * Meal types for different times of day
 */
export const MEAL_TYPES = [
  'Café da manhã',
  'Lanche da manhã',
  'Almoço',
  'Lanche da tarde',
  'Jantar',
  'Ceia'
] as const;

/**
 * Export formats available
 */
export const EXPORT_FORMATS = [
  { value: 'json', label: 'JSON', extension: '.json' },
  { value: 'csv', label: 'CSV', extension: '.csv' },
  { value: 'pdf', label: 'PDF', extension: '.pdf' }
] as const;

/**
 * Validation rules
 */
export const VALIDATION_RULES = {
  food: {
    name: {
      minLength: 2,
      maxLength: 100,
      required: true
    },
    amount: {
      minLength: 1,
      maxLength: 50,
      required: true
    },
    macros: {
      min: 0,
      max: 1000,
      required: true
    },
    quantity: {
      min: 0.1,
      max: 10000,
      required: true
    }
  },
  meal: {
    name: {
      minLength: 2,
      maxLength: 50,
      required: true
    }
  }
} as const;

/**
 * API endpoints for future backend integration
 */
export const API_ENDPOINTS = {
  base: '/api/v1',
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    register: '/auth/register',
    refresh: '/auth/refresh'
  },
  meals: {
    list: '/meals',
    create: '/meals',
    update: '/meals/:id',
    delete: '/meals/:id'
  },
  foods: {
    list: '/foods',
    search: '/foods/search',
    create: '/foods',
    update: '/foods/:id',
    delete: '/foods/:id'
  },
  plans: {
    list: '/plans',
    create: '/plans',
    update: '/plans/:id',
    delete: '/plans/:id'
  },
  reports: {
    daily: '/reports/daily',
    weekly: '/reports/weekly',
    monthly: '/reports/monthly',
    export: '/reports/export'
  }
} as const;

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  theme: 'nutria-theme',
  language: 'nutria-language',
  userSettings: 'nutria-user-settings',
  mealPlans: 'nutria-meal-plans',
  customFoods: 'nutria-custom-foods',
  recentSearches: 'nutria-recent-searches'
} as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  network: 'Erro de conexão. Verifique sua internet.',
  validation: 'Dados inválidos. Verifique os campos.',
  notFound: 'Item não encontrado.',
  unauthorized: 'Acesso não autorizado.',
  serverError: 'Erro interno do servidor.',
  unknown: 'Erro desconhecido. Tente novamente.'
} as const;

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  saved: 'Dados salvos com sucesso!',
  deleted: 'Item removido com sucesso!',
  exported: 'Dados exportados com sucesso!',
  imported: 'Dados importados com sucesso!',
  updated: 'Dados atualizados com sucesso!'
} as const;

/**
 * Loading messages
 */
export const LOADING_MESSAGES = {
  saving: 'Salvando...',
  loading: 'Carregando...',
  deleting: 'Removendo...',
  exporting: 'Exportando...',
  importing: 'Importando...',
  updating: 'Atualizando...'
} as const;

/**
 * Feature flags for development
 */
export const FEATURE_FLAGS = {
  enableExport: true,
  enableImport: false,
  enableCharts: true,
  enableNotifications: true,
  enableOfflineMode: false,
  enableAdvancedFilters: false,
  enableRecipes: false,
  enableMealPlanning: false
} as const;

