// src/lib/real-time-pricing.ts

interface StorePrice {
  name: string;
  price: number;
  url: string;
  special: boolean;
}

// Base prices for items in AUD (per kg or per item)
const basePrices: { [key: string]: number } = {
  'apple': 4.50,
  'banana': 3.80,
  'orange': 3.50,
  'bread': 3.20,
  'milk': 2.10,
  'chicken': 11.00,
  'beef': 18.50,
  'eggs': 5.00,
  'pizza': 7.00,
  'samosa': 2.00,
  'cake': 20.00,
  'default': 5.00
};

const stores = [
  { name: 'ALDI', url: 'https://www.aldi.com.au', priceVariation: 0.9 },
  { name: 'Coles', url: 'https://www.coles.com.au', priceVariation: 1.05 },
  { name: 'Woolworths', url: 'https://www.woolworths.com.au', priceVariation: 1.0 }
];

/**
 * Generates a seed based on the current date and an item name.
 * This ensures that for a given day, the "random" price is consistent.
 */
function generateDailySeed(itemName: string): number {
  const date = new Date();
  const dateString = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  const seedString = dateString + itemName;
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    const char = seedString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return (hash % 1000) / 1000; // Normalize to a 0-1 range
}

/**
 * Generates more realistic, pseudo-real-time prices for a given food item.
 * Prices are stable for the same day but will change daily.
 */
export function getRealTimePrices(foodName: string): StorePrice[] {
  const foodLower = foodName.toLowerCase();
  let basePrice = basePrices.default;

  // Find a matching base price
  const matchingKeyword = Object.keys(basePrices).find(keyword => foodLower.includes(keyword));
  if (matchingKeyword) {
    basePrice = basePrices[matchingKeyword];
  }

  const seed = generateDailySeed(foodLower);

  const prices = stores.map((store, index) => {
    // Daily variation using the seed
    const dailyFluctuation = (generateDailySeed(store.name + foodLower) - 0.5) * 0.2; // +/- 10%
    
    // Store-specific variation
    const storePriceMultiplier = store.priceVariation;

    // Calculate final price
    let finalPrice = basePrice * storePriceMultiplier * (1 + dailyFluctuation);

    // Randomly put one item on "special" each day
    const isSpecial = (Math.floor(seed * stores.length)) === index;
    if (isSpecial) {
      finalPrice *= 0.8; // 20% discount
    }

    return {
      name: store.name,
      price: parseFloat(finalPrice.toFixed(2)),
      url: store.url,
      special: isSpecial
    };
  });

  return prices.sort((a, b) => a.price - b.price);
}
