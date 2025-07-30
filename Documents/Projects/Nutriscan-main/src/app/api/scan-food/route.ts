import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { analyzeImageForFood } from '@/lib/api';
import { getNutritionData } from '@/lib/api'; // Assume this wraps /api/nutrition

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  // Enforce authentication
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const image = formData.get('image');
  if (!image || !(image instanceof Blob)) {
    return NextResponse.json({ error: 'No image provided' }, { status: 400 });
  }

  // Try Gemini AI first
  let foodResults: { name: string; confidence: number; source: string }[] = [];
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
        foodResults = geminiData.foods.map((f: any) => ({ ...f, source: 'gemini' }));
      }
    }
  } catch (e) {
    // Ignore Gemini errors, fallback below
  }

  // If Gemini failed or low confidence, fallback to vision
  if (!foodResults.length || (foodResults[0].confidence || 0) < 0.7) {
    foodResults = await analyzeImageForFood(image);
  }

  // Filter for high-confidence results (e.g., >0.7)
  foodResults = foodResults.filter(f => typeof f.confidence === 'number' && f.confidence > 0.7);

  // Remove non-food items using NON_FOOD_ITEMS set
  const { NON_FOOD_ITEMS } = await import('@/lib/non-food-items');
  foodResults = foodResults.filter(f => f.name && !NON_FOOD_ITEMS.has(f.name.trim().toLowerCase()));

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
