// src/lib/api.ts
import { NutritionInfo } from './types';

// This file is now drastically simplified. It only contains the nutrition data fetcher,
// which is now primarily used by the server-side scan-food endpoint.

export async function getNutritionData(foodName: string): Promise<NutritionInfo | null> {
  console.log(`Fetching nutrition data for: "${foodName}"`);
  try {
    // We must use the full URL for server-side fetch calls.
    // Ensure NEXT_PUBLIC_APP_URL is set in your .env.local file (e.g., http://localhost:3000)
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/nutrition`, {
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