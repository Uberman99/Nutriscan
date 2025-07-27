import { NextRequest, NextResponse } from 'next/server';


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

    // Gemini API endpoint for text generation (corrected to v1)
    const geminiEndpoint = 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=' + GEMINI_API_KEY;
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

    const result = await response.json();
    // Gemini returns candidates[0].content.parts[0].text
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      console.error('Failed to parse Gemini response as JSON:', text);
      return NextResponse.json({
        description: 'Food analysis failed',
        healthScore: 50,
        suggestions: ['Try again later', 'Ensure valid input', 'Check API status'],
        geminiRaw: text
      }, { status: 500 });
    }
    return NextResponse.json({
      description: parsed.description || 'Food analysis completed',
      healthScore: typeof parsed.healthScore === 'number' ? parsed.healthScore : 75,
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.slice(0, 3) : ['Add more vegetables', 'Watch portion sizes', 'Stay hydrated']
    });

  } catch (error) {
    console.error('Free AI API Error:', error);
    return NextResponse.json({
      description: 'Food analysis failed',
      healthScore: 50,
      suggestions: ['Try again later', 'Ensure valid input', 'Check API status']
    });
  }
}
