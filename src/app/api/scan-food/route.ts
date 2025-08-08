// src/app/api/scan-food/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { filterFoodItems } from '@/lib/non-food-items';
import { NutritionInfo } from '@/lib/types';

export const runtime = "nodejs"; // Required for advanced processing

// Initialize Google AI Client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

// --- Helper Functions ---

async function fileToGenerativePart(file: File) {
  const fileBuffer = await file.arrayBuffer();
  return {
    inlineData: {
      data: Buffer.from(fileBuffer).toString("base64"),
      mimeType: file.type,
    },
  };
}

// Re-integrated nutrition fetching logic for server-side use
async function getNutritionData(foodName: string): Promise<NutritionInfo | null> {
    console.log(`Fetching nutrition data for: "${foodName}"`);
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/nutrition`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ foodName }),
        });
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error(`Error fetching nutrition data for "${foodName}":`, error);
        return null;
    }
}


// --- Main API Endpoint ---
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File | null;

    if (!imageFile) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    // --- 1. Primary Vision Analysis (Gemini) ---
    const visionModel = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
    const visionPrompt = `Analyze the provided image of a meal with extreme precision. Identify every single ingredient. Your response MUST be a valid JSON object with a single key "foods", which is an array of strings. Be as granular as possible. For a burger, output ["sesame seed bun", "beef patty", "cheddar cheese", "lettuce", "tomato slice"]. Return ONLY the JSON object.`;
    const imagePart = await fileToGenerativePart(imageFile);
    
    const visionResult = await visionModel.generateContent([visionPrompt, imagePart]);
    const visionResponseText = visionResult.response.text();
    const cleanedVisionText = visionResponseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedVision = JSON.parse(cleanedVisionText);

    // --- 2. Intelligent Filtering ---
    const rawFoodItems: string[] = parsedVision.foods || [];
    if (rawFoodItems.length === 0) {
        throw new Error('Gemini Vision failed to identify any food items.');
    }
    const finalFoodItems = filterFoodItems(rawFoodItems);

    if (finalFoodItems.length === 0) {
      throw new Error('No valid food items were detected after filtering. Please try a clearer picture.');
    }

    // --- 3. Precise Nutrition Lookup (Top 3 Items) ---
    const nutritionPromises = finalFoodItems.slice(0, 3).map(name => getNutritionData(name));
    const nutritionData = (await Promise.all(nutritionPromises)).filter((item): item is NutritionInfo => item !== null);

    if (nutritionData.length === 0) {
        throw new Error('Could not retrieve valid nutrition data for the detected food items.');
    }

    // --- 4. Sovereign Health Analysis (Gemini) ---
    const analysisModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const analysisPrompt = `
      You are a world-class nutritionist. Analyze the following meal components: ${finalFoodItems.join(', ')}.
      The primary item's nutrition data is: ${JSON.stringify(nutritionData[0])}.
      
      Your task is to return a valid JSON object with ONLY the following structure:
      {
        "description": "A brief, insightful, and slightly formal analysis of the meal.",
        "healthScore": <A number from 1 to 100, based on nutritional balance, processing level, and ingredient quality>,
        "suggestions": [
          "<A specific, actionable suggestion to improve the meal's health profile>",
          "<Another distinct, helpful suggestion>",
          "<A final, encouraging suggestion>"
        ]
      }
      Do not include any text outside of this JSON object.
    `;
    const analysisResult = await analysisModel.generateContent(analysisPrompt);
    const analysisResponseText = analysisResult.response.text();
    const cleanedAnalysisText = analysisResponseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const aiAnalysis = JSON.parse(cleanedAnalysisText);

    // --- 5. Assemble and Return Final Response ---
    const responsePayload = {
        foodItems: finalFoodItems.map(name => ({ name, confidence: 0.95, source: 'Gemini' })),
        aiAnalysis,
        nutritionData,
        priceData: [] 
    };

    return NextResponse.json(responsePayload);

  } catch (error) {
    console.error('Error in unified scan-food API route:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to complete food analysis', details: errorMessage }, { status: 500 });
  }
}