
import { NextRequest, NextResponse } from 'next/server';

// Type for Gemini API response
type GeminiCandidate = {
  content?: {
    parts?: { text?: string }[];
  };
};


type GeminiResponse = {
  candidates?: GeminiCandidate[];
};

type GeminiParsed = {
  description: string;
  healthScore: number;
  suggestions: string[];
};


export async function POST(request: NextRequest) {
  try {

    let { foodItems } = await request.json();

    console.log('Free AI API called with foodItems:', foodItems);

    // Basic filtering: remove empty, whitespace, duplicates, and obviously invalid entries
    if (!foodItems || !Array.isArray(foodItems)) {
      return NextResponse.json({ error: 'No food items provided' }, { status: 400 });
    }
    foodItems = foodItems
      .map((item: string) => item.trim())
      .filter((item: string, idx: number, arr: string[]) =>
        item &&
        item.length > 1 &&
        !/[^a-zA-Z0-9\s\-]/.test(item) && // only allow alphanum, space, dash
        arr.indexOf(item) === idx // remove duplicates
      );
    if (foodItems.length === 0) {
      return NextResponse.json({ error: 'No valid food items after filtering' }, { status: 400 });
    }


    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      console.error('Gemini API key not configured on the server.');
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    // Gemini API endpoint for text generation using the latest model
    const geminiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + GEMINI_API_KEY;
    // Improved prompt to handle generic food items
    const prompt = `Analyze the following food items: ${foodItems.join(', ')}.

If the food items are generic (like "Food Item") or unclear, provide a general healthy eating analysis.

Return ONLY a valid JSON object with exactly these fields:
{
  "description": "Brief analysis of the food items or general nutrition advice",
  "healthScore": 75,
  "suggestions": ["Add more vegetables", "Stay hydrated", "Control portion sizes"]
}

Do not include markdown formatting, code blocks, or any text outside the JSON object.`;

    const geminiBody = {
      contents: [{ parts: [{ text: prompt }] }]
    };

    const response = await fetch(geminiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error:', errorText);
      return NextResponse.json({
        description: 'Food analysis failed',
        healthScore: 50,
        suggestions: ['Try again later', 'Ensure valid input', 'Check API status'],
        geminiError: errorText
      }, { status: 500 });
    }


    const result: GeminiResponse = await response.json();
    // Gemini returns candidates[0].content.parts[0].text
    let text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Clean up the response - remove markdown code blocks if present
    text = text.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '').trim();
    // Also remove any other markdown formatting
    text = text.replace(/^```/gm, '').replace(/```$/gm, '').trim();
    
    console.log('Cleaned Gemini response text:', text);
    
    let parsed: GeminiParsed;
    try {
      parsed = JSON.parse(text) as GeminiParsed;
    } catch (e) {
      console.error('Failed to parse Gemini response as JSON:', text, e);
      
      // Better fallback based on the food items provided
      const isGenericFood = foodItems.some((item: string) => 
        item.toLowerCase().includes('food item') || 
        item.toLowerCase().includes('unknown') ||
        item.length < 3
      );
      
      return NextResponse.json({
        description: isGenericFood 
          ? 'General food analysis: Focus on balanced nutrition with a variety of food groups.'
          : `Analysis of ${foodItems.join(', ')}: These foods can be part of a balanced diet.`,
        healthScore: isGenericFood ? 70 : 75,
        suggestions: [
          'Add more vegetables to your meals',
          'Stay hydrated with water',
          'Control your portion sizes'
        ],
        geminiRaw: text
      }, { status: 500 });
    }
    // Validate parsed object
    if (
      typeof parsed !== 'object' ||
      typeof parsed.description !== 'string' ||
      typeof parsed.healthScore !== 'number' ||
      !Array.isArray(parsed.suggestions)
    ) {
      console.error('Gemini response missing expected fields:', parsed);
      return NextResponse.json({
        description: 'Food analysis failed',
        healthScore: 50,
        suggestions: ['Try again later', 'Ensure valid input', 'Check API status'],
        geminiRaw: text
      }, { status: 500 });
    }
    return NextResponse.json({
      description: parsed.description,
      healthScore: parsed.healthScore,
      suggestions: parsed.suggestions.slice(0, 3)
    });

  } catch (error) {
    console.error('Free AI API Error:', error);
    return NextResponse.json({
      description: 'Food analysis failed',
      healthScore: 50,
      suggestions: ['Try again later', 'Ensure valid input', 'Check API status']
    }, { status: 500 });
  }
}
