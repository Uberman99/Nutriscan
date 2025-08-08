/**
 * A comprehensive list of common non-food items that should be excluded from AI vision results
 * to improve the accuracy of food recognition.
 */
export const NON_FOOD_ITEMS = new Set<string>([
  // Kitchen items and tableware
  'tableware', 'dishware', 'serveware', 'plate', 'bowl', 'utensil', 'fork', 'spoon', 'knife',
  'cutting board', 'chopsticks', 'kitchen utensil', 'spatula', 'ladle', 'tongs',
  
  // Containers and packaging
  'container', 'packaging', 'wrapper', 'plastic bag', 'box', 'carton', 'lid',
  'aluminum foil', 'plastic wrap',
  
  // Environmental and background items
  'background', 'wood', 'fabric', 'textile', 'countertop', 'table', 'surface',
  'wall', 'placemat', 'napkin', 'tablecloth',
  
  // Human body parts
  'person', 'hand', 'finger', 'arm', 'face', 'skin', 'nail',
  
  // Decorative and non-edible items
  'plant', 'flower', 'vase', 'bottle', 'cup', 'glass', 'mug',
  'font', 'liquid', 'drinkware', 'gas', 'human body', 'gesture', 'thumb', 'wrist',
  'cutlery', 'tray', 'platter', 'saucer', 'porcelain', 'ceramic', 'art', 'appliance',
  'electronics', 'phone', 'camera', 'clothing', 'shirt', 'paper', 'book'
]);

/**
 * Advanced AI-powered food item validation. More permissive to avoid false negatives.
 */
export function isValidFoodItem(item: string): boolean {
  if (!item || typeof item !== 'string' || item.length < 3) return false;
  const cleanItem = item.toLowerCase().trim();

  // Hard rejections for universally non-food items or vague terms
  const rejectionList = ['person', 'hand', 'finger', 'table', 'plate', 'bowl', 'utensil', 'fork', 'spoon', 'knife', 'fabric', 'wood', 'background', 'item', 'object'];
  if (rejectionList.some(term => cleanItem.includes(term))) {
    return false;
  }

  // If it's on the non-food list, it must contain an explicit food keyword to pass
  const foodKeywords = ['food', 'meal', 'dish', 'cake', 'bread', 'sushi', 'pizza', 'salad', 'curry', 'berry', 'fruit', 'veg'];
  if (NON_FOOD_ITEMS.has(cleanItem)) {
    if (!foodKeywords.some(keyword => cleanItem.includes(keyword))) {
      return false;
    }
  }
  
  return true;
}

/**
 * Enhanced food item filtering with AI-powered validation
 */
export function filterFoodItems(items: string[]): string[] {
  const uniqueItems = [...new Set(items.map(i => i.toLowerCase().trim()))];

  const filtered = uniqueItems.filter(isValidFoodItem);

  if (filtered.length === 0 && items.length > 0) {
    console.warn('Filtering removed all items; returning the first original item as a fallback.');
    return items.slice(0, 1);
  }

  // Sort by length to prioritize more specific terms
  return filtered.sort((a, b) => a.length - b.length).slice(0, 10);
}