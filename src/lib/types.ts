// src/lib/types.ts
export interface NutritionInfo {
  food_name: string;
  brand_name: string | null;
  serving_qty: number;
  serving_unit: string;
  serving_weight_grams: number | null;
  nf_calories: number | null;
  nf_total_fat: number | null;
  nf_saturated_fat: number | null;
  nf_cholesterol: number | null;
  nf_sodium: number | null;
  nf_total_carbohydrate: number | null;
  nf_dietary_fiber: number | null;
  nf_sugars: number | null;
  nf_protein: number | null;
  nf_potassium: number | null;
  nf_p: number | null;
  photo?: { thumb: string; };
  healthData?: HealthImpactData;
}
export interface HealthImpactData {
  glycemicIndex?: number;
  glycemicLoad?: number;
  inflammatoryScore?: number;
  inflammatoryText?: string;
}
export interface MealLog {
  id: string;
  userId: string;
  date: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  mealName: string;
  foods: NutritionInfo[];
  createdAt: Date;
}

// New type for the Sovereign Database
export interface FoodItem {
  name: string;
  ingredients: string[];
  keywords: string[];
}