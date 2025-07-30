import { NextRequest, NextResponse } from 'next/server';
import { mockNutritionData } from '@/lib/demo-data';
import { NON_FOOD_ITEMS } from '@/lib/non-food-items';
<<<<<<< HEAD
import stringSimilarity from 'string-similarity';
=======
>>>>>>> 248da69a8d9281c86ca4da4f6f5c83429d127f98
import { getHealthData, calculateGlycemicLoad } from '@/lib/health-data';
import { NutritionInfo, HealthImpactData } from '@/lib/types';

const USDA_API_KEY = process.env.USDA_API_KEY;
const USDA_BASE_URL = 'https://api.nal.usda.gov/fdc/v1';

function getInflammatoryText(score?: number): string {
  if (score === undefined) return 'Unknown';
  if (score < 0) return 'Anti-inflammatory';
  if (score > 0) return 'Pro-inflammatory';
  return 'Neutral';
}

export async function POST(request: NextRequest) {
  try {
    const { foodName } = await request.json();
    
    if (!foodName) {
      return NextResponse.json({ error: 'No food name provided' }, { status: 400 });
    }

    console.log(`Checking foodName against NON_FOOD_ITEMS: "${foodName.toLowerCase()}"`);

<<<<<<< HEAD
    // Robust non-food item check using string-similarity
    const nonFoodList = Array.from(NON_FOOD_ITEMS);
    const { bestMatch } = stringSimilarity.findBestMatch(foodName.toLowerCase(), nonFoodList);
    if (bestMatch.rating > 0.85) {
        console.log(`Rejecting non-food item from nutrition search (fuzzy match): "${foodName}" ~ "${bestMatch.target}"`);
=======
    // First, check if the item is a known non-food item.
    if (NON_FOOD_ITEMS.has(foodName.toLowerCase())) {
        console.log(`Rejecting non-food item from nutrition search: "${foodName}"`);
>>>>>>> 248da69a8d9281c86ca4da4f6f5c83429d127f98
        return NextResponse.json({
            food_name: foodName,
            nutrients: [],
            nf_calories: 0,
            message: 'This is not a food item.'
        });
    }
    
<<<<<<< HEAD
    // If no API key is available, fail in production, else use mock data in development
    if (!USDA_API_KEY) {
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'USDA API key is missing. Nutrition endpoint not available.' }, { status: 501 });
      }
      // ...existing code for mock data and generic fallback...
      const lowerFoodName = foodName.toLowerCase();
      const mockDataKey = Object.keys(mockNutritionData).find(key => key.toLowerCase() === lowerFoodName);
      const mockData = mockDataKey ? mockNutritionData[mockDataKey as keyof typeof mockNutritionData] : undefined;
      if (mockData) {
        // ...existing code for mockData...
      }
      // ...existing code for generic fallback...
=======
    // If no API key is available, use mock data
    if (!USDA_API_KEY) {
      console.warn('USDA API key is missing. Using mock data for USDA Nutrition API');
      
      const lowerFoodName = foodName.toLowerCase();
      const mockDataKey = Object.keys(mockNutritionData).find(key => key.toLowerCase() === lowerFoodName);
      const mockData = mockDataKey ? mockNutritionData[mockDataKey as keyof typeof mockNutritionData] : undefined;

      if (mockData) {
        // Define a base type for what we need to access to avoid using 'any'
        interface BaseMockData {
            foodName: string;
            calories: number;
            macronutrients?: { name: string; amount: number; unit: string }[];
            exactPortion?: { unit: string; weight: number };
            dataSource?: string;
        }
        const safeMockData = mockData as BaseMockData;

        interface Nutrient { name: string; amount: number; unit: string; }

        const getNutrient = (name: string) => {
            if (safeMockData.macronutrients) {
                return safeMockData.macronutrients.find((n: Nutrient) => n.name.toLowerCase().includes(name.toLowerCase()));
            }
            return undefined;
        }
        
        const carbsNutrient = getNutrient('carbohydrate');
        const carbs = carbsNutrient ? carbsNutrient.amount : 0;

        const healthData = getHealthData(safeMockData.foodName);
        const glycemicLoad = healthData.glycemicIndex ? calculateGlycemicLoad(healthData.glycemicIndex, carbs) : undefined;

        const healthImpact: HealthImpactData = {
          glycemicIndex: healthData.glycemicIndex,
          glycemicLoad: glycemicLoad,
          inflammatoryScore: healthData.inflammatoryScore,
          inflammatoryText: getInflammatoryText(healthData.inflammatoryScore),
        };

        const nutritionInfo: NutritionInfo = {
          food_name: safeMockData.foodName,
          brand_name: safeMockData.dataSource || 'MockData',
          serving_qty: 1,
          serving_unit: safeMockData.exactPortion?.unit || 'serving',
          serving_weight_grams: safeMockData.exactPortion?.weight || 100,
          nf_calories: safeMockData.calories,
          nf_total_fat: getNutrient('fat')?.amount || null,
          nf_saturated_fat: getNutrient('saturated fat')?.amount || null,
          nf_cholesterol: null,
          nf_sodium: getNutrient('sodium')?.amount || null,
          nf_total_carbohydrate: carbs,
          nf_dietary_fiber: getNutrient('fiber')?.amount || null,
          nf_sugars: getNutrient('sugars')?.amount || null,
          nf_protein: getNutrient('protein')?.amount || null,
          nf_potassium: null,
          nf_p: null,
          healthData: healthImpact,
        };
        
        return NextResponse.json(nutritionInfo);
      }
      
      // Fallback for generic terms if no specific mock data is found
      const genericTerms = ['food item', 'mixed meal', 'prepared meal', 'object', 'thing'];
      if (genericTerms.some(term => lowerFoodName.includes(term))) {
        const genericData = {
          food_name: 'Mixed Food Item',
          nf_calories: 250,
          nf_protein: 12.0,
          nf_total_fat: 8.5,
          nf_total_carbohydrate: 35.0,
          nf_dietary_fiber: 4.2,
          nf_sugars: 8.5,
          nf_sodium: 450,
          serving_unit: 'serving',
          serving_qty: 1,
          serving_weight_grams: 200,
          brand_name: null,
          nf_saturated_fat: null,
          nf_cholesterol: null,
          nf_potassium: null,
          nf_p: null,
        };
        const healthData = getHealthData(genericData.food_name);
        const carbs = genericData.nf_total_carbohydrate || 0;
        const glycemicLoad = healthData.glycemicIndex ? calculateGlycemicLoad(healthData.glycemicIndex, carbs) : undefined;
        
        const healthImpact: HealthImpactData = {
          glycemicIndex: healthData.glycemicIndex,
          glycemicLoad: glycemicLoad,
          inflammatoryScore: healthData.inflammatoryScore,
          inflammatoryText: getInflammatoryText(healthData.inflammatoryScore),
        };

        const nutritionInfo: NutritionInfo = {
          ...genericData,
          healthData: healthImpact,
        };

        return NextResponse.json(nutritionInfo);
      }
      
      return NextResponse.json({ error: `No mock data found for "${foodName}"` }, { status: 404 });
>>>>>>> 248da69a8d9281c86ca4da4f6f5c83429d127f98
    }

    // If API key is present, proceed with USDA API call
    const searchResponse = await fetch(`${USDA_BASE_URL}/foods/search?query=${encodeURIComponent(foodName)}&api_key=${USDA_API_KEY}`);
    if (!searchResponse.ok) {
      throw new Error(`USDA API error for food search: ${searchResponse.statusText}`);
    }
    const searchData = await searchResponse.json();

    if (!searchData.foods || searchData.foods.length === 0) {
      return NextResponse.json({ error: 'Food not found in USDA database' }, { status: 404 });
    }

    const food = searchData.foods[0];
    const fdcId = food.fdcId;

    const detailsResponse = await fetch(`${USDA_BASE_URL}/food/${fdcId}?api_key=${USDA_API_KEY}`);
    if (!detailsResponse.ok) {
      throw new Error(`USDA API error for food details: ${detailsResponse.statusText}`);
    }
    const detailsData = await detailsResponse.json();

    interface FoodNutrient {
      nutrient: { id: number };
      amount: number;
    }

    const getNutrientValue = (id: number) => {
<<<<<<< HEAD
      const nutrients = detailsData.foodNutrients;
      if (!Array.isArray(nutrients)) return null;
      const nutrient = nutrients.find((n: FoodNutrient) => n.nutrient.id === id);
=======
      const nutrient = detailsData.foodNutrients.find((n: FoodNutrient) => n.nutrient.id === id);
>>>>>>> 248da69a8d9281c86ca4da4f6f5c83429d127f98
      return nutrient ? nutrient.amount : null;
    };

    const carbs = getNutrientValue(1005) || 0;
    const healthData = getHealthData(detailsData.description);
    const glycemicLoad = healthData.glycemicIndex ? calculateGlycemicLoad(healthData.glycemicIndex, carbs) : undefined;

    const healthImpact: HealthImpactData = {
      glycemicIndex: healthData.glycemicIndex,
      glycemicLoad: glycemicLoad,
      inflammatoryScore: healthData.inflammatoryScore,
      inflammatoryText: getInflammatoryText(healthData.inflammatoryScore),
    };

    const nutritionInfo: NutritionInfo = {
      food_name: detailsData.description,
      brand_name: detailsData.brandOwner || null,
      serving_qty: 1,
      serving_unit: detailsData.servingSizeUnit || 'g',
      serving_weight_grams: detailsData.servingSize || 100,
      nf_calories: getNutrientValue(1008),
      nf_total_fat: getNutrientValue(1004),
      nf_saturated_fat: getNutrientValue(1258),
      nf_cholesterol: getNutrientValue(1253),
      nf_sodium: getNutrientValue(1093),
      nf_total_carbohydrate: carbs,
      nf_dietary_fiber: getNutrientValue(1079),
      nf_sugars: getNutrientValue(2000),
      nf_protein: getNutrientValue(1003),
      nf_potassium: getNutrientValue(1092),
      nf_p: getNutrientValue(1091),
      healthData: healthImpact,
    };

    return NextResponse.json(nutritionInfo);

  } catch (error) {
    console.error('Nutrition API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to fetch nutrition data', details: errorMessage }, { status: 500 });
  }
}
