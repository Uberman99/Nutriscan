import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { mockAIAnalysis } from '@/lib/demo-data';

// Initialize the Gemini AI client if API key exists
const genAI = process.env.GEMINI_API_KEY ? 
  new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

export async function POST(request: NextRequest) {
  try {
    const { foodItems } = await request.json();
    
    console.log('Gemini API called with foodItems:', foodItems);
    console.log('GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
    console.log('genAI client exists:', !!genAI);
    
    if (!foodItems || !Array.isArray(foodItems)) {
      return NextResponse.json({ error: 'No food items provided' }, { status: 400 });
    }
    
    // If no API key is available, use mock data
    if (!genAI) {
      console.log('Using mock data for Gemini AI');
      return NextResponse.json(mockAIAnalysis);
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Analyze the following food items: ${foodItems.join(', ')}
      
      Consider these foods from various cuisines including Indian, Western, Asian, and Australian foods.
      For items like samosa, panipuri, rasmalai, biryani, dosa - recognize these as popular Indian foods.
      For desserts like cake, cookies - consider their sugar and calorie content.
      For street foods and snacks - account for their typically high sodium and oil content.
      
      Please provide:
      1. A brief description of the meal/food combination, mentioning cuisine type if relevant
      2. A health score from 1-100 (100 being the healthiest)
      3. Three specific health suggestions or improvements based on the food type
      
      Format your response as JSON with the following structure:
      {
        "description": "Brief description of the food including cuisine context",
        "healthScore": number,
        "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
      // Try to parse as JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedResponse = JSON.parse(jsonMatch[0]);
        return NextResponse.json(parsedResponse);
      }
    } catch (_error) {
      // If JSON parsing fails, create a structured response
      const lines = text.split('\n').filter(line => line.trim());
      return NextResponse.json({
        description: lines[0] || 'Food analysis completed',
        healthScore: 75, // Default score
        suggestions: lines.slice(1, 4).map(line => line.replace(/^\d+\.\s*/, '')) || [
          'Consider adding more vegetables',
          'Watch portion sizes',
          'Stay hydrated'
        ]
      });
    }

    return NextResponse.json({
      description: 'Food analysis completed',
      healthScore: 75,
      suggestions: ['Consider adding more vegetables', 'Watch portion sizes', 'Stay hydrated']
    });

  } catch (error) {
    console.error('Gemini API Error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    
    // Return mock data as fallback when there's an error
    return NextResponse.json(mockAIAnalysis);
  }
}
