// Core data types for NUTRIA MACRO application

import React from 'react';

/**
 * Represents a food item with nutritional information
 */
export interface Food {
  id: string;
  name: string;
  amount?: string;
  category?: string;
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  quantity: number; // grams base for calculations
  unit?: 'g' | 'household';
  householdUnit?: string;
  gramsPerHouseholdUnit?: number;
}

// Substitution group: alternative foods for a meal (not included in totals)
export interface Substitution {
  id: string;
  name: string; // label like "Option 1"
  time?: string;
  description?: string;
  foods: Food[];
  total?: Macros & { quantity?: number };
}

/**
 * Represents a meal containing multiple food items
 */
export interface Meal {
  id: string;
  name: string;
  type?: string;
  emoji?: string;
  foods: Food[];
  substitutions?: Substitution[];
}

/**
 * Basic macronutrient information
 */
export interface Macros {
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  fiber?: number;
}

/**
 * Extended macros with quantity information
 */
export interface CalculatedMacros extends Macros {
  quantity: number;
}

/**
 * Meal with calculated macronutrient totals
 */
export interface MealWithMacros extends Meal {
  macros: CalculatedMacros;
}

/**
 * Navigation link structure
 */
export interface NavLink {
  id: string;
  label: string;
  icon: React.ReactNode;
}

/**
 * Button component props
 */
export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  className?: string;
  title?: string;
}

/**
 * Card component props
 */
export interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  isDarkMode?: boolean;
  className?: string;
  padding?: 'none' | 'small' | 'medium' | 'large';
  shadow?: 'none' | 'small' | 'medium' | 'large' | 'xl';
  onKeyDown?: (event: React.KeyboardEvent) => void;
  tabIndex?: number;
  role?: string;
  'aria-label'?: string;
}

/**
 * Card header props
 */
export interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Card content props
 */
export interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Card footer props
 */
export interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Icon component props
 */
export interface IconProps {
  className?: string;
  size?: number;
}

/**
 * Meal card component props
 */
export interface MealCardProps {
  meal: Meal & { emoji?: string; type?: string };
  onUpdateMeal: (_updatedMeal: Meal) => void;
  onRemoveMeal?: () => void;
  onDuplicateMeal?: () => void;
  isDarkMode?: boolean;
}

/**
 * Macros Summary component props
 */
export interface MacrosSummaryProps {
  dailyMacros: Macros;
  isDarkMode: boolean;
  meals: { [key: string]: Meal };
}

/**
 * Summary section component props
 */
export interface SummarySectionProps {
  meals: { [key: string]: Meal };
  dailyMacros: Macros;
  isDarkMode: boolean;
  onExport?: () => void;
}

/**
 * Meal Builder Section component props
 */
export interface MealBuilderSectionProps {
  meals: { [key: string]: Meal };
  onUpdateMeal: (_mealId: string, _updatedMeal: Meal) => void;
  onRemoveMeal: (_mealId: string) => void;
  isDarkMode: boolean;
  isLoading: boolean;
  onReorderMeals?: (_orderedIds: string[]) => void;
}

/**
 * Header component props
 */
export interface HeaderProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  activeSection: string;
  onSetActiveSection: (_section: string) => void;
  navigationLinks: NavLink[];

}

/**
 * App state interface
 */
export interface AppState {
  meals: { [key: string]: Meal };
  isDarkMode: boolean;
  activeSection: string;
  isLoading: boolean;
  error: string | null;

}

/**
 * Export data structure
 */
export interface ExportData {
  date: string;
  meals: MealWithMacros[];
  totalMacros: Macros;
  summary: {
    totalCalories: number;
    proteinPercentage: number;
    carbsPercentage: number;
    fatsPercentage: number;
  };
}

/**
 * Nutritional summary row for detailed breakdown
 */
export interface NutritionalSummaryRow {
  meal: string;
  protein: number;
  carbs: number;
  fats: number;
  calories: number;
}

