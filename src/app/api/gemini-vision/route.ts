import { NextResponse } from 'next/server';
import Tesseract from 'tesseract.js';

// Helper function to extract text from an image using Tesseract.js
async function extractTextFromImage(file: File): Promise<string> {
  const result = await Tesseract.recognize(file, 'eng') as unknown as { data: { text: string } };
  const text = result.data.text;
  return text;
}

export async function POST(request: Request) {
  try {
    console.log('🚀 Received request for OCR analysis using Tesseract.js');
    const formData = await request.formData();
    const imageFile = formData.get('image') as File | null;

    if (!imageFile) {
      console.error('❌ Missing image in the request');
      return NextResponse.json({ error: 'Missing image' }, { status: 400 });
    }

    console.log('✅ Image received. Starting OCR analysis...');
    const extractedText = await extractTextFromImage(imageFile);

    console.log('✅ Extracted Text:', extractedText);

    return NextResponse.json({ extractedText });

  } catch (error) {
    console.error('🚨 Error in Tesseract.js OCR:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to analyze image with Tesseract.js', details: errorMessage }, { status: 500 });
  }
}
