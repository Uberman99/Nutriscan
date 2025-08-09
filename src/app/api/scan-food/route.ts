import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NutritionInfo } from '@/lib/types';
import stringSimilarity from 'string-similarity';
import { getHealthData, calculateGlycemicLoad } from '@/lib/health-data';

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
        // Define a type for healthImpact
        interface HealthImpact {
            glycemicIndex?: number;
            glycemicLoad?: number;
            inflammatoryScore?: number;
        }

        // Update the type of healthImpact
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

async function getClarifaiConcepts(imageBuffer: Buffer): Promise<string[]> {
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
        return data.outputs?.[0]?.data?.concepts?.map((c: { name: string }) => c.name) || [];
    } catch (error) {
        console.error('Error in getClarifaiConcepts:', error);
        return [];
    }
}

// Helper function to fetch nutrition data from Nutritionix API
async function getNutritionixData(foodName: string): Promise<NutritionInfo | null> {
    const NUTRITIONIX_APP_ID = process.env.NUTRITIONIX_APP_ID;
    const NUTRITIONIX_API_KEY = process.env.NUTRITIONIX_API_KEY;

    if (!NUTRITIONIX_APP_ID || !NUTRITIONIX_API_KEY) {
        console.warn('Nutritionix API credentials are missing.');
        return null;
    }

    try {
        const response = await fetch(`https://trackapi.nutritionix.com/v2/natural/nutrients`, {
            method: 'POST',
            headers: {
                'x-app-id': NUTRITIONIX_APP_ID,
                'x-app-key': NUTRITIONIX_API_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: foodName }),
        });

        if (!response.ok) return null;
        const data = await response.json();
        const food = data.foods?.[0];
        if (!food) return null;

        return {
            food_name: food.food_name,
            brand_name: food.brand_name || null,
            serving_qty: food.serving_qty,
            serving_unit: food.serving_unit,
            serving_weight_grams: food.serving_weight_grams,
            nf_calories: food.nf_calories,
            nf_total_fat: food.nf_total_fat,
            nf_saturated_fat: food.nf_saturated_fat,
            nf_cholesterol: food.nf_cholesterol,
            nf_sodium: food.nf_sodium,
            nf_total_carbohydrate: food.nf_total_carbohydrate,
            nf_dietary_fiber: food.nf_dietary_fiber,
            nf_sugars: food.nf_sugars,
            nf_protein: food.nf_protein,
            nf_potassium: food.nf_potassium,
            nf_p: null, // Nutritionix does not provide phosphorus data
            healthData: {
                glycemicIndex: undefined, // Nutritionix does not provide glycemic index
                glycemicLoad: undefined, // Nutritionix does not provide glycemic load
                inflammatoryScore: undefined, // Placeholder for future data
            },
        };
    } catch (error) {
        console.error(`Error fetching Nutritionix data for "${foodName}":`, error);
        return null;
    }
}

