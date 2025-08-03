import { NextResponse } from 'next/server';

// Fallback price data for common foods
const fallbackPrices: Record<string, number> = {
  'almond': 12.99,
  'almonds': 12.99,
  'nut': 8.99,
  'nuts': 8.99,
  'apple': 3.99,
  'banana': 2.49,
  'orange': 4.99,
  'bread': 2.99,
  'milk': 3.49,
  'cheese': 5.99,
  'chicken': 8.99,
  'beef': 12.99,
  'fish': 10.99,
  'rice': 4.99,
  'pasta': 1.99,
  'tomato': 3.99,
  'potato': 2.99,
  'carrot': 1.99,
  'onion': 1.49,
  'garlic': 0.99
};

export async function POST(request: Request) {
  try {
    const { foodItems } = await request.json();
    
    if (!foodItems || !Array.isArray(foodItems)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid food items provided' 
      }, { status: 400 });
    }

    const pricesWithFallback = foodItems.map((item: any) => {
      const foodName = item.name || item;
      const normalizedName = foodName.toLowerCase().trim();
      
      // Try to find exact match or partial match
      let price = fallbackPrices[normalizedName];
      
      if (!price) {
        // Try to find partial matches
        const partialMatch = Object.keys(fallbackPrices).find(key => 
          normalizedName.includes(key) || key.includes(normalizedName)
        );
        price = partialMatch ? fallbackPrices[partialMatch] : 5.99; // Default price
      }

      return {
        name: foodName,
        price: price,
        currency: 'USD',
        unit: 'per lb',
        source: 'fallback_data'
      };
    });

    return NextResponse.json({
      success: true,
      prices: pricesWithFallback,
      message: 'Prices retrieved successfully (using fallback data)'
    });

  } catch (error) {
    console.error('Price API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get price information',
      prices: []
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    success: true,
    message: 'Prices API is available. Use POST method with foodItems array.' 
  });
}
