/**
 * A comprehensive list of common non-food items that should be excluded from AI vision results
 * to improve the accuracy of food recognition. Enhanced with AI-powered smart detection.
 */
export const NON_FOOD_ITEMS = new Set([
  // Kitchen items and tableware
  'tableware',
  'dishware',
  'serveware',
  'plate',
  'bowl',
  'utensil',
  'fork',
  'spoon',
  'knife',
  'cutting board',
  'chopsticks',
  'strainer',
  'colander',
  'kitchen utensil',
  'cooking utensil',
  'spatula',
  'ladle',
  'whisk',
  'tongs',
  'measuring cup',
  'measuring spoon',
  
  // Containers and packaging
  'container',
  'packaging',
  'wrapper',
  'plastic bag',
  'paper bag',
  'cardboard',
  'box',
  'carton',
  'can opener',
  'lid',
  'cap',
  'cork',
  'aluminum foil',
  'plastic wrap',
  'parchment paper',
  
  // Environmental and background items
  'background',
  'wood',
  'flooring',
  'fabric',
  'textile',
  'countertop',
  'table',
  'surface',
  'wall',
  'ceiling',
  'window',
  'door',
  'placemat',
  'napkin',
  'tablecloth',
  'coaster',
  
  // Human body parts
  'person',
  'hand',
  'finger',
  'arm',
  'face',
  'head',
  'body',
  'skin',
  'nail',
  
  // Decorative and non-edible items
  'plant',
  'flower',
  'vase',
  'bottle',
  'cup',
  'glass',
  'mug',
  'tumbler',
  'wine glass',
  'beer glass',
  'shot glass',
  'water bottle',
  'soda bottle',
  'wood stain',
  'hardwood',
  'laminate flooring',
  'wood flooring',
  'plank',
  'pattern',
  'line',
  'beige',
  'circle',
  'rectangle',
  'jewellery',
  'fashion accessory',
  'white',
  'skin',
  'font',
  'liquid',
  'automotive lighting',
  'drinkware',
  'gas',
  'human body',
  'eyelash',
  'sleeve',
  'gesture',
  'thumb',
  'wrist',
  'nail',
  'elbow',
  'silverware',
  'cutlery',
  'tray',
  'platter',
  'saucer',
  'tureen',
  'porcelain',
  'ceramic',
  'earthenware',
  'pottery',
  'faience',
  'tablecloth',
  'doily',
  'coaster',
  'trivet',
  'charger',
  'centerpiece',
  'candle',
  'candlestick',
  'chandelier',
  'lamp',
  'light fixture',
  'window',
  'door',
  'wall',
  'ceiling',
  'floor',
  'carpet',
  'rug',
  'curtain',
  'drape',
  'blind',
  'shade',
  'furniture',
  'chair',
  'stool',
  'bench',
  'cabinet',
  'shelf',
  'bookcase',
  'picture frame',
  'mirror',
  'clock',
  'art',
  'painting',
  'drawing',
  'sculpture',
  'photograph',
  'poster',
  'appliance',
  'refrigerator',
  'oven',
  'stove',
  'microwave',
  'dishwasher',
  'blender',
  'toaster',
  'coffee maker',
  'kettle',
  'electronics',
  'computer',
  'laptop',
  'tablet',
  'phone',
  'camera',
  'television',
  'remote control',
  'clothing',
  'shirt',
  'pants',
  'dress',
  'skirt',
  'jacket',
  'coat',
  'sweater',
  'hat',
  'scarf',
  'glove',
  'sock',
  'shoe',
  'boot',
  'bag',
  'purse',
  'backpack',
  'wallet',
  'key',
  'watch',
  'bracelet',
  'necklace',
  'earring',
  'ring',
  'brooch',
  'tie',
  'belt',
  'buckle',
  'zipper',
  'button',
  'paper',
  'book',
  'notebook',
  'magazine',
  'newspaper',
  'card',
  'envelope',
  'pen',
  'pencil',
  'marker',
  'crayon',
  'highlighter',
  'eraser',
  'ruler',
  'scissors',
  'stapler',
  'tape',
  'glue',
  'clip',
  'pin',
  'tack',
  'toy',
  'doll',
  'stuffed animal',
  'action figure',
  'game',
  'puzzle',
  'ball',
  'car',
  'truck',
  'train',
  'plane',
  'boat',
  'instrument',
  'piano',
  'guitar',
  'violin',
  'drum',
  'flute',
  'trumpet',
  'tool',
  'hammer',
  'screwdriver',
  'wrench',
  'plier',
  'saw',
  'drill',
  'insect',
  'bug',
  'spider',
  'ant',
  'bee',
  'wasp',
  'fly',
  'mosquito',
  'moth',
  'butterfly',
  'ladybug',
  'cockroach',
  'termite',
  'bed bug',
  'flea',
  'tick',
  'lice',
  'mite',
  'centipede',
  'millipede',
  'scorpion',
  'sponge',
  'plankton',
  'bacteria',
  'virus',
  'fungus',
  'mold',
  'mildew',
  'yeast',
  'lichen',
  'moss',
  'fern',
  'grass',
  'weed',
  'tree',
  'shrub',
  'bush',
  'vine',
  'cactus',
  'succulent',
  'ice',
  'snow',
  'rain',
  'hail',
  'sleet',
  'fog',
  'mist',
  'cloud',
  'sky',
  'sun',
  'moon',
  'star',
  'planet',
  'galaxy',
  'universe',
  'space',
  'time',
  'light',
  'dark',
  'shadow',
  'color',
  'red',
  'orange',
  'yellow',
  'green',
  'blue',
  'purple',
  'pink',
  'brown',
  'black',
  'gray',
  'silver',
  'gold',
  'metal',
  'iron',
  'steel',
  'copper',
  'brass',
  'bronze',
  'aluminum',
  'tin',
  'lead',
  'zinc',
  'nickel',
  'titanium',
  'platinum',
  'stone',
  'rock',
  'pebble',
  'gravel',
  'sand',
  'dirt',
  'clay',
  'mud',
  'dust',
  'ash',
  'soot',
  'smoke',
  'fire',
  'flame',
  'ember',
  'spark',
  'electricity',
  'magnetism',
  'gravity',
  'sound',
  'noise',
  'music',
  'voice',
  'speech',
  'language',
  'word',
  'letter',
  'number',
  'symbol',
  'shape',
  'square',
  'triangle',
  'oval',
  'star',
  'heart',
  'arrow',
  'plus',
  'minus',
  'equals',
  'slash',
  'backslash',
  'pipe',
  'dot',
  'comma',
  'period',
  'question mark',
  'exclamation point',
  'at sign',
  'hashtag',
  'dollar sign',
  'percent sign',
  'ampersand',
  'asterisk',
  'parentheses',
  'brackets',
  'braces',
  'quotes',
  'apostrophe',
  'hyphen',
  'dash',
  'underscore',
  'tilde',
  'caret',
  'less than',
  'greater than',
  'less than or equal to',
  'greater than or equal to',
  'not equal to',
  'approximately equal to',
  'infinity',
  'degree',
  'pi',
  'phi',
  'delta',
  'lambda',
  'mu',
  'sigma',
  'omega',
  'alpha',
  'beta',
  'gamma',
  'epsilon',
  'zeta',
  'eta',
  'theta',
    'iota',
]);

