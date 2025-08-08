// src/app/api/scan-food/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { filterFoodItems } from '@/lib/non-food-items';
import { getNutritionData } from '@/lib/api';
import { NutritionInfo } from '@/lib/types';
import { mockAIAnalysis, mockNutritionData } from '@/lib/demo-data';

export const runtime = "nodejs";

// --- CLIENT INITIALIZATION ---
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

// --- HELPER FUNCTIONS ---
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
        headers: {
          'Authorization': `Key ${CLARIFAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: [{ data: { image: { base64: imageBuffer.toString('base64') } } }]
        })
      }
    );
    if (!response.ok) {
        console.error('Clarifai API fallback failed:', response.statusText);
        return [];
    }
    const data = await response.json();
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
      const visionPrompt = `Analyze the provided image of a meal with extreme precision. Identify every single ingredient. Your response MUST be a valid JSON object with a single key "foods", which is an array of strings. Be as granular as possible. For a burger, output ["sesame seed bun", "beef patty", "cheddar cheese", "lettuce", "tomato slice"]. Return ONLY the JSON object.`;
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

    // --- Intelligent Filtering ---
    const finalFoodItems = filterFoodItems(rawFoodItems);
    if (finalFoodItems.length === 0) {
      throw new Error('No valid food items were detected after filtering.');
    }

    // --- Precise Nutrition Lookup ---
    const nutritionPromises = finalFoodItems.slice(0, 3).map(name => getNutritionData(name));
    let nutritionData = (await Promise.all(nutritionPromises)).filter((item): item is NutritionInfo => item !== null);
    
    // Fallback nutrition data if live lookup fails
    if (nutritionData.length === 0) {
        console.warn("Live nutrition lookup failed. Using mock data as fallback.");
        const mockKey = finalFoodItems[0].toLowerCase() as keyof typeof mockNutritionData;
        const mock = mockNutritionData[mockKey];
        if(mock) {
            // Corrected: Wrap the single mock object in an array to match the expected type NutritionInfo[]
            nutritionData = [mock as unknown as NutritionInfo];
        }
    }
    
    if (nutritionData.length === 0) {
        throw new Error('Could not retrieve any nutrition data for the detected items.');
    }

    // --- HEALTH ANALYSIS with FALLBACK ---
    let aiAnalysis;
    try {
      console.log('Attempting primary health analysis with Gemini...');
      const analysisModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const analysisPrompt = `You are a world-class nutritionist. Analyze the following meal components: ${finalFoodItems.join(', ')}. The primary item's nutrition data is: ${JSON.stringify(nutritionData[0])}. Your task is to return a valid JSON object with ONLY the following structure: {"description": "...", "healthScore": <1-100>, "suggestions": ["...", "...", "..."]}`;
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

    // --- Assemble and Return Final Response ---
    const responsePayload = {
        foodItems: finalFoodItems.map(name => ({ name, confidence: 0.9, source: 'Sovereign Engine' })),
        aiAnalysis,
        nutritionData,
        priceData: []
    };

    return NextResponse.json(responsePayload);

  } catch (error) {
    console.error('CRITICAL ERROR in unified scan-food API route:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to complete food analysis', details: errorMessage }, { status: 500 });
  }
}