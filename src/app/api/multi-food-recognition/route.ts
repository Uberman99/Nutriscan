import { NextRequest, NextResponse } from 'next/server';

// Multi-API food recognition for maximum accuracy
export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();
    
    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const recognitionResults: string[][] = [];
    const confidenceScores: number[] = [];

    // 1. Try Nutritionix (best for restaurant foods)
    if (process.env.NUTRITIONIX_APP_ID && process.env.NUTRITIONIX_API_KEY) {
      try {
        const nutritionixResponse = await fetch('/api/nutritionix-vision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image })
        });
        
        if (nutritionixResponse.ok) {
          const nutritionixData = await nutritionixResponse.json();
          recognitionResults.push(nutritionixData.labels || []);
          confidenceScores.push(nutritionixData.confidence || 0.95);
        }
      } catch (error) {
        console.warn('Nutritionix failed:', error);
      }
    }

    // 2. Try Clarifai (excellent food-specific recognition)
    if (process.env.CLARIFAI_API_KEY) {
      try {
        const clarifaiResponse = await fetch('/api/clarifai-vision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image })
        });
        
        if (clarifaiResponse.ok) {
          const clarifaiData = await clarifaiResponse.json();
          recognitionResults.push(clarifaiData.labels || []);
          confidenceScores.push(clarifaiData.confidence || 0.92);
        }
      } catch (error) {
        console.warn('Clarifai failed:', error);
      }
    }

    // 3. Fallback to enhanced Google Vision
    if (recognitionResults.length === 0) {
      try {
        const visionResponse = await fetch('/api/vision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image })
        });
        
        if (visionResponse.ok) {
          const visionData = await visionResponse.json();
          recognitionResults.push(visionData.labels || []);
          confidenceScores.push(0.75); // Lower confidence for generic vision
        }
      } catch (error) {
        console.warn('Google Vision failed:', error);
      }
    }

    // Combine and rank results
    const allFoods = recognitionResults.flat();
    const foodCounts: { [food: string]: { count: number, avgConfidence: number } } = {};
    
    recognitionResults.forEach((foods, index) => {
      foods.forEach(food => {
        if (!foodCounts[food]) {
          foodCounts[food] = { count: 0, avgConfidence: 0 };
        }
        foodCounts[food].count++;
        foodCounts[food].avgConfidence += confidenceScores[index];
      });
    });

    // Calculate final confidence and sort by relevance
    Object.keys(foodCounts).forEach(food => {
      foodCounts[food].avgConfidence /= foodCounts[food].count;
    });

    const finalFoods = Object.entries(foodCounts)
      .sort(([,a], [,b]) => (b.count * b.avgConfidence) - (a.count * a.avgConfidence))
      .slice(0, 5)
      .map(([food]) => food);

    return NextResponse.json({ 
      labels: finalFoods.length > 0 ? finalFoods : ['Mixed Meal'],
      success: true,
      confidence: Math.max(...confidenceScores),
      apisCalled: recognitionResults.length,
      method: 'multi-api-fusion'
    });

  } catch (error) {
    console.error('Multi-API Food Recognition Error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze food image with any API' }, 
      { status: 500 }
    );
  }
}