/**
 * Advanced AI-powered food item validation
 * Uses multiple strategies to determine if an item is actually food
 * IMPROVED: Much more permissive to avoid false negatives
 */
export function isValidFoodItem(item: string): boolean {
  if (!item || typeof item !== 'string') return false;
  
  const cleanItem = item.toLowerCase().trim();
  
  // Remove very short terms only
  if (cleanItem.length < 2) return false;
  
  // Check against our comprehensive non-food list - but be more selective
  if (NON_FOOD_ITEMS.has(cleanItem)) {
    // Even if it's in the non-food list, allow if it contains obvious food words
    const obviousFoodWords = [
      'cake', 'tart', 'pie', 'cookie', 'bread', 'pasta', 'pizza', 'burger', 'sandwich',
      'salad', 'soup', 'rice', 'chicken', 'beef', 'fish', 'meat', 'cheese', 'milk',
      'fruit', 'apple', 'banana', 'berry', 'vegetable', 'tomato', 'potato', 'bean',
      'almond', 'nut', 'chocolate', 'vanilla', 'lemon', 'strawberry', 'burrito',
      'taco', 'muffin', 'donut', 'bagel', 'croissant', 'pancake', 'waffle', 'cereal',
      'ice cream', 'mcflurry', 'oreo', 'mcdonalds', 'food', 'meal', 'snack', 'dessert',
      // Indian cuisine
      'samosa', 'biryani', 'rasmalai', 'panipuri', 'dosa', 'idli', 'chapati', 'roti',
      'naan', 'curry', 'dal', 'tandoori', 'masala', 'tikka', 'kebab', 'pakora',
      'chaat', 'vada', 'upma', 'poha', 'paratha', 'kulcha', 'bhaji', 'kofta',
      'raita', 'lassi', 'chai', 'halwa', 'gulab jamun', 'jalebi', 'barfi', 'laddu'
    ];
    
    if (!obviousFoodWords.some(word => cleanItem.includes(word))) {
      console.log(`❌ Food rejected by non-food list: ${item}`);
      return false;
    }
  }

  // BE VERY LENIENT - Accept almost anything that could be food
  const easyFoodWords = [
    'cake', 'tart', 'pie', 'cookie', 'bread', 'pasta', 'pizza', 'burger', 'sandwich',
    'salad', 'soup', 'rice', 'chicken', 'beef', 'fish', 'meat', 'cheese', 'milk',
    'fruit', 'apple', 'banana', 'berry', 'vegetable', 'tomato', 'potato', 'bean',
    'almond', 'nut', 'chocolate', 'vanilla', 'lemon', 'strawberry', 'burrito',
    'taco', 'muffin', 'donut', 'bagel', 'croissant', 'pancake', 'waffle', 'cereal',
    'ice cream', 'mcflurry', 'oreo', 'mcdonalds', 'food', 'meal', 'snack', 'dessert',
    'cream', 'butter', 'sugar', 'flour', 'egg', 'oil', 'spice', 'herb', 'sauce',
    // Indian cuisine - comprehensive list
    'samosa', 'biryani', 'rasmalai', 'panipuri', 'dosa', 'idli', 'chapati', 'roti',
    'naan', 'curry', 'dal', 'tandoori', 'masala', 'tikka', 'kebab', 'pakora',
    'chaat', 'vada', 'upma', 'poha', 'paratha', 'kulcha', 'bhaji', 'kofta',
    'raita', 'lassi', 'chai', 'halwa', 'gulab jamun', 'jalebi', 'barfi', 'laddu',
    'dhokla', 'kheer', 'pulao', 'rajma', 'chole', 'aloo', 'gobi', 'paneer',
    'butter chicken', 'vindaloo', 'korma', 'saag', 'matar', 'palak', 'karahi',
    // Asian cuisine
    'sushi', 'ramen', 'kimchi', 'pad thai', 'pho', 'dumpling', 'spring roll',
    'fried rice', 'lo mein', 'teriyaki', 'tempura', 'miso', 'udon', 'soba'
  ];
  
  // If it contains any obvious food word, it's valid
  if (easyFoodWords.some(word => cleanItem.includes(word))) {
    console.log(`✅ Food validated by food keywords: ${item}`);
    return true;
  }
  
  // If it's a reasonable length and doesn't look like gibberish, probably food
  if (cleanItem.length >= 3 && cleanItem.length <= 30) {
    // Check if it has vowels and looks like real words
    const hasVowels = /[aeiou]/i.test(cleanItem);
    const notAllConsonants = !/^[bcdfghjklmnpqrstvwxyz]+$/i.test(cleanItem);
    const notNumbers = !/^\d+$/.test(cleanItem);
    
    // MUCH MORE PERMISSIVE: Accept if it looks like real words
    if (hasVowels && notAllConsonants && notNumbers) {
      console.log(`✅ Food validated by heuristics: ${item}`);
      return true;
    }
  }
  
  console.log(`❌ Food rejected: ${item}`);
  return false;
}

