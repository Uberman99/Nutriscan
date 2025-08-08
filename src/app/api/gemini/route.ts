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
    console.log('[Edge Runtime] /api/gemini endpoint called');

    let { foodItems } = await request.json();

    console.log('[Edge Runtime] Free AI API called with foodItems:', foodItems);

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

    console.log('[Node Runtime] Checking GEMINI_API_KEY...');
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    console.log('[Node Runtime] Environment check - NODE_ENV:', process.env.NODE_ENV);
    console.log('[Node Runtime] Environment check - VERCEL:', process.env.VERCEL);
    console.log('[Node Runtime] All env keys containing GEMINI:', Object.keys(process.env).filter(key => key.toLowerCase().includes('gemini')));
    
    if (!GEMINI_API_KEY) {
      console.error('[Node Runtime] CRITICAL: Gemini API key is missing or not accessible in this environment.');
      console.error('[Node Runtime] Available env vars:', Object.keys(process.env).filter(key => key.includes('GEMINI')));
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }
    console.log('[Node Runtime] GEMINI_API_KEY found, length:', GEMINI_API_KEY.length);

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

    console.log('[Edge Runtime] Making request to Gemini API...');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // Increased to 20 second timeout

    let response;
    try {
      response = await fetch(geminiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Edge Runtime] Gemini API Error:', response.status, errorText);
        // Handle Gemini API quota exceeded
        if (response.status === 429) {
          console.error('Gemini API quota exceeded');
          return NextResponse.json({ error: 'Gemini API quota exceeded. Please try again later.' }, { status: 429 });
        }
        return NextResponse.json({
          description: 'Food analysis failed',
          healthScore: 50,
          suggestions: ['Try again later', 'Ensure valid input', 'Check API status'],
          geminiError: errorText
        }, { status: 500 });
      }
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('[Edge Runtime] Gemini API request timed out');
        return NextResponse.json({
          description: 'Request timed out',
          healthScore: 50,
          suggestions: ['Try again later', 'Network connection may be slow']
        }, { status: 408 });
      }
      throw error;
    }

    console.log('[Edge Runtime] Gemini API request successful, parsing response...');
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
    console.error('Gemini API Error:', error);
    // Enhanced fallback based on detected food items
    const foodItems: string[] = []; // Initialize as an empty array
    const fallbackDescription = foodItems.length > 0 
      ? `Analysis of ${foodItems.join(', ')}: These foods contribute to your daily nutrition. Consider balancing with other food groups for optimal health.`
      : 'General nutrition advice: Focus on a balanced diet with variety from all food groups.';

    return NextResponse.json({
      description: fallbackDescription,
      healthScore: 72,
      suggestions: [
        'Maintain balanced nutrition',
        'Stay hydrated with water',
        'Include regular physical activity'
      ]
    });
  }
}