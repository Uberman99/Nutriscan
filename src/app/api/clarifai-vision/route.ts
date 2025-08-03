// src/app/api/clarifai-vision/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface ClarifaiConcept {
  name: string;
  value: number;
}

interface ClarifaiResult {
  name: string;
  confidence: number;
  source: string;
}

interface ClarifaiResponse {
  outputs?: Array<{
    data: {
      concepts: ClarifaiConcept[];
    };
  }>;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Clarifai API Request starting...');
    const formData = await request.formData();
    const imageFile = formData.get('image') as File | null;
    const apiKey = process.env.CLARIFAI_API_KEY;

    console.log('📊 Clarifai API Credentials check:', {
      hasApiKey: !!apiKey,
      keyLength: apiKey?.length,
      hasImage: !!imageFile
    });

    if (!imageFile) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    if (!apiKey) {
      console.warn('⚠️ Clarifai API key missing! Using fallback food detection.');
      return NextResponse.json({ 
        foods: [{ name: 'Food Item', confidence: 0.75, source: 'clarifai-fallback' }]
      });
    }

    const bytes = await imageFile.arrayBuffer();
    const base64Data = Buffer.from(bytes).toString('base64');

    const apiResponse = await fetch(
      'https://api.clarifai.com/v2/models/food-item-recognition/versions/1d5fd481e0cf4826aa72ec3ff049e044/outputs',
      {
        method: 'POST',
        headers: {
          Authorization: `Key ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: [{
            data: {
              image: { base64: base64Data }
            }
          }]
        })
      }
    );

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('❌ Clarifai API Error:', apiResponse.status, errorText);
      return NextResponse.json({ 
        foods: [{ name: 'Food Item', confidence: 0.6, source: 'clarifai-error' }]
      });
    }

    const data = await apiResponse.json() as ClarifaiResponse;
    console.log('✅ Clarifai API response received');
    console.log('🔍 Clarifai concepts found:', data.outputs?.[0]?.data?.concepts?.length || 0);
    
    const concepts = data.outputs?.[0]?.data?.concepts;

    if (!concepts?.length) {
      console.warn('⚠️ No concepts detected by Clarifai');
      return NextResponse.json({ 
        foods: [{ name: 'Food Item', confidence: 0.5, source: 'clarifai-no-concepts' }]
      });
    }

    const results: ClarifaiResult[] = concepts
      .filter((concept): concept is ClarifaiConcept => 
        typeof concept.value === 'number' && concept.value > 0.3 // Lower threshold
      )
      .map(concept => ({
        name: concept.name,
        confidence: concept.value,
        source: 'clarifai'
      }));

    console.log('🍎 Clarifai filtered results:', results);

    if (results.length === 0) {
      console.warn('⚠️ No high-confidence food items detected by Clarifai');
      return NextResponse.json({ 
        foods: [{ name: 'Food Item', confidence: 0.4, source: 'clarifai-low-confidence' }]
      });
    }

    return NextResponse.json({ foods: results });

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    console.error('Error:', errorMessage);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}