/**
 * Enhanced food item filtering with AI-powered validation
 * IMPROVED: Much more permissive to avoid false negatives
 */
export function filterFoodItems(items: string[]): string[] {
  const filtered = items
    .filter(item => isValidFoodItem(item))
    .filter((item, index, arr) => arr.indexOf(item.toLowerCase()) === index); // Remove duplicates
  
  // If filtering removes everything, return original (avoid false negatives)
  if (filtered.length === 0 && items.length > 0) {
    console.log('⚠️ Filtering would remove all items - returning original list to avoid false negatives');
    return items.slice(0, 10); // Return original but limit count
  }
  
  return filtered
    .sort((a, b) => {
      // Prioritize single-word food items
      const aWords = a.split(' ').length;
      const bWords = b.split(' ').length;
      if (aWords !== bWords) return aWords - bWords;
      return a.length - b.length; // Then by length
    })
    .slice(0, 10); // Limit to top 10 most relevant items
}

/**
 * Smart confidence scoring for detected food items
 */
export function getFoodConfidenceScore(item: string): number {
  if (!isValidFoodItem(item)) return 0;
  
  const cleanItem = item.toLowerCase().trim();
  let score = 0.5; // Base score
  
  // Bonus for common food words
  const commonFoodWords = ['food', 'meal', 'dish', 'fruit', 'vegetable', 'meat', 'drink', 'beverage'];
  if (commonFoodWords.some(word => cleanItem.includes(word))) score += 0.3;
  
  // Bonus for specific food names
  const specificFoods = ['apple', 'banana', 'pizza', 'burger', 'salad', 'chicken', 'rice', 'bread'];
  if (specificFoods.some(food => cleanItem.includes(food))) score += 0.4;
  
  // Penalty for vague terms
  const vagueTerms = ['item', 'thing', 'object', 'stuff', 'something'];
  if (vagueTerms.some(term => cleanItem.includes(term))) score -= 0.3;
  
  // Bonus for single, specific words
  if (!/\s/.test(cleanItem) && cleanItem.length >= 3 && cleanItem.length <= 15) score += 0.1;
  
  return Math.max(0, Math.min(1, score)); // Clamp between 0 and 1
}
