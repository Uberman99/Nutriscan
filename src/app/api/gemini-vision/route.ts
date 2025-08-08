// Force Node.js runtime for advanced image processing capabilities
export const runtime = "nodejs";

import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

async function fileToGenerativePart(file: File) {
  const fileBuffer = await file.arrayBuffer();
  return {
    inlineData: {
      data: Buffer.from(fileBuffer).toString("base64"),
      mimeType: file.type,
    },
  };
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File | null;

    if (!imageFile) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

    // --- UPGRADED AI DIRECTIVE FOR PURE ACCURACY ---
    const prompt = `
      Analyze the provided image of a meal with extreme precision. Your task is to act as an expert food scientist and identify EVERY single ingredient and component visible.

      Your response MUST be a valid JSON object containing a single key: "foods".
      The "foods" key must be an array of objects, where each object has two keys: "name" (string) and "confidence" (a number between 0 and 1).

      Deconstruct the entire meal. For example, if you see a burger, do not just say "burger". Instead, identify "sesame seed bun", "beef patty", "cheddar cheese slice", "lettuce leaf", "tomato slice", "onions", and "ketchup". Be as granular as possible.

      Return only the JSON object and nothing else.
    `;

    const imagePart = await fileToGenerativePart(imageFile);

    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();
    
    // Clean the response to ensure it is valid JSON
    const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedResponse = JSON.parse(cleanedText);

    // Validate the structure of the AI's response
    if (!parsedResponse.foods || !Array.isArray(parsedResponse.foods)) {
        throw new Error("AI response did not contain a valid 'foods' array.");
    }
    
    return NextResponse.json(parsedResponse);

  } catch (error) {
    console.error('Error in Gemini Vision API route:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to analyze image with Gemini Vision', details: errorMessage }, { status: 500 });
  }
}