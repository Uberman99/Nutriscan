import { NextRequest, NextResponse } from 'next/server';
import { vision } from '@/lib/vision-client';
import { mockFoodRecognition } from '@/lib/demo-data';

export async function POST(request: NextRequest) {
<<<<<<< HEAD
  return NextResponse.json({ error: 'This endpoint is deprecated. Use /api/scan-food instead.' }, { status: 410 });
=======
>>>>>>> 248da69a8d9281c86ca4da4f6f5c83429d127f98
  try {
    const { image } = await request.json();
    
    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // If no Vision client is available, use mock data
    if (!vision.client) {
      console.log('Using mock data for Vision API');
      return NextResponse.json({ 
        labels: mockFoodRecognition,
        success: true 
      });
    }

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(image, 'base64');
    const visionRequest = { image: { content: imageBuffer } };

    // Perform multiple types of analysis for better food recognition
    // Update Promise.all to include explicit types
    const [labelResult, textResult, objectResult] = await Promise.all([
      vision.labelDetection(visionRequest) as unknown as [{ labelAnnotations: Array<{ description: string; score: number }> }],
      vision.textDetection(visionRequest) as unknown as [{ textAnnotations: Array<{ description: string }> }],
      vision.objectLocalization(visionRequest) as unknown as [{ localizedObjectAnnotations: Array<{ name: string; score: number }> }]
    ]);

    const labels = labelResult[0].labelAnnotations || [];
    const textAnnotations = textResult[0].textAnnotations || [];
    const objects = objectResult[0].localizedObjectAnnotations || [];

    // Add type annotations for map and filter functions
    const detectedText = textAnnotations.map((annotation: { description: string }) => annotation.description || '').join(' ').toLowerCase();

    // Use filteredObjects in the response to avoid unused variable warning
    const filteredObjects = objects
      .filter((obj: { score: number }) => obj.score && obj.score > 0.4)
      .map((obj: { name: string }) => obj.name || '');

    return NextResponse.json({
      labels,
      detectedText,
      filteredObjects
    });
  } catch (error) {
    console.error('Vision API Error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze image' }, 
      { status: 500 }
    );
  }
}
