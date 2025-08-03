// Temporarily switch back to Node.js runtime for debugging
// export const runtime = "edge";

import { NextResponse } from 'next/server';

// Type definition for Gemini Vision API response
interface GeminiFoodItem {
  name?: string;
  confidence?: number;
  ingredients?: string[];
}


export async function POST(request: Request) {
  try {
    console.log('[Edge Runtime] 🚀 Received request for Gemini Vision AI analysis');
    
    // Check content type
    const contentType = request.headers.get('content-type');
    console.log('[Edge Runtime] 📋 Request content-type:', contentType);
    
    if (!contentType || !contentType.includes('multipart/form-data')) {
      console.error('[Edge Runtime] ❌ Invalid content type. Expected multipart/form-data, got:', contentType);
      return NextResponse.json({ 
        error: 'Invalid content type. Expected multipart/form-data',
        foods: [{ name: 'Food Item', confidence: 0.5, source: 'Gemini Vision' }]
      }, { status: 400 });
    }
    
    const formData = await request.formData();
    const imageFile = formData.get('image');

    if (!imageFile || typeof imageFile === 'string') {
      console.error('[Edge Runtime] ❌ Missing image in the request');
      return NextResponse.json({ 
        error: 'Missing image',
        foods: [{ name: 'Food Item', confidence: 0.5, source: 'Gemini Vision' }]
      }, { status: 400 });
    }

    // Convert image to base64 for Gemini API - Edge Runtime compatible
    const arrayBuffer = await imageFile.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    
    // Convert to base64 in chunks to avoid memory issues
    let base64Image = '';
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.slice(i, i + chunkSize);
      base64Image += btoa(String.fromCharCode(...chunk));
    }

    console.log('[Edge Runtime] ✅ Image received. Starting Gemini Vision analysis...');

    // Call Gemini Vision API for food recognition
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      console.error('[Edge Runtime] ❌ Missing Gemini API key');
      return NextResponse.json({
        error: 'Server configuration error',
        foods: [{ name: 'Food Item', confidence: 0.5, source: 'Gemini Vision' }]
      }, { status: 500 });
    }

    console.log('[Edge Runtime] 🔄 Making request to Gemini API...');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // Increased to 30 second timeout
    
    let geminiResponse;
    try {
      geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Analyze this food image and identify ALL food items visible. For each food item, provide:
1. The specific name of the food (be precise - e.g., "almond cake", "chocolate muffin", "apple pie" rather than just "cake" or "dessert")
2. A confidence score from 0.0 to 1.0
3. Any visible ingredients or toppings

Respond with a JSON array of objects with fields: name, confidence, ingredients.
Focus on being very specific with food names. If you see pastries, cakes, or baked goods, identify the specific type.
Example response format:
[
  {"name": "Almond Cake", "confidence": 0.95, "ingredients": ["almonds", "flour", "sugar"]},
  {"name": "Chocolate Chip Cookie", "confidence": 0.88, "ingredients": ["chocolate chips", "flour", "butter"]}
]`
                  },
                  {
                    inline_data: {
                      mime_type: 'image/jpeg',
                      data: base64Image
                    }
                  }
                ]
              }
            ]
          })
        }
      );
      
      clearTimeout(timeoutId);
      
      if (!geminiResponse.ok) {
        console.error('[Node Runtime] ❌ Gemini API request failed:', geminiResponse.status, geminiResponse.statusText);
        
        // Enhanced fallback for quota exceeded
        if (geminiResponse.status === 429) {
          console.log('[Node Runtime] 🔄 Gemini quota exceeded, providing generic food detection fallback');
          return NextResponse.json({
            foods: [
              { name: 'Food Item', confidence: 0.7, source: 'Quota Fallback', ingredients: [] },
              { name: 'Snack', confidence: 0.6, source: 'Quota Fallback', ingredients: [] }
            ]
          });
        }
        
        return NextResponse.json({
          error: 'Vision analysis temporarily unavailable',
          foods: [{ name: 'Food Item', confidence: 0.6, source: 'API Error Fallback' }]
        }, { status: 200 }); // Return 200 for better UX
      }
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('[Node Runtime] ❌ Gemini API request timed out');
        return NextResponse.json({
          foods: [
            { name: 'Food Item', confidence: 0.7, source: 'Timeout Fallback', ingredients: [] },
            { name: 'Meal', confidence: 0.6, source: 'Timeout Fallback', ingredients: [] }
          ]
        }, { status: 200 }); // Return 200 for better UX
      }
      throw error;
    }

    const geminiData = await geminiResponse.json();
    console.log('[Edge Runtime] ✅ Gemini Vision response received');

    // Parse Gemini response
    let detectedFoods = [];
    try {
      const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
      console.log('[Edge Runtime] 🤖 Gemini raw response:', responseText);
      
      // Clean up the response to extract JSON
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const foodsJson = JSON.parse(jsonMatch[0]);
        detectedFoods = foodsJson.map((food: GeminiFoodItem) => ({
          name: food.name || 'Unknown Food',
          confidence: food.confidence || 0.7,
          source: 'Gemini Vision',
          ingredients: food.ingredients || []
        }));
      }
    } catch (error) {
      console.error('[Edge Runtime] ❌ Error parsing Gemini response:', error);
    }

    // If Gemini didn't detect anything specific, provide a fallback
    if (detectedFoods.length === 0) {
      console.log('[Edge Runtime] 🔄 No foods detected by Gemini, using fallback...');
      detectedFoods = [{ name: 'Food Item', confidence: 0.4, source: 'Fallback', ingredients: [] }];
    }

    console.log('[Edge Runtime] ✅ Final detected foods:', detectedFoods);

    return NextResponse.json({
      foods: detectedFoods
    });

  } catch (error) {
    console.error('[Edge Runtime] 🚨 Error in Gemini Vision analysis:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ 
      error: 'Failed to analyze image with Gemini Vision', 
      details: errorMessage,
      foods: [{ name: 'Food Item', confidence: 0.3, source: 'Error Fallback' }]
    }, { status: 500 });
  }
}
