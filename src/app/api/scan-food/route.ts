import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server'; // Correctly using server-side auth
import { analyzeImageForFood, getNutritionData } from '@/lib/api';
import { NON_FOOD_ITEMS } from '@/lib/non-food-items';

// Define a specific type for the expected food item structure
interface FoodResult {
  name: string;
  confidence: number;
  source: string;
}

// Ensure edge runtime for Vercel deployment compatibility
export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    // CORRECTIVE ACTION: Added 'await' to correctly resolve the auth promise.
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const image = formData.get('image');
    if (!image || !(image instanceof Blob)) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    let foodResults: FoodResult[] = await analyzeImageForFood(image);

    // Filter results for high confidence and exclude known non-food items
    foodResults = foodResults
      .filter(f => f.name && typeof f.confidence === 'number' && f.confidence > 0.7)
      .filter(f => !NON_FOOD_ITEMS.has(f.name.trim().toLowerCase()));

    if (foodResults.length === 0) {
      // It is critical to provide a clear error message if no valid food is found.
      return NextResponse.json({ error: "No high-confidence food items were detected. Please try a different photo." }, { status: 404 });
    }
    
    // Sort by confidence to ensure the primary item is processed first
    foodResults.sort((a, b) => b.confidence - a.confidence);

    const topFoodName = foodResults[0].name;
    const nutrition = await getNutritionData(topFoodName);

    return NextResponse.json({
      foodResults,
      nutrition,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during the scan.';
    console.error("Error in scan-food route:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}