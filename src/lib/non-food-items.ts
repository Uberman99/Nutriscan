// src/lib/non-food-items.ts

export const NON_FOOD_ITEMS = new Set<string>([
  // This list should be maintained with common non-food items
  'tableware', 'dishware', 'plate', 'bowl', 'utensil', 'fork', 'spoon', 'knife',
  'cutting board', 'background', 'wood', 'fabric', 'textile', 'countertop', 'table',
  'person', 'hand', 'finger', 'font', 'drinkware', 'art', 'electronics', 'clothing'
]);

// A list of common but implausible ingredients to filter out during sanity checks
export const IMPLAUSIBLE_INGREDIENTS_MAP: { [key: string]: Set<string> } = {
    'onion': new Set(['pizza', 'candy', 'cake', 'peach', 'berry', 'corn']),
    'dessert': new Set(['fish', 'chicken', 'beef', 'chili', 'salsa', 'potato', 'onion']),
    'salad': new Set(['cake', 'candy', 'dough', 'bread']),
    // Add more mappings as needed
};


/**
 * Final filtering logic to remove non-food items and nonsensical combinations.
 */
export function filterFoodItems(items: string[], primaryItemHint?: string): string[] {
  const lowerCaseHint = primaryItemHint?.toLowerCase();
  
  const filtered = items
    .map(item => item.trim())
    .filter(item => {
      const cleanItem = item.toLowerCase();
      if (!cleanItem || cleanItem.length < 3) return false;
      if (NON_FOOD_ITEMS.has(cleanItem)) return false;

      // Check against implausible combinations if a hint is provided
      if (lowerCaseHint) {
          const hintKey = Object.keys(IMPLAUSIBLE_INGREDIENTS_MAP).find(key => lowerCaseHint.includes(key));
          if (hintKey && IMPLAUSIBLE_INGREDIENTS_MAP[hintKey].has(cleanItem)) {
              console.log(`[Sanity Check] Filtering out implausible item "${cleanItem}" for hint "${hintKey}"`);
              return false;
          }
      }
      return true;
    });

  // Remove duplicates
  return [...new Set(filtered)];
}