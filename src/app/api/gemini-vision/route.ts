// Force Node.js runtime to avoid Edge Runtime incompatibility
export const runtime = "nodejs";

import { NextResponse } from 'next/server';
import { foodShowcaseData } from '@/lib/food-data';

// Type definition for Gemini Vision API response
interface GeminiFoodItem {
  name?: string;
  confidence?: number;
  ingredients?: string[];
}

// Helper function to extract text from an image using Tesseract.js with proper configuration
async function extractTextFromImage(imageBuffer: Buffer): Promise<string> {
  try {
    // Import Tesseract dynamically to avoid worker issues
    const Tesseract = await import('tesseract.js');
    
    // Use the simplified API that works with Next.js
    const { data: { text } } = await Tesseract.recognize(imageBuffer, 'eng', {
      logger: m => console.log('🔍 OCR Progress:', m)
    });
    
    return text || '';
  } catch (error) {
    console.error('Tesseract OCR error:', error);
    // Return empty string as fallback
    return '';
  }
}

// Fuzzy match extracted text to known foods
function matchFoods(text: string): Array<{ name: string; confidence: number; source: string }> {
  const lowerText = text.toLowerCase();
  const matches: Array<{ name: string; confidence: number; source: string }> = [];
  for (const food of foodShowcaseData) {
    const foodName = food.name.replace(/^[^a-zA-Z]+/, '').toLowerCase();
    if (lowerText.includes(foodName)) {
      matches.push({ name: foodName, confidence: 0.99, source: 'OCR' });
    } else if (foodName.split(' ').some(word => lowerText.includes(word))) {
      matches.push({ name: foodName, confidence: 0.7, source: 'OCR' });
    }
  }
  // If no matches, return a generic guess
  if (matches.length === 0 && lowerText.trim().length > 0) {
    matches.push({ name: lowerText.split(/\s+/)[0], confidence: 0.5, source: 'OCR' });
  }
  return matches;
}


export async function POST(request: Request) {
  try {
    console.log('🚀 Received request for Gemini Vision AI analysis');
    
    // Check content type
    const contentType = request.headers.get('content-type');
    console.log('📋 Request content-type:', contentType);
    
    if (!contentType || !contentType.includes('multipart/form-data')) {
      console.error('❌ Invalid content type. Expected multipart/form-data, got:', contentType);
      return NextResponse.json({ 
        error: 'Invalid content type. Expected multipart/form-data',
        foods: [{ name: 'Food Item', confidence: 0.5, source: 'Gemini Vision' }]
      }, { status: 400 });
    }
    
    const formData = await request.formData();
    const imageFile = formData.get('image');

    if (!imageFile || typeof imageFile === 'string') {
      console.error('❌ Missing image in the request');
      return NextResponse.json({ 
        error: 'Missing image',
        foods: [{ name: 'Food Item', confidence: 0.5, source: 'Gemini Vision' }]
      }, { status: 400 });
    }

    // Convert image to base64 for Gemini API
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString('base64');

    console.log('✅ Image received. Starting Gemini Vision analysis...');

    // Call Gemini Vision API for food recognition
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      console.error('❌ Missing Gemini API key');
      return NextResponse.json({
        foods: [{ name: 'Food Item', confidence: 0.5, source: 'Gemini Vision' }]
      });
    }

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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

    if (!geminiResponse.ok) {
      console.error('❌ Gemini API request failed:', geminiResponse.statusText);
      // Fallback to OCR analysis
      const extractedText = await extractTextFromImage(buffer);
      const foodItems = matchFoods(extractedText);
      
      return NextResponse.json({
        foods: foodItems.length > 0 ? foodItems : [{ name: 'Food Item', confidence: 0.5, source: 'OCR Fallback' }]
      });
    }

    const geminiData = await geminiResponse.json();
    console.log('✅ Gemini Vision response received');

    // Parse Gemini response
    let detectedFoods = [];
    try {
      const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
      console.log('🤖 Gemini raw response:', responseText);
      
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
      console.error('❌ Error parsing Gemini response:', error);
    }

    // If Gemini didn't detect anything specific, try OCR as backup
    if (detectedFoods.length === 0) {
      console.log('🔄 No foods detected by Gemini, trying OCR fallback...');
      const extractedText = await extractTextFromImage(buffer);
      const ocrFoods = matchFoods(extractedText);
      detectedFoods = ocrFoods.length > 0 ? ocrFoods : [{ name: 'Food Item', confidence: 0.4, source: 'Fallback' }];
    }

    console.log('✅ Final detected foods:', detectedFoods);

    return NextResponse.json({
      foods: detectedFoods
    });

  } catch (error) {
    console.error('🚨 Error in Gemini Vision analysis:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ 
      error: 'Failed to analyze image with Gemini Vision', 
      details: errorMessage,
      foods: [{ name: 'Food Item', confidence: 0.3, source: 'Error Fallback' }]
    }, { status: 500 });
  }
}
