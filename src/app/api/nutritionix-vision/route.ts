import { NextRequest, NextResponse } from 'next/server';

// Type definition for Nutritionix API response
interface NutritionixFood {
  food_name?: string;
  nf_calories?: number;
  nf_protein?: number;
  nf_total_fat?: number;
  nf_total_carbohydrate?: number;
  nf_dietary_fiber?: number;
  nf_sugars?: number;
  nf_sodium?: number;
}

interface NutritionixResponse {
  foods?: NutritionixFood[];
}

const NUTRITIONIX_APP_ID = process.env.NUTRITIONIX_APP_ID;
const NUTRITIONIX_API_KEY = process.env.NUTRITIONIX_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File | null;

    if (!imageFile) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    console.log('🔍 Nutritionix API Request starting...');
    console.log('📊 API Credentials check:', {
      hasAppId: !!NUTRITIONIX_APP_ID,
      hasApiKey: !!NUTRITIONIX_API_KEY,
      appIdLength: NUTRITIONIX_APP_ID?.length,
      keyLength: NUTRITIONIX_API_KEY?.length
    });

    if (!NUTRITIONIX_APP_ID || !NUTRITIONIX_API_KEY) {
      console.warn('⚠️ Nutritionix API credentials missing! Using fallback food detection.');
      // Return fallback detection using OCR or basic analysis
      return NextResponse.json({ 
        foods: [
          { name: 'Food Item', confidence: 0.75, source: 'fallback' }
        ]
      });
    }

    // Nutritionix doesn't have direct image analysis, but we can use the query parameter
    // to analyze the detected food name from other APIs
    const query = formData.get('query') as string;
    const foodQuery = query || 'food item';
    
    console.log('🔍 Using Nutritionix text analysis for:', foodQuery);
    
    try {
      const response = await fetch('https://trackapi.nutritionix.com/v2/natural/nutrients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-app-id': NUTRITIONIX_APP_ID,
          'x-app-key': NUTRITIONIX_API_KEY,
        },
        body: JSON.stringify({
          query: foodQuery,
          timezone: 'US/Eastern'
        })
      });

      if (!response.ok) {
        console.warn('⚠️ Nutritionix API request failed:', response.statusText);
        return NextResponse.json({ 
          foods: [{ name: foodQuery, confidence: 0.6, source: 'nutritionix-fallback' }]
        });
      }

      const data: NutritionixResponse = await response.json();
      console.log('✅ Nutritionix API response received');
      
      const foods = data.foods?.map((food: NutritionixFood) => ({
        name: food.food_name || foodQuery,
        confidence: 0.85,
        source: 'nutritionix',
        nutrition: {
          calories: food.nf_calories,
          protein: food.nf_protein,
          fat: food.nf_total_fat,
          carbs: food.nf_total_carbohydrate
        }
      })) || [];

      return NextResponse.json({ foods });
      
    } catch (error) {
      console.error('❌ Nutritionix API error:', error);
      return NextResponse.json({ 
        foods: [{ name: foodQuery, confidence: 0.6, source: 'nutritionix-error' }]
      });
    }

    // If we had the correct endpoint, this is how it would work:
    // const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
    // // Use text analysis endpoint with detected food name instead
    // const response = await fetch('https://trackapi.nutritionix.com/v2/natural/nutrients', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'x-app-id': NUTRITIONIX_APP_ID,
    //     'x-app-key': NUTRITIONIX_API_KEY,
    //   },
    //   body: JSON.stringify({ query: 'detected food name' })
    // });
  } catch (error) {
    console.error('❌ Error in Nutritionix API route:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
