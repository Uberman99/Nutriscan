import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

// Helper function to convert a File to a GoogleGenerativeAI.Part
async function fileToGenerativePart(file: File): Promise<{ inlineData: { data: string; mimeType: string; }; }> {
  const base64 = await file.arrayBuffer().then(bytes => Buffer.from(bytes).toString('base64'));
  return {
    inlineData: {
      data: base64,
      mimeType: file.type,
    },
  };
}

export async function POST(request: Request) {
  try {
    console.log('🚀 Received request for Gemini Vision analysis');
    const formData = await request.formData();
    const imageFile = formData.get('image') as File | null;
    const labelsString = formData.get('labels') as string | null;

    if (!imageFile || !labelsString) {
      console.error('❌ Missing image or labels in the request');
      return NextResponse.json({ error: 'Missing image or labels' }, { status: 400 });
    }

    console.log('✅ Image and labels received. Labels:', labelsString);
    const candidateLabels = JSON.parse(labelsString);
    const imagePart = await fileToGenerativePart(imageFile);

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
      You are a world-class food expert and culinary specialist. Your task is to identify the food item in the provided image with the highest possible accuracy.
      You have been given a list of candidate labels from other AI models: ${JSON.stringify(candidateLabels)}.
      
      Instructions:
      1.  Analyze the image carefully.
      2.  Consider the candidate labels as suggestions, but do not be limited by them. Your own analysis of the image is paramount.
      3.  Identify the most specific, common, and accurate name for the food item. For example, if the labels are "Oreo", "Cream", "Ice Cream", the correct consolidated name is "Oreo Cookies and Cream Ice Cream". If the labels are "Dough", "Cheese", "Pepperoni", the correct name is "Pepperoni Pizza".
      4.  Do not identify non-food items.
      5.  Your response MUST be a JSON object with a single key: "foodName".
      
      Example Response:
      {
        "foodName": "Glazed Doughnut with Sprinkles"
      }
    `;

    console.log('📝 Sending prompt to Gemini...');
    const result = await model.generateContent([prompt, imagePart]);
    const response = result.response;
    const text = response.text();

    console.log('✅ Gemini Raw Response:', text);

    // Clean the response to ensure it's valid JSON
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const jsonResponse = JSON.parse(cleanedText);

    console.log('✅ Parsed Gemini JSON Response:', jsonResponse);

    return NextResponse.json(jsonResponse);

  } catch (error) {
    console.error('🚨 Error in Gemini Vision API:', error);
    // Check if the error is a known type, otherwise create a generic error
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to analyze image with Gemini Vision', details: errorMessage }, { status: 500 });
  }
}
