
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
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    // Gemini API endpoint for text generation (latest, recommended)
    // If you have access to Gemini 1.5, use 'models/gemini-1.5-pro-latest' or check your available models.
    const geminiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=' + GEMINI_API_KEY;
    const prompt = `Analyze the following food items: ${foodItems.join(', ')}.\n\nReturn ONLY a JSON object with the following fields: description (string), healthScore (number between 1-100), suggestions (array of 3 short strings with health tips). Example: {\n  \"description\": \"...\",\n  \"healthScore\": 85,\n  \"suggestions\": [\"tip1\", \"tip2\", \"tip3\"]\n}`;

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
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
    let parsed: GeminiParsed;
    try {
      parsed = JSON.parse(text) as GeminiParsed;
    } catch (e) {
      console.error('Failed to parse Gemini response as JSON:', text, e);
      return NextResponse.json({
        description: 'Food analysis failed',
        healthScore: 50,
        suggestions: ['Try again later', 'Ensure valid input', 'Check API status'],
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
