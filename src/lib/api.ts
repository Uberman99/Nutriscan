// src/lib/api.ts
import { NutritionInfo } from './types';

// Type definition for the result from our vision service
interface FoodRecognitionResult {
  name: string;
  confidence: number;
  source: 'Clarifai';
}

/**
 * Analyzes an image file for food items using a streamlined and reliable API endpoint.
 * This is the primary function for initiating a food scan from the client-side.
 * @param imageFile The image file uploaded by the user.
 * @returns A promise that resolves to an array of identified food items.
 */
export async function analyzeImageForFood(imageFile: File): Promise<FoodRecognitionResult[]> {
  console.log('🚀 Initiating streamlined food recognition via /api/clarifai-vision...');

  const formData = new FormData();
  formData.append('image', imageFile);

  try {
    const response = await fetch('/api/clarifai-vision', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response from Clarifai API' }));
      throw new Error(errorData.error || `Clarifai API request failed with status: ${response.status}`);
    }

    const data = await response.json();

    if (Array.isArray(data.foods) && data.foods.length > 0) {
      console.log('✅ Food recognition successful:', data.foods);
      return data.foods;
    } else {
      console.warn('No food items were recognized in the image.');
      // Return a specific result for no-food-found cases
      return [{ name: 'No food recognized', confidence: 0, source: 'Clarifai' }];
    }
  } catch (error) {
    console.error('Fatal error in analyzeImageForFood:', error);
    // Propagate a clear, user-friendly error message
    throw new Error('Could not analyze the image. Please try again with a clearer picture.');
  }
}

/**
 * Fetches detailed nutritional data for a given food name from the backend.
 * @param foodName The name of the food item to look up.
 * @returns A promise that resolves to the NutritionInfo object or null if not found.
 */
export async function getNutritionData(foodName: string): Promise<NutritionInfo | null> {
  console.log(`Fetching nutrition data for: "${foodName}"`);
  try {
    const response = await fetch('/api/nutrition', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ foodName }),
    });

    if (!response.ok) {
      console.warn(`Nutrition API failed for "${foodName}". Status: ${response.status}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching nutrition data for "${foodName}":`, error);
    return null;
  }
}

/**
 * Fetches price comparison data for a given food name.
 * @param foodName The name of the food to get prices for.
 * @returns A promise that resolves to price data from various stores.
 */
export async function getPrices(foodName: string) {
    console.log(`Fetching prices for: "${foodName}"`);
    try {
        const response = await fetch('/api/prices', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ foodName }),
        });

        if (!response.ok) {
            throw new Error(`Price API failed with status ${response.status}`);
        }
        return await response.json();
    } catch (error) {
         console.warn(`Price API call failed for "${foodName}", returning fallback data. Error:`, error);
        // Return fallback data if the API call fails for any reason
        return {
            stores: [
                { name: 'ALDI', price: 3.99, url: 'https://aldi.com.au' },
                { name: 'Coles', price: 4.50, url: 'https://coles.com.au' },
                { name: 'Woolworths', price: 4.25, url: 'https://woolworths.com.au' }
            ]
        };
    }
}

/**
 * Provides a mock AI analysis. This can be replaced with a real AI call if needed.
 * @param foodNames An array of identified food names.
 * @returns A promise resolving to a mock AI analysis object.
 */
export async function analyzeFoodWithAI(foodNames: string[]) {
    console.log('Generating mock AI analysis for:', foodNames);
    return {
        description: `This meal primarily features ${foodNames.join(', ')}.`,
        healthScore: Math.floor(Math.random() * (85 - 60 + 1)) + 60, // Random score between 60-85
        suggestions: ['Consider pairing with a green vegetable for added fiber.', 'Ensure portion sizes are moderate.'],
    };
}