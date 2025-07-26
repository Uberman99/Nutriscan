import { NextRequest, NextResponse } from 'next/server';

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
      console.error('❌ Nutritionix API credentials missing!');
      return NextResponse.json({ error: 'Nutritionix API credentials not configured' }, { status: 500 });
    }

    // Convert file to base64
    const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
    console.log('🖼️ Image buffer size:', imageBuffer.length, 'bytes');

    // Nutritionix v2 Natural Language API with image (correct current API)
    const nutritionixFormData = new FormData();
    nutritionixFormData.append('photo', imageFile);
    // The API requires a query string in the form data.
    nutritionixFormData.append('query', 'a food item');

    // Dynamically set the query parameter based on detected food items
    const detectedFoodItem = 'example food'; // Replace with actual detected food item
    console.log('🔍 Detected food items:', detectedFoodItem);
    if (!detectedFoodItem || detectedFoodItem.trim() === '') {
      console.error('❌ Detected food item is empty or invalid. Using fallback query parameter.');
      nutritionixFormData.set('query', 'generic food');
    } else {
      nutritionixFormData.set('query', detectedFoodItem);
    }
    console.log('📋 Final Nutritionix Form Data:', Array.from(nutritionixFormData.entries()));

    console.log('📡 Sending request to Nutritionix v2 API...');
    const response = await fetch('https://trackapi.nutritionix.com/v2/natural/nutrients', {
      method: 'POST',
      headers: {
        'x-app-id': NUTRITIONIX_APP_ID,
        'x-app-key': NUTRITIONIX_API_KEY,
      },
      body: nutritionixFormData
    });

    console.log('📨 Nutritionix response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Nutritionix API Error Response:', response.status, errorText);
      throw new Error(`Nutritionix API request failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Nutritionix API Response:', JSON.stringify(data, null, 2));

    // Define a type for the food item from Nutritionix
    interface NutritionixFood {
      food_name: string;
      serving_qty: number;
    }

    // Extract food items and assign a confidence score
    const foods = data.foods?.map((food: NutritionixFood) => ({
      name: food.food_name,
      confidence: food.serving_qty ? 0.9 : 0.85 // Example confidence
    })) || [];

    return NextResponse.json({ foods });
  } catch (error) {
    console.error('❌ Error in Nutritionix API route:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
