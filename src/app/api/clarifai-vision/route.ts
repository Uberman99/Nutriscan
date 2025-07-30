import { NextRequest, NextResponse } from 'next/server';

<<<<<<< HEAD
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
=======
const CLARIFAI_API_KEY = process.env.CLARIFAI_API_KEY;
>>>>>>> 248da69a8d9281c86ca4da4f6f5c83429d127f98

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File | null;
<<<<<<< HEAD
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
=======

    if (!imageFile) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    if (!CLARIFAI_API_KEY) {
      return NextResponse.json({ error: 'Clarifai API key not configured' }, { status: 500 });
    }

    const imageBytes = await imageFile.arrayBuffer();
    const imageBase64 = Buffer.from(imageBytes).toString('base64');

    // Clarifai Food Recognition API
    const response = await fetch('https://api.clarifai.com/v2/models/food-item-recognition/versions/1d5fd481e0cf4826aa72ec3ff049e044/outputs', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${CLARIFAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: [
          {
            data: {
              image: {
                base64: imageBase64
              }
            }
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Clarifai API Error Response:', response.status, errorText);
      // Try to parse the error, but fallback to text if it's not valid JSON
      try {
        const errorJson = JSON.parse(errorText);
        return NextResponse.json(errorJson, { status: response.status });
      } catch {
        return NextResponse.json({ error: errorText }, { status: response.status });
      }
    }

    const data = await response.json();
    console.log('✅ Clarifai API Response:', data);

    // Extract predicted concepts (food items)
    const concepts = data.outputs?.[0]?.data?.concepts || [];
    const recognizedFoods = concepts
      .filter((concept: { value: number; }) => concept.value > 0.5) // Filter by confidence threshold
      .map((concept: { name: string; value: number; }) => ({
        name: concept.name,
        confidence: concept.value
      }));

    return NextResponse.json({ foods: recognizedFoods });
  } catch (error) {
    console.error('❌ Error in Clarifai API route:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
>>>>>>> 248da69a8d9281c86ca4da4f6f5c83429d127f98
  }
}
