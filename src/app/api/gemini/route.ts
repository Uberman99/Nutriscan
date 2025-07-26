import { NextRequest, NextResponse } from 'next/server';
import fetch from 'node-fetch';

export async function POST(request: NextRequest) {
  try {
    const { foodItems } = await request.json();

    console.log('Free AI API called with foodItems:', foodItems);

    if (!foodItems || !Array.isArray(foodItems)) {
      return NextResponse.json({ error: 'No food items provided' }, { status: 400 });
    }

    const prompt = `Analyze the following food items: ${foodItems.join(', ')}\n\n` +
      `Provide a brief description, a health score (1-100), and three health suggestions.`;

    const response = await fetch('https://api-inference.huggingface.co/models/gpt2', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer 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`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: prompt }),
    });

    if (!response.ok) {
      console.error('Free AI API Error:', await response.text());
      return NextResponse.json({
        description: 'Food analysis failed',
        healthScore: 50,
        suggestions: ['Try again later', 'Ensure valid input', 'Check API status']
      });
    }

    const result = await response.json();
    const text = result.generated_text || 'Food analysis completed';

    // Parse the response text into structured data
    const lines = text.split('\n').filter((line: string) => line.trim());
    return NextResponse.json({
      description: lines[0] || 'Food analysis completed',
      healthScore: parseInt(lines[1], 10) || 75,
      suggestions: lines.slice(2, 5) || ['Add more vegetables', 'Watch portion sizes', 'Stay hydrated']
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
