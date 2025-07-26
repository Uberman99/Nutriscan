// Force Node.js runtime to avoid Edge Runtime incompatibility
export const runtime = "nodejs";

import { NextResponse } from 'next/server';
import Tesseract from 'tesseract.js';

// Helper function to extract text from an image using Tesseract.js
// Accepts Buffer for server-side usage
async function extractTextFromImage(imageBuffer: Buffer): Promise<string> {
  const { data: { text } } = await Tesseract.recognize(imageBuffer, 'eng');
  return text;
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

    // Get the public app URL from env
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || null;

    return NextResponse.json({ extractedText, appUrl });

  } catch (error) {
    console.error('🚨 Error in Tesseract.js OCR:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to analyze image with Tesseract.js', details: errorMessage }, { status: 500 });
  }
}
