import { NextRequest, NextResponse } from 'next/server';
import { mockNutritionData } from '@/lib/demo-data';
import { NON_FOOD_ITEMS } from '@/lib/non-food-items';
import { getHealthData, calculateGlycemicLoad } from '@/lib/health-data';
import { NutritionInfo, HealthImpactData } from '@/lib/types';
import stringSimilarity from 'string-similarity';

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

    // Robust non-food item check using string similarity
    const nonFoodList = Array.from(NON_FOOD_ITEMS);
    const { bestMatch } = stringSimilarity.findBestMatch(foodName.toLowerCase(), nonFoodList);

    if (bestMatch.rating > 0.85) { // High confidence non-food match
        console.log(`Rejecting non-food item from nutrition search (fuzzy match): "${foodName}" ~ "${bestMatch.target}"`);
        return NextResponse.json({
            food_name: foodName,
            nutrients: [],
            nf_calories: 0,
            message: 'This is not a food item.'
        }, { status: 404 });
    }
    
    // If no API key is available, use mock data. This is a fallback for local dev.
    if (!USDA_API_KEY) {
      console.warn('USDA API key is missing. Using mock data for USDA Nutrition API');
      const lowerFoodName = foodName.toLowerCase();
      const mockDataKey = Object.keys(mockNutritionData).find(key => key.toLowerCase() === lowerFoodName);
      const mockData = mockDataKey ? mockNutritionData[mockDataKey as keyof typeof mockNutritionData] : undefined;
      
      if (mockData) {
        // This section will now correctly process mock data when the API key is absent.
        return NextResponse.json(mockData);
      }
      return NextResponse.json({ error: `No mock data found for "${foodName}" and API key is missing.` }, { status: 404 });
    }

    // --- Live USDA API Call Logic ---
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

    const getNutrientValue = (id: number) => {
      const nutrient = detailsData.foodNutrients.find((n: { nutrient: { id: number } }) => n.nutrient.id === id);
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
      nf_sugars: getNutrientValue(2000), // Note: This ID represents total sugars.
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