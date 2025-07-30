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
    const formData = await request.formData();
    const imageFile = formData.get('image') as File | null;
    const apiKey = process.env.CLARIFAI_API_KEY;

    if (!imageFile) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
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
      console.error('Clarifai API Error:', apiResponse.status, errorText);
      return NextResponse.json(
        { error: 'Failed to analyze image' },
        { status: apiResponse.status }
      );
    }


    const data = await apiResponse.json() as ClarifaiResponse;
    console.log('Clarifai API raw response:', JSON.stringify(data, null, 2));
    const concepts = data.outputs?.[0]?.data?.concepts;

    if (!concepts?.length) {
      return NextResponse.json(
        { error: 'No food items detected' },
        { status: 400 }
      );
    }

    const results: ClarifaiResult[] = concepts
      .filter((concept): concept is ClarifaiConcept => 
        typeof concept.value === 'number' && concept.value > 0.5
      )
      .map(concept => ({
        name: concept.name,
        confidence: concept.value,
        source: 'clarifai'
      }));

    console.log('Clarifai mapped results:', results);

    if (results.length === 0) {
      return NextResponse.json(
        { error: 'No food items detected with high confidence' },
        { status: 400 }
      );
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
