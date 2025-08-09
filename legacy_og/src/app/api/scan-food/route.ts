import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { filterFoodItems } from '@/lib/non-food-items';
import { NutritionInfo } from '@/lib/types';
import { mockAIAnalysis, mockNutritionData } from '@/lib/demo-data';
import stringSimilarity from 'string-similarity';

export const runtime = "nodejs";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

// --- DIRECT NUTRITION LOGIC ---
async function getNutritionData(foodName: string): Promise<NutritionInfo | null> {
    const USDA_API_KEY = process.env.USDA_API_KEY;
    if (!USDA_API_KEY) {
        console.warn('USDA API key is missing. Cannot perform live nutrition lookup.');
        return null;
    }
    try {
        const searchResponse = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(foodName)}&api_key=${USDA_API_KEY}`);
        if (!searchResponse.ok) return null;
        const searchData = await searchResponse.json();
        if (!searchData.foods || searchData.foods.length === 0) return null;

        const food = searchData.foods[0];
        const detailsResponse = await fetch(`https://api.nal.usda.gov/fdc/v1/food/${food.fdcId}?api_key=${USDA_API_KEY}`);
        if (!detailsResponse.ok) return null;
        const detailsData = await detailsResponse.json();
        
        const getNutrient = (id: number) => detailsData.foodNutrients.find((n: { nutrient: { id: number; }; }) => n.nutrient.id === id)?.amount || null;

        return {
          food_name: detailsData.description,
          brand_name: detailsData.brandOwner || null,
          serving_qty: 1,
          serving_unit: detailsData.servingSizeUnit || 'g',
          serving_weight_grams: detailsData.servingSize || 100,
          nf_calories: getNutrient(1008),
          nf_total_fat: getNutrient(1004),
          nf_saturated_fat: getNutrient(1258),
          nf_cholesterol: getNutrient(1253),
          nf_sodium: getNutrient(1093),
          nf_total_carbohydrate: getNutrient(1005),
          nf_dietary_fiber: getNutrient(1079),
          nf_sugars: getNutrient(2000),
          nf_protein: getNutrient(1003),
          nf_potassium: getNutrient(1092),
          nf_p: getNutrient(1091),
        };
    } catch (error) {
        console.error(`Direct nutrition fetch error for "${foodName}":`, error);
        return null;
    }
}

async function getClarifaiVisionData(imageBuffer: Buffer): Promise<string[]> {
    const CLARIFAI_API_KEY = process.env.CLARIFAI_API_KEY;
    if (!CLARIFAI_API_KEY) {
        console.warn('Clarifai API key missing, cannot use as fallback.');
        return [];
    }
    const response = await fetch(
      'https://api.clarifai.com/v2/models/food-item-recognition/versions/1d5fd481e0cf4826aa72ec3ff049e044/outputs',
      {
        method: 'POST',
        headers: { 'Authorization': `Key ${CLARIFAI_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs: [{ data: { image: { base64: imageBuffer.toString('base64') } } }] })
      }
    );
    if (!response.ok) {
        console.error('Clarifai API fallback failed:', response.statusText);
        return [];
    }
    const data = await response.json();
    // CORRECTED: Replaced 'any' with a specific type for the concept object
    return data.outputs?.[0]?.data?.concepts?.map((c: { name: string }) => c.name) || [];
}

// --- MAIN API ENDPOINT ---
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File | null;

    if (!imageFile) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }
    const imageBuffer = Buffer.from(await imageFile.arrayBuffer());

    let rawFoodItems: string[] = [];

    // --- VISION ANALYSIS with FALLBACK ---
    try {
      console.log('Attempting primary vision analysis with Gemini...');
      const visionModel = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
      const visionPrompt = `Analyze the image. Identify every ingredient. Your response MUST be a valid JSON object with a single key "foods", an array of strings. Be granular. For a burger, output ["bun", "patty", "cheese", "lettuce"]. Return ONLY the JSON.`;
      const imagePart = { inlineData: { data: imageBuffer.toString("base64"), mimeType: imageFile.type } };
      const visionResult = await visionModel.generateContent([visionPrompt, imagePart]);
      const visionResponseText = visionResult.response.text();
      const cleanedVisionText = visionResponseText.replace(/```json/g, '').replace(/```/g, '').trim();
      rawFoodItems = JSON.parse(cleanedVisionText).foods || [];
      console.log('Gemini Vision successful.');
    } catch (geminiError) {
      console.warn('Gemini Vision failed. Triggering fallback to Clarifai.', geminiError);
      rawFoodItems = await getClarifaiVisionData(imageBuffer);
    }

    if (rawFoodItems.length === 0) {
      throw new Error('All vision models failed to identify any food items.');
    }

    const finalFoodItems = filterFoodItems(rawFoodItems);
    if (finalFoodItems.length === 0) {
      throw new Error('No valid food items were detected after filtering.');
    }

    const nutritionPromises = finalFoodItems.slice(0, 3).map(name => getNutritionData(name));
    let nutritionData = (await Promise.all(nutritionPromises)).filter((item): item is NutritionInfo => item !== null);
    
    if (nutritionData.length === 0) {
        console.warn("Live nutrition lookup failed. Using intelligent mock data fallback.");
        const mockDataKeys = Object.keys(mockNutritionData);
        const bestMatch = stringSimilarity.findBestMatch(finalFoodItems[0].toLowerCase(), mockDataKeys);
        if (bestMatch.bestMatch.rating > 0.5) {
            const mockKey = bestMatch.bestMatch.target as keyof typeof mockNutritionData;
            const mock = mockNutritionData[mockKey];
            if(mock) {
                nutritionData = [mock as unknown as NutritionInfo];
            }
        }
    }
    
    if (nutritionData.length === 0) {
        throw new Error('Could not retrieve any nutrition data for the detected items.');
    }

    let aiAnalysis;
    try {
      console.log('Attempting primary health analysis with Gemini...');
      const analysisModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const analysisPrompt = `You are a world-class nutritionist. Analyze these meal components: ${finalFoodItems.join(', ')}. The primary item's data is: ${JSON.stringify(nutritionData[0])}. Return a valid JSON object with ONLY this structure: {"description": "...", "healthScore": <1-100>, "suggestions": ["...", "...", "..."]}`;
      const analysisResult = await analysisModel.generateContent(analysisPrompt);
      const analysisResponseText = analysisResult.response.text();
      const cleanedAnalysisText = analysisResponseText.replace(/```json/g, '').replace(/```/g, '').trim();
      aiAnalysis = JSON.parse(cleanedAnalysisText);
      console.log('Gemini Health Analysis successful.');
    } catch (analysisError) {
        console.warn('Gemini Health Analysis failed. Using mock analysis as fallback.', analysisError);
        aiAnalysis = {
            ...mockAIAnalysis,
            description: `This meal appears to be ${finalFoodItems.join(', ')}. A detailed AI analysis is currently unavailable.`,
        };
    }

    const responsePayload = {
        foodItems: finalFoodItems.map(name => ({ name, confidence: 0.9, source: 'Sovereign Engine' })),
        aiAnalysis,
        nutritionData,
        priceData: []
    };
    return NextResponse.json(responsePayload);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('CRITICAL ERROR in unified scan-food API route:', errorMessage);
    return NextResponse.json({ error: 'Failed to complete food analysis', details: errorMessage }, { status: 500 });
  }
}