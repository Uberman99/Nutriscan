import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NutritionInfo } from '@/lib/types';
import { mockAIAnalysis } from '@/lib/demo-data';
import stringSimilarity from 'string-similarity';
import { getHealthData, calculateGlycemicLoad } from '@/lib/health-data';
import { foodDatabase } from '@/lib/food-data';

export const runtime = "nodejs";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

// --- SELF-CONTAINED HELPER FUNCTIONS ---
async function getNutritionData(foodName: string): Promise<NutritionInfo | null> {
    const USDA_API_KEY = process.env.USDA_API_KEY;
    if (!USDA_API_KEY) { return null; }
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

        const carbs = getNutrient(1005) || 0;
        const localHealthData = getHealthData(detailsData.description);
        const glycemicLoad = localHealthData.glycemicIndex ? calculateGlycemicLoad(localHealthData.glycemicIndex, carbs) : undefined;
        const healthImpact: any = {
            glycemicIndex: localHealthData.glycemicIndex,
            glycemicLoad: glycemicLoad,
            inflammatoryScore: localHealthData.inflammatoryScore,
            inflammatoryText: 'N/A',
        };

        return {
          food_name: detailsData.description,
          brand_name: detailsData.brandOwner || null,
          serving_qty: 1, serving_unit: detailsData.servingSizeUnit || 'g',
          serving_weight_grams: detailsData.servingSize || 100,
          nf_calories: getNutrient(1008), nf_total_fat: getNutrient(1004),
          nf_saturated_fat: getNutrient(1258), nf_cholesterol: getNutrient(1253),
          nf_sodium: getNutrient(1093), nf_total_carbohydrate: carbs,
          nf_dietary_fiber: getNutrient(1079), nf_sugars: getNutrient(2000),
          nf_protein: getNutrient(1003), nf_potassium: getNutrient(1092),
          nf_p: getNutrient(1091), healthData: healthImpact,
        };
    } catch (error) {
        console.error(`Direct nutrition fetch error for "${foodName}":`, error);
        return null;
    }
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

    let aiSuggestedNames: string[] = [];

    // Step 1: AI as a Recognition Tool
    try {
      console.log('Ground Truth Protocol: AI Recognition Step...');
      const visionModel = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
      const visionPrompt = `Analyze the image and identify the food. Provide a list of possible, common names, from most to least likely. Your response MUST be a valid JSON object with a single key "suggestions", an array of strings. Example: {"suggestions": ["Tuna Sandwich", "Sandwich", "Tuna Salad"]}. Return ONLY the JSON object.`;
      const imagePart = { inlineData: { data: imageBuffer.toString("base64"), mimeType: imageFile.type } };
      const result = await visionModel.generateContent([visionPrompt, imagePart]);
      aiSuggestedNames = JSON.parse(result.response.text().replace(/```json/g, '').replace(/```/g, '').trim()).suggestions || [];
    } catch (e) {
      throw new Error('AI Vision model failed to provide suggestions.');
    }
    
    if (aiSuggestedNames.length === 0) {
        throw new Error('AI Vision model returned no suggestions.');
    }

    // Step 2: Server-Side Deterministic Matching
    const allFoodNamesAndKeywords = foodDatabase.flatMap(food => [food.name, ...food.keywords]);
    const bestMatch = stringSimilarity.findBestMatch(aiSuggestedNames[0], allFoodNamesAndKeywords);
    
    if (bestMatch.bestMatch.rating < 0.4) {
        throw new Error(`Could not find a confident match in the Sovereign Database for suggestion: "${aiSuggestedNames[0]}"`);
    }
    
    const matchedItem = foodDatabase.find(food => food.name === bestMatch.bestMatch.target || food.keywords.includes(bestMatch.bestMatch.target));
    
    if (!matchedItem) {
        throw new Error('Internal error: Matched item not found in database.');
    }

    const finalFoodItems = matchedItem.ingredients;
    const identifiedDishName = matchedItem.name;
    console.log(`Ground Truth Protocol successful. Identified: "${identifiedDishName}". Using ingredients:`, finalFoodItems);
    
    // Step 3: Analysis using Ground Truth Data
    const nutritionPromises = finalFoodItems.map(name => getNutritionData(name));
    const nutritionData = (await Promise.all(nutritionPromises)).filter((item): item is NutritionInfo => item !== null);
    
    if (nutritionData.length === 0) {
        throw new Error('Could not retrieve nutrition data for the verified ingredients.');
    }

    let aiAnalysis;
    try {
      const analysisModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const analysisPrompt = `You are a nutritionist. Analyze a meal called "${identifiedDishName}" with these ingredients: ${finalFoodItems.join(', ')}. The primary item's data is: ${JSON.stringify(nutritionData[0])}. Return a valid JSON object with ONLY this structure: {"description": "...", "healthScore": <1-100>, "suggestions": ["...", "...", "..."]}`;
      const result = await analysisModel.generateContent(analysisPrompt);
      aiAnalysis = JSON.parse(result.response.text().replace(/```json/g, '').replace(/```/g, '').trim());
    } catch (analysisError) {
        aiAnalysis = { ...mockAIAnalysis, description: `Analysis for ${identifiedDishName} is unavailable.`};
    }

    const responsePayload = {
        foodItems: [{ name: identifiedDishName, confidence: 1.0, source: 'Sovereign Database' }],
        aiAnalysis,
        nutritionData,
        priceData: []
    };
    return NextResponse.json(responsePayload);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('CRITICAL ERROR:', errorMessage);
    return NextResponse.json({ error: 'Failed to complete food analysis', details: errorMessage }, { status: 500 });
  }
}