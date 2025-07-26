// src/lib/health-data.ts

export interface HealthData {
  glycemicIndex?: number;
  inflammatoryScore?: number; // Simple score: -1 (anti-inflammatory), 0 (neutral), 1 (pro-inflammatory)
}

// This is a simplified database of health data for common food items.
// In a real-world application, this would come from a comprehensive food database.
export const healthDataDb: { [key: string]: HealthData } = {
  // Fruits
  'apple': { glycemicIndex: 36, inflammatoryScore: -1 },
  'banana': { glycemicIndex: 51, inflammatoryScore: -1 },
  'orange': { glycemicIndex: 43, inflammatoryScore: -1 },
  'strawberry': { glycemicIndex: 40, inflammatoryScore: -1 },
  'grapes': { glycemicIndex: 59, inflammatoryScore: -1 },
  'watermelon': { glycemicIndex: 76, inflammatoryScore: 0 },
  'blueberry': { glycemicIndex: 53, inflammatoryScore: -1 },
  'cherry': { glycemicIndex: 22, inflammatoryScore: -1 },
  'peach': { glycemicIndex: 42, inflammatoryScore: -1 },
  'pear': { glycemicIndex: 38, inflammatoryScore: -1 },
  'mango': { glycemicIndex: 51, inflammatoryScore: -1 },

  // Vegetables
  'broccoli': { glycemicIndex: 15, inflammatoryScore: -1 },
  'carrot': { glycemicIndex: 39, inflammatoryScore: -1 },
  'potato': { glycemicIndex: 78, inflammatoryScore: 1 },
  'sweet potato': { glycemicIndex: 63, inflammatoryScore: -1 },
  'spinach': { glycemicIndex: 15, inflammatoryScore: -1 },
  'tomato': { glycemicIndex: 15, inflammatoryScore: -1 },
  'lettuce': { glycemicIndex: 15, inflammatoryScore: -1 },
  'cucumber': { glycemicIndex: 15, inflammatoryScore: -1 },
  'bell pepper': { glycemicIndex: 15, inflammatoryScore: -1 },
  'onion': { glycemicIndex: 15, inflammatoryScore: 0 },
  'garlic': { glycemicIndex: 10, inflammatoryScore: -1 },
  'kale': { glycemicIndex: 15, inflammatoryScore: -1 },

  // Grains
  'white bread': { glycemicIndex: 75, inflammatoryScore: 1 },
  'whole wheat bread': { glycemicIndex: 51, inflammatoryScore: 0 },
  'white rice': { glycemicIndex: 73, inflammatoryScore: 1 },
  'brown rice': { glycemicIndex: 68, inflammatoryScore: 0 },
  'oats': { glycemicIndex: 55, inflammatoryScore: -1 },
  'quinoa': { glycemicIndex: 53, inflammatoryScore: -1 },
  'pasta': { glycemicIndex: 60, inflammatoryScore: 1 },
  'whole wheat pasta': { glycemicIndex: 48, inflammatoryScore: 0 },
  'corn': { glycemicIndex: 52, inflammatoryScore: 0 },

  // Proteins
  'chicken breast': { glycemicIndex: 0, inflammatoryScore: 0 },
  'salmon': { glycemicIndex: 0, inflammatoryScore: -1 },
  'tuna': { glycemicIndex: 0, inflammatoryScore: -1 },
  'beef': { glycemicIndex: 0, inflammatoryScore: 1 },
  'pork': { glycemicIndex: 0, inflammatoryScore: 1 },
  'eggs': { glycemicIndex: 0, inflammatoryScore: 0 },
  'lentils': { glycemicIndex: 32, inflammatoryScore: -1 },
  'chickpeas': { glycemicIndex: 28, inflammatoryScore: -1 },
  'black beans': { glycemicIndex: 30, inflammatoryScore: -1 },
  'tofu': { glycemicIndex: 15, inflammatoryScore: -1 },

  // Dairy & Alternatives
  'milk': { glycemicIndex: 39, inflammatoryScore: 0 },
  'cheese': { glycemicIndex: 27, inflammatoryScore: 1 },
  'yogurt': { glycemicIndex: 35, inflammatoryScore: -1 },
  'almond milk': { glycemicIndex: 25, inflammatoryScore: -1 },
  'soy milk': { glycemicIndex: 34, inflammatoryScore: -1 },

  // Fats, Nuts & Seeds
  'olive oil': { glycemicIndex: 0, inflammatoryScore: -1 },
  'butter': { glycemicIndex: 0, inflammatoryScore: 1 },
  'avocado': { glycemicIndex: 15, inflammatoryScore: -1 },
  'almonds': { glycemicIndex: 15, inflammatoryScore: -1 },
  'walnuts': { glycemicIndex: 15, inflammatoryScore: -1 },
  'chia seeds': { glycemicIndex: 1, inflammatoryScore: -1 },
  'flax seeds': { glycemicIndex: 0, inflammatoryScore: -1 },

  // Sugary & Processed Foods
  'cake': { glycemicIndex: 70, inflammatoryScore: 1 },
  'pizza': { glycemicIndex: 80, inflammatoryScore: 1 },
  'soda': { glycemicIndex: 63, inflammatoryScore: 1 },
  'french fries': { glycemicIndex: 75, inflammatoryScore: 1 },
  'samosa': { glycemicIndex: 60, inflammatoryScore: 1 },
  'cookie': { glycemicIndex: 64, inflammatoryScore: 1 },
  'ice cream': { glycemicIndex: 57, inflammatoryScore: 1 },
  'chocolate': { glycemicIndex: 45, inflammatoryScore: 0 },
  'potato chips': { glycemicIndex: 56, inflammatoryScore: 1 },
};

/**
 * Calculates the estimated Glycemic Load for a food item.
 * GL = (GI * Grams of Carbs) / 100
 */
export function calculateGlycemicLoad(gi: number, carbs: number): number {
  if (carbs === 0) return 0;
  return Math.round((gi * carbs) / 100);
}

/**
 * Estimates the health data for a given food item by looking up keywords.
 * It prioritizes longer, more specific keywords.
 */
export function getHealthData(foodName: string): HealthData {
  const foodLower = foodName.toLowerCase();
  const keywords = Object.keys(healthDataDb).sort((a, b) => b.length - a.length); // Prioritize longer keys

  const foundKeyword = keywords.find(keyword => foodLower.includes(keyword));

  if (foundKeyword) {
    return healthDataDb[foundKeyword];
  }

  // Default for unknown foods
  return {
    glycemicIndex: 50, // Neutral GI
    inflammatoryScore: 0, // Neutral score
  };
}
