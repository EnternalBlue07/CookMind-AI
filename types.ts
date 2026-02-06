export interface Ingredient {
  name: string;
  quantity: string;
  isMandatory: boolean;
  substitute?: string;
  inInventory?: boolean; // UI state
  estimatedCost?: string; // e.g., "₹40"
}

export interface CookingStep {
  stepNumber: number;
  instruction: string;
  timerSeconds?: number;
  tip?: string; // AI Coach tip
}

export interface NutritionData {
  calories: number;
  protein: string;
  carbs: string;
  fats: string;
  healthLabel: string; // e.g., "High Protein", "Keto Friendly"
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  prepTime: string;
  cookTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  servings: number;
  ingredients: Ingredient[];
  steps: CookingStep[];
  nutrition: NutritionData;
  costEstimate: string; // e.g., "₹150 - ₹200"
  regionalStyle?: string; // e.g., "Punjabi Dhaba Style"
  tips?: string[]; // Chef's tips or variations
}

export enum AppView {
  HOME = 'HOME',
  ANALYSIS = 'ANALYSIS',
  COOKING = 'COOKING',
  INVENTORY = 'INVENTORY',
  PROFILE = 'PROFILE'
}

export interface UserContext {
  dietaryRestrictions: string[];
  spiceLevel: 'Low' | 'Medium' | 'High';
  goal: 'Healthy' | 'Comfort' | 'Budget' | 'Quick';
}