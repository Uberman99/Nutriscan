// Force Node.js runtime to avoid Edge Runtime incompatibility
export const runtime = "nodejs";

import { NextResponse } from 'next/server';
import Tesseract from 'tesseract.js';
import { foodShowcaseData } from '@/lib/food-data';
import { healthDataDb } from '@/lib/health-data';

// Helper function to extract text from an image using Tesseract.js
async function extractTextFromImage(imageBuffer: Buffer): Promise<string> {
  const { data: { text } } = await Tesseract.recognize(imageBuffer, 'eng');
  return text;
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

// Nutrition lookup (mocked for demo)
function getNutritionData(foodName: string) {
  // Simple mock: calories and macros for demo foods
  const base = {
    calories: 250,
    protein: 8,
    fat: 10,
    carbs: 30,
    fiber: 2,
    sugars: 5,
    sodium: 300,
  };
  // Add health data if available
  const health = healthDataDb[foodName] || {};
  return {
    food_name: foodName,
    serving_qty: 1,
    serving_unit: 'serving',
    serving_weight_grams: 100,
    nf_calories: base.calories,
    nf_total_fat: base.fat,
    nf_saturated_fat: 2,
    nf_cholesterol: 10,
    nf_sodium: base.sodium,
    nf_total_carbohydrate: base.carbs,
    nf_dietary_fiber: base.fiber,
    nf_sugars: base.sugars,
    nf_protein: base.protein,
    nf_potassium: 200,
    nf_p: 100,
    healthData: health,
  };
}

// AI analysis mock
function getAIAnalysis(foodNames: string[]) {
  return {
    description: `Detected foods: ${foodNames.join(', ')}. This is a demo analysis.`,
    healthScore: 80,
    suggestions: [
      'Add more vegetables for a balanced meal.',
      'Drink water with your meal.',
    ],
  };
}

export async function POST(request: Request) {
  try {
    console.log('🚀 Received request for OCR analysis using Tesseract.js');
    const formData = await request.formData();
    const imageFile = formData.get('image');

    if (!imageFile || typeof imageFile === 'string') {
      console.error('❌ Missing image in the request');
      return NextResponse.json({ error: 'Missing image' }, { status: 400 });
    }

    // Convert Blob to Buffer
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log('✅ Image received. Starting OCR analysis...');
    const extractedText = await extractTextFromImage(buffer);

    console.log('✅ Extracted Text:', extractedText);

    // Food detection
    const foodItems = matchFoods(extractedText);
    const foodNames = foodItems.map(f => f.name);
    // Nutrition lookup
    const nutritionData = foodNames.map(getNutritionData);
    // AI analysis
    const aiAnalysis = getAIAnalysis(foodNames);

    return NextResponse.json({
      extractedText,
      foodItems,
      aiAnalysis,
      nutritionData,
    });

  } catch (error) {
    console.error('🚨 Error in Tesseract.js OCR:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to analyze image with Tesseract.js', details: errorMessage }, { status: 500 });
  }
}
