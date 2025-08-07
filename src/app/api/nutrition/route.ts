// src/app/api/nutrition/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { NON_FOOD_ITEMS } from '@/lib/non-food-items';
import stringSimilarity from 'string-similarity';
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
    
    if (!foodName || typeof foodName !== 'string' || foodName.trim() === '') {
      return NextResponse.json({ error: 'No food name provided' }, { status: 400 });
    }

    const cleanedFoodName = foodName.trim().toLowerCase();

    // Robust non-food item check using string-similarity to catch close matches
    const nonFoodList = Array.from(NON_FOOD_ITEMS);
    const { bestMatch } = stringSimilarity.findBestMatch(cleanedFoodName, nonFoodList);
    
    if (bestMatch.rating > 0.85) {
        console.log(`Rejecting non-food item (fuzzy match): "${foodName}" ~ "${bestMatch.target}"`);
        return NextResponse.json({
            error: `'${foodName}' is recognized as a non-food item.`,
        }, { status: 400 });
    }
    
    // If no API key is available, the service is non-functional. Fail immediately.
    if (!USDA_API_KEY) {
      console.error('CRITICAL: USDA_API_KEY is not configured in environment variables.');
      return NextResponse.json({ error: 'Nutrition service is currently unavailable.' }, { status: 503 });
    }

    // --- Proceed with USDA API call ---
    const searchResponse = await fetch(`${USDA_BASE_URL}/foods/search?query=${encodeURIComponent(cleanedFoodName)}&api_key=${USDA_API_KEY}`);
    if (!searchResponse.ok) {
      console.error(`USDA search API error: ${searchResponse.status} ${searchResponse.statusText}`);
      throw new Error(`USDA API is unavailable.`);
    }
    const searchData = await searchResponse.json();

    if (!searchData.foods || searchData.foods.length === 0) {
      return NextResponse.json({ error: `Food '${foodName}' not found in USDA database.` }, { status: 404 });
    }

    const food = searchData.foods[0];
    const fdcId = food.fdcId;

    const detailsResponse = await fetch(`${USDA_BASE_URL}/food/${fdcId}?api_key=${USDA_API_KEY}`);
    if (!detailsResponse.ok) {
        console.error(`USDA details API error: ${detailsResponse.status} ${detailsResponse.statusText}`);
        throw new Error(`Could not retrieve details for FDC ID ${fdcId}.`);
    }
    const detailsData = await detailsResponse.json();

    interface FoodNutrient {
      nutrient: { id: number };
      amount?: number;
    }

    const getNutrientValue = (id: number): number | null => {
      const nutrient = detailsData.foodNutrients?.find((n: FoodNutrient) => n.nutrient.id === id);
      return nutrient?.amount ?? null;
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
      photo: { thumb: food.foodNutrients?.[0]?.photo?.thumb || null },
      healthData: healthImpact,
    };

    return NextResponse.json(nutritionInfo);

  } catch (error) {
    console.error('Nutrition API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to fetch nutrition data', details: errorMessage }, { status: 500 });
  }
}