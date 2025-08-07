// src/app/api/scan-food/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { NON_FOOD_ITEMS } from '@/lib/non-food-items';
import { getHealthData, calculateGlycemicLoad } from '@/lib/health-data';
import { NutritionInfo, HealthImpactData } from '@/lib/types';

// Define types for external API responses
interface ClarifaiConcept {
  name: string;
  value: number; // Confidence score
}

// --- SERVER-SIDE HELPER FUNCTIONS ---

/**
 * Calls the Clarifai API to get food predictions for an image.
 */
async function recognizeFoodWithClarifai(imageBuffer: Buffer): Promise<{ name: string; confidence: number }[]> {
  const apiKey = process.env.CLARIFAI_API_KEY;
  if (!apiKey) {
    console.warn('Clarifai API key not configured. Skipping Clarifai recognition.');
    return [];
  }

  try {
    const response = await fetch(
      'https://api.clarifai.com/v2/models/food-item-recognition/versions/1d5fd481e0cf4826aa72ec3ff049e044/outputs',
      {
        method: 'POST',
        headers: {
          Authorization: `Key ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: [{ data: { image: { base64: imageBuffer.toString('base64') } } }],
        }),
      }
    );

    if (!response.ok) {
      console.error(`Clarifai API error: ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    const concepts: ClarifaiConcept[] = data.outputs?.[0]?.data?.concepts || [];
    
    return concepts.map(c => ({ name: c.name, confidence: c.value }));
  } catch (error) {
    console.error('Error calling Clarifai API:', error);
    return [];
  }
}

/**
 * Fetches nutrition data from the USDA API.
 */
async function fetchNutritionData(foodName: string): Promise<NutritionInfo | null> {
    const USDA_API_KEY = process.env.USDA_API_KEY;
    if (!USDA_API_KEY) {
        console.error('USDA API key is missing.');
        return null;
    }

    try {
        const searchResponse = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(foodName)}&api_key=${USDA_API_KEY}`);
        if (!searchResponse.ok) return null;

        const searchData = await searchResponse.json();
        if (!searchData.foods || searchData.foods.length === 0) return null;

        const food = searchData.foods[0];
        const fdcId = food.fdcId;

        const detailsResponse = await fetch(`https://api.nal.usda.gov/fdc/v1/food/${fdcId}?api_key=${USDA_API_KEY}`);
        if (!detailsResponse.ok) return null;
        
        const detailsData = await detailsResponse.json();

        const getNutrientValue = (id: number): number | null => {
            const nutrient = detailsData.foodNutrients.find((n: any) => n.nutrient.id === id);
            return nutrient ? nutrient.amount : null;
        };

        const carbs = getNutrientValue(1005) || 0;
        const healthData = getHealthData(detailsData.description);
        const glycemicLoad = healthData.glycemicIndex ? calculateGlycemicLoad(healthData.glycemicIndex, carbs) : undefined;
        
        const healthImpact: HealthImpactData = {
          glycemicIndex: healthData.glycemicIndex,
          glycemicLoad: glycemicLoad,
          inflammatoryScore: healthData.inflammatoryScore,
          inflammatoryText: healthData.inflammatoryScore !== undefined ? (healthData.inflammatoryScore < 0 ? 'Anti-inflammatory' : (healthData.inflammatoryScore > 0 ? 'Pro-inflammatory' : 'Neutral')) : 'Unknown'
        };

        return {
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
    } catch (error) {
        console.error(`Failed to fetch nutrition data for "${foodName}":`, error);
        return null;
    }
}


/**
 * Gets AI analysis from Gemini.
 */
async function getAiAnalysis(foodNames: string[]): Promise<any> {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
      console.error('Gemini API key not configured.');
      return {
          description: 'AI analysis is currently unavailable.',
          healthScore: 50,
          suggestions: ['Please configure the Gemini API key.'],
      };
  }
  
  const prompt = `Analyze the following food items: ${foodNames.join(', ')}.\n\nReturn ONLY a JSON object with the following fields: description (string, 1-2 sentences), healthScore (number between 1-100), suggestions (array of 3 short strings with health tips). Example: {\n  \"description\": \"...\",\n  \"healthScore\": 85,\n  \"suggestions\": [\"tip1\", \"tip2\", \"tip3\"]\n}`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API request failed: ${errorText}`);
    }

    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    return JSON.parse(text);
  } catch (error) {
      console.error('Error calling Gemini API:', error);
      return {
          description: 'Failed to generate AI analysis.',
          healthScore: 0,
          suggestions: [],
      };
  }
}

// --- API ROUTE HANDLER ---

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const image = formData.get('image') as File | null;
    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const imageBuffer = Buffer.from(await image.arrayBuffer());

    // Step 1: Recognize food items from the image
    let foodItems = await recognizeFoodWithClarifai(imageBuffer);
    
    // Step 2: Filter out non-food items and low-confidence results
    foodItems = foodItems
      .filter(item => item.confidence > 0.8 && !NON_FOOD_ITEMS.has(item.name.toLowerCase()))
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5); // Limit to top 5 results

    if (foodItems.length === 0) {
        return NextResponse.json({ error: 'No food could be confidently identified. Please try a clearer image.' }, { status: 404 });
    }

    const foodNames = foodItems.map(item => item.name);

    // Step 3: Fetch nutritional data for each identified food item in parallel
    const nutritionPromises = foodNames.map(name => fetchNutritionData(name));
    const nutritionData = (await Promise.all(nutritionPromises)).filter((item): item is NutritionInfo => item !== null);
    
    if (nutritionData.length === 0) {
        return NextResponse.json({ error: 'Could not retrieve nutritional information for the identified items.' }, { status: 404 });
    }

    // Step 4: Get AI-powered health analysis
    const aiAnalysis = await getAiAnalysis(foodNames);

    return NextResponse.json({
      foodItems,
      nutritionData,
      aiAnalysis,
    });

  } catch (error) {
    console.error('Error in /api/scan-food:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to process image', details: message }, { status: 500 });
  }
}