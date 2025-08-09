import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NutritionInfo } from '@/lib/types';
import { mockAIAnalysis, mockNutritionData } from '@/lib/demo-data';
import stringSimilarity from 'string-similarity';
import { getHealthData, calculateGlycemicLoad } from '@/lib/health-data';
import { foodDatabase } from '@/lib/food-data';

export const runtime = "nodejs";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

// --- SELF-CONTAINED HELPER FUNCTIONS ---
async function getNutritionData(foodName: string): Promise<NutritionInfo | null> {
    const USDA_API_KEY = process.env.USDA_API_KEY;
    if (!USDA_API_KEY) {
        console.warn('USDA API key is missing.');
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
        const carbs = getNutrient(1005) || 0;
        const localHealthData = getHealthData(detailsData.description);
        const glycemicLoad = localHealthData.glycemicIndex ? calculateGlycemicLoad(localHealthData.glycemicIndex, carbs) : undefined;
        const healthImpact: HealthImpact = {
            glycemicIndex: localHealthData.glycemicIndex,
            glycemicLoad: glycemicLoad,
            inflammatoryScore: localHealthData.inflammatoryScore,
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

async function getAIConcepts(imageBuffer: Buffer): Promise<{name: string, confidence: number}[]> {
    const CLARIFAI_API_KEY = process.env.CLARIFAI_API_KEY;
    if (!CLARIFAI_API_KEY) { return []; }
    try {
        const response = await fetch('https://api.clarifai.com/v2/models/food-item-recognition/versions/1d5fd481e0cf4826aa72ec3ff049e044/outputs', {
            method: 'POST',
            headers: { 'Authorization': `Key ${CLARIFAI_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ inputs: [{ data: { image: { base64: imageBuffer.toString('base64') } } }] })
        });
        if (!response.ok) return [];
        const data = await response.json();
        return data.outputs?.[0]?.data?.concepts?.map((c: { name: string, value: number }) => ({ name: c.name, confidence: c.value })) || [];
    } catch (error) {
        console.error('Error in getAIConcepts:', error);
        return [];
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

    let finalFoodItems: string[] = [];
    let identifiedDishName: string = '';
    let source: string = '';

    // --- Deterministic Fusion Engine ---
    console.log('Fusion Engine: Step 1 - High-Confidence Concept Generation...');
    const aiConcepts = await getAIConcepts(imageBuffer);
    const highConfidenceConcepts = aiConcepts
        .filter(c => c.confidence > 0.95)
        .map(c => c.name.toLowerCase());

    if (highConfidenceConcepts.length === 0) {
        throw new Error('Vision model could not identify any high-confidence concepts in the image.');
    }
    
    let bestMatch = { score: 0, item: null as typeof foodDatabase[0] | null };
    foodDatabase.forEach(item => {
        let score = 0;
        const keywords = item.keywords.map(k => k.toLowerCase());
        highConfidenceConcepts.forEach(concept => {
            if (keywords.includes(concept)) {
                score++;
            }
        });
        if (score > bestMatch.score) {
            bestMatch = { score, item };
        }
    });

    if (bestMatch.score > 0 && bestMatch.item) {
        finalFoodItems = bestMatch.item.ingredients;
        identifiedDishName = bestMatch.item.name;
        source = "Sovereign Database";
        console.log(`Tier 1 Success. Matched: "${identifiedDishName}" with score ${bestMatch.score}.`);
    } else {
        console.log('Tier 1 Failed. Falling back to Tier 2: Highest-Confidence AI Concept.');
        identifiedDishName = aiConcepts[0].name;
        finalFoodItems = [identifiedDishName];
        source = "Filtered AI Concept";
    }
    
    const nutritionPromises = finalFoodItems.map(name => getNutritionData(name));
    const nutritionData = (await Promise.all(nutritionPromises)).filter((item): item is NutritionInfo => item !== null);
    
    if (nutritionData.length === 0) {
        throw new Error('Could not retrieve nutrition data for any identified ingredients.');
    }

    let aiAnalysis;
    try {
      const analysisModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const analysisPrompt = `You are a nutritionist. Analyze a meal called "${identifiedDishName}" containing: ${finalFoodItems.join(', ')}. Base your analysis STRICTLY on these components and the provided data: ${JSON.stringify(nutritionData[0])}. Return a valid JSON object with ONLY this structure: {"description": "...", "healthScore": <1-100>, "suggestions": ["...", "...", "..."]}`;
      const result = await analysisModel.generateContent(analysisPrompt);
      aiAnalysis = JSON.parse(result.response.text().replace(/```json/g, '').replace(/```/g, '').trim());
    } catch {
        aiAnalysis = { ...mockAIAnalysis, description: `Analysis for ${identifiedDishName} is unavailable.`};
    }

    const responsePayload = {
        foodItems: [{ name: identifiedDishName, confidence: 1.0, source }],
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

// Define a specific type for healthImpact
interface HealthImpact {
  glycemicIndex?: number;
  glycemicLoad?: number;
  inflammatoryScore?: number;
}