// --- MAIN API ENDPOINT ---
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File | null;
    if (!imageFile) {
      console.error('No image file provided in the request.');
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }
    console.log('Image file received:', {
      name: imageFile.name,
      size: imageFile.size,
      type: imageFile.type,
    });
    const imageBuffer = Buffer.from(await imageFile.arrayBuffer());

    let identifiedDishName = '';
    let finalFoodItems: string[] = [];
    let source = '';
    let aiAnalysis;

    // --- TIER 1: GEMINI HIGH-FIDELITY ANALYSIS ---
    try {
        console.log('Fusion Engine: Attempting Tier 1 (Gemini)...');
        const visionModel = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
        const visionPrompt = `Analyze the image and identify the food. Provide a list of possible, common names, from most to least likely. Your response MUST be a valid JSON object with a single key "suggestions", an array of strings. Example: {"suggestions": ["Tuna Sandwich", "Sandwich", "Tuna Salad"]}. Return ONLY the JSON object.`;
        const imagePart = { inlineData: { data: imageBuffer.toString("base64"), mimeType: imageFile.type } };
        const visionResult = await visionModel.generateContent([visionPrompt, imagePart]);
        finalFoodItems = JSON.parse(visionResult.response.text().replace(/```json/g, '').replace(/```/g, '').trim()).suggestions || [];
        
        if (finalFoodItems.length > 0) {
            identifiedDishName = finalFoodItems[0];
            source = "Gemini Vision";
            const analysisModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const analysisPrompt = `You are a nutritionist. Analyze a meal called "${identifiedDishName}" with these components: ${finalFoodItems.join(', ')}. Return a valid JSON object with ONLY this structure: {"description": "...", "healthScore": <1-100>, "suggestions": ["...", "...", "..."]}`;
            const analysisResult = await analysisModel.generateContent(analysisPrompt);
            aiAnalysis = JSON.parse(analysisResult.response.text().replace(/```json/g, '').replace(/```/g, '').trim());
            console.log('Tier 1 Success.');
        } else {
            throw new Error("Gemini returned no suggestions.");
        }
    } catch (e) {
        console.warn('Gemini API failed or is unavailable. Proceeding without Gemini.', e);
        finalFoodItems = []; // Reset for fallback
    }

    // --- TIER 2: CLARIFAI + FOOD DATABASE FALLBACK ---
    if (finalFoodItems.length === 0) {
        const clarifaiConcepts = await getClarifaiConcepts(imageBuffer);
        if (clarifaiConcepts.length > 0) {
            const allFoodData = await fetchFoodData();
            const allFoodKeywords = allFoodData.flatMap(food => [food.name, ...food.keywords]);

            if (allFoodKeywords.length > 0) {
                const bestMatch = stringSimilarity.findBestMatch(clarifaiConcepts[0], allFoodKeywords);
                if (bestMatch.bestMatch.rating > 0.6) {
                    const matchedItem = allFoodData.find(food => food.name === bestMatch.bestMatch.target || food.keywords.includes(bestMatch.bestMatch.target));
                    if (matchedItem) {
                        identifiedDishName = matchedItem.name;
                        finalFoodItems = matchedItem.ingredients;
                        source = "API Database Match";
                    }
                } else {
                    identifiedDishName = clarifaiConcepts[0];
                    finalFoodItems = clarifaiConcepts;
                    source = "Clarifai Vision";
                }
            } else {
                console.warn('No food keywords available. Using fallback data.');
                identifiedDishName = clarifaiConcepts[0];
                finalFoodItems = clarifaiConcepts;
                source = "Clarifai Vision";
            }
        } else {
            console.warn('Clarifai API failed. Using fallback data.');
            identifiedDishName = 'Unknown Food';
            finalFoodItems = ['Unknown Ingredient'];
            source = "Fallback";
        }
    }

    console.log('Final food items identified:', finalFoodItems);

    // --- NUTRITION & ANALYSIS ---
    const nutritionPromises = finalFoodItems.slice(0, 5).map(async (name) => {
        try {
            const [usdaData, nutritionixData] = await Promise.all([
                getNutritionData(name),
                getNutritionixData(name),
            ]);

            if (usdaData && nutritionixData) {
                console.log(`Merging USDA and Nutritionix data for: ${name}`);
                return {
                    ...nutritionixData,
                    ...usdaData,
                    healthData: {
                        ...nutritionixData.healthData,
                        ...usdaData.healthData,
                    },
                };
            }

            if (usdaData) {
                console.log(`Using USDA data for: ${name}`);
                return usdaData;
            }

            if (nutritionixData) {
                console.log(`Using Nutritionix data for: ${name}`);
                return nutritionixData;
            }

            console.warn(`Both USDA and Nutritionix APIs failed for: ${name}. Falling back to null.`);
            return null; // Fallback to null if both APIs fail
        } catch (error) {
            console.error(`Error processing nutrition data for: ${name}`, error);
            return null;
        }
    });

    const nutritionData = (await Promise.all(nutritionPromises)).filter((item): item is NutritionInfo => item !== null);

    if (nutritionData.length === 0) {
        console.warn('Both USDA and Nutritionix APIs failed for all items. Using mock nutrition data.');
        nutritionData.push({
            food_name: identifiedDishName,
            brand_name: null, // Default value for brand_name
            serving_qty: 1,
            serving_unit: 'g',
            serving_weight_grams: 100,
            nf_calories: 100,
            nf_total_fat: 0,
            nf_saturated_fat: 0,
            nf_cholesterol: 0,
            nf_sodium: 0,
            nf_total_carbohydrate: 25,
            nf_dietary_fiber: 2,
            nf_sugars: 5,
            nf_protein: 2,
            nf_potassium: 200,
            nf_p: 50,
            healthData: {
                glycemicIndex: 50,
                glycemicLoad: 10,
                inflammatoryScore: 0,
            },
        });
    }

    console.log('Final nutrition data:', nutritionData);

    // Use mock analysis if it wasn't generated in Tier 1
    if (!aiAnalysis) {
        aiAnalysis = { description: `A detailed AI analysis for "${identifiedDishName}" is currently unavailable.`, healthScore: 50, suggestions: [] };
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

async function fetchFoodData(): Promise<{ name: string; keywords: string[]; ingredients: string[] }[]> {
    const API_URL = process.env.FOOD_API_URL;
    if (!API_URL) {
        console.warn('Food API URL is missing. Using mock data for development.');
        return [
            { name: 'Pizza', keywords: ['pizza', 'cheese', 'italian'], ingredients: ['Dough', 'Cheese', 'Tomato Sauce'] },
            { name: 'Sushi', keywords: ['sushi', 'fish', 'japanese'], ingredients: ['Rice', 'Nori', 'Fish'] },
            { name: 'Salad', keywords: ['salad', 'vegetable', 'healthy'], ingredients: ['Lettuce', 'Tomato', 'Cucumber'] },
        ];
    }
    try {
        const response = await fetch(`${API_URL}/foods`);
        if (!response.ok) return [];
        return await response.json();
    } catch (error) {
        console.error('Error fetching food data:', error);
        return [];
    }
}