/**
 * Theme context type
 */
export interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

/**
 * API response types for future backend integration
 */
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}



/**
 * Meal plan type for future features
 */
export interface MealPlan {
  id: string;
  name: string;
  description?: string;
  meals: Meal[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Food database entry for future features
 */
export interface FoodCatalogEntry {
  id: string;
  name: string;
  brand?: string;
  category: string;
  nutritionPer100g: Macros;
  servingSizes: {
    name: string;
    grams: number;
  }[];
  verified: boolean;
  createdAt: string;
}

/**
 * Component ref types
 */
export type MealCardRef = React.RefObject<HTMLDivElement>;
export type MacrosSummaryRef = React.RefObject<HTMLDivElement>;

/**
 * Event handler types
 */
export type FoodAddHandler = (_mealId: string, _food: Food) => void;
export type FoodRemoveHandler = (_mealId: string, _foodId: string) => void;
export type FoodUpdateHandler = (_mealId: string, _foodId: string, _updates: Partial<Food>) => void;
export type MealUpdateHandler = (_mealId: string, _updates: Partial<Meal>) => void;
export type ExportHandler = (_format: 'json' | 'csv' | 'pdf') => void;

/**
 * Utility types
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Form validation types
 */
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState<T> {
  data: T;
  errors: ValidationError[];
  isValid: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
}

/**
 * Loading states
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Sort options for meals and foods
 */
export type SortOption = 'name' | 'calories' | 'protein' | 'carbs' | 'fats' | 'quantity';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: SortOption;
  direction: SortDirection;
}

/**
 * Filter options
 */
export interface FilterConfig {
  minCalories?: number;
  maxCalories?: number;
  minProtein?: number;
  maxProtein?: number;
  searchTerm?: string;
  categories?: string[];
}

/**
 * Pagination types
 */
export interface PaginationConfig {
  page: number;
  limit: number;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Chart data types for future analytics
 */
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface MacroDistributionData {
  protein: ChartDataPoint;
  carbs: ChartDataPoint;
  fats: ChartDataPoint;
}

/**
 * Notification types
 */
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  actions?: {
    label: string;
    action: () => void;
  }[];
}

/**
 * Settings types for future features
 */
export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  units: 'metric' | 'imperial';
  language: 'pt-BR' | 'en-US' | 'es-ES';
  notifications: {
    email: boolean;
    push: boolean;
    reminders: boolean;
  };
  privacy: {
    shareData: boolean;
    analytics: boolean;
  };
}

/**
 * Recipe types for future features
 */
export interface Recipe {
  id: string;
  name: string;
  description: string;
  instructions: string[];
  ingredients: {
    foodId: string;
    quantity: number;
    unit: string;
  }[];
  servings: number;
  prepTime: number;
  cookTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  nutrition: Macros;
  createdBy: string;
  createdAt: string;
}

/**
 * Supabase foods table row
 * Nutritional data from the foods table with 5668+ records
 */
// Linha da tabela Supabase foods: manter nome reservado para schema externo
export interface FoodDatabase {
  id: string; // converted to string for compatibility
  food_name: string;
  unit?: string;
  portion_grams?: number;
  carbs_g: number;
  protein_g: number;
  fat_g: number;
  fiber_g?: number;
  energy_kcal: number;
  source?: string;
  created_at: string;
}

/**
 * Subset for listing columns we fetch from Supabase foods table
 */
export type FoodListItem = Pick<FoodDatabase, 'id' | 'food_name' | 'carbs_g' | 'protein_g' | 'fat_g' | 'energy_kcal' | 'source'>;

/**
 * Result for portion calculations
 * Values are scaled to the requested grams
 */
export interface PortionResult {
  food_name: string;
  grams: number;
  carbs_g: number;
  protein_g: number;
  fat_g: number;
  energy_kcal: number;
}
