import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { analyzeImageForFood, getNutritionData } from '@/lib/api';

export const runtime = 'edge';

interface FoodResult {
  name: string;
  confidence: number;
  source: string;
}

export async function POST(req: NextRequest) {
  // Enforce authentication
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized - Please sign in' }, { status: 401 });
  }

  const formData = await req.formData();
  const image = formData.get('image');
  if (!image || !(image instanceof Blob)) {
    return NextResponse.json({ error: 'No image provided' }, { status: 400 });
  }

  // Try Gemini AI first
  let foodResults: FoodResult[] = [];
  let geminiResponse: Response | null = null;
  try {
    const geminiFormData = new FormData();
    geminiFormData.append('image', image);
    geminiResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/gemini-vision`, {
      method: 'POST',
      body: geminiFormData,
    });
    if (geminiResponse.ok) {
      const geminiData = await geminiResponse.json();
      if (Array.isArray(geminiData.foods) && geminiData.foods.length > 0) {
        foodResults = geminiData.foods.map((f: FoodResult) => ({ ...f, source: 'gemini' }));
      }
    }
  } catch (error) {
    console.warn('Gemini AI fallback failed:', error);
    // Ignore Gemini errors, fallback below
  }

  // If Gemini failed or low confidence, fallback to vision
  if (!foodResults.length || (foodResults[0].confidence || 0) < 0.7) {
    foodResults = await analyzeImageForFood(image);
  }

  // Filter for high-confidence results (e.g., >0.7)
  foodResults = foodResults.filter(f => typeof f.confidence === 'number' && f.confidence > 0.7);

  // Remove non-food items using enhanced smart detection
  const { filterFoodItems } = await import('@/lib/non-food-items');
  const foodNames = foodResults.map(f => f.name).filter(Boolean);
  const validFoodNames = filterFoodItems(foodNames);
  foodResults = foodResults.filter(f => validFoodNames.includes(f.name));

  // Sort by confidence descending
  foodResults.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));

  // Use the most confident food name
  const topFood = foodResults[0]?.name || 'Food Item';

  // Get nutrition data for the top result
  const nutrition = await getNutritionData(topFood);

  return NextResponse.json({
    foodResults,
    nutrition,
  });